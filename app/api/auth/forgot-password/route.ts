import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { sendVerificationOtpEmail, shouldExposeDevOtp } from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { jsonError, readJson } from "@/lib/server/api";
import { enforceCaptcha } from "@/lib/server/captcha";
import { authLog } from "@/lib/server/dev-log";
import { createOtp, hashOtp } from "@/lib/server/otp";
import { prisma } from "@/lib/server/prisma";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { addMinutes } from "@/lib/server/tokens";

type ForgotPasswordBody = {
  email?: string;
  captchaToken?: string;
};

export async function POST(request: NextRequest) {
  authLog("forgot password route hit");
  const body = await readJson<ForgotPasswordBody>(request);
  if (!body) {
    authLog("forgot password validation failed", { reason: "invalid_body" });
    return jsonError("Invalid request body.");
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`forgot:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    authLog("forgot password validation failed", { reason: "rate_limit", ip });
    return jsonError(`Too many reset requests. Try again in ${limit.retryAfter} seconds.`, 429);
  }

  const captchaError = await enforceCaptcha(body.captchaToken, ip);
  if (captchaError) return captchaError;

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) {
    authLog("forgot password validation failed", { reason: "invalid_email" });
    return jsonError("Enter a valid email address.");
  }

  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
    select: { id: true, workspaceId: true, name: true },
  });

  if (!user) {
    return NextResponse.json({
      message: "If an account exists, a password reset OTP has been sent.",
    });
  }

  const otp = createOtp();
  const emailResult = await sendVerificationOtpEmail({
    to: email,
    name: user.name ?? "there",
    otp,
    purpose: "reset",
  });

  if (!emailResult.sent) {
    authLog("forgot password email send fail", {
      email,
      reason: emailResult.reason,
      devOtp: shouldExposeDevOtp(emailResult) ? otp : undefined,
    });
    if (process.env.NODE_ENV === "production") {
      return jsonError("Password reset email could not be sent.", 503);
    }
  }

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    }),
    prisma.passwordResetToken.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.id,
        tokenHash: hashOtp(email, otp, "password"),
        expiresAt: addMinutes(10),
      },
    }),
  ]);
  authLog("forgot password database update success", { userId: user.id, email });
  const exposeDevOtp = shouldExposeDevOtp(emailResult);

  return NextResponse.json({
    message: emailResult.sent
      ? "OTP sent to your email. Please check your inbox."
      : exposeDevOtp
        ? "Email is not configured. Use the development OTP below."
        : "Email delivery failed. Please try again.",
    email,
    emailSent: emailResult.sent,
    devOtp: exposeDevOtp ? otp : undefined,
  });
}
