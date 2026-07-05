import { withWorkspace } from "@/lib/server/api";
import { maskedGoogleStatus } from "@/lib/server/google";

export async function GET() {
  return withWorkspace(async (session) => {
    const status = await maskedGoogleStatus(session.workspaceId);
    return {
      ...status,
      message: status.connected ? "Sync successful" : "Demo mode active",
    };
  });
}
