import { headers } from "next/headers";

import WidgetDashboardModule from "@/components/widget/WidgetDashboardModule";
import { InboxChannel } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

async function resolveWorkspaceId() {
  const workspaceId = (await headers()).get("x-rdleadify-workspace-id");
  if (workspaceId) return workspaceId;

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return workspace?.id;
}

export default async function WidgetDashboardPage() {
  const workspaceId = await resolveWorkspaceId();

  if (!workspaceId) {
    return (
      <WidgetDashboardModule
        visitors={0}
        chats={0}
        qualifiedLeads={0}
        appointments={0}
        conversionRate="0%"
        recent={[]}
      />
    );
  }

  const [chats, qualifiedLeads, appointments, recent] = await Promise.all([
    prisma.inboxConversation.count({
      where: { workspaceId, channel: InboxChannel.WEBSITE_CHAT },
    }),
    prisma.lead.count({
      where: { workspaceId, source: "Website Widget", score: { gte: 70 } },
    }),
    prisma.calendarBookingLog.count({
      where: { workspaceId, status: { contains: "DEMO" } },
    }),
    prisma.inboxConversation.findMany({
      where: { workspaceId, channel: InboxChannel.WEBSITE_CHAT },
      orderBy: { lastMessageTime: "desc" },
      take: 8,
      select: {
        id: true,
        customerName: true,
        lastMessage: true,
        leadScore: true,
        language: true,
        createdAt: true,
        tags: true,
      },
    }),
  ]);

  const visitors = Math.max(chats, recent.length);
  const conversionRate = chats ? `${Math.round((qualifiedLeads / chats) * 100)}%` : "0%";

  return (
    <WidgetDashboardModule
      visitors={visitors}
      chats={chats}
      qualifiedLeads={qualifiedLeads}
      appointments={appointments}
      conversionRate={conversionRate}
      recent={recent.map((conversation) => ({
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
      }))}
    />
  );
}
