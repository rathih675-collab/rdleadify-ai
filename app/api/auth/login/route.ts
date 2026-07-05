import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/server/tokens";

import { AUTH_COOKIE_NAME, NORMAL_SESSION_SECONDS, REFRESH_COOKIE_NAME, REMEMBER_ME_SESSION_SECONDS } from "@/lib/server/auth-constants";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { jsonError, readJson } from "@/lib/server/api";
import { enforceCaptcha } from "@/lib/server/captcha";
import { authLog } from "@/lib/server/dev-log";
import { verifyPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp, getDeviceLabel, getUserAgent } from "@/lib/server/request";
import { sessionCookieOptions, signSessionToken } from "@/lib/server/tokens";

type LoginBody = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
  captchaToken?: string;
};

export async function POST(request: NextRequest) {
  authLog("login route hit");
  const body = await readJson<LoginBody>(request);
  if (!body) {
    authLog("login validation failed", { reason: "invalid_body" });
    return jsonError("Invalid request body.");
  }

  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);
  const limit = rateLimit(`login:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    authLog("login validation failed", { reason: "rate_limit", ip });
    return jsonError(`Too many login attempts. Try again in ${limit.retryAfter} seconds.`, 429);
  }

  const captchaError = await enforceCaptcha(body.captchaToken, ip);
  if (captchaError) return captchaError;

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!isValidEmail(email) || !password) {
    authLog("login validation failed", { reason: "invalid_credentials_shape" });
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
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  });

  if (!user) {
    authLog("login validation failed", { reason: "user_not_found", email });
    return jsonError("Invalid email or password.", 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    authLog("login validation failed", { reason: "account_locked", userId: user.id });
    return jsonError("Account is temporarily locked after multiple failed attempts. Try again later.", 423);
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil:
          failedLoginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });
    authLog("login validation failed", { reason: "bad_password", userId: user.id, failedLoginAttempts });

    return jsonError(
      failedLoginAttempts >= 5
        ? "Account locked for 15 minutes after too many failed attempts."
        : "Invalid email or password.",
      401,
    );
  }

  if (!user.isActive) {
    authLog("login validation failed", { reason: "inactive_account", userId: user.id });
    return jsonError("This account is inactive.", 403);
  }

  if (!user.emailVerifiedAt) {
    authLog("login validation failed", { reason: "email_unverified", userId: user.id });
    return jsonError("Please verify your email.", 403);
  }

  const rememberMe = Boolean(body.rememberMe);
  const sessionMaxAge = rememberMe ? REMEMBER_ME_SESSION_SECONDS : NORMAL_SESSION_SECONDS;
  const refreshToken = createOpaqueToken();
  const refreshTokenHash = hashOpaqueToken(refreshToken);

  const token = await signSessionToken({
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.userRole,
    email: user.email,
  }, rememberMe ? "30d" : "24h");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        lastLoginUserAgent: userAgent,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.authSession.create({
      data: {
        userId: user.id,
        workspaceId: user.workspaceId,
        refreshTokenHash,
        ipAddress: ip,
        userAgent,
        device: getDeviceLabel(userAgent),
        expiresAt: new Date(Date.now() + sessionMaxAge * 1000),
        lastSeenAt: new Date(),
      },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        workspaceId: user.workspaceId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + sessionMaxAge * 1000),
      },
    }),
    prisma.activityLog.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.id,
        action: "AUTH_LOGIN_SUCCESS",
        entityType: "AuthSession",
        metadata: {
          ip,
          userAgent,
          device: getDeviceLabel(userAgent),
          rememberMe,
          status: "SUCCESS",
        },
        ipAddress: ip,
        userAgent,
      },
    }),
  ]);
  authLog("login database update success", { userId: user.id, rememberMe });

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

  response.cookies.set(AUTH_COOKIE_NAME, token, sessionCookieOptions(sessionMaxAge));
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, sessionCookieOptions(sessionMaxAge));

  return response;
}
