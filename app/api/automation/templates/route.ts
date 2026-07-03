import { ApiError, assertPermission, paginationFromUrl, readJson, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type TemplateBody = {
  name?: string;
  category?: string;
  description?: string;
  nodes?: unknown;
  edges?: unknown;
  triggers?: unknown;
  conditions?: unknown;
  crmActions?: unknown;
  providerConfig?: unknown;
};

const systemTemplates = [
  "Lead Qualification",
  "Sales Follow-up",
  "Demo Reminder",
  "Appointment Confirmation",
  "Payment Reminder",
  "Customer Support",
  "Real Estate",
  "Education",
  "Healthcare",
  "Insurance",
].map((name, index) => ({
  id: `system-${index + 1}`,
  name,
  category: index < 5 ? "Sales" : "Industry",
  description: `${name} automation template with AI decisioning, CRM updates, and provider-abstract channel steps.`,
  nodes: [
    { id: "start", type: "Start", label: "Start" },
    { id: "ai-chat", type: "AI Chat", label: "Personalized AI follow-up" },
    { id: "decision", type: "AI Decision", label: "AI decides next best action" },
    { id: "crm", type: "Update Lead", label: "CRM update" },
    { id: "end", type: "End", label: "End campaign" },
  ],
  edges: [
    { from: "start", to: "ai-chat" },
    { from: "ai-chat", to: "decision" },
    { from: "decision", to: "crm" },
    { from: "crm", to: "end" },
  ],
  triggers: ["New Lead", "Manual Trigger"],
  conditions: ["Lead Score", "AI Intent", "Reply Status"],
  crmActions: ["Update Lead", "Create Activity", "Create Task", "Add Notes"],
  providerConfig: { ai: "abstract", email: "abstract", voice: "abstract", whatsapp: "beta" },
  isSystem: true,
}));

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 50, max: 100 });

    const customTemplates = await prisma.automationTemplate.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        nodes: true,
        edges: true,
        triggers: true,
        conditions: true,
        crmActions: true,
        providerConfig: true,
        isSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { templates: [...systemTemplates, ...customTemplates] };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "automation:write");

    const body = await readJson<TemplateBody>(request);
    if (!body?.name?.trim()) throw new ApiError("Template name is required.");

    const template = await prisma.automationTemplate.create({
      data: {
        workspaceId: session.workspaceId,
        createdById: session.userId,
        name: body.name.trim().slice(0, 160),
        category: body.category?.slice(0, 120) || "Custom",
        description: body.description?.slice(0, 2000),
        nodes: body.nodes ?? [],
        edges: body.edges ?? [],
        triggers: body.triggers ?? [],
        conditions: body.conditions ?? [],
        crmActions: body.crmActions ?? [],
        providerConfig: body.providerConfig ?? {},
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        nodes: true,
        edges: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "AUTOMATION_TEMPLATE_CREATED",
        entityType: "AutomationTemplate",
        entityId: template.id,
        metadata: {
          name: template.name,
          category: template.category,
        },
      },
    });

    return { template };
  });
}
