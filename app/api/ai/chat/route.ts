import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { Prisma } from "@/lib/generated/prisma/client";
import { AIConversationChannel } from "@/lib/generated/prisma/enums";
import { buildBrainSystemPrompt, defaultPromptConfig, personalityPresets } from "@/lib/ai/brain";
import { AUTO_LANGUAGE_ID, detectLanguage, questionForField } from "@/lib/ai/languages";
import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { jsonError, readJson } from "@/lib/server/api";
import { backendLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";
import { verifySessionToken } from "@/lib/server/tokens";

type Role = "assistant" | "user";
type RequiredField = "name" | "business" | "requirement" | "budget" | "demoTime";

type ChatMessage = {
  role: Role;
  content: string;
};

type LeadInfo = {
  name?: string;
  phone?: string;
  email?: string;
  business?: string;
  requirement?: string;
  budget?: string;
  demoTime?: string;
  timeline?: string;
  decisionMaker?: string;
  industry?: string;
  country?: string;
  intent?: string;
  urgency?: string;
  detectedLanguage?: string;
  preferredLanguage?: string;
  timezone?: string;
};

type LeadAnalysis = {
  leadInfo: LeadInfo;
  score: number;
  status: "New" | "Contacted" | "Qualified" | "Demo Booked";
  tags: string[];
  summary: string;
  nextAction: string;
  missingFields: RequiredField[];
  priority: "Low" | "Medium" | "High" | "Urgent";
  detectedLanguage: string;
  preferredLanguage: string;
  languageName: string;
};

type ChatBody = {
  message?: string;
  messages?: ChatMessage[];
  workspaceId?: string;
  conversationId?: string;
  leadInfo?: LeadInfo;
  systemPrompt?: string;
  languagePreference?: string;
};

const requiredFields: RequiredField[] = ["name", "business", "requirement", "budget", "demoTime"];

const fieldLabels: Record<keyof LeadInfo, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  business: "business type",
  requirement: "requirement",
  budget: "budget",
  demoTime: "demo time",
  timeline: "timeline",
  decisionMaker: "decision maker",
  industry: "industry",
  country: "country",
  intent: "intent",
  urgency: "urgency",
  detectedLanguage: "detected language",
  preferredLanguage: "preferred language",
  timezone: "timezone",
};

const questionByField: Record<RequiredField, string> = {
  name: "Step 1: What is your name?",
  business: "Step 2: What type of business do you run?",
  requirement: "Step 3: What do you need help with?",
  budget: "Step 4: What budget range should we plan around?",
  demoTime: "Step 5: What is your preferred demo time?",
};

function splitWords(text: string) {
  return text.replace(/[^\w\s+@.-]/g, " ").split(/\s+/).filter(Boolean);
}

