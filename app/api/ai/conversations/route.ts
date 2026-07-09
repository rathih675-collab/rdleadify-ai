import { AIConversationChannel } from "@prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type ConversationBody = {
  channel?: "CHAT" | "VOICE";
  messages?: unknown;
  summary?: string;
  leadScore?: number;
  status?: string;
};

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 20, max: 100 });

    const conversations = await prisma.aIConversationLog.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        channel: true,
        messages: true,
        summary: true,
        leadScore: true,
        status: true,
        createdAt: true,
        userId: true,
      },
    });

    return { conversations };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "ai:write");

    const body = await readJson<ConversationBody>(request);
    if (!body) throw new ApiError("Invalid request body.");

    const channel = body.channel === "VOICE" ? AIConversationChannel.VOICE : AIConversationChannel.CHAT;
    const conversation = await prisma.aIConversationLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        channel,
        messages: body.messages ?? [],
        summary: body.summary?.slice(0, 2000),
        leadScore: Math.max(0, Math.min(100, Number(body.leadScore ?? 0))),
        status: body.status?.slice(0, 80) || "CAPTURED",
      },
      select: {
        id: true,
        channel: true,
        messages: true,
        summary: true,
        leadScore: true,
        status: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "AI_CONVERSATION_LOG_CREATED",
        entityType: "AIConversationLog",
        entityId: conversation.id,
        metadata: {
          channel: conversation.channel,
          leadScore: conversation.leadScore,
          status: conversation.status,
        },
      },
    });

    return { conversation };
  });
}
