import { LeadStatus } from "@/lib/generated/prisma/enums";
import { ApiError, assertPermission, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type MessageLike = {
  role?: string;
  content?: string;
};

function messagesToText(messages: unknown, summary?: string | null) {
  const text = Array.isArray(messages)
    ? messages
        .map((message: MessageLike) => String(message?.content ?? ""))
        .filter(Boolean)
        .join("\n")
    : "";

  return [text, summary ?? ""].filter(Boolean).join("\n");
}

function pickAfter(text: string, markers: string[]) {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const index = lower.indexOf(marker);
    if (index >= 0) {
      return text
        .slice(index + marker.length)
        .split(/[,.;\n]/)[0]
        .trim()
        .replace(/^is\s+/i, "");
    }
  }

  return "";
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] || "AI",
    lastName: parts.slice(1).join(" ") || undefined,
  };
}

function extractLead(text: string) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(?:\+?\d[\d\s-]{7,}\d)/)?.[0]?.trim();
  const budget = text.match(/(?:budget\s*(?:is|of|around)?\s*)?((?:rs\.?|inr|\$)?\s?\d[\d,.]*(?:\s?(?:lakh|lac|cr|crore|k|m|million))?)/i)?.[1]?.trim();
  const demoTime = text.match(/(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|\d{1,2}(?::\d{2})?\s?(?:am|pm))/i)?.[0]?.trim();
  const rawName = pickAfter(text, ["my name is", "i am", "i'm", "name is", "this is"]);
  const rawBusiness = pickAfter(text, ["business type is", "business is", "company is", "we run", "i run", "from"]);
  const requirement = pickAfter(text, ["requirement is", "need", "looking for", "want", "interested in"]);
  const name = rawName.split(/\s+(?:and|from|with|email|phone)\s+/i)[0]?.trim() || "AI Conversation Lead";
  const business = rawBusiness.split(/\s+(?:and|for|with)\s+/i)[0]?.trim();

  return {
    name,
    email,
    phone,
    business,
    requirement: requirement || "AI conversation follow-up",
    budget,
    demoTime,
  };
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withWorkspace(async (session) => {
    assertPermission(session, "leads:create");

    const { id } = await context.params;
    const conversation = await prisma.aIConversationLog.findFirst({
      where: {
        id,
        workspaceId: session.workspaceId,
      },
    });

    if (!conversation) throw new ApiError("Conversation not found.", 404);

    const text = messagesToText(conversation.messages, conversation.summary);
    const extracted = extractLead(text);
    const { firstName, lastName } = splitName(extracted.name);
    const tags = ["AI Agent", "Conversation Log", conversation.channel === "VOICE" ? "Voice" : "Chat"];
    const notes = [
      conversation.summary,
      extracted.business ? `Business: ${extracted.business}` : null,
      extracted.requirement ? `Requirement: ${extracted.requirement}` : null,
      extracted.budget ? `Budget: ${extracted.budget}` : null,
      extracted.demoTime ? `Demo time: ${extracted.demoTime}` : null,
      `Converted from AI conversation ${conversation.id}`,
    ]
      .filter(Boolean)
      .join("\n");

    const lead = await prisma.lead.create({
      data: {
        workspaceId: session.workspaceId,
        assignedUserId: session.userId,
        title: `${extracted.name} - AI Conversation Lead`,
        firstName,
        lastName,
        email: extracted.email,
        phone: extracted.phone,
        source: "AI Agent",
        status: conversation.leadScore >= 70 ? LeadStatus.QUALIFIED : LeadStatus.NEW,
        score: conversation.leadScore,
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
              color: "#38bdf8",
            },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        score: true,
        status: true,
      },
    });

    await prisma.$transaction([
      prisma.aIConversationLog.update({
        where: { id: conversation.id },
        data: { status: "CONVERTED_TO_LEAD" },
      }),
      prisma.activityLog.create({
        data: {
          workspaceId: session.workspaceId,
          userId: session.userId,
          leadId: lead.id,
          action: "AI_CONVERSATION_CONVERTED_TO_LEAD",
          entityType: "Lead",
          entityId: lead.id,
          metadata: {
            conversationId: conversation.id,
            channel: conversation.channel,
            leadScore: conversation.leadScore,
          },
        },
      }),
    ]);

    return { lead };
  });
}
