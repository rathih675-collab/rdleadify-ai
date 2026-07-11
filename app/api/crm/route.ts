import { LeadStatus, Prisma } from "@prisma/client";

import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

const defaultStages = [
  ["New Lead", 0, 10, "#38bdf8"], ["Qualified", 1, 25, "#818cf8"],
  ["Interested", 2, 40, "#f59e0b"], ["Demo Booked", 3, 55, "#a78bfa"],
  ["Proposal Sent", 4, 70, "#06b6d4"], ["Negotiation", 5, 85, "#f97316"],
  ["Won", 6, 100, "#34d399"], ["Lost", 7, 0, "#fb7185"],
] as const;
const defaultTags = [["Hot", "#fb7185"], ["Warm", "#f59e0b"], ["Cold", "#38bdf8"], ["Urgent", "#ef4444"], ["VIP", "#a78bfa"], ["Follow Up", "#22c55e"], ["Spam", "#64748b"], ["Duplicate", "#94a3b8"]] as const;

async function ensureDefaults(workspaceId: string) {
  let pipeline = await prisma.pipeline.findFirst({ where: { workspaceId, isDefault: true } });
  if (!pipeline) pipeline = await prisma.pipeline.create({ data: { workspaceId, name: "Sales Pipeline", isDefault: true } });
  await prisma.$transaction([
    ...defaultStages.map(([name, position, probability, color]) => prisma.pipelineStage.upsert({
      where: { pipelineId_name: { pipelineId: pipeline.id, name } },
      update: { position, probability, color }, create: { workspaceId, pipelineId: pipeline.id, name, position, probability, color },
    })),
    ...defaultTags.map(([name, color]) => prisma.tag.upsert({ where: { workspaceId_name: { workspaceId, name } }, update: {}, create: { workspaceId, name, color } })),
  ]);
  return pipeline;
}

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    if (!session.permissions.some(permission => permission === "*" || permission === "crm:read" || permission === "crm:write")) throw new ApiError("You do not have permission to view CRM data.", 403);
    const pipeline = await ensureDefaults(session.workspaceId);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const where: Prisma.LeadWhereInput = { workspaceId: session.workspaceId, ...(search ? { OR: [
      { firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }, { title: { contains: search, mode: "insensitive" } },
    ] } : {}) };
    const [leads, stages, tags, users] = await Promise.all([
      prisma.lead.findMany({ where, orderBy: { updatedAt: "desc" }, take: 500, include: {
        assignedUser: { select: { id: true, name: true, email: true } }, company: { select: { name: true } },
        stage: { select: { id: true, name: true, color: true } }, tags: { select: { id: true, name: true, color: true } },
        leadMemory: true, _count: { select: { inboxConversations: true, tasks: true } },
      } }),
      prisma.pipelineStage.findMany({ where: { pipelineId: pipeline.id }, orderBy: { position: "asc" } }),
      prisma.tag.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { name: "asc" } }),
      prisma.user.findMany({ where: { workspaceId: session.workspaceId, isActive: true }, select: { id: true, name: true, email: true } }),
    ]);
    return { pipeline, stages, tags, users, leads };
  });
}

type Mutation = { action?: string; ids?: string[]; id?: string; stageId?: string; assignedUserId?: string | null; tagId?: string; name?: string; color?: string };
export async function PATCH(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "leads:update");
    const body = await readJson<Mutation>(request); const ids = [...new Set(body?.ids ?? (body?.id ? [body.id] : []))].slice(0, 500);
    if (!body?.action || !ids.length) throw new ApiError("Action and at least one lead are required.");
    const owned = await prisma.lead.count({ where: { workspaceId: session.workspaceId, id: { in: ids } } });
    if (owned !== ids.length) throw new ApiError("One or more leads were not found.", 404);
    if (body.action === "move") {
      const stage = await prisma.pipelineStage.findFirst({ where: { id: body.stageId, workspaceId: session.workspaceId } });
      if (!stage) throw new ApiError("Pipeline stage not found.", 404);
      const status = stage.name === "Won" ? LeadStatus.WON : stage.name === "Lost" ? LeadStatus.LOST : stage.name === "Qualified" ? LeadStatus.QUALIFIED : stage.name === "Negotiation" ? LeadStatus.NEGOTIATION : LeadStatus.CONTACTED;
      await prisma.lead.updateMany({ where: { id: { in: ids }, workspaceId: session.workspaceId }, data: { stageId: stage.id, pipelineId: stage.pipelineId, status } });
    } else if (body.action === "assign") {
      if (body.assignedUserId && !await prisma.user.findFirst({ where: { id: body.assignedUserId, workspaceId: session.workspaceId } })) throw new ApiError("User not found.", 404);
      await prisma.lead.updateMany({ where: { id: { in: ids }, workspaceId: session.workspaceId }, data: { assignedUserId: body.assignedUserId ?? null } });
    } else if (body.action === "tag") {
      const tag = await prisma.tag.findFirst({ where: { id: body.tagId, workspaceId: session.workspaceId } }); if (!tag) throw new ApiError("Tag not found.", 404);
      await Promise.all(ids.map(id => prisma.lead.update({ where: { id }, data: { tags: { connect: { id: tag.id } } } })));
    } else throw new ApiError("Unsupported action.");
    return { updated: ids.length };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "crm:write"); const body = await readJson<Mutation>(request);
    if (body?.action !== "createTag" || !body.name?.trim()) throw new ApiError("A tag name is required.");
    const tag = await prisma.tag.upsert({ where: { workspaceId_name: { workspaceId: session.workspaceId, name: body.name.trim() } }, update: { color: body.color ?? "#38bdf8" }, create: { workspaceId: session.workspaceId, name: body.name.trim(), color: body.color ?? "#38bdf8" } });
    return { tag };
  });
}

export async function DELETE(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "crm:write"); const body = await readJson<Mutation>(request); const ids = [...new Set(body?.ids ?? [])].slice(0, 500);
    if (!ids.length) throw new ApiError("Select at least one lead.");
    const result = await prisma.lead.deleteMany({ where: { workspaceId: session.workspaceId, id: { in: ids } } }); return { deleted: result.count };
  });
}
