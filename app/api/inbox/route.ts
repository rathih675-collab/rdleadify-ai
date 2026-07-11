import { InboxSender } from "@prisma/client";
import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "inbox:write");
    const id = new URL(request.url).searchParams.get("id");
    const [conversations, users] = await Promise.all([
      prisma.inboxConversation.findMany({
        where: { workspaceId: session.workspaceId, ...(id ? { id } : {}) },
        orderBy: [{ lastMessageTime: "desc" }, { updatedAt: "desc" }], take: 250,
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, stage: { select: { name: true } }, tags: { select: { name: true, color: true } } } },
          ...(id ? { messages: { orderBy: { timestamp: "asc" as const }, take: 300 } } : {}),
        },
      }),
      prisma.user.findMany({ where: { workspaceId: session.workspaceId, isActive: true }, select: { id: true, name: true, email: true } }),
    ]);
    return { conversations, users };
  });
}

type Body = { action?: string; id?: string; text?: string; assignedUserId?: string | null; status?: "OPEN" | "PENDING" | "RESOLVED" | "LOST" | "SPAM" };
export async function PATCH(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "inbox:write");
    const body = await readJson<Body>(request);
    const conversation = await prisma.inboxConversation.findFirst({ where: { id: body?.id, workspaceId: session.workspaceId } });
    if (!conversation) throw new ApiError("Conversation not found.", 404);
    if (body?.action === "reply") {
      const message = body.text?.trim();
      if (!message) throw new ApiError("Reply cannot be empty.");
      await prisma.$transaction([
        prisma.inboxMessage.create({ data: { conversationId: conversation.id, userId: session.userId, sender: InboxSender.AGENT, text: message } }),
        prisma.inboxConversation.update({ where: { id: conversation.id }, data: { lastMessage: message, lastMessageTime: new Date(), unreadCount: 0 } }),
      ]);
    } else if (body?.action === "read") await prisma.inboxConversation.update({ where: { id: conversation.id }, data: { unreadCount: 0 } });
    else if (body?.action === "assign") await prisma.inboxConversation.update({ where: { id: conversation.id }, data: { assignedUserId: body.assignedUserId ?? null } });
    else if (body?.action === "status" && body.status) await prisma.inboxConversation.update({ where: { id: conversation.id }, data: { status: body.status } });
    else throw new ApiError("Unsupported action.");
    return { updated: true };
  });
}
