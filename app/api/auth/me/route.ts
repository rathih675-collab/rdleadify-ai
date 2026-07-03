import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
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
        userRole: true,
        workspace: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!user) {
      authLog("me validation failed", { reason: "user_not_found", userId: session.userId });
      return jsonError("Not authenticated.", 401);
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole,
        workspace: user.workspace,
      },
    });
  } catch {
    authLog("me validation failed", { reason: "invalid_session" });
    return jsonError("Not authenticated.", 401);
  }
}
