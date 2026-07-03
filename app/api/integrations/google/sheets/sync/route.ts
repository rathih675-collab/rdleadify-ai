import { Prisma } from "@/lib/generated/prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type SheetSyncBody = {
  leadId?: string;
  lead?: Record<string, unknown>;
  source?: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function hasGoogleCredentials() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  );
}

function missingGoogleCredentials(): string[] {
  return [
    ["GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID],
    ["GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET],
    ["GOOGLE_REDIRECT_URI", process.env.GOOGLE_REDIRECT_URI],
    ["GOOGLE_SHEETS_SPREADSHEET_ID", process.env.GOOGLE_SHEETS_SPREADSHEET_ID],
    ["APP_URL", process.env.APP_URL],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => String(key));
}

function hasLeadPayload(lead?: Record<string, unknown>) {
  if (!lead) return false;
  return ["name", "phone", "email", "business", "requirement", "budget", "summary"].some((key) =>
    Boolean(lead[key]),
  );
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "integrations:write");

    const body = await readJson<SheetSyncBody>(request);
    if (!body) throw new ApiError("Invalid request body.");
    if (!hasLeadPayload(body.lead)) {
      throw new ApiError("Missing extracted lead data. Qualify a lead before syncing to Google Sheets.", 422);
    }

    const missingCredentials = missingGoogleCredentials();
    const demoMode = !hasGoogleCredentials();
    const payload = {
      source: body.source ?? "RDLeadify AI",
      lead: body.lead ?? {},
      leadId: body.leadId,
      requestedAt: new Date().toISOString(),
    };
    const response = demoMode
      ? {
          mode: "DEMO",
          missingCredentials,
          spreadsheetId: "demo-spreadsheet",
          rowNumber: Math.floor(Date.now() / 1000) % 10000,
          message: "Demo sync completed",
        }
      : {
          mode: "REAL_OAUTH_PENDING",
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          authUrl: `${process.env.APP_URL ?? ""}/api/integrations/google/oauth/start?scope=sheets`,
          message: "Real sync pending setup. OAuth architecture is ready for the Google Sheets adapter.",
        };

    const log = await prisma.googleSheetSyncLog.create({
      data: {
        workspaceId: session.workspaceId,
        leadId: body.leadId,
        status: demoMode ? "DEMO_SUCCESS" : "REAL_SYNC_PENDING_SETUP",
        payload: toJsonValue(payload),
        response: toJsonValue(response),
      },
      select: {
        id: true,
        status: true,
        payload: true,
        response: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        leadId: body.leadId,
        action: "GOOGLE_SHEET_SYNC",
        entityType: "GoogleSheetSyncLog",
        entityId: log.id,
        metadata: toJsonValue({
          demoMode,
          status: log.status,
          source: payload.source,
          missingCredentials,
        }),
      },
    });

    return {
      mode: demoMode ? "DEMO" : "REAL_OAUTH_PENDING",
      demoMode,
      missingCredentials,
      message: demoMode ? "Demo sync completed" : "Real sync pending setup",
      log,
    };
  });
}

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 10, max: 50 });

    const logs = await prisma.googleSheetSyncLog.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        leadId: true,
        status: true,
        payload: true,
        response: true,
        createdAt: true,
      },
    });

    const missingCredentials = missingGoogleCredentials();
    return {
      logs,
      demoMode: !hasGoogleCredentials(),
      mode: hasGoogleCredentials() ? "REAL_OAUTH_PENDING" : "DEMO",
      missingCredentials,
    };
  });
}
