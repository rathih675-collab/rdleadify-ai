import { Prisma } from "@/lib/generated/prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { backendLog } from "@/lib/server/dev-log";
import { createGoogleCalendarEvent, getGoogleIntegration, missingCalendarEnv } from "@/lib/server/google";
import { prisma } from "@/lib/server/prisma";

type CalendarBookBody = {
  leadId?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  lead?: Record<string, unknown>;
  requirement?: string;
  description?: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeStart(value?: string) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function buildDescription(body: CalendarBookBody) {
  const lead = body.lead ?? {};
  return [
    body.description || body.requirement || text(lead.requirement),
    text(lead.phone) ? `Phone: ${text(lead.phone)}` : null,
    body.attendeeEmail || text(lead.email) ? `Email: ${body.attendeeEmail || text(lead.email)}` : null,
    text(lead.summary) || text(lead.aiSummary) ? `AI Summary: ${text(lead.summary) || text(lead.aiSummary)}` : null,
  ].filter(Boolean).join("\n");
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "integrations:write");

    const body = await readJson<CalendarBookBody>(request);
    if (!body) throw new ApiError("Invalid request body.");
    if (!body.title && !body.lead?.name) {
      throw new ApiError("Missing extracted lead data. A lead name or appointment title is required.", 422);
    }
    if (!body.attendeeEmail && !body.attendeePhone && !body.lead?.email && !body.lead?.phone) {
      throw new ApiError("Missing attendee info. Capture lead email or phone before booking.", 422);
    }

    const integration = await getGoogleIntegration(session.workspaceId);
    const missingCalendar = missingCalendarEnv();
    if (integration && missingCalendar.length) {
      throw new ApiError("Missing calendar ID.", 400);
    }

    const startTime = normalizeStart(body.startTime);
    const explicitEnd = body.endTime ? new Date(body.endTime) : null;
    const endTime = explicitEnd && !Number.isNaN(explicitEnd.getTime())
      ? explicitEnd
      : new Date(startTime.getTime() + 30 * 60 * 1000);
    const leadName = text(body.lead?.name) || "Lead";
    const title = body.title?.slice(0, 160) || `Demo with ${leadName}`;
    const attendeeEmail = body.attendeeEmail || text(body.lead?.email) || undefined;
    const attendeePhone = body.attendeePhone || text(body.lead?.phone) || undefined;
    const description = buildDescription(body);

    let response: Record<string, unknown>;
    let status = "DEMO_BOOKED";
    let demoMode = true;
    let message = "Demo calendar appointment booked";

    if (integration) {
      try {
        const googleResponse = await createGoogleCalendarEvent(session.workspaceId, {
          summary: title,
          description,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined,
          conferenceData: {
            createRequest: {
              requestId: `rdleadify-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        });

        demoMode = false;
        status = "BOOKING_SUCCESS";
        message = "Booking successful";
        response = {
          mode: "REAL",
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          google: googleResponse,
          message,
        };
      } catch (error) {
        demoMode = false;
        status = "BOOKING_FAILED";
        message = error instanceof Error ? error.message : "Google Calendar booking failed.";
        response = {
          mode: "REAL",
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          error: message,
        };
      }
    } else {
      response = {
        mode: "DEMO",
        calendarId: "demo-calendar",
        eventId: `demo_${Date.now()}`,
        meetLink: "https://meet.google.com/demo-rdleadify",
        description,
        message,
      };
    }

    const log = await prisma.calendarBookingLog.create({
      data: {
        workspaceId: session.workspaceId,
        leadId: body.leadId,
        title,
        startTime,
        endTime,
        attendeeEmail,
        attendeePhone,
        status,
        response: toJsonValue(response),
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        attendeeEmail: true,
        attendeePhone: true,
        status: true,
        response: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        leadId: body.leadId,
        action: "GOOGLE_CALENDAR_BOOKING",
        entityType: "CalendarBookingLog",
        entityId: log.id,
        metadata: toJsonValue({
          demoMode,
          status: log.status,
          title: log.title,
          attendeeEmail: log.attendeeEmail,
          connected: Boolean(integration),
        }),
      },
    });

    backendLog("google-calendar", "booking attempt saved", {
      workspaceId: session.workspaceId,
      logId: log.id,
      status,
      demoMode,
    });

    if (status === "BOOKING_FAILED") {
      throw new ApiError(message, 502);
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

    const logs = await prisma.calendarBookingLog.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        leadId: true,
        title: true,
        startTime: true,
        endTime: true,
        attendeeEmail: true,
        attendeePhone: true,
        status: true,
        response: true,
        createdAt: true,
      },
    });

    return {
      logs,
      demoMode: !integration,
      connected: Boolean(integration),
      mode: integration ? "REAL" : "DEMO",
      missingCredentials: integration ? missingCalendarEnv() : ["Google not connected"],
    };
  });
}
