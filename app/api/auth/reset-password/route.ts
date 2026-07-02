import { jsonError, readJson } from "@/lib/server/api";
import { validatePassword } from "@/lib/server/auth-validation";
import { hashPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { hashOpaqueToken } from "@/lib/server/tokens";

type ResetPasswordBody = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = await readJson<ResetPasswordBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!token) return jsonError("Reset token is required.");

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return jsonError(passwordCheck.failures.join(" "));
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return jsonError("Reset token is invalid or expired.", 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return Response.json({ message: "Password reset successfully." });
}
