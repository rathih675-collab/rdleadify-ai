import { jsonError, readJson } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { hashOpaqueToken } from "@/lib/server/tokens";

type VerifyEmailBody = {
  token?: string;
};

export async function POST(request: Request) {
  const body = await readJson<VerifyEmailBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const token = body.token?.trim() ?? "";
  if (!token) return jsonError("Verification token is required.");

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
  });

  if (
    !verificationToken ||
    verificationToken.usedAt ||
    verificationToken.expiresAt < new Date()
  ) {
    return jsonError("Verification token is invalid or expired.", 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return Response.json({ message: "Email verified successfully." });
}
