import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ApiError, assertPermission, requireWorkspaceSession } from "@/lib/server/api";
import { buildGoogleAuthUrl } from "@/lib/server/google";
import { createOpaqueToken, sessionCookieOptions } from "@/lib/server/tokens";

const stateCookieName = "rdleadify_google_oauth_state";

export async function GET() {
  try {
    const session = await requireWorkspaceSession();
    assertPermission(session, "integrations:write");

    const nonce = createOpaqueToken();
    const state = Buffer.from(JSON.stringify({
      nonce,
      workspaceId: session.workspaceId,
      userId: session.userId,
      createdAt: Date.now(),
    })).toString("base64url");

    const response = NextResponse.redirect(buildGoogleAuthUrl(state));
    response.cookies.set(stateCookieName, state, sessionCookieOptions(10 * 60));
    return response;
  } catch (error) {
    const message = error instanceof ApiError || error instanceof Error ? error.message : "Google connect failed.";
    return NextResponse.redirect(`${process.env.APP_URL ?? ""}/integrations/google?error=${encodeURIComponent(message)}`);
  }
}
