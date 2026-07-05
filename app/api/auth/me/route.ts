import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { enterprisePermissions, roleDisplayNames } from "@/lib/server/auth-constants";
import { jsonError } from "@/lib/server/api";
import { authLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";
import { verifySessionToken } from "@/lib/server/tokens";

export async function GET() {
  authLog("me route hit");
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    authLog("me validation failed", { reason: "missing_session_cookie" });
    return jsonError("Not authenticated.", 401);
  }

  try {
    const session = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        userRole: true,
        isActive: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        lastLoginIp: true,
        lastLoginUserAgent: true,
        workspaceId: true,
        workspace: { select: { id: true, name: true, slug: true, timezone: true } },
      },
    });

    if (!user || user.workspaceId !== session.workspaceId) {
      authLog("me validation failed", { reason: "user_not_found", userId: session.userId });
      return jsonError("Not authenticated.", 401);
    }

    const activeSession = await prisma.authSession.findFirst({
      where: {
        userId: user.id,
        workspaceId: session.workspaceId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastSeenAt: "desc" },
      select: {
        id: true,
        device: true,
        ipAddress: true,
        userAgent: true,
        lastSeenAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return Response.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.userRole,
        roleLabel: roleDisplayNames[user.userRole] ?? user.userRole,
        status: user.isActive ? "Active" : "Suspended",
        emailVerified: Boolean(user.emailVerifiedAt),
        emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        lastLoginIp: user.lastLoginIp,
        lastLoginUserAgent: user.lastLoginUserAgent,
        workspace: user.workspace,
        timezone: user.workspace.timezone,
        language: "English",
        permissions: enterprisePermissions[user.userRole] ?? [],
      },
      session: activeSession
        ? {
            ...activeSession,
            createdAt: activeSession.createdAt.toISOString(),
            lastSeenAt: activeSession.lastSeenAt?.toISOString() ?? null,
            expiresAt: activeSession.expiresAt.toISOString(),
          }
        : null,
    });
  } catch {
    authLog("me validation failed", { reason: "invalid_session" });
    return jsonError("Not authenticated.", 401);
  }
}
