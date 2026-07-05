import { ApiError, assertPermission, withWorkspace } from "@/lib/server/api";
import { disconnectGoogleIntegration } from "@/lib/server/google";
import { prisma } from "@/lib/server/prisma";

export async function POST() {
  return withWorkspace(async (session) => {
    assertPermission(session, "integrations:write");

    const integration = await disconnectGoogleIntegration(session.workspaceId);
    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "GOOGLE_DISCONNECTED",
        entityType: "Integration",
        entityId: integration.id,
        metadata: { provider: "google" },
      },
    });

    return { message: "Google disconnected.", status: "disconnected" };
  });
}
