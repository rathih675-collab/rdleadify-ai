import { jsonError, readJson } from "@/lib/server/api";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { authLog } from "@/lib/server/dev-log";
import { hashOtp } from "@/lib/server/otp";
import { prisma } from "@/lib/server/prisma";

type VerifyEmailBody = {
  email?: string;
  otp?: string;
};

export async function POST(request: Request) {
  authLog("verify otp route hit");
  const body = await readJson<VerifyEmailBody>(request);
  if (!body) {
    authLog("verify otp validation failed", { reason: "invalid_body" });
    return jsonError("Invalid request body.");
  }

  const email = normalizeEmail(body.email ?? "");
  const otp = body.otp?.trim() ?? "";

  if (!isValidEmail(email)) {
    authLog("verify otp validation failed", { reason: "invalid_email" });
    return jsonError("Enter a valid email address.");
  }
  if (!/^\d{6}$/.test(otp)) {
    authLog("verify otp validation failed", { reason: "invalid_otp_shape" });
    return jsonError("Enter the 6 digit OTP.");
  }

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  });

  if (!user) {
    authLog("verify otp validation failed", { reason: "user_not_found", email });
    return jsonError("Invalid OTP.", 400);
  }
  if (user.emailVerifiedAt) {
    authLog("verify otp already verified", { userId: user.id });
    return Response.json({ message: "Email already verified." });
  }

  const verificationOtp = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: user.id,
      tokenHash: hashOtp(email, otp, "email"),
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verificationOtp || verificationOtp.expiresAt < new Date()) {
    const latestOtp = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      if (latestOtp.attempts >= 4) {
        await prisma.emailVerificationToken.delete({ where: { id: latestOtp.id } });
        authLog("verify otp validation failed", { reason: "too_many_attempts", userId: user.id });
        return jsonError("Too many incorrect OTP attempts. Request a new OTP.", 429);
      }

      await prisma.emailVerificationToken.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } },
      });
    }

    return jsonError("OTP is invalid or expired.", 400);
  }

  if (verificationOtp.attempts >= 5) {
    await prisma.emailVerificationToken.delete({ where: { id: verificationOtp.id } });
    authLog("verify otp validation failed", { reason: "too_many_attempts", userId: user.id });
    return jsonError("Too many incorrect OTP attempts. Request a new OTP.", 429);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    }),
  ]);
  authLog("verify otp database update success", { userId: user.id });

  return Response.json({ message: "Email verified successfully." });
}