function cleanValue(value: string) {
  return value.trim().replace(/\s+/g, " ").replace(/^(is|it is|it's)\s+/i, "");
}

function pickAfter(text: string, markers: string[]) {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const index = lower.indexOf(marker);
    if (index >= 0) {
      return cleanValue(text.slice(index + marker.length).split(/[,.;\n]/)[0]);
    }
  }

  return "";
}

function mergeBareAnswer(info: LeadInfo, value: string) {
  const nextField = requiredFields.find((field) => !info[field]);
  const cleaned = cleanValue(value);

  if (!nextField || !cleaned) return info;
  return { ...info, [nextField]: cleaned };
}

function detectIndustry(text: string) {
  if (/realty|property|builder|real estate|broker/i.test(text)) return "Real Estate";
  if (/clinic|doctor|patient|hospital|health/i.test(text)) return "Healthcare";
  if (/school|college|course|student|admission/i.test(text)) return "Education";
  if (/saas|software|crm|automation|sales/i.test(text)) return "SaaS";
  return "General Business";
}

function detectCountry(text: string) {
  if (/\+91|india|mumbai|delhi|bengaluru|bangalore|pune|hyderabad|chennai/i.test(text)) return "India";
  if (/\+1|usa|united states|new york|california|texas/i.test(text)) return "United States";
  if (/\+44|uk|united kingdom|london/i.test(text)) return "United Kingdom";
  return "Not captured";
}

function extractLeadInfo(messages: ChatMessage[], previous: LeadInfo = {}) {
  let info: LeadInfo = { ...previous };
  const userMessages = messages.filter((message) => message.role === "user");
  const text = userMessages.map((message) => message.content).join("\n");
  const words = splitWords(text);
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s-]{7,}\d)/);
  const budgetMatch = text.match(/(?:budget\s*(?:is|of|around)?\s*)?((?:rs\.?|inr|\$)?\s?\d[\d,.]*(?:\s?(?:lakh|lac|cr|crore|k|m|million))?)/i);
  const timeMatch = text.match(/(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|\d{1,2}(?::\d{2})?\s?(?:am|pm))/i);
  const timelineMatch = text.match(/(?:today|tomorrow|this week|next week|this month|next month|in \d+\s?(?:days|weeks|months))/i);
  const name = pickAfter(text, ["my name is", "i am", "i'm", "name is", "this is"]);
  const business = pickAfter(text, ["business type is", "business is", "company is", "we run", "i run", "from"]);
  const requirement = pickAfter(text, ["requirement is", "need", "looking for", "want", "interested in"]);
  const decisionMaker = pickAfter(text, ["decision maker is", "approver is", "owner is"]);

  if (name) info.name = cleanValue(name.split(/\s+(?:and|from|with|email|phone)\s+/i)[0]);
  if (business) info.business = cleanValue(business.split(/\s+(?:and|for|with)\s+/i)[0]);
  if (requirement) info.requirement = requirement;
  if (emailMatch) info.email = emailMatch[0];
  if (phoneMatch) info.phone = phoneMatch[0].trim();
  if (budgetMatch) info.budget = cleanValue(budgetMatch[1]);
  if (timeMatch) info.demoTime = cleanValue(timeMatch[0]);
  if (timelineMatch) info.timeline = cleanValue(timelineMatch[0]);
  if (decisionMaker) info.decisionMaker = cleanValue(decisionMaker);

  for (const message of userMessages) {
    const content = message.content.trim();
    if (!content) continue;
    const explicitMatch =
      /name|business|company|requirement|need|looking|want|budget|demo|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm|email|phone/i.test(content);
    if (!explicitMatch || content.split(/\s+/).length <= 5) {
      info = mergeBareAnswer(info, content);
    }
  }

  if (!info.requirement && /(crm|lead|automation|whatsapp|voice|chat|sales|pipeline)/i.test(text)) {
    info.requirement = "CRM, lead automation, or AI agent workflow";
  }

  if (!info.business && words.length > 5 && /(agency|realty|clinic|school|company|startup|business)/i.test(text)) {
    info.business = words.slice(0, 6).join(" ");
  }

  info.intent = info.budget && info.demoTime ? "High" : info.requirement ? "Medium" : "Low";
  info.industry = detectIndustry(text);
  info.country = detectCountry(text);
  info.urgency = /urgent|asap|today|tomorrow|this week|launch|immediately/i.test(text) ? "High" : "Medium";

  return info;
}

function analyzeLead(messages: ChatMessage[], previous: LeadInfo = {}, languagePreference = AUTO_LANGUAGE_ID): LeadAnalysis {
  const leadInfo = extractLeadInfo(messages, previous);
  const detected = detectLanguage(
    messages.filter((message) => message.role === "user").map((message) => message.content).join("\n"),
    languagePreference,
  );
  const missingFields = requiredFields.filter((field) => !leadInfo[field]);
  const transcript = messages.map((message) => message.content).join(" ").toLowerCase();
  let score = 15;

  if (leadInfo.name) score += 10;
  if (leadInfo.email || leadInfo.phone) score += 10;
  if (leadInfo.business) score += 16;
  if (leadInfo.requirement) score += 22;
  if (leadInfo.budget) score += 22;
  if (leadInfo.demoTime) score += 18;
  if (/urgent|asap|this week|today|tomorrow|hot|ready/i.test(transcript)) score += 10;
  score = Math.min(score, 100);

  const tags = new Set(["AI Agent"]);
  if (score >= 80) tags.add("Hot Lead");
  if (score >= 65) tags.add("Qualified");
  if (leadInfo.budget) tags.add("Budget Shared");
  if (leadInfo.demoTime) tags.add("Demo Ready");
  if (leadInfo.intent === "High") tags.add("High Intent");
  if (leadInfo.urgency === "High") tags.add("Urgent");
  if (/whatsapp/i.test(transcript)) tags.add("WhatsApp Interest");
  if (/voice|call/i.test(transcript)) tags.add("Voice Demo");
  if (/crm|sales|lead|pipeline/i.test(transcript)) tags.add("CRM Fit");

  const status =
    leadInfo.demoTime && score >= 70
      ? "Demo Booked"
      : score >= 70
        ? "Qualified"
        : messages.length > 2
          ? "Contacted"
          : "New";
  const priority =
    score >= 85 || leadInfo.urgency === "High"
      ? "Urgent"
      : score >= 70
        ? "High"
        : score >= 45
          ? "Medium"
          : "Low";

  const summary = missingFields.length
    ? `Captured ${Object.entries(leadInfo)
        .filter(([, value]) => value)
        .map(([key]) => fieldLabels[key as keyof LeadInfo])
        .join(", ") || "initial interest"}. Waiting for ${missingFields.map((field) => fieldLabels[field]).join(", ")}.`
    : `${leadInfo.name} runs ${leadInfo.business}, needs ${leadInfo.requirement}, has budget ${leadInfo.budget}, and prefers a demo ${leadInfo.demoTime}.`;

  leadInfo.detectedLanguage = detected.name;
  leadInfo.preferredLanguage = detected.name;
  if (!leadInfo.country || leadInfo.country === "Not captured") leadInfo.country = detected.countries[0] ?? "Not captured";

  return {
    leadInfo,
    score,
    status,
    tags: Array.from(tags),
    summary,
    nextAction: missingFields.length ? questionForField(missingFields[0], detected.id) : "Lead is ready to save and hand over to sales.",
    missingFields,
    priority,
    detectedLanguage: detected.id,
    preferredLanguage: languagePreference === AUTO_LANGUAGE_ID ? detected.id : languagePreference,
    languageName: detected.name,
  };
}

