import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { prisma } from "@/lib/server/prisma";
import { hashOpaqueToken } from "@/lib/server/tokens";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) {
    await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { tokenHash: hashOpaqueToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.authSession.updateMany({
        where: { refreshTokenHash: hashOpaqueToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  const response = NextResponse.json({ message: "Signed out successfully." });

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
