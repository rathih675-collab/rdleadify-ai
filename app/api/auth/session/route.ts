import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REMEMBER_ME_SESSION_SECONDS,
  SESSION_REFRESH_THRESHOLD_SECONDS,
} from "@/lib/server/auth-constants";
import { jsonError } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { hashOpaqueToken, sessionCookieOptions, signSessionToken, verifySessionToken } from "@/lib/server/tokens";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!token) return jsonError("Not authenticated.", 401);

  try {
    const session = await verifySessionToken(token);
    const sessionRecord = refreshToken
      ? await prisma.authSession.findFirst({
          where: {
            workspaceId: session.workspaceId,
            userId: session.userId,
            refreshTokenHash: hashOpaqueToken(refreshToken),
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          select: {
            id: true,
            expiresAt: true,
            lastSeenAt: true,
            ipAddress: true,
            userAgent: true,
            device: true,
            createdAt: true,
          },
        })
      : null;

    if (!sessionRecord) return jsonError("Session expired or revoked.", 401);

    await prisma.authSession.update({
      where: { id: sessionRecord.id },
      data: { lastSeenAt: new Date() },
    });

    const secondsRemaining = Math.max(0, Math.floor((sessionRecord.expiresAt.getTime() - Date.now()) / 1000));
    if (secondsRemaining <= SESSION_REFRESH_THRESHOLD_SECONDS) {
      const refreshedToken = await signSessionToken(session, "24h");
      const refreshedResponse = NextResponse.json({
        ok: true,
        session: {
          ...sessionRecord,
          expiresAt: sessionRecord.expiresAt.toISOString(),
          lastSeenAt: new Date().toISOString(),
          createdAt: sessionRecord.createdAt.toISOString(),
          secondsRemaining,
        },
        refreshed: true,
      });
      refreshedResponse.cookies.set(AUTH_COOKIE_NAME, refreshedToken, sessionCookieOptions(Math.min(REMEMBER_ME_SESSION_SECONDS, secondsRemaining + 60 * 60 * 24)));
      return refreshedResponse;
    }

    return NextResponse.json({
      ok: true,
      session: {
        ...sessionRecord,
        expiresAt: sessionRecord.expiresAt.toISOString(),
        lastSeenAt: sessionRecord.lastSeenAt?.toISOString() ?? null,
        createdAt: sessionRecord.createdAt.toISOString(),
        secondsRemaining,
      },
      refreshed: false,
    });
  } catch {
    return jsonError("Not authenticated.", 401);
  }
}
