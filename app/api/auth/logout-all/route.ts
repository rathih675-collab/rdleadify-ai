import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { requireWorkspaceSession } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function POST() {
  const session = await requireWorkspaceSession();

  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: { userId: session.userId, workspaceId: session.workspaceId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.authSession.updateMany({
      where: { userId: session.userId, workspaceId: session.workspaceId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "AUTH_LOGOUT_ALL",
        entityType: "AuthSession",
        metadata: { status: "SUCCESS" },
      },
    }),
  ]);

  const response = NextResponse.json({ ok: true, message: "Signed out from all devices." });
  for (const cookieName of [AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME]) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}
