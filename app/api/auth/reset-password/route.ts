import type { NextRequest } from "next/server";

import { jsonError, readJson } from "@/lib/server/api";
import { isValidEmail, normalizeEmail, validatePassword } from "@/lib/server/auth-validation";
import { enforceCaptcha } from "@/lib/server/captcha";
import { hashOtp, validateOtpShape } from "@/lib/server/otp";
import { hashPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";

type ResetPasswordBody = {
  email?: string;
  otp?: string;
  password?: string;
  captchaToken?: string;
};

export async function POST(request: NextRequest) {
  const body = await readJson<ResetPasswordBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const ip = getClientIp(request);
  const limit = rateLimit(`reset:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError(`Too many reset attempts. Try again in ${limit.retryAfter} seconds.`, 429);
  }

  const captchaError = await enforceCaptcha(body.captchaToken, ip);
  if (captchaError) return captchaError;

  const email = normalizeEmail(body.email ?? "");
  const otp = body.otp?.trim() ?? "";
  const password = body.password ?? "";

  if (!isValidEmail(email)) return jsonError("Enter a valid email address.");
  if (!validateOtpShape(otp)) return jsonError("Enter the 6 digit OTP.");

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return jsonError(passwordCheck.failures.join(" "));
  }

  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
    select: { id: true },
  });
  if (!user) return jsonError("OTP is invalid or expired.", 400);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      tokenHash: hashOtp(email, otp, "password"),
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    const latestToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (latestToken) {
      if (latestToken.attempts >= 4) {
        await prisma.passwordResetToken.delete({ where: { id: latestToken.id } });
        return jsonError("Too many incorrect OTP attempts. Request a new OTP.", 429);
      }

      await prisma.passwordResetToken.update({
        where: { id: latestToken.id },
        data: { attempts: { increment: 1 } },
      });
    }

    return jsonError("OTP is invalid or expired.", 400);
  }

  if (resetToken.attempts >= 5) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return jsonError("Too many incorrect OTP attempts. Request a new OTP.", 429);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: await hashPassword(password),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return Response.json({ message: "Password reset successfully." });
}
