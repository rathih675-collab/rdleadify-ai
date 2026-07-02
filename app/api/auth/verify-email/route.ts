import { jsonError, readJson } from "@/lib/server/api";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { hashOtp } from "@/lib/server/otp";
import { prisma } from "@/lib/server/prisma";

type VerifyEmailBody = {
  email?: string;
  otp?: string;
};

export async function POST(request: Request) {
  const body = await readJson<VerifyEmailBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const email = normalizeEmail(body.email ?? "");
  const otp = body.otp?.trim() ?? "";

  if (!isValidEmail(email)) return jsonError("Enter a valid email address.");
  if (!/^\d{6}$/.test(otp)) return jsonError("Enter the 6 digit OTP.");

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  });

  if (!user) return jsonError("Invalid OTP.", 400);
  if (user.emailVerifiedAt) {
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

  return Response.json({ message: "Email verified successfully." });
}