function localReply(analysis: LeadAnalysis) {
  const language = detectLanguage("", analysis.preferredLanguage);
  if (analysis.missingFields.length > 0) {
    if (language.id === "es") return `Gracias, actualicé el puntaje del lead a ${analysis.score}. ${analysis.nextAction}`;
    if (language.id === "hi") return `धन्यवाद, मैंने लीड स्कोर ${analysis.score} कर दिया है। ${analysis.nextAction}`;
    if (language.id === "hinglish") return `Thanks, lead score ${analysis.score} update ho gaya. ${analysis.nextAction}`;
    if (language.id === "fr") return `Merci, j'ai mis à jour le score du prospect à ${analysis.score}. ${analysis.nextAction}`;
    if (language.id === "ar") return `شكرا، تم تحديث درجة العميل المحتمل إلى ${analysis.score}. ${analysis.nextAction}`;
    return `Thanks, I updated the lead score to ${analysis.score}. ${analysis.nextAction}`;
  }

  if (language.id === "es") return `Perfecto, el perfil del lead está completo. ${analysis.summary} Recomiendo guardarlo en el CRM ahora.`;
  if (language.id === "hi") return `बहुत अच्छा, लीड प्रोफाइल पूरी हो गई है। ${analysis.summary} अब इसे CRM में सेव करना चाहिए।`;
  if (language.id === "hinglish") return `Perfect, lead profile complete ho gayi. ${analysis.summary} Ab is lead ko CRM mein save karna chahiye.`;
  if (language.id === "fr") return `Parfait, le profil du prospect est complet. ${analysis.summary} Je recommande de l'enregistrer dans le CRM.`;
  if (language.id === "ar") return `رائع، تم اكتمال ملف العميل المحتمل. ${analysis.summary} أنصح بحفظه في CRM الآن.`;
  return `Perfect, the lead profile is complete. ${analysis.summary} I recommend saving this lead to CRM now.`;
}

