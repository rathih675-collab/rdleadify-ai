import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { backendLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";

type BusinessMemoryBody = {
  businessName?: string;
  industry?: string;
  description?: string;
  products?: string;
  services?: string;
  pricing?: string;
  faqs?: string;
  workingHours?: string;
  address?: string;
  contactDetails?: string;
  website?: string;
  socialLinks?: unknown;
};

function text(value: unknown, max = 12000) {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export async function GET() {
  return withWorkspace(async (session) => {
    const memory = await prisma.businessMemory.findUnique({
      where: { workspaceId: session.workspaceId },
    });

    return { memory };
  });
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "knowledge:write");

    const body = await readJson<BusinessMemoryBody>(request);
    if (!body) throw new ApiError("Invalid request body.");

    const memory = await prisma.businessMemory.upsert({
      where: { workspaceId: session.workspaceId },
      update: {
        businessName: text(body.businessName, 240),
        industry: text(body.industry, 240),
        description: text(body.description),
        products: text(body.products),
        services: text(body.services),
        pricing: text(body.pricing),
        faqs: text(body.faqs),
        workingHours: text(body.workingHours, 1000),
        address: text(body.address, 2000),
        contactDetails: text(body.contactDetails, 2000),
        website: text(body.website, 1000),
        socialLinks: jsonValue(body.socialLinks),
      },
      create: {
        workspaceId: session.workspaceId,
        businessName: text(body.businessName, 240),
        industry: text(body.industry, 240),
        description: text(body.description),
        products: text(body.products),
        services: text(body.services),
        pricing: text(body.pricing),
        faqs: text(body.faqs),
        workingHours: text(body.workingHours, 1000),
        address: text(body.address, 2000),
        contactDetails: text(body.contactDetails, 2000),
        website: text(body.website, 1000),
        socialLinks: jsonValue(body.socialLinks),
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "BUSINESS_MEMORY_UPSERTED",
        entityType: "BusinessMemory",
        entityId: memory.id,
        metadata: { businessName: memory.businessName, industry: memory.industry },
      },
    });

    backendLog("business-memory", "memory upserted", {
      workspaceId: session.workspaceId,
      memoryId: memory.id,
    });

    return { message: "Business memory saved.", memory };
  });
}
