import { Prisma } from "@/lib/generated/prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
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

function hasGoogleCredentials() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI &&
      process.env.GOOGLE_CALENDAR_ID,
  );
}

function missingGoogleCredentials(): string[] {
  return [
    ["GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID],
    ["GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET],
    ["GOOGLE_REDIRECT_URI", process.env.GOOGLE_REDIRECT_URI],
    ["GOOGLE_CALENDAR_ID", process.env.GOOGLE_CALENDAR_ID],
    ["APP_URL", process.env.APP_URL],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => String(key));
}

function normalizeStart(value?: string) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "integrations:write");

    const body = await readJson<CalendarBookBody>(request);
    if (!body) throw new ApiError("Invalid request body.");
    if (!body.title && !body.lead?.name) {
      throw new ApiError("Missing extracted lead data. A lead name or appointment title is required.", 422);
    }
    if (!body.attendeeEmail && !body.attendeePhone) {
      throw new ApiError("Missing attendee info. Capture lead email or phone before booking.", 422);
    }

    const missingCredentials = missingGoogleCredentials();
    const demoMode = !hasGoogleCredentials();
    const startTime = normalizeStart(body.startTime);
    const explicitEnd = body.endTime ? new Date(body.endTime) : null;
    const endTime = explicitEnd && !Number.isNaN(explicitEnd.getTime())
      ? explicitEnd
      : new Date(startTime.getTime() + 30 * 60 * 1000);
    const title = body.title?.slice(0, 160) || "RDLeadify AI Demo Appointment";
    const response = demoMode
      ? {
          mode: "DEMO",
          missingCredentials,
          calendarId: "demo-calendar",
          eventId: `demo_${Date.now()}`,
          meetLink: "https://meet.google.com/demo-rdleadify",
          description: body.description ?? body.requirement,
          message: "Demo calendar booking completed",
        }
      : {
          mode: "REAL_OAUTH_PENDING",
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          authUrl: `${process.env.APP_URL ?? ""}/api/integrations/google/oauth/start?scope=calendar`,
          description: body.description ?? body.requirement,
          message: "Real booking pending setup. OAuth architecture is ready for the Google Calendar adapter.",
        };

    const log = await prisma.calendarBookingLog.create({
      data: {
        workspaceId: session.workspaceId,
        leadId: body.leadId,
        title,
        startTime,
        endTime,
        attendeeEmail: body.attendeeEmail,
        attendeePhone: body.attendeePhone,
        status: demoMode ? "DEMO_BOOKED" : "REAL_BOOKING_PENDING_SETUP",
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
          missingCredentials,
        }),
      },
    });

    return {
      mode: demoMode ? "DEMO" : "REAL_OAUTH_PENDING",
      demoMode,
      missingCredentials,
      message: demoMode ? "Demo calendar booking completed" : "Real booking pending setup",
      log,
    };
  });
}

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 10, max: 50 });

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

    const missingCredentials = missingGoogleCredentials();
    return {
      logs,
      demoMode: !hasGoogleCredentials(),
      mode: hasGoogleCredentials() ? "REAL_OAUTH_PENDING" : "DEMO",
      missingCredentials,
    };
  });
}
