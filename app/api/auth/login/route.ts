import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { jsonError, readJson } from "@/lib/server/api";
import { verifyPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { sessionCookieOptions, signSessionToken } from "@/lib/server/tokens";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = await readJson<LoginBody>(request);
  if (!body) return jsonError("Invalid request body.");

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!isValidEmail(email) || !password) {
    return jsonError("Invalid email or password.", 401);
  }

  const user = await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      workspaceId: true,
      email: true,
      name: true,
      passwordHash: true,
      userRole: true,
      isActive: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    return jsonError("This account is inactive.", 403);
  }

  if (!user.emailVerifiedAt) {
    return jsonError("Please verify your email before signing in.", 403);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await signSessionToken({
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.userRole,
    email: user.email,
  });

  const response = NextResponse.json({
    message: "Signed in successfully.",
    user: {
      id: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      name: user.name,
      role: user.userRole,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, sessionCookieOptions());

  return response;
}
