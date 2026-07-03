import { TaskPriority } from "@/lib/generated/prisma/enums";
import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type CrmActionBody = {
  action?: "CREATE_TASK" | "CREATE_NOTE" | "UPDATE_LEAD";
  leadId?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

function jsonMetadata(metadata: Record<string, unknown> | undefined) {
  return JSON.parse(JSON.stringify(metadata ?? {})) as Record<string, string | number | boolean | null>;
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "leads:update");

    const body = await readJson<CrmActionBody>(request);
    if (!body?.action) throw new ApiError("CRM action is required.");

    if (body.leadId) {
      const leadExists = await prisma.lead.count({
        where: {
          id: body.leadId,
          workspaceId: session.workspaceId,
        },
      });

      if (!leadExists) throw new ApiError("Lead not found in this workspace.", 404);
    }

    if (body.action === "CREATE_TASK") {
      const task = await prisma.task.create({
        data: {
          workspaceId: session.workspaceId,
          assignedUserId: session.userId,
          leadId: body.leadId,
          title: body.title?.slice(0, 180) || "Follow up AI qualified lead",
          description: body.description?.slice(0, 2000),
          priority: TaskPriority.HIGH,
        },
        select: { id: true, title: true, status: true },
      });

      await prisma.activityLog.create({
        data: {
          workspaceId: session.workspaceId,
          userId: session.userId,
          leadId: body.leadId,
          action: "AI_TASK_CREATED",
          entityType: "Task",
          entityId: task.id,
          metadata: jsonMetadata(body.metadata),
        },
      });

      return { task };
    }

    const activity = await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        leadId: body.leadId,
        action: body.action === "CREATE_NOTE" ? "AI_NOTE_CREATED" : "AI_LEAD_UPDATE_REQUESTED",
        entityType: body.action === "CREATE_NOTE" ? "Note" : "Lead",
        entityId: body.leadId,
        metadata: {
          title: body.title,
          description: body.description,
          ...jsonMetadata(body.metadata),
        },
      },
      select: { id: true, action: true, createdAt: true },
    });

    return { activity };
  });
}
