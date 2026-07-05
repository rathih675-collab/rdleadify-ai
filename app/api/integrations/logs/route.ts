import { Prisma } from "@/lib/generated/prisma/client";
import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type IntegrationLogBody = {
  provider?: string;
  action?: string;
  status?: string;
  requestTime?: string;
  responseTime?: string;
  error?: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 50, max: 100 });
    const logs = await prisma.activityLog.findMany({
      where: {
        workspaceId: session.workspaceId,
        entityType: "IntegrationLog",
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
      },
    });

    return { logs };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "integrations:write");
    const body = await readJson<IntegrationLogBody>(request);
    if (!body?.provider || !body.action || !body.status) {
      throw new ApiError("Provider, action, and status are required.");
    }

    const log = await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "INTEGRATION_EVENT",
        entityType: "IntegrationLog",
        metadata: toJsonValue({
          provider: body.provider,
          action: body.action,
          status: body.status,
          requestTime: body.requestTime ?? new Date().toISOString(),
          responseTime: body.responseTime ?? new Date().toISOString(),
          error: body.error ?? null,
          workspaceId: session.workspaceId,
        }),
      },
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
      },
    });

    return { message: "Integration log saved.", log };
  });
}
