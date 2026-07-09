import { Prisma } from "@prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type ExecutionLogBody = {
  workflowId?: string;
  campaign?: string;
  lead?: string;
  currentStep?: string;
  status?: string;
  executionTime?: number;
  result?: string;
  aiSummary?: string;
  errors?: unknown;
  metadata?: unknown;
};

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 50, max: 100 });

    const logs = await prisma.automationExecutionLog.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        workflowId: true,
        campaign: true,
        lead: true,
        currentStep: true,
        status: true,
        executionTime: true,
        result: true,
        aiSummary: true,
        errors: true,
        metadata: true,
        createdAt: true,
      },
    });

    return { logs };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "automation:write");

    const body = await readJson<ExecutionLogBody>(request);
    if (!body?.campaign || !body.lead || !body.currentStep) {
      throw new ApiError("Campaign, lead, and current step are required.");
    }

    const log = await prisma.automationExecutionLog.create({
      data: {
        workspaceId: session.workspaceId,
        workflowId: body.workflowId,
        userId: session.userId,
        campaign: body.campaign.slice(0, 160),
        lead: body.lead.slice(0, 160),
        currentStep: body.currentStep.slice(0, 160),
        status: body.status?.slice(0, 80) || "QUEUED",
        executionTime: body.executionTime,
        result: body.result?.slice(0, 500),
        aiSummary: body.aiSummary?.slice(0, 2000),
        errors: body.errors ?? Prisma.JsonNull,
        metadata: body.metadata ?? {},
      },
      select: {
        id: true,
        campaign: true,
        lead: true,
        currentStep: true,
        status: true,
        executionTime: true,
        result: true,
        aiSummary: true,
        errors: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "AUTOMATION_EXECUTION_LOG_CREATED",
        entityType: "AutomationExecutionLog",
        entityId: log.id,
        metadata: {
          campaign: log.campaign,
          lead: log.lead,
          currentStep: log.currentStep,
          status: log.status,
        },
      },
    });

    return { log };
  });
}
