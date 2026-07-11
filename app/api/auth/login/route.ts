import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, NORMAL_SESSION_SECONDS, REFRESH_COOKIE_NAME, REMEMBER_ME_SESSION_SECONDS } from "@/lib/server/auth-constants";
import { isValidEmail, normalizeEmail } from "@/lib/server/auth-validation";
import { authLog } from "@/lib/server/dev-log";
import { verifyPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp, getDeviceLabel, getUserAgent } from "@/lib/server/request";
import { createOpaqueToken, hashOpaqueToken, sessionCookieOptions, signSessionToken } from "@/lib/server/tokens";

type LoginBody = { email?: string; password?: string; rememberMe?: boolean; captchaToken?: string };
type CaptchaResult = { success?: boolean; "error-codes"?: string[] };
const json = (success: boolean, error?: string, status = 200) => NextResponse.json(success ? { success: true, redirect: "/dashboard" } : { success: false, error: error ?? "Unable to sign in." }, { status, headers: { "Cache-Control": "no-store" } });

async function verifyCaptcha(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) { if (process.env.NODE_ENV === "production") throw new Error("NOT_CONFIGURED"); return { success: true } as CaptchaResult; }
  if (!token) return { success: false, "error-codes": ["missing-input-response"] } as CaptchaResult;
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: new URLSearchParams({ secret, response: token, remoteip: ip }), signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("UPSTREAM_ERROR");
    return await response.json() as CaptchaResult;
  } finally { clearTimeout(timer); }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now(); const requestId = randomUUID();
  authLog("login request received", { requestId });
  try {
    let body: LoginBody;
    try { body = await request.json() as LoginBody; } catch { return json(false, "Invalid login request. Please try again.", 400); }
    const ip = getClientIp(request); const userAgent = getUserAgent(request);
    const limit = rateLimit(`login:${ip}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) return json(false, `Too many login attempts. Try again in ${limit.retryAfter} seconds.`, 429);

    authLog("captcha verification started", { requestId });
    let captcha: CaptchaResult;
    try { captcha = await verifyCaptcha(body.captchaToken ?? "", ip); }
    catch (error) { const reason = error instanceof Error ? error.message : "UNKNOWN"; authLog("captcha verification result", { requestId, success: false, reason }); return json(false, reason === "NOT_CONFIGURED" ? "Security verification is not configured. Please contact support." : "Security verification is unavailable. Please try again.", 503); }
    authLog("captcha verification result", { requestId, success: Boolean(captcha.success), errorCodes: captcha.success ? undefined : captcha["error-codes"] });
    if (!captcha.success) return json(false, "Security verification failed. Please try again.", 400);

    const email = normalizeEmail(body.email ?? ""); const password = body.password ?? "";
    if (!isValidEmail(email) || !password) return json(false, "Invalid email or password.", 401);
    authLog("user lookup started", { requestId });
    const user = await prisma.user.findFirst({ where: { email }, select: { id: true, workspaceId: true, email: true, passwordHash: true, userRole: true, isActive: true, emailVerifiedAt: true, failedLoginAttempts: true, lockedUntil: true } });
    authLog("user lookup result", { requestId, found: Boolean(user) });
    if (!user) return json(false, "Invalid email or password.", 401);
    if (user.lockedUntil && user.lockedUntil > new Date()) return json(false, "Account is temporarily locked. Try again later.", 423);
    const validPassword = await verifyPassword(password, user.passwordHash);
    authLog("password verification result", { requestId, success: validPassword, userId: user.id });
    if (!validPassword) { const attempts = user.failedLoginAttempts + 1; await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 900_000) : null } }); return json(false, attempts >= 5 ? "Account locked for 15 minutes after too many failed attempts." : "Invalid email or password.", 401); }
    if (!user.isActive) return json(false, "This account is inactive.", 403);
    if (!user.emailVerifiedAt) return json(false, "Please verify your email.", 403);

    const rememberMe = Boolean(body.rememberMe); const maxAge = rememberMe ? REMEMBER_ME_SESSION_SECONDS : NORMAL_SESSION_SECONDS;
    const refreshToken = createOpaqueToken(); const refreshTokenHash = hashOpaqueToken(refreshToken);
    const token = await signSessionToken({ userId: user.id, workspaceId: user.workspaceId, role: user.userRole, email: user.email }, rememberMe ? "30d" : "24h");
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), lastLoginIp: ip, lastLoginUserAgent: userAgent, failedLoginAttempts: 0, lockedUntil: null } }),
      prisma.authSession.create({ data: { userId: user.id, workspaceId: user.workspaceId, refreshTokenHash, ipAddress: ip, userAgent, device: getDeviceLabel(userAgent), expiresAt: new Date(Date.now() + maxAge * 1000), lastSeenAt: new Date() } }),
      prisma.refreshToken.create({ data: { userId: user.id, workspaceId: user.workspaceId, tokenHash: refreshTokenHash, expiresAt: new Date(Date.now() + maxAge * 1000) } }),
      prisma.activityLog.create({ data: { workspaceId: user.workspaceId, userId: user.id, action: "AUTH_LOGIN_SUCCESS", entityType: "AuthSession", metadata: { device: getDeviceLabel(userAgent), rememberMe, status: "SUCCESS" }, ipAddress: ip, userAgent } }),
    ]);
    authLog("session creation result", { requestId, success: true, userId: user.id, rememberMe });
    const response = json(true); response.cookies.set(AUTH_COOKIE_NAME, token, sessionCookieOptions(maxAge)); response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, sessionCookieOptions(maxAge));
    authLog("redirect result", { requestId, redirect: "/dashboard" }); return response;
  } catch (error) {
    authLog("login request failed", { requestId, errorType: error instanceof Error ? error.name : "UnknownError" });
    return json(false, "The login service is temporarily unavailable. Please try again.", 500);
  } finally { authLog("login request completed", { requestId, durationMs: Date.now() - startedAt }); }
}
