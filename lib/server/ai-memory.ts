import { Prisma } from "@prisma/client";
import { backendLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";

export type AiMemoryLeadInfo = {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  business?: string;
  requirement?: string;
  budget?: string;
  timeline?: string;
  source?: string;
  intent?: string;
  buyingIntent?: string;
  preferredLanguage?: string;
  detectedLanguage?: string;
};

export type AiMemoryAnalysis = {
  leadInfo: AiMemoryLeadInfo;
  score: number;
  summary: string;
  status?: string;
  tags?: string[];
};

export type AiContextBundle = {
  businessMemory: Awaited<ReturnType<typeof getBusinessMemory>>;
  knowledge: Awaited<ReturnType<typeof getKnowledgeSnippets>>;
  visitorMemory: Awaited<ReturnType<typeof getVisitorMemory>>;
  prompt: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  try {
    return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
  } catch (error) {
    console.error("[ai-memory] JSON serialization failed", {
      error: error instanceof Error ? error.message : "Unknown JSON serialization error",
    });
    return {};
  }
}

function extraMemoryValue(memory: Awaited<ReturnType<typeof getBusinessMemory>>, key: "appointmentRules" | "guardrails") {
  const value = memory?.socialLinks;
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  return typeof record[key] === "string" ? record[key].trim() : "";
}

function sectionValue(value: string | null | undefined, fallback = "Not configured") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function metadataText(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function boundedUnique(values: Array<string | undefined | null>, limit = 12) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = String(value ?? "").trim();
    if (!cleaned || seen.has(cleaned.toLowerCase())) continue;
    seen.add(cleaned.toLowerCase());
    result.push(cleaned.slice(0, 1200));
  }

  return result.slice(0, limit);
}

export function visitorKeyFrom(input: {
  workspaceId: string;
  conversationId?: string;
  leadInfo?: AiMemoryLeadInfo;
}) {
  const email = input.leadInfo?.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = input.leadInfo?.phone?.replace(/[^\d+]/g, "");
  if (phone) return `phone:${phone}`;
  return `conversation:${input.conversationId || "new"}`;
}

export async function getBusinessMemory(workspaceId: string) {
  try {
    return await prisma.businessMemory.findUnique({
      where: { workspaceId },
    });
  } catch (error) {
    console.error("[ai-memory] business memory unavailable", {
      workspaceId,
      error: error instanceof Error ? error.message : "Unknown database error",
    });
    return null;
  }
}

