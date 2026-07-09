import { Prisma } from "@prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { backendLog } from "@/lib/server/dev-log";
import { GoogleApiError, appendLeadToGoogleSheet, getGoogleIntegration, missingSheetsEnv } from "@/lib/server/google";
import { prisma } from "@/lib/server/prisma";

type SheetSyncBody = {
  leadId?: string;
  lead?: Record<string, unknown>;
  source?: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function hasLeadPayload(lead?: Record<string, unknown>) {
  if (!lead) return false;
  return ["name", "phone", "email", "company", "business", "requirement", "budget", "summary"].some((key) =>
    Boolean(lead[key]),
  );
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function buildSheetRow(lead: Record<string, unknown>, source?: string) {
  return [
    text(lead.name),
    text(lead.phone),
    text(lead.email),
    text(lead.company) || text(lead.business),
    text(lead.requirement),
    text(lead.budget),
    source || text(lead.source) || "RDLeadify AI",
    text(lead.score) || text(lead.leadScore),
    text(lead.summary) || text(lead.aiSummary),
    new Date().toISOString(),
  ];
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "integrations:write");

    const body = await readJson<SheetSyncBody>(request);
    if (!body) throw new ApiError("Invalid request body.");
    if (!hasLeadPayload(body.lead)) {
      throw new ApiError("Missing extracted lead data. Qualify a lead before syncing to Google Sheets.", 422);
    }

    const integration = await getGoogleIntegration(session.workspaceId);
    const missingSpreadsheet = missingSheetsEnv();
    const payload = {
      source: body.source ?? "RDLeadify AI",
      lead: body.lead ?? {},
      leadId: body.leadId,
      requestedAt: new Date().toISOString(),
    };

    let response: Record<string, unknown>;
    let status = "DEMO_SUCCESS";
    let demoMode = true;
    let message = "Demo sync completed";

    if (integration && missingSpreadsheet.length) {
      throw new ApiError("Missing spreadsheet ID.", 400);
    }

    if (integration) {
      try {
        const googleResponse = await appendLeadToGoogleSheet(
          session.workspaceId,
          buildSheetRow(body.lead ?? {}, payload.source),
        );
        demoMode = false;
        status = "SYNC_SUCCESS";
        message = "Sync successful";
        response = {
          mode: "REAL",
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          google: googleResponse,
          message,
        };
      } catch (error) {
        status = "SYNC_FAILED";
        demoMode = false;
        message = error instanceof Error ? error.message : "Google Sheets sync failed.";
        response = {
          mode: "REAL",
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          error: message,
          ...(error instanceof GoogleApiError
            ? {
                diagnostics: error.diagnostics,
                googleApiErrorCode: error.code,
                googleApiErrorMessage: error.message,
                googleApiResponseBody: error.responseBody,
              }
            : {}),
        };
      }
    } else {
      response = {
        mode: "DEMO",
        spreadsheetId: "demo-spreadsheet",
        rowNumber: Math.floor(Date.now() / 1000) % 10000,
        message,
      };
    }

    const log = await prisma.googleSheetSyncLog.create({
      data: {
        workspaceId: session.workspaceId,
        leadId: body.leadId,
        status,
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
          connected: Boolean(integration),
        }),
      },
    });

    backendLog("google-sheets", "sync attempt saved", {
      workspaceId: session.workspaceId,
      logId: log.id,
      status,
      demoMode,
    });

    if (status === "SYNC_FAILED") {
      const errorStatus =
        typeof response.googleApiErrorCode === "number" && response.googleApiErrorCode >= 400
          ? response.googleApiErrorCode
          : 502;
      throw new ApiError(message, errorStatus, response);
    }

    return {
      ok: true,
      mode: demoMode ? "DEMO" : "REAL",
      demoMode,
      connected: Boolean(integration),
      message,
      log,
    };
  });
}

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 10, max: 50 });
    const integration = await getGoogleIntegration(session.workspaceId);

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

    return {
      logs,
      demoMode: !integration,
      connected: Boolean(integration),
      mode: integration ? "REAL" : "DEMO",
      missingCredentials: integration ? missingSheetsEnv() : ["Google not connected"],
    };
  });
}
