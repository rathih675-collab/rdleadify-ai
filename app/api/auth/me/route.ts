import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { jsonError } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { verifySessionToken } from "@/lib/server/tokens";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) return jsonError("Not authenticated.", 401);

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

    if (!user) return jsonError("Not authenticated.", 401);

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
    return jsonError("Not authenticated.", 401);
  }
}