export async function getKnowledgeSnippets(workspaceId: string, query: string, take = 6) {
  const terms = query.toLowerCase().split(/\W+/).filter((term) => term.length > 2).slice(0, 12);
  let documents: Array<{
    id: string;
    name: string;
    type: string;
    sourceUrl: string | null;
    extractedText: string;
    summary: string | null;
    updatedAt: Date;
  }> = [];

  try {
    documents = await prisma.knowledgeDocument.findMany({
      where: {
        workspaceId,
        status: { in: ["PROCESSED", "IMPORTED"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        name: true,
        type: true,
        sourceUrl: true,
        extractedText: true,
        summary: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("[ai-memory] knowledge base unavailable", {
      workspaceId,
      error: error instanceof Error ? error.message : "Unknown database error",
    });
    return [];
  }

  return documents
    .map((document) => {
      const haystack = `${document.name} ${document.summary ?? ""} ${document.extractedText}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return {
        ...document,
        relevance: score,
        snippet: (document.summary || document.extractedText).slice(0, 1200),
      };
    })
    .sort((a, b) => b.relevance - a.relevance || b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, take);
}

export async function getVisitorMemory(input: {
  workspaceId: string;
  conversationId?: string;
  leadInfo?: AiMemoryLeadInfo;
}) {
  const visitorKey = visitorKeyFrom(input);
  try {
    const direct = await prisma.visitorMemory.findUnique({
      where: {
        workspaceId_visitorKey: {
          workspaceId: input.workspaceId,
          visitorKey,
        },
      },
    });

    if (direct) return direct;

    const phone = input.leadInfo?.phone;
    const email = input.leadInfo?.email;
    if (!phone && !email) return null;

    return await prisma.visitorMemory.findFirst({
      where: {
        workspaceId: input.workspaceId,
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as Array<{ email: string } | { phone: string }>,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("[ai-memory] visitor memory unavailable", {
      workspaceId: input.workspaceId,
      error: error instanceof Error ? error.message : "Unknown database error",
    });
    return null;
  }
}

export async function loadAiContext(input: {
  workspaceId: string;
  conversationId?: string;
  messages: Array<{ role: "assistant" | "user"; content: string }>;
  leadInfo?: AiMemoryLeadInfo;
}): Promise<AiContextBundle> {
  const query = input.messages.map((message) => message.content).join("\n").slice(-4000);
  const [businessMemory, knowledge, visitorMemory] = await Promise.all([
    getBusinessMemory(input.workspaceId),
    getKnowledgeSnippets(input.workspaceId, query),
    getVisitorMemory({
      workspaceId: input.workspaceId,
      conversationId: input.conversationId,
      leadInfo: input.leadInfo,
    }),
  ]);

  console.log("[Memory Loaded]", {
    workspaceId: input.workspaceId,
    businessMemoryLoaded: Boolean(businessMemory),
    visitorMemoryLoaded: Boolean(visitorMemory),
    conversationId: input.conversationId,
  });
  console.log("[Knowledge Loaded]", {
    workspaceId: input.workspaceId,
    documentsLoaded: knowledge.length,
    queryLength: query.length,
  });

  const prompt = buildAiContextPrompt({ businessMemory, knowledge, visitorMemory });
  return { businessMemory, knowledge, visitorMemory, prompt };
}

export function buildAiContextPrompt(input: {
  businessMemory: Awaited<ReturnType<typeof getBusinessMemory>>;
  knowledge: Awaited<ReturnType<typeof getKnowledgeSnippets>>;
  visitorMemory: Awaited<ReturnType<typeof getVisitorMemory>>;
}) {
  const business = input.businessMemory;
  const visitor = input.visitorMemory;
  const knowledgeText = input.knowledge.length
    ? input.knowledge
        .map((item, index) => `${index + 1}. ${item.name}${item.sourceUrl ? ` (${item.sourceUrl})` : ""}: ${item.snippet}`)
        .join("\n")
    : "No uploaded knowledge matched this message.";

  return [
    "Use the following RDLeadify workspace memory before answering. Answer from this context when relevant.",
    "If the answer is not in business memory or knowledge, ask a focused follow-up or say the team will assist.",
    "",
    "BUSINESS MEMORY",
    `Business Name: ${business?.businessName ?? "Not configured"}`,
    `Industry: ${business?.industry ?? "Not configured"}`,
    `Description: ${business?.description ?? "Not configured"}`,
    `Products: ${business?.products ?? "Not configured"}`,
    `Services: ${business?.services ?? "Not configured"}`,
    `Pricing: ${business?.pricing ?? "Not configured"}`,
    `FAQs: ${business?.faqs ?? "Not configured"}`,
    `Working Hours: ${business?.workingHours ?? "Not configured"}`,
    `Address: ${business?.address ?? "Not configured"}`,
    `Contact Details: ${business?.contactDetails ?? "Not configured"}`,
    `Website: ${business?.website ?? "Not configured"}`,
    `Social Links: ${business?.socialLinks ? JSON.stringify(business.socialLinks) : "Not configured"}`,
    "",
    "VISITOR MEMORY",
    visitor
      ? [
          `Name: ${visitor.name ?? "Unknown"}`,
          `Phone: ${visitor.phone ?? "Unknown"}`,
          `Email: ${visitor.email ?? "Unknown"}`,
          `Business: ${visitor.business ?? "Unknown"}`,
          `Preferred Language: ${visitor.preferredLanguage ?? "Unknown"}`,
          `Previous Conversations: ${visitor.previousConversations}`,
          `Previous Appointments: ${visitor.previousAppointments}`,
          `Buying Intent: ${visitor.buyingIntent ?? "Unknown"}`,
          `Last Visit: ${visitor.lastVisit.toISOString()}`,
          `Last AI Summary: ${visitor.lastAiSummary ?? "None"}`,
          `Previous Requirements: ${visitor.previousRequirements.length ? visitor.previousRequirements.join(" | ") : "None"}`,
          `Previous Summaries: ${visitor.previousSummaries.length ? visitor.previousSummaries.join(" | ") : "None"}`,
          `Last AI Response: ${visitor.lastAiResponse ?? "None"}`,
        ].join("\n")
      : "No prior visitor memory found.",
    "",
    "KNOWLEDGE BASE",
    knowledgeText,
  ].join("\n");
}

export function buildFinalAiSystemPrompt(input: {
  businessPrompt?: string;
  aiContext: AiContextBundle;
  messages: Array<{ role: "assistant" | "user"; content: string }>;
  capturedFields?: Record<string, unknown>;
  missingFields?: string[];
  latestUserMessage?: string;
  responseRules?: string[];
}) {
  const business = input.aiContext.businessMemory;
  const visitor = input.aiContext.visitorMemory;
  const knowledgeText = input.aiContext.knowledge.length
    ? input.aiContext.knowledge
        .map((item, index) => `${index + 1}. ${item.name}${item.sourceUrl ? ` (${item.sourceUrl})` : ""}: ${item.snippet}`)
        .join("\n")
    : "No uploaded knowledge matched this message.";
  const previousMessages = input.messages
    .slice(-8, -1)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const latestUserMessage =
    input.latestUserMessage ?? [...input.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const businessPrompt = sectionValue(input.businessPrompt || business?.description, "You are RDLeadify AI. Answer business questions first, then qualify leads naturally.");
  const appointmentRules = extraMemoryValue(business, "appointmentRules");
  const guardrails = extraMemoryValue(business, "guardrails");
  const conversationMemory = visitor
    ? [
        `Name: ${visitor.name ?? "Unknown"}`,
        `Phone: ${visitor.phone ?? "Unknown"}`,
        `Email: ${visitor.email ?? "Unknown"}`,
        `Business: ${visitor.business ?? "Unknown"}`,
        `Requirement: ${visitor.previousRequirements[0] ?? "Unknown"}`,
        `Budget: ${metadataText(visitor.metadata, "budget") || "Unknown"}`,
        `Timeline: ${metadataText(visitor.metadata, "timeline") || "Unknown"}`,
        `Preferred Language: ${visitor.preferredLanguage ?? "Unknown"}`,
        `Previous Summary: ${visitor.previousSummaries[0] ?? visitor.lastAiSummary ?? "None"}`,
        `Last AI Response: ${visitor.lastAiResponse ?? "None"}`,
        `Already Captured Fields: ${JSON.stringify(input.capturedFields ?? {})}`,
        `Missing Fields: ${input.missingFields?.length ? input.missingFields.join(", ") : "none"}`,
        previousMessages || "No prior messages in this request.",
      ].join("\n")
    : [
        "No prior visitor memory found.",
        `Already Captured Fields: ${JSON.stringify(input.capturedFields ?? {})}`,
        `Missing Fields: ${input.missingFields?.length ? input.missingFields.join(", ") : "none"}`,
        previousMessages || "No prior messages in this request.",
      ].join("\n");

  const sections = {
    businessPrompt,
    businessMemory: [
      `Business Name: ${sectionValue(business?.businessName)}`,
      `Industry: ${sectionValue(business?.industry)}`,
      `Products: ${sectionValue(business?.products)}`,
      `Services: ${sectionValue(business?.services)}`,
      `Working Hours: ${sectionValue(business?.workingHours)}`,
      `Address: ${sectionValue(business?.address)}`,
      `Contact Details: ${sectionValue(business?.contactDetails)}`,
      `Website: ${sectionValue(business?.website)}`,
    ].join("\n"),
    knowledgeBase: knowledgeText,
    faq: sectionValue(business?.faqs),
    pricingRules: sectionValue(business?.pricing),
    appointmentRules: sectionValue(appointmentRules),
    guardrails: sectionValue(guardrails),
    conversationMemory,
    userMessage: latestUserMessage || "No latest user message.",
  };
  const loadedSections = {
    businessPrompt: sections.businessPrompt !== "Not configured",
    businessMemory: Boolean(business),
    knowledgeBase: input.aiContext.knowledge.length > 0,
    faq: sections.faq !== "Not configured",
    pricingRules: sections.pricingRules !== "Not configured",
    appointmentRules: sections.appointmentRules !== "Not configured",
    guardrails: sections.guardrails !== "Not configured",
    conversationMemory: Boolean(visitor),
    userMessage: Boolean(latestUserMessage),
  };
  const responseRules = input.responseRules ?? [
    "Answer the user's latest question first using Business Memory and Knowledge Base.",
    "Then ask only one missing lead question naturally.",
    "Never ask for name, phone, email, business, requirement, budget, timeline, or demo time when already present in Conversation Memory or captured fields.",
    "If the answer is not in memory or knowledge, say: I'll connect you with our team.",
    "Return only valid JSON with shape: {\"reply\":\"...\",\"leadInfo\":{...}}.",
  ];
  const finalSystemPrompt = [
    "BUSINESS PROMPT",
    sections.businessPrompt,
    "",
    "BUSINESS MEMORY",
    sections.businessMemory,
    "",
    "KNOWLEDGE BASE",
    sections.knowledgeBase,
    "",
    "FAQ",
    sections.faq,
    "",
    "PRICING RULES",
    sections.pricingRules,
    "",
    "APPOINTMENT RULES",
    sections.appointmentRules,
    "",
    "GUARDRAILS",
    sections.guardrails,
    "",
    "CONVERSATION MEMORY",
    sections.conversationMemory,
    "",
    "USER MESSAGE",
    sections.userMessage,
    "",
    "RESPONSE RULES",
    responseRules.join("\n"),
  ].join("\n");

  console.log("[Prompt Built]", {
    loadedSections,
    promptLength: finalSystemPrompt.length,
  });

  return { finalSystemPrompt, sections, loadedSections };
}

export async function saveVisitorMemory(input: {
  workspaceId: string;
  conversationId?: string;
  analysis: AiMemoryAnalysis;
  leadId?: string | null;
  lastAiResponse?: string;
}) {
  try {
    const leadInfo = input.analysis.leadInfo;
    const visitorKey = visitorKeyFrom({
      workspaceId: input.workspaceId,
      conversationId: input.conversationId,
      leadInfo,
    });
    const existing = await getVisitorMemory({
      workspaceId: input.workspaceId,
      conversationId: input.conversationId,
      leadInfo,
    });

  const previousAppointments = await prisma.appointment.count({
    where: {
      workspaceId: input.workspaceId,
      OR: [
        input.leadId ? { leadId: input.leadId } : undefined,
        leadInfo.email ? { contact: { email: leadInfo.email } } : undefined,
        leadInfo.phone ? { contact: { phone: leadInfo.phone } } : undefined,
      ].filter(Boolean) as Array<Record<string, unknown>>,
    },
  }).catch(() => 0);

  const saved = existing
    ? await prisma.visitorMemory.update({
        where: { id: existing.id },
        data: {
          visitorKey,
          name: leadInfo.name ?? existing.name,
          phone: leadInfo.phone ?? existing.phone,
          email: leadInfo.email ?? existing.email,
          business: leadInfo.business ?? leadInfo.company ?? existing.business,
          preferredLanguage: leadInfo.preferredLanguage ?? leadInfo.detectedLanguage ?? existing.preferredLanguage,
          previousRequirements: boundedUnique([leadInfo.requirement, ...existing.previousRequirements]),
          previousSummaries: boundedUnique([input.analysis.summary, ...existing.previousSummaries]),
          previousConversations: { increment: 1 },
          previousAppointments,
          buyingIntent: leadInfo.buyingIntent ?? leadInfo.intent ?? existing.buyingIntent,
          lastVisit: new Date(),
          lastAiSummary: input.analysis.summary,
          lastAiResponse: input.lastAiResponse?.slice(0, 4000) ?? existing.lastAiResponse,
          lastConversationId: input.conversationId,
          leadId: input.leadId ?? existing.leadId,
          metadata: toJsonValue({
            company: leadInfo.company,
            business: leadInfo.business,
            requirement: leadInfo.requirement,
            budget: leadInfo.budget,
            timeline: "timeline" in leadInfo ? leadInfo.timeline : undefined,
            preferredLanguage: leadInfo.preferredLanguage ?? leadInfo.detectedLanguage,
            score: input.analysis.score,
            status: input.analysis.status,
            tags: input.analysis.tags,
          }),
        },
      })
    : await prisma.visitorMemory.create({
        data: {
          workspaceId: input.workspaceId,
          visitorKey,
          name: leadInfo.name,
          phone: leadInfo.phone,
          email: leadInfo.email,
          business: leadInfo.business ?? leadInfo.company,
          preferredLanguage: leadInfo.preferredLanguage ?? leadInfo.detectedLanguage,
          previousRequirements: boundedUnique([leadInfo.requirement]),
          previousSummaries: boundedUnique([input.analysis.summary]),
          previousConversations: 1,
          previousAppointments,
          buyingIntent: leadInfo.buyingIntent ?? leadInfo.intent,
          lastVisit: new Date(),
          lastAiSummary: input.analysis.summary,
          lastAiResponse: input.lastAiResponse?.slice(0, 4000),
          lastConversationId: input.conversationId,
          leadId: input.leadId ?? undefined,
          metadata: toJsonValue({
            company: leadInfo.company,
            business: leadInfo.business,
            requirement: leadInfo.requirement,
            budget: leadInfo.budget,
            timeline: "timeline" in leadInfo ? leadInfo.timeline : undefined,
            preferredLanguage: leadInfo.preferredLanguage ?? leadInfo.detectedLanguage,
            score: input.analysis.score,
            status: input.analysis.status,
            tags: input.analysis.tags,
          }),
        },
      });

  backendLog("ai-memory", "visitor memory saved", {
    workspaceId: input.workspaceId,
    visitorKey,
    memoryId: saved.id,
  });

    return saved;
  } catch (error) {
    console.error("[ai-memory] visitor memory save skipped", {
      workspaceId: input.workspaceId,
      error: error instanceof Error ? error.message : "Unknown database error",
    });
    return null;
  }
}

export async function updateMatchingLeadFromAi(input: {
  workspaceId: string;
  conversationId?: string;
  analysis: AiMemoryAnalysis;
}) {
  try {
    const leadInfo = input.analysis.leadInfo;
    const where = [
      leadInfo.email ? { email: leadInfo.email } : undefined,
      leadInfo.phone ? { phone: leadInfo.phone } : undefined,
    ].filter(Boolean) as Array<{ email: string } | { phone: string }>;

    if (!where.length) return null;

    const lead = await prisma.lead.findFirst({
      where: {
        workspaceId: input.workspaceId,
        OR: where,
      },
      select: { id: true, notes: true, score: true },
    });

    if (!lead) return null;

    const noteBlock = [
      "AI Memory Update",
      `Lead Score: ${input.analysis.score}`,
      `Intent: ${leadInfo.intent ?? leadInfo.buyingIntent ?? "Unknown"}`,
      `Summary: ${input.analysis.summary}`,
      input.conversationId ? `Last Conversation: ${input.conversationId}` : null,
    ].filter(Boolean).join("\n");

    return await prisma.lead.update({
      where: { id: lead.id },
      data: {
        score: Math.max(lead.score, input.analysis.score),
        notes: [lead.notes, noteBlock].filter(Boolean).join("\n\n").slice(0, 12000),
      },
      select: { id: true, score: true },
    });
  } catch (error) {
    console.error("[ai-memory] matching lead update skipped", {
      workspaceId: input.workspaceId,
      error: error instanceof Error ? error.message : "Unknown database error",
    });
    return null;
  }
}
