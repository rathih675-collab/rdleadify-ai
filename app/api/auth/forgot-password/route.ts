import { NextResponse } from "next/server";

import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { jsonError, readJson } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { addHours, createOpaqueToken, hashOpaqueToken } from "@/lib/server/tokens";

type ForgotPasswordBody = {
  email?: string;
};

export async function POST(request: Request) {
  const body = await readJson<ForgotPasswordBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const email = normalizeEmail(body.email ?? "");
  if (!isValidEmail(email)) return jsonError("Enter a valid email address.");

  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
    select: { id: true, workspaceId: true },
  });

  if (!user) {
    return NextResponse.json({
      message: "If an account exists, a reset link has been prepared.",
    });
  }

  const resetToken = createOpaqueToken();

  await prisma.passwordResetToken.create({
    data: {
      workspaceId: user.workspaceId,
      userId: user.id,
      tokenHash: hashOpaqueToken(resetToken),
      expiresAt: addHours(1),
    },
  });

  return NextResponse.json({
    message: "If an account exists, a reset link has been prepared.",
    resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
  });
}
