import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { exchangeGoogleCode, fetchGoogleProfile, upsertGoogleIntegration } from "@/lib/server/google";
import { verifySessionToken } from "@/lib/server/tokens";
import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";

const stateCookieName = "rdleadify_google_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.APP_URL ?? `${url.protocol}//${url.host}`;
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stateCookieName)?.value;
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (error) return redirectWith(appUrl, "error", `Google connection cancelled: ${error}`);
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWith(appUrl, "error", "Google OAuth state verification failed.");
  }
  if (!sessionToken) return redirectWith(appUrl, "error", "Not authenticated.");

  try {
    const session = await verifySessionToken(sessionToken);
    const statePayload = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
      workspaceId?: string;
      userId?: string;
      createdAt?: number;
    };

    if (
      statePayload.workspaceId !== session.workspaceId ||
      statePayload.userId !== session.userId ||
      !statePayload.createdAt ||
      Date.now() - statePayload.createdAt > 10 * 60 * 1000
    ) {
      return redirectWith(appUrl, "error", "Google OAuth session expired. Try connecting again.");
    }

    const tokens = await exchangeGoogleCode(code);
    const profile = await fetchGoogleProfile(tokens.access_token);
    const integration = await upsertGoogleIntegration({
      workspaceId: session.workspaceId,
      tokens,
      connectedEmail: profile.email ?? session.email,
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "GOOGLE_CONNECTED",
        entityType: "Integration",
        entityId: integration.id,
        metadata: {
          provider: "google",
          connectedEmail: profile.email ?? session.email,
          scopes: tokens.scope?.split(/\s+/).filter(Boolean) ?? [],
        },
      },
    });

    const response = redirectWith(appUrl, "connected", "Google connected successfully.");
    response.cookies.delete(stateCookieName);
    return response;
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : "Google callback failed.";
    return redirectWith(appUrl, "error", message);
  }
}

function redirectWith(appUrl: string, key: "connected" | "error", message: string) {
  return NextResponse.redirect(`${appUrl}/integrations/google?${key}=${encodeURIComponent(message)}`);
}
