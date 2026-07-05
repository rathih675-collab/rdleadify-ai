import { NextResponse } from "next/server";

import { orchestrateEvent, supportedOrchestratorSources } from "@/lib/ai-orchestrator";
import type { OrchestratorEventSource } from "@/lib/ai-orchestrator";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type OrchestratorEventBody = {
  source?: OrchestratorEventSource;
  content?: string;
  customerName?: string;
  business?: string;
};

function isSupportedSource(source: string): source is OrchestratorEventSource {
  return supportedOrchestratorSources.includes(source as OrchestratorEventSource);
}

export async function GET(request: Request) {
  const { take } = paginationFromUrl(request, { take: 25, max: 100 });

  return withWorkspace(async (session) => {
    assertPermission(session, "activity:read");

    const logs = await prisma.activityLog.findMany({
      where: {
        workspaceId: session.workspaceId,
        action: "AI_ORCHESTRATOR_DECISION",
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        createdAt: true,
        entityId: true,
        metadata: true,
      },
    });

    return { logs };
  });
}

export async function POST(request: Request) {
  const body = await readJson<OrchestratorEventBody>(request);

  return withWorkspace(async (session) => {
    assertPermission(session, "ai:write");

    if (!body?.source || !isSupportedSource(body.source)) {
      throw new ApiError("A supported orchestrator source is required.");
    }

    if (!body.content || body.content.trim().length < 2) {
      throw new ApiError("Event content is required.");
    }

    const decision = orchestrateEvent({
      id: crypto.randomUUID(),
      workspaceId: session.workspaceId,
      source: body.source,
      content: body.content.slice(0, 4000),
      customerName: body.customerName?.slice(0, 120),
      business: body.business?.slice(0, 160),
      createdAt: new Date().toISOString(),
    });

    const log = await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "AI_ORCHESTRATOR_DECISION",
        entityType: "AIOrchestrator",
        entityId: decision.id,
        metadata: {
          timestamp: decision.timestamp,
          workspace: decision.workspace,
          source: decision.source,
          intent: decision.intent,
          confidence: decision.confidence,
          decision: decision.decision,
          action: decision.actions,
          executionTime: decision.executionTime,
          status: decision.status,
          memory: decision.memory,
          knowledge: decision.knowledge,
          notification: decision.notification,
          workflowTrigger: decision.workflowTrigger,
        },
      },
      select: {
        id: true,
        createdAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({ ok: true, decision, log }, { headers: { "Cache-Control": "no-store" } });
  });
}
