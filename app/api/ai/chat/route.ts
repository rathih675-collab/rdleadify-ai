import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { Prisma } from "@/lib/generated/prisma/client";
import { AIConversationChannel, LeadStatus } from "@/lib/generated/prisma/enums";
import { AUTO_LANGUAGE_ID, detectLanguage } from "@/lib/ai/languages";
import { AUTH_COOKIE_NAME } from "@/lib/server/auth-constants";
import { jsonError, readJson } from "@/lib/server/api";
import { buildFinalAiSystemPrompt, loadAiContext, saveVisitorMemory, updateMatchingLeadFromAi } from "@/lib/server/ai-memory";
import { backendLog } from "@/lib/server/dev-log";
import { GoogleApiError, appendLeadToGoogleSheet, getGoogleIntegration, missingSheetsEnv } from "@/lib/server/google";
import { prisma } from "@/lib/server/prisma";
import { verifySessionToken } from "@/lib/server/tokens";

type Role = "assistant" | "user";
type RequiredField = "name" | "phone" | "email" | "business" | "requirement" | "budget" | "timeline";

type ChatMessage = {
  role: Role;
  content: string;
};

type LeadInfo = {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  business?: string;
  requirement?: string;
  budget?: string;
  source?: string;
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
  scoreLabel: "Hot" | "Warm" | "Cold";
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

class AiParsingError extends Error {
  rawResponse: string;

  constructor(rawResponse: string, message = "AI parsing failed") {
    super(message);
    this.name = "AiParsingError";
    this.rawResponse = rawResponse;
  }
}

const requiredFields: RequiredField[] = ["name", "phone", "email", "business", "requirement", "budget", "timeline"];

const fieldLabels: Record<keyof LeadInfo, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  company: "company",
  business: "business type",
  requirement: "requirement",
  budget: "budget",
  source: "source",
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
  name: "May I know your name?",
  phone: "What phone number should our team use for follow-up?",
  email: "Please share your email as well.",
  business: "What kind of business do you run?",
  requirement: "What are you trying to solve right now?",
  budget: "What budget range should we plan around?",
  timeline: "When do you want to get this live?",
};

function splitWords(text: string) {
  return text.replace(/[^\w\s+@.-]/g, " ").split(/\s+/).filter(Boolean);
}

function cleanValue(value: string) {
  return value.trim().replace(/\s+/g, " ").replace(/^(is|it is|it's)\s+/i, "");
}

function cleanCapturedValue(value: string) {
  return cleanValue(value)
    .replace(/\s+(hai|hain|hu|hoon|hun|h)$/i, "")
    .replace(/\s+(chahiye|chaahiye|required|needed)$/i, "")
    .trim();
}

function scoreLabel(score: number): LeadAnalysis["scoreLabel"] {
  if (score >= 80) return "Hot";
  if (score >= 45) return "Warm";
  return "Cold";
}

function leadExtracted(analysis: LeadAnalysis) {
  return Boolean(analysis.leadInfo.name && (analysis.leadInfo.phone || analysis.leadInfo.email) && analysis.leadInfo.requirement);
}

function completeLeadProfile(analysis: LeadAnalysis) {
  return Boolean(
    analysis.leadInfo.name &&
      (analysis.leadInfo.phone || analysis.leadInfo.email) &&
      analysis.leadInfo.business &&
      analysis.leadInfo.requirement &&
      analysis.leadInfo.budget &&
      analysis.leadInfo.timeline,
  );
}

function localizedQuestion(field: RequiredField, languageId: string) {
  const hinglish: Record<RequiredField, string> = {
    name: "Aapka naam kya hai?",
    phone: "Follow-up ke liye phone number share kar dijiye.",
    email: "Email bhi share kar dijiye.",
    business: "Aap kis type ka business run karte hain?",
    requirement: "Abhi aapko kis cheez mein help chahiye?",
    budget: "Iske liye budget range kya hai?",
    timeline: "Aap ise kab tak live karna chahte hain?",
  };

  if (languageId === "hi" || languageId === "hinglish") return hinglish[field];
  return questionByField[field];
}

function safeJsonObject(value: string) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch (error) {
    console.error("[ai-chat] parsed JSON failed", {
      error: error instanceof Error ? error.message : "Unknown JSON parse error",
      rawResponse: value,
    });
    return null;
  }
}

function parseJsonObjectOrThrow(value: string) {
  const record = safeJsonObject(value);
  if (!record) throw new AiParsingError(value);
  return record;
}

function stringField(record: Record<string, unknown>, key: keyof LeadInfo) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? cleanValue(value).slice(0, 500) : undefined;
}

