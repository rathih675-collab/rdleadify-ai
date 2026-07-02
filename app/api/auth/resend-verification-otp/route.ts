import type { NextRequest } from "next/server";

import { sendVerificationOtpEmail } from "@/lib/email";
import { jsonError, readJson } from "@/lib/server/api";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { createOtp, hashOtp } from "@/lib/server/otp";
import { prisma } from "@/lib/server/prisma";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { addMinutes } from "@/lib/server/tokens";

type ResendOtpBody = {
  email?: string;
};

export async function POST(request: NextRequest) {
  const body = await readJson<ResendOtpBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const ip = getClientIp(request);
  const limit = rateLimit(`resend-email-otp:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError(`Too many OTP requests. Try again in ${limit.retryAfter} seconds.`, 429);
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) return jsonError("Enter a valid email address.");

  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    return Response.json({ message: "If an account exists, a new OTP has been sent." });
  }

  if (user.emailVerifiedAt) {
    return Response.json({ message: "Email is already verified." });
  }

  const otp = createOtp();
  const emailResult = await sendVerificationOtpEmail({
    to: email,
    name: user.name ?? "there",
    otp,
  });

  if (!emailResult.sent) {
    return jsonError("Verification email could not be sent.", 503);
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: {
        OR: [{ userId: user.id }, { expiresAt: { lt: new Date() } }],
      },
    }),
    prisma.emailVerificationToken.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.id,
        tokenHash: hashOtp(email, otp, "email"),
        expiresAt: addMinutes(10),
      },
    }),
  ]);

  return Response.json({ message: "A new OTP has been sent." });
}
