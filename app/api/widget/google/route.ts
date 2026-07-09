import { NextResponse } from "next/server";

import { Prisma } from "@/lib/generated/prisma/client";
import {
  GoogleApiError,
  appendLeadToGoogleSheet,
  createGoogleCalendarEvent,
  getGoogleIntegration,
  missingCalendarEnv,
  missingSheetsEnv,
} from "@/lib/server/google";
import { prisma } from "@/lib/server/prisma";
import { corsHeaders, resolveWidgetWorkspace } from "@/lib/server/widget";

type GoogleWidgetBody = {
  action?: "sheet" | "calendar";
  workspaceKey?: string;
  leadId?: string;
  lead?: Record<string, unknown>;
  title?: string;
  startTime?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  conversationId?: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeStart(value?: string) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date(Date.now() + 24 * 60 * 60 * 1000);
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function buildSheetRow(lead: Record<string, unknown>, source: string) {
  return [
    text(lead.name),
    text(lead.phone),
    text(lead.email),
    text(lead.company) || text(lead.business),
    text(lead.requirement),
    text(lead.budget),
    source,
    text(lead.score) || text(lead.leadScore),
    text(lead.summary) || text(lead.aiSummary),
    new Date().toISOString(),
  ];
}

function buildDescription(lead: Record<string, unknown>, attendeeEmail?: string) {
  return [
    text(lead.requirement),
    text(lead.phone) ? `Phone: ${text(lead.phone)}` : null,
    attendeeEmail || text(lead.email) ? `Email: ${attendeeEmail || text(lead.email)}` : null,
    text(lead.summary) || text(lead.aiSummary) ? `AI Summary: ${text(lead.summary) || text(lead.aiSummary)}` : null,
  ].filter(Boolean).join("\n");
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = (await request.json()) as GoogleWidgetBody;
    const workspace = await resolveWidgetWorkspace(
      body.workspaceKey || request.headers.get("x-rdleadify-workspace") || undefined,
    );
    const integration = await getGoogleIntegration(workspace.id);

    if (body.action === "calendar") {
      if (!body.leadId && !body.attendeeEmail && !body.attendeePhone && !body.lead?.email && !body.lead?.phone) {
        return NextResponse.json(
          { ok: false, error: "Missing lead data. Capture or save a lead before booking a demo appointment." },
          { status: 422, headers: corsHeaders(origin) },
        );
      }

      const startTime = normalizeStart(body.startTime);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      const title = body.title?.slice(0, 160) || `Demo with ${text(body.lead?.name) || "Website Lead"}`;
      const attendeeEmail = body.attendeeEmail || text(body.lead?.email) || undefined;
      const attendeePhone = body.attendeePhone || text(body.lead?.phone) || undefined;
      const description = buildDescription(body.lead ?? {}, attendeeEmail);
      let response: Record<string, unknown>;
      let status = "DEMO_BOOKED";
      let mode = "DEMO";
      let message = "Demo calendar appointment booked";

      if (integration) {
        if (missingCalendarEnv().length) {
          return NextResponse.json({ ok: false, error: "Missing calendar ID." }, { status: 400, headers: corsHeaders(origin) });
        }
        const googleResponse = await createGoogleCalendarEvent(workspace.id, {
          summary: title,
          description,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined,
          conferenceData: {
            createRequest: {
              requestId: `rdleadify-widget-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        });
        response = {
          mode: "REAL",
          source: "Website Widget",
          google: googleResponse,
          conversationId: body.conversationId,
        };
        status = "BOOKING_SUCCESS";
        mode = "REAL";
        message = "Booking successful";
      } else {
        response = {
          mode: "DEMO",
          source: "Website Widget",
          eventId: `widget_demo_${Date.now()}`,
          meetLink: "https://meet.google.com/demo-rdleadify",
          conversationId: body.conversationId,
        };
      }

      const log = await prisma.calendarBookingLog.create({
        data: {
          workspaceId: workspace.id,
          leadId: body.leadId,
          title,
          startTime,
          endTime,
          attendeeEmail,
          attendeePhone,
          status,
          response: toJsonValue(response),
        },
        select: { id: true, status: true, title: true, startTime: true, response: true },
      });

      await prisma.activityLog.create({
        data: {
          workspaceId: workspace.id,
          leadId: body.leadId,
          action: "WIDGET_GOOGLE_CALENDAR_BOOKING",
          entityType: "CalendarBookingLog",
          entityId: log.id,
          metadata: toJsonValue({ source: "Website Widget", conversationId: body.conversationId, mode }),
        },
      });

      return NextResponse.json({ ok: true, mode, message, log }, { headers: corsHeaders(origin) });
    }

    if (!body.leadId && !body.lead?.name && !body.lead?.phone && !body.lead?.email) {
      return NextResponse.json(
        { ok: false, error: "Missing lead data. Capture or save a lead before sending to Google Sheet." },
        { status: 422, headers: corsHeaders(origin) },
      );
    }

    let response: Record<string, unknown>;
    let status = "DEMO_SUCCESS";
    let mode = "DEMO";
    let message = "Demo sync completed";

    if (integration) {
      if (missingSheetsEnv().length) {
        return NextResponse.json({ ok: false, error: "Missing spreadsheet ID." }, { status: 400, headers: corsHeaders(origin) });
      }
      try {
        const googleResponse = await appendLeadToGoogleSheet(workspace.id, buildSheetRow(body.lead ?? {}, "Website Widget"));
        response = {
          mode: "REAL",
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          google: googleResponse,
          message: "Sync successful",
        };
        status = "SYNC_SUCCESS";
        mode = "REAL";
        message = "Sync successful";
      } catch (error) {
        const details = error instanceof GoogleApiError
          ? {
              diagnostics: error.diagnostics,
              googleApiErrorCode: error.code,
              googleApiErrorMessage: error.message,
              googleApiResponseBody: error.responseBody,
            }
          : undefined;
        response = {
          mode: "REAL",
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          error: error instanceof Error ? error.message : "Google Sheet sync failed.",
          details,
        };
        status = "SYNC_FAILED";
        mode = "REAL";
        message = error instanceof Error ? error.message : "Google Sheet sync failed.";
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
        workspaceId: workspace.id,
        leadId: body.leadId,
        status,
        payload: toJsonValue({
          source: "Website Widget",
          lead: body.lead ?? {},
          conversationId: body.conversationId,
          requestedAt: new Date().toISOString(),
        }),
        response: toJsonValue(response),
      },
      select: { id: true, status: true, response: true, createdAt: true },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: workspace.id,
        leadId: body.leadId,
          action: "WIDGET_GOOGLE_SHEET_SYNC",
          entityType: "GoogleSheetSyncLog",
          entityId: log.id,
          metadata: toJsonValue({ source: "Website Widget", conversationId: body.conversationId, mode }),
        },
      });

    if (status === "SYNC_FAILED") {
      const responseDetails = response.details ?? response;
      return NextResponse.json(
        { ok: false, mode, error: message, details: responseDetails, log },
        { status: 502, headers: corsHeaders(origin) },
      );
    }

    return NextResponse.json({ ok: true, mode, message, log }, { headers: corsHeaders(origin) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Widget Google action failed." },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