function mergeAiLeadInfo(previous: LeadInfo, record: Record<string, unknown> | null) {
  if (!record) return previous;
  const leadInfo = typeof record.leadInfo === "object" && record.leadInfo ? record.leadInfo as Record<string, unknown> : record;

  return {
    ...previous,
    name: stringField(leadInfo, "name") ?? previous.name,
    phone: stringField(leadInfo, "phone") ?? previous.phone,
    email: stringField(leadInfo, "email") ?? previous.email,
    company: stringField(leadInfo, "company") ?? previous.company,
    business: stringField(leadInfo, "business") ?? previous.business,
    requirement: stringField(leadInfo, "requirement") ?? previous.requirement,
    budget: stringField(leadInfo, "budget") ?? previous.budget,
    timeline: stringField(leadInfo, "timeline") ?? previous.timeline,
    demoTime: stringField(leadInfo, "demoTime") ?? previous.demoTime,
    decisionMaker: stringField(leadInfo, "decisionMaker") ?? previous.decisionMaker,
    industry: stringField(leadInfo, "industry") ?? previous.industry,
    country: stringField(leadInfo, "country") ?? previous.country,
    timezone: stringField(leadInfo, "timezone") ?? previous.timezone,
  };
}

function pickAfter(text: string, markers: string[]) {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const index = lower.indexOf(marker);
    if (index >= 0) {
      return cleanCapturedValue(text.slice(index + marker.length).split(/[,.;\n]/)[0]);
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
  const name = pickAfter(text, ["my name is", "mera naam", "mera name", "main", "mai", "i am", "i'm", "name is", "this is"]);
  const company = pickAfter(text, ["company is", "from company", "company name is", "at"]);
  const business = pickAfter(text, ["business type is", "business is", "we run", "i run", "from"]);
  const requirement =
    text.match(/(?:mujhe|hume|humko|i need|we need)\s+(.+?)\s+(?:chahiye|chaahiye|needed|required)(?:[,.]|\n|$)/i)?.[1] ||
    pickAfter(text, ["requirement is", "mujhe", "hume", "humko", "need", "looking for", "want", "interested in"]);
  const decisionMaker = pickAfter(text, ["decision maker is", "approver is", "owner is"]);

  if (name) info.name = cleanCapturedValue(name.split(/\s+(?:and|from|with|email|phone)\s+/i)[0]);
  if (company) info.company = cleanCapturedValue(company.split(/\s+(?:and|for|with)\s+/i)[0]);
  if (business) info.business = cleanCapturedValue(business.split(/\s+(?:and|for|with)\s+/i)[0]);
  if (requirement) info.requirement = cleanCapturedValue(requirement);
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
  info.source = "AI Chat";
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
  if (leadInfo.timeline) score += 12;
  if (leadInfo.demoTime) score += 10;
  if (/urgent|asap|this week|today|tomorrow|hot|ready/i.test(transcript)) score += 10;
  score = Math.min(score, 100);

  const tags = new Set(["AI Agent"]);
  const label = scoreLabel(score);
  tags.add(`${label} Lead`);
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
    : `${leadInfo.name} runs ${leadInfo.business}, needs ${leadInfo.requirement}, has budget ${leadInfo.budget}, and wants to move on ${leadInfo.timeline}.`;

  leadInfo.detectedLanguage = detected.name;
  leadInfo.preferredLanguage = detected.name;
  if (!leadInfo.country || leadInfo.country === "Not captured") leadInfo.country = detected.countries[0] ?? "Not captured";

  return {
    leadInfo,
    score,
    scoreLabel: label,
    status,
    tags: Array.from(tags),
    summary,
    nextAction: missingFields.length ? localizedQuestion(missingFields[0], detected.id) : "Lead is ready to save to CRM, sync to Google Sheet, and offer demo booking.",
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
    if (language.id === "hi") return `Samajh gaya. ${analysis.nextAction}`;
    if (language.id === "hinglish") return `Got it. ${analysis.nextAction}`;
    return `Got it. ${analysis.nextAction}`;
  }

  if (language.id === "hi" || language.id === "hinglish") {
    return `Perfect, details capture ho gayi hain. ${analysis.summary} Main lead CRM mein save kar rahi hoon aur Google Sheet sync enable kar rahi hoon. Demo booking bhi offer kar sakti hoon.`;
  }
  return `Perfect, I have the details. ${analysis.summary} I am saving this lead to CRM, enabling Google Sheet sync, and can offer a demo booking next.`;

  if (analysis.missingFields.length > 0) {
    if (language.id === "es") return `Gracias, actualicé el puntaje del lead a ${analysis.score}. ${analysis.nextAction}`;
    if (language.id === "hi") return `धन्यवाद, मैंने लीड स्कोर ${analysis.score} कर दिया है। ${analysis.nextAction}`;
    if (language.id === "fr") return `Merci, j'ai mis à jour le score du prospect à ${analysis.score}. ${analysis.nextAction}`;
    if (language.id === "ar") return `شكرا، تم تحديث درجة العميل المحتمل إلى ${analysis.score}. ${analysis.nextAction}`;
  }

  if (language.id === "es") return `Perfecto, el perfil del lead está completo. ${analysis.summary} Recomiendo guardarlo en el CRM ahora.`;
  if (language.id === "hi") return `बहुत अच्छा, लीड प्रोफाइल पूरी हो गई है। ${analysis.summary} अब इसे CRM में सेव करना चाहिए।`;
  if (language.id === "hinglish") return `Perfect, lead profile complete ho gayi. ${analysis.summary} Ab is lead ko CRM mein save karna chahiye.`;
  if (language.id === "fr") return `Parfait, le profil du prospect est complet. ${analysis.summary} Je recommande de l'enregistrer dans le CRM.`;
  if (language.id === "ar") return `رائع، تم اكتمال ملف العميل المحتمل. ${analysis.summary} أنصح بحفظه في CRM الآن.`;
  return `Perfect, the lead profile is complete. ${analysis.summary} I am saving this lead to CRM, syncing it to Google Sheet, and can offer a demo booking next.`;
}

async function createAiConversationTurn(input: {
  messages: ChatMessage[];
  leadInfo?: LeadInfo;
  languagePreference?: string;
  finalSystemPrompt: string;
}) {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  const openAiPayload = {
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: input.finalSystemPrompt,
      },
      ...input.messages.map((message) => ({ role: message.role, content: message.content })),
    ],
  };

  console.log("[ai-chat] OpenAI verification", { hasApiKey, model });
  console.log("[OpenAI Request]", openAiPayload);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(openAiPayload),
  });

  const rawOpenAiResponse = await response.text();
  console.log("[OpenAI Response]", {
    status: response.status,
    ok: response.ok,
    body: rawOpenAiResponse,
  });

  if (!response.ok) throw new Error(`OpenAI conversation request failed (${response.status}): ${rawOpenAiResponse}`);

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = JSON.parse(rawOpenAiResponse) as { choices?: Array<{ message?: { content?: string } }> };
  } catch (error) {
    console.error("[ai-chat] OpenAI HTTP JSON parse failed", {
      error: error instanceof Error ? error.message : "Unknown JSON parse error",
      rawResponse: rawOpenAiResponse,
    });
    throw new AiParsingError(rawOpenAiResponse);
  }

  console.log("[ai-chat] OpenAI response object", data);
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) {
    console.error("[ai-chat] OpenAI response content empty", data);
    throw new AiParsingError(JSON.stringify(data));
  }

  const record = parseJsonObjectOrThrow(content);
  console.log("[ai-chat] parsed JSON", record);
  const reply = typeof record?.reply === "string" && record.reply.trim() ? record.reply.trim() : "";
  const leadInfo = mergeAiLeadInfo(input.leadInfo ?? {}, record);

  if (!reply) throw new AiParsingError(content);
  return { reply, leadInfo };
}

