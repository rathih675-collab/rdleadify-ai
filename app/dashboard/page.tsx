import { headers } from "next/headers";

import DashboardModule from "@/components/dashboard/DashboardModule";
import { InboxChannel } from "@/lib/generated/prisma/enums";
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

export default async function DashboardPage() {
  const workspaceId = await resolveWorkspaceId();

  if (!workspaceId) return <DashboardModule />;

  const [leads, conversations, appointments, sheetSyncs, aiChats, websiteConversations, widgetLeads] = await Promise.all([
    prisma.lead.count({ where: { workspaceId } }),
    prisma.inboxConversation.count({ where: { workspaceId } }),
    prisma.calendarBookingLog.count({ where: { workspaceId } }),
    prisma.googleSheetSyncLog.count({ where: { workspaceId } }),
    prisma.aIConversationLog.count({ where: { workspaceId } }),
    prisma.inboxConversation.count({ where: { workspaceId, channel: InboxChannel.WEBSITE_CHAT } }),
    prisma.lead.count({ where: { workspaceId, source: "Website Widget" } }),
  ]);

  return (
    <DashboardModule
      widgetMetrics={{
        leads,
        conversations,
        appointments,
        sheetSyncs,
        aiChats,
        websiteConversations,
        widgetLeads,
      }}
    />
  );
}
