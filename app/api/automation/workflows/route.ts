import { CampaignStatus } from "@prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type WorkflowBody = {
  name?: string;
  description?: string;
  goal?: string;
  aiAgent?: string;
  pipeline?: string;
  leadSource?: string;
  triggerEvent?: string;
  workingHours?: string;
  timezone?: string;
  retryCount?: number;
  retryDelay?: string;
  status?: "DRAFT" | "SCHEDULED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  nodes?: unknown;
  edges?: unknown;
  triggers?: unknown;
  conditions?: unknown;
  providerConfig?: unknown;
  crmActions?: unknown;
};

function mapStatus(status?: WorkflowBody["status"]) {
  if (status && status in CampaignStatus) return CampaignStatus[status];
  return CampaignStatus.DRAFT;
}

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 50, max: 100 });

    const workflows = await prisma.automationWorkflow.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        description: true,
        goal: true,
        aiAgent: true,
        pipeline: true,
        leadSource: true,
        triggerEvent: true,
        workingHours: true,
        timezone: true,
        retryCount: true,
        retryDelay: true,
        status: true,
        nodes: true,
        edges: true,
        triggers: true,
        conditions: true,
        providerConfig: true,
        crmActions: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { workflows };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "automation:write");

    const body = await readJson<WorkflowBody>(request);
    if (!body?.name?.trim()) throw new ApiError("Workflow name is required.");

    const status = mapStatus(body.status);
    const workflow = await prisma.automationWorkflow.create({
      data: {
        workspaceId: session.workspaceId,
        createdById: session.userId,
        name: body.name.trim().slice(0, 160),
        description: body.description?.slice(0, 2000),
        goal: body.goal?.slice(0, 500),
        aiAgent: body.aiAgent?.slice(0, 120),
        pipeline: body.pipeline?.slice(0, 120),
        leadSource: body.leadSource?.slice(0, 120),
        triggerEvent: body.triggerEvent?.slice(0, 120),
        workingHours: body.workingHours?.slice(0, 120),
        timezone: body.timezone?.slice(0, 80) || "UTC",
        retryCount: Math.max(0, Math.min(10, Number(body.retryCount ?? 0))),
        retryDelay: body.retryDelay?.slice(0, 80),
        status,
        nodes: body.nodes ?? [],
        edges: body.edges ?? [],
        triggers: body.triggers ?? [],
        conditions: body.conditions ?? [],
        providerConfig: body.providerConfig ?? {},
        crmActions: body.crmActions ?? [],
        publishedAt: status === CampaignStatus.ACTIVE ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: status === CampaignStatus.ACTIVE ? "AUTOMATION_WORKFLOW_PUBLISHED" : "AUTOMATION_WORKFLOW_CREATED",
        entityType: "AutomationWorkflow",
        entityId: workflow.id,
        metadata: {
          name: workflow.name,
          status: workflow.status,
          triggerEvent: body.triggerEvent,
          providerArchitecture: "abstract",
        },
      },
    });

    return { workflow };
  });
}