function asksBusinessKnowledge(message: string) {
  return /(rdleadify|kya karta|kya karti|what do you do|what does|price|pricing|cost|service|product|hours|timing|address|location|contact|faq|feature|plan|package|refund|support|kya price|kitna|fees|charges)/i.test(
    message,
  );
}

function localTeamHandoff(languageId: string) {
  if (languageId === "hi" || languageId === "hinglish") return "Main aapko hamari team se connect kar dungi.";
  return "I'll connect you with our team.";
}

function contextHasAnswerSource(contextPrompt: string) {
  return !contextPrompt.includes("Business Name: Not configured") || !contextPrompt.includes("No uploaded knowledge matched this message.");
}

function localBusinessAnswer(contextPrompt: string, languageId: string) {
  const lines = contextPrompt
    .split("\n")
    .filter((line) => /^(Business Name|Description|Products|Services|Pricing|FAQs|Contact Details|Website):/.test(line))
    .filter((line) => !line.endsWith("Not configured"))
    .slice(0, 6);

  const memory = lines.length
    ? lines.map((line) => line.replace(/^[^:]+:\s*/, "")).join(" ")
    : "RDLeadify AI helps businesses capture website visitors, qualify leads with AI chat and voice agents, sync leads to Google Sheets, and prepare demo booking.";

  if (languageId === "hi" || languageId === "hinglish") {
    return `RDLeadify AI business ke website visitors ko AI chat aur voice agent se qualify karta hai, lead details capture karta hai, Google Sheet sync karta hai, aur demo booking ke liye ready karta hai. ${memory}`;
  }
  return memory;
}

