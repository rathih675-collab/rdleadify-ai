import { LeadStatus } from "@/lib/generated/prisma/enums";
import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type LeadInfo = {
  name?: string;
  email?: string;
  business?: string;
  phone?: string;
  requirement?: string;
  budget?: string;
  demoTime?: string;
  timeline?: string;
  decisionMaker?: string;
  intent?: string;
  urgency?: string;
  company?: string;
  industry?: string;
  country?: string;
  sentiment?: string;
  buyingIntent?: string;
  detectedLanguage?: string;
  preferredLanguage?: string;
  timezone?: string;
};

type LeadBody = {
  leadInfo?: LeadInfo;
  score?: number;
  status?: string;
  tags?: string[];
  summary?: string;
  nextAction?: string;
  conversationId?: string;
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] || "AI",
    lastName: parts.slice(1).join(" ") || undefined,
  };
}

function mapLeadStatus(status?: string) {
  if (status === "Qualified" || status === "Demo Booked") return LeadStatus.QUALIFIED;
  if (status === "Contacted") return LeadStatus.CONTACTED;
  return LeadStatus.NEW;
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "leads:create");

    const body = await readJson<LeadBody>(request);
    if (!body?.leadInfo) {
      throw new ApiError("Lead info is required.");
    }

    const leadInfo = body.leadInfo;
    const name = leadInfo.name?.trim() || "AI Agent Lead";
    const { firstName, lastName } = splitName(name);
    const tags = Array.from(new Set([...(body.tags ?? []), "AI Agent"])).slice(0, 10);
    const notes = [
      body.summary,
      body.nextAction ? `Next action: ${body.nextAction}` : null,
      leadInfo.business ? `Business: ${leadInfo.business}` : null,
      leadInfo.company ? `Company: ${leadInfo.company}` : null,
      leadInfo.requirement ? `Requirement: ${leadInfo.requirement}` : null,
      leadInfo.budget ? `Budget: ${leadInfo.budget}` : null,
      leadInfo.demoTime ? `Demo time: ${leadInfo.demoTime}` : null,
      leadInfo.timeline ? `Timeline: ${leadInfo.timeline}` : null,
      leadInfo.decisionMaker ? `Decision maker: ${leadInfo.decisionMaker}` : null,
      leadInfo.intent ? `Intent: ${leadInfo.intent}` : null,
      leadInfo.buyingIntent ? `Buying intent: ${leadInfo.buyingIntent}` : null,
      leadInfo.urgency ? `Urgency: ${leadInfo.urgency}` : null,
      leadInfo.industry ? `Industry: ${leadInfo.industry}` : null,
      leadInfo.country ? `Country: ${leadInfo.country}` : null,
      leadInfo.detectedLanguage ? `Detected language: ${leadInfo.detectedLanguage}` : null,
      leadInfo.preferredLanguage ? `Preferred language: ${leadInfo.preferredLanguage}` : null,
      leadInfo.timezone ? `Timezone: ${leadInfo.timezone}` : null,
      leadInfo.sentiment ? `Sentiment: ${leadInfo.sentiment}` : null,
      body.conversationId ? `AI conversation: ${body.conversationId}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const lead = await prisma.lead.create({
      data: {
        workspaceId: session.workspaceId,
        assignedUserId: session.userId,
        title: `${name} - AI Agent Lead`,
        firstName,
        lastName,
        email: leadInfo.email,
        phone: leadInfo.phone,
        source: "AI Agent",
        detectedLanguage: leadInfo.detectedLanguage,
        preferredLanguage: leadInfo.preferredLanguage,
        country: leadInfo.country,
        timezone: leadInfo.timezone,
        status: mapLeadStatus(body.status),
        score: Math.max(0, Math.min(100, Number(body.score ?? 0))),
        notes,
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: {
              workspaceId_name: {
                workspaceId: session.workspaceId,
                name: tag,
              },
            },
            create: {
              workspaceId: session.workspaceId,
              name: tag,
              color: tag === "Hot Lead" ? "#34d399" : "#38bdf8",
            },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        score: true,
        source: true,
      },
    });

    await prisma.$transaction([
      prisma.activityLog.create({
        data: {
          workspaceId: session.workspaceId,
          userId: session.userId,
          leadId: lead.id,
          action: "AI_AGENT_LEAD_CREATED",
          entityType: "Lead",
          entityId: lead.id,
          metadata: {
            source: "AI Agent",
            tags,
            score: lead.score,
            conversationId: body.conversationId,
            leadInfo,
          },
        },
      }),
      ...(body.conversationId
        ? [
            prisma.aIConversationLog.updateMany({
              where: {
                id: body.conversationId,
                workspaceId: session.workspaceId,
              },
              data: { status: "CONVERTED_TO_LEAD" },
            }),
          ]
        : []),
    ]);

    return {
      message: "Lead saved successfully.",
      lead,
    };
  });
}
