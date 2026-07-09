import { withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function metadataRequirement(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return "";
  const record = metadata as Record<string, unknown>;
  return text(record.requirement) || text(record.previousRequirement);
}

export async function GET() {
  return withWorkspace(async (session) => {
    const [memories, conversations, activities, sheetLogs, bookingLogs] = await Promise.all([
      prisma.visitorMemory.findMany({
        where: { workspaceId: session.workspaceId },
        orderBy: { lastVisit: "desc" },
        take: 20,
        select: {
          id: true,
          visitorKey: true,
          name: true,
          phone: true,
          email: true,
          business: true,
          preferredLanguage: true,
          previousRequirements: true,
          previousSummaries: true,
          lastAiResponse: true,
          previousConversations: true,
          previousAppointments: true,
          buyingIntent: true,
          lastVisit: true,
          lastAiSummary: true,
          lastConversationId: true,
          leadId: true,
          metadata: true,
        },
      }),
      prisma.aIConversationLog.findMany({
        where: { workspaceId: session.workspaceId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          channel: true,
          summary: true,
          leadScore: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.findMany({
        where: {
          workspaceId: session.workspaceId,
          OR: [
            { action: { contains: "LEAD" } },
            { action: { contains: "CONVERSATION" } },
            { action: { contains: "MEMORY" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          leadId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.googleSheetSyncLog.findMany({
        where: { workspaceId: session.workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          leadId: true,
          status: true,
          payload: true,
          createdAt: true,
        },
      }),
      prisma.calendarBookingLog.findMany({
        where: { workspaceId: session.workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          leadId: true,
          title: true,
          status: true,
          startTime: true,
          attendeeEmail: true,
          attendeePhone: true,
          createdAt: true,
        },
      }),
    ]);

    const timeline = [
      ...memories.map((memory) => ({
        id: `memory-${memory.id}`,
        type: "AI Summary",
        title: memory.name || memory.business || "Visitor memory",
        detail:
          memory.lastAiSummary ||
          memory.previousSummaries[0] ||
          memory.lastAiResponse ||
          "Memory created for this visitor.",
        time: memory.lastVisit.toISOString(),
        visitorKey: memory.visitorKey,
      })),
      ...conversations.map((conversation) => ({
        id: `conversation-${conversation.id}`,
        type: "Previous Conversation",
        title: `${conversation.channel} conversation`,
        detail: conversation.summary || `Conversation ${conversation.status.toLowerCase()} with score ${conversation.leadScore}.`,
        time: conversation.createdAt.toISOString(),
      })),
      ...activities.map((activity) => ({
        id: `activity-${activity.id}`,
        type: activity.entityType === "Lead" || activity.leadId ? "Lead Update" : "Previous Conversation",
        title: activity.action.replaceAll("_", " "),
        detail: metadataRequirement(activity.metadata) || `${activity.entityType}${activity.entityId ? ` ${activity.entityId}` : ""}`,
        time: activity.createdAt.toISOString(),
      })),
      ...sheetLogs.map((log) => ({
        id: `sheet-${log.id}`,
        type: "Lead Update",
        title: "Google Sheet sync",
        detail: `Sheet sync ${log.status}${log.leadId ? ` for lead ${log.leadId}` : ""}.`,
        time: log.createdAt.toISOString(),
      })),
      ...bookingLogs.map((booking) => ({
        id: `booking-${booking.id}`,
        type: "Demo Booking",
        title: booking.title,
        detail: `${booking.status} for ${booking.attendeeEmail || booking.attendeePhone || "lead"} at ${booking.startTime.toISOString()}.`,
        time: booking.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 50);

    return { memories, timeline };
  });
}