function localReplyWithContext(analysis: LeadAnalysis, contextPrompt: string, messages: ChatMessage[]) {
  const base = localReply(analysis);
  const latestUser = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const askedBusinessQuestion = asksBusinessKnowledge(latestUser);
  const hasAnswerSource = contextHasAnswerSource(contextPrompt);
  const asksAboutRdleadify = /rdleadify/i.test(latestUser);

  if (askedBusinessQuestion && !hasAnswerSource && !asksAboutRdleadify) {
    return localTeamHandoff(analysis.detectedLanguage);
  }

  if (askedBusinessQuestion) {
    return `${localBusinessAnswer(contextPrompt, analysis.detectedLanguage)} ${base}`;
  }

  if (!hasAnswerSource) return base;
  if (analysis.missingFields.length > 0) return base;

  return `${base} I used the configured business memory and knowledge base for this answer.`;
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
  try {
    return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
  } catch (error) {
    console.error("[ai-chat] JSON serialization failed", {
      error: error instanceof Error ? error.message : "Unknown JSON serialization error",
      value,
    });
    return {} as Prisma.InputJsonValue;
  }
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

async function resolveBusinessPrompt(workspaceId: string, incomingPrompt?: string, memoryPrompt?: string | null) {
  if (incomingPrompt?.trim()) return incomingPrompt.trim();
  if (memoryPrompt?.trim()) return memoryPrompt.trim();

  const agent = await prisma.aIAgent.findFirst({
    where: { workspaceId, isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { systemPrompt: true },
  });

  return agent?.systemPrompt?.trim() || undefined;
}

function hydrateLeadInfoFromMemory(leadInfo: LeadInfo = {}, visitorMemory: Awaited<ReturnType<typeof loadAiContext>>["visitorMemory"]) {
  if (!visitorMemory) return leadInfo;

  return {
    ...leadInfo,
    name: leadInfo.name ?? visitorMemory.name ?? undefined,
    phone: leadInfo.phone ?? visitorMemory.phone ?? undefined,
    email: leadInfo.email ?? visitorMemory.email ?? undefined,
    business: leadInfo.business ?? visitorMemory.business ?? undefined,
    requirement: leadInfo.requirement ?? visitorMemory.previousRequirements[0] ?? undefined,
    preferredLanguage: leadInfo.preferredLanguage ?? visitorMemory.preferredLanguage ?? undefined,
    intent: leadInfo.intent ?? visitorMemory.buyingIntent ?? undefined,
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

function splitName(name?: string) {
  const parts = cleanValue(name || "Website Visitor").split(/\s+/);
  return { firstName: parts[0] || "Website", lastName: parts.slice(1).join(" ") || undefined };
}

function sheetLeadPayload(analysis: LeadAnalysis) {
  return {
    name: analysis.leadInfo.name,
    phone: analysis.leadInfo.phone,
    email: analysis.leadInfo.email,
    company: analysis.leadInfo.company || analysis.leadInfo.business,
    business: analysis.leadInfo.business,
    requirement: analysis.leadInfo.requirement,
    budget: analysis.leadInfo.budget,
    source: "AI Chat",
    score: analysis.score,
    leadScore: analysis.scoreLabel,
    summary: analysis.summary,
    aiSummary: analysis.summary,
  };
}

function sheetRow(analysis: LeadAnalysis) {
  const lead = sheetLeadPayload(analysis);
  const plain = (value: unknown) =>
    typeof value === "string" || typeof value === "number" ? String(value).trim() : "";

  return [
    plain(lead.name),
    plain(lead.phone),
    plain(lead.email),
    plain(lead.company),
    plain(lead.requirement),
    plain(lead.budget),
    "AI Chat",
    `${analysis.scoreLabel} (${analysis.score})`,
    plain(lead.summary),
    new Date().toISOString(),
  ];
}

async function createOrUpdateLeadFromAi(input: {
  workspaceId: string;
  conversationId: string;
  analysis: LeadAnalysis;
}) {
  const { workspaceId, conversationId, analysis } = input;
  if (!leadExtracted(analysis)) return null;

  const leadInfo = analysis.leadInfo;
  const { firstName, lastName } = splitName(leadInfo.name);
  const duplicateWhere = [
    leadInfo.email ? { email: leadInfo.email } : null,
    leadInfo.phone ? { phone: leadInfo.phone } : null,
  ].filter(Boolean) as Array<{ email: string } | { phone: string }>;
  const existingLead = duplicateWhere.length
    ? await prisma.lead.findFirst({
        where: { workspaceId, OR: duplicateWhere },
        select: { id: true },
      })
    : null;
  const notes = [
    analysis.summary,
    `Lead Score: ${analysis.scoreLabel} (${analysis.score})`,
    `Requirement: ${leadInfo.requirement}`,
    `Budget: ${leadInfo.budget}`,
    `Timeline: ${leadInfo.timeline}`,
    conversationId ? `AI conversation: ${conversationId}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const data = {
    title: `${leadInfo.name || "AI Chat Lead"} - AI Chat`,
    firstName,
    lastName,
    email: leadInfo.email,
    phone: leadInfo.phone,
    source: "AI Chat",
    status: analysis.score >= 70 ? LeadStatus.QUALIFIED : LeadStatus.CONTACTED,
    score: analysis.score,
    detectedLanguage: leadInfo.detectedLanguage,
    preferredLanguage: leadInfo.preferredLanguage,
    country: leadInfo.country,
    timezone: leadInfo.timezone,
    notes,
    tags: {
      connectOrCreate: analysis.tags.slice(0, 10).map((tag) => ({
        where: { workspaceId_name: { workspaceId, name: tag } },
        create: { workspaceId, name: tag, color: tag === "Hot Lead" ? "#10b981" : tag === "Warm Lead" ? "#f59e0b" : "#38bdf8" },
      })),
    },
  };

  const lead = existingLead
    ? await prisma.lead.update({
        where: { id: existingLead.id },
        data,
        select: { id: true, title: true, score: true, status: true },
      })
    : await prisma.lead.create({
        data: { workspaceId, ...data },
        select: { id: true, title: true, score: true, status: true },
      });

  return lead;
}

async function syncAiLeadToGoogleSheet(input: {
  workspaceId: string;
  leadId: string;
  conversationId: string;
  analysis: LeadAnalysis;
}) {
  const existing = await prisma.googleSheetSyncLog.findFirst({
    where: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      status: { in: ["SYNC_SUCCESS", "DEMO_SUCCESS"] },
    },
    select: { id: true, status: true },
  });

  if (existing) return { skipped: true, reason: "Already synced", log: existing };

  const integration = await getGoogleIntegration(input.workspaceId);
  const payload = {
    source: "AI Chat",
    lead: sheetLeadPayload(input.analysis),
    leadId: input.leadId,
    conversationId: input.conversationId,
    requestedAt: new Date().toISOString(),
    automatic: true,
  };
  let response: Record<string, unknown>;
  let status = "DEMO_SUCCESS";
  let mode = "DEMO";

  try {
    if (integration) {
      if (missingSheetsEnv().length) throw new Error("Missing spreadsheet ID.");
      const google = await appendLeadToGoogleSheet(input.workspaceId, sheetRow(input.analysis));
      response = {
        mode: "REAL",
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        google,
        message: "Sync successful",
      };
      status = "SYNC_SUCCESS";
      mode = "REAL";
    } else {
      response = {
        mode: "DEMO",
        spreadsheetId: "demo-spreadsheet",
        rowNumber: Math.floor(Date.now() / 1000) % 10000,
        message: "Demo sync completed",
      };
    }
  } catch (error) {
    status = "SYNC_FAILED";
    mode = integration ? "REAL" : "DEMO";
    response = {
      mode,
      error: error instanceof Error ? error.message : "Google Sheet sync failed.",
      ...(error instanceof GoogleApiError
        ? {
            diagnostics: error.diagnostics,
            googleApiErrorCode: error.code,
            googleApiErrorMessage: error.message,
            googleApiResponseBody: error.responseBody,
          }
        : {}),
    };
  }

  const log = await prisma.googleSheetSyncLog.create({
    data: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      status,
      payload: toJsonValue(payload),
      response: toJsonValue(response),
    },
    select: { id: true, status: true, response: true, createdAt: true },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      action: "AI_CHAT_AUTO_GOOGLE_SHEET_SYNC",
      entityType: "GoogleSheetSyncLog",
      entityId: log.id,
      metadata: toJsonValue({ source: "AI Chat", conversationId: input.conversationId, mode, status }),
    },
  });

  return { skipped: false, mode, log };
}

function chatResponse(input: {
  reply: string;
  analysis: LeadAnalysis;
  provider: "openai" | "local";
  conversationId: string;
  memory: {
    businessMemoryLoaded: boolean;
    knowledgeDocumentsUsed: number;
    visitorMemoryLoaded: boolean;
  };
  lead?: { id: string; score?: number; title?: string; status?: string } | null;
  sheetSync?: Awaited<ReturnType<typeof syncAiLeadToGoogleSheet>> | null;
  warning?: string;
}) {
  const payload = {
    ok: true,
    success: true,
    message: input.reply,
    reply: input.reply,
    language: input.analysis.detectedLanguage,
    leadScore: input.analysis.scoreLabel,
    numericLeadScore: input.analysis.score,
    leadExtracted: leadExtracted(input.analysis),
    summary: input.analysis.summary,
    analysis: input.analysis,
    provider: input.provider,
    conversationId: input.conversationId,
    lead: input.lead ?? {},
    sheetSync: input.sheetSync,
    memory: input.memory,
    warning: input.warning,
  };

  console.log("[ai-chat] final response", payload);
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
  const body = await readJson<ChatBody>(request);
  console.log("[ai-chat] incoming request", {
    hasBody: Boolean(body),
    conversationId: body?.conversationId,
    workspaceId: body?.workspaceId,
    messageCount: body?.messages?.length ?? (body?.message ? 1 : 0),
    leadInfo: body?.leadInfo,
    hasSystemPrompt: Boolean(body?.systemPrompt),
  });
  console.log("[ai-chat] backend verification", {
    route: "POST /api/ai/chat",
    usedBy: "/ai-agent",
    openAiApiKeyExists: Boolean(process.env.OPENAI_API_KEY),
    configuredModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });

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

  const aiContext = await loadAiContext({
    workspaceId: context.workspaceId,
    conversationId: body.conversationId,
    messages,
    leadInfo: body.leadInfo,
  });
  const hydratedLeadInfo = hydrateLeadInfoFromMemory(body.leadInfo, aiContext.visitorMemory);
  const businessPrompt = await resolveBusinessPrompt(context.workspaceId, body.systemPrompt, aiContext.businessMemory?.description);
  const preliminaryAnalysis = analyzeLead(messages, hydratedLeadInfo, body.languagePreference);
  const promptBuild = buildFinalAiSystemPrompt({
    businessPrompt,
    aiContext,
    messages,
    capturedFields: preliminaryAnalysis.leadInfo,
    missingFields: preliminaryAnalysis.missingFields,
    responseRules: [
      "You are the AI sales assistant for this business. Behave like a real human sales executive.",
      "Answer the user's latest question first using Business Memory, Knowledge Base, FAQ, Pricing Rules, Appointment Rules, and Guardrails.",
      "Then ask only one missing qualification question when useful.",
      "Silently extract lead fields: name, phone, email, business, requirement, budget, timeline, demoTime, preferredLanguage.",
      "Never ask for the same information twice when it exists in Conversation Memory or captured fields.",
      "If the answer is not in memory or knowledge, say: I'll connect you with our team.",
      "Never use Step 1, Step 2, fixed forms, numbered qualification flow, or robotic scoring language.",
      "Return only valid JSON with shape: {\"reply\":\"...\",\"leadInfo\":{...}}.",
      `Continue in the visitor's detected language. Language preference: ${body.languagePreference ?? AUTO_LANGUAGE_ID}.`,
    ],
  });
  let analysis: LeadAnalysis;
  let reply: string;
  let provider: "openai" | "local" = process.env.OPENAI_API_KEY ? "openai" : "local";
  let warning: string | undefined;

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiTurn = await createAiConversationTurn({
        messages,
        leadInfo: hydratedLeadInfo,
        languagePreference: body.languagePreference,
        finalSystemPrompt: promptBuild.finalSystemPrompt,
      });
      analysis = analyzeLead(messages, aiTurn.leadInfo, body.languagePreference);
      reply = aiTurn.reply;
    } catch (error) {
      provider = "local";
      warning = "AI provider failed; local fallback response was used.";
      backendLog("ai-chat", "OpenAI conversation failed, using local adaptive fallback", {
        workspaceId: context.workspaceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      analysis = preliminaryAnalysis;
      reply = localReplyWithContext(analysis, aiContext.prompt, messages);
    }
  } else {
    analysis = preliminaryAnalysis;
    reply = localReplyWithContext(analysis, aiContext.prompt, messages);
  }

  let conversationId = body.conversationId || `local-${Date.now()}`;
  let lead: { id: string; score?: number; title?: string; status?: string } | null = null;
  let sheetSync: Awaited<ReturnType<typeof syncAiLeadToGoogleSheet>> | null = null;

  try {
    const conversation = await persistChatLog({
      workspaceId: context.workspaceId,
      userId: context.userId,
      conversationId: body.conversationId,
      messages,
      analysis,
      reply,
    });
    conversationId = conversation.id;
    const matchingLead = await updateMatchingLeadFromAi({
      workspaceId: context.workspaceId,
      conversationId,
      analysis,
    });
    lead = matchingLead ?? (await createOrUpdateLeadFromAi({
      workspaceId: context.workspaceId,
      conversationId,
      analysis,
    }));
    sheetSync = lead?.id
      ? await syncAiLeadToGoogleSheet({
          workspaceId: context.workspaceId,
          leadId: lead.id,
          conversationId,
          analysis,
        })
      : null;
    await saveVisitorMemory({
      workspaceId: context.workspaceId,
      conversationId,
      analysis,
      leadId: lead?.id,
      lastAiResponse: reply,
    });
  } catch (error) {
    warning = "I answered successfully, but saving this chat is temporarily unavailable.";
    console.error("[ai-chat] persistence skipped", {
      workspaceId: context.workspaceId,
      error: error instanceof Error ? error.message : "Unknown database error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  return chatResponse({
    reply,
    analysis,
    provider,
    conversationId,
    lead,
    sheetSync,
    memory: {
      businessMemoryLoaded: Boolean(aiContext.businessMemory),
      knowledgeDocumentsUsed: aiContext.knowledge.length,
      visitorMemoryLoaded: Boolean(aiContext.visitorMemory),
    },
    warning,
  });
  } catch (error) {
    if (error instanceof AiParsingError) {
      console.error("[ai-chat] AI parsing failed", { rawResponse: error.rawResponse });
      return jsonError("I could not read the AI response. Please try again.", 502);
    }

    const payload = {
      success: false,
      ok: false,
      error: "AI chat is temporarily unavailable. Please try again.",
      message: "I could not complete that chat request right now. Please try again.",
      lead: {},
    };
    console.error("[ai-chat] unhandled backend error", {
      error: error instanceof Error ? error.message : "Unknown backend error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(payload, { status: 500 });
  }
}