async function openAiReply(messages: ChatMessage[], analysis: LeadAnalysis, systemPrompt?: string) {
  const brainPrompt = buildBrainSystemPrompt(defaultPromptConfig, personalityPresets[0], analysis.languageName);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            `${systemPrompt?.slice(0, 1500) || "You are RDLeadify AI, a concise sales qualification agent. Ask for name, phone/email, business type, requirement, budget, and preferred demo time in order. Keep replies under 70 words. Do not invent lead details."}\n\n${brainPrompt}`,
        },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
        {
          role: "system",
          content: `Current extracted lead JSON: ${JSON.stringify(analysis)}. Customer language: ${analysis.languageName}. Understand and reason internally in English, but reply only in ${analysis.languageName}. If using English knowledge-base content, translate the answer into ${analysis.languageName}. Ask only this next step if missing fields remain: ${analysis.nextAction}. Confirm saving when complete.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error("OpenAI request failed");

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() || localReply(analysis);
}

async function getSession() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function resolveChatContext(workspaceId?: string) {
  const session = await getSession();
  const resolvedWorkspaceId = session?.workspaceId || workspaceId;

  if (!resolvedWorkspaceId) return null;

  const workspace = await prisma.workspace.findUnique({
    where: { id: resolvedWorkspaceId },
    select: { id: true },
  });

  if (!workspace) return null;

  return {
    workspaceId: workspace.id,
    userId: session?.userId ?? null,
  };
}

async function loadExistingMessages(workspaceId: string, conversationId?: string): Promise<ChatMessage[]> {
  if (!conversationId) return [];

  const conversation = await prisma.aIConversationLog.findFirst({
    where: { id: conversationId, workspaceId },
    select: { messages: true },
  });

  if (!conversation || !Array.isArray(conversation.messages)) return [];

  return conversation.messages
    .filter((message): message is { role: Role; content: string } => {
      if (!message || typeof message !== "object") return false;
      const record = message as Record<string, unknown>;
      return (record.role === "assistant" || record.role === "user") && typeof record.content === "string";
    })
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 2000),
    }));
}

function normalizeIncomingMessages(body: ChatBody, existingMessages: ChatMessage[]) {
  const provided = Array.isArray(body.messages) ? body.messages : [];
  const normalized = provided
    .filter((message) => message && (message.role === "assistant" || message.role === "user"))
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? "").slice(0, 2000),
    }))
    .filter((message) => message.content);

  if (normalized.length) return normalized;

  const message = String(body.message ?? "").trim().slice(0, 2000);
  return message ? [...existingMessages, { role: "user" as const, content: message }] : existingMessages;
}

async function persistChatLog(input: {
  workspaceId: string;
  userId?: string | null;
  conversationId?: string;
  messages: ChatMessage[];
  analysis: LeadAnalysis;
  reply: string;
}) {
  const { workspaceId, userId, conversationId, messages, analysis, reply } = input;
  const existing = conversationId
    ? await prisma.aIConversationLog.findFirst({
        where: { id: conversationId, workspaceId },
        select: { id: true },
      })
    : null;
  const storedMessages = toJsonValue([...messages, { role: "assistant", content: reply }]);

  const conversation = existing
    ? await prisma.aIConversationLog.update({
        where: { id: existing.id },
        data: {
          messages: storedMessages,
          summary: analysis.summary,
          leadScore: analysis.score,
          status: analysis.status,
        },
        select: { id: true },
      })
    : await prisma.aIConversationLog.create({
        data: {
          workspaceId,
          userId,
          channel: AIConversationChannel.CHAT,
          messages: storedMessages,
          summary: analysis.summary,
          leadScore: analysis.score,
          status: analysis.status,
        },
        select: { id: true },
      });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: existing ? "AI_CHAT_CONVERSATION_UPDATED" : "AI_CHAT_CONVERSATION_CREATED",
      entityType: "AIConversationLog",
      entityId: conversation.id,
      metadata: toJsonValue({
        channel: "CHAT",
        leadScore: analysis.score,
        status: analysis.status,
        summary: analysis.summary,
        leadInfo: analysis.leadInfo,
        language: analysis.languageName,
        detectedLanguage: analysis.detectedLanguage,
        preferredLanguage: analysis.preferredLanguage,
        messageCount: messages.length + 1,
      }),
    },
  });

  backendLog("ai-chat", existing ? "conversation updated" : "conversation created", {
    workspaceId,
    conversationId: conversation.id,
    leadScore: analysis.score,
  });

  return conversation;
}

export async function POST(request: Request) {
  const body = await readJson<ChatBody>(request);

  if (!body) {
    return jsonError("Invalid request body.");
  }

  const context = await resolveChatContext(body.workspaceId);
  if (!context) {
    return jsonError("workspaceId is required when no authenticated session is available.", 401);
  }

  const existingMessages = await loadExistingMessages(context.workspaceId, body.conversationId);
  const messages = normalizeIncomingMessages(body, existingMessages);

  if (!messages.some((message) => message.role === "user")) {
    return jsonError("A user message is required.");
  }

  const analysis = analyzeLead(messages, body.leadInfo, body.languagePreference);

  if (!process.env.OPENAI_API_KEY) {
    const reply = localReply(analysis);
    const conversation = await persistChatLog({
      workspaceId: context.workspaceId,
      userId: context.userId,
      conversationId: body.conversationId,
      messages,
      analysis,
      reply,
    });

    return NextResponse.json({
      ok: true,
      reply,
      analysis,
      provider: "local",
      conversationId: conversation.id,
    });
  }

  try {
    const reply = await openAiReply(messages, analysis, body.systemPrompt);
    const conversation = await persistChatLog({
      workspaceId: context.workspaceId,
      userId: context.userId,
      conversationId: body.conversationId,
      messages,
      analysis,
      reply,
    });

    return NextResponse.json({
      ok: true,
      reply,
      analysis,
      provider: "openai",
      conversationId: conversation.id,
    });
  } catch (error) {
    backendLog("ai-chat", "OpenAI failed, using local reply", {
      workspaceId: context.workspaceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    const reply = localReply(analysis);
    const conversation = await persistChatLog({
      workspaceId: context.workspaceId,
      userId: context.userId,
      conversationId: body.conversationId,
      messages,
      analysis,
      reply,
    });

    return NextResponse.json({
      ok: true,
      reply,
      analysis,
      provider: "local",
      conversationId: conversation.id,
      warning: "AI provider failed; local fallback response was used.",
    });
  }
}
