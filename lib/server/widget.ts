import {
  InboxChannel,
  InboxMessageType,
  InboxSender,
  LeadStatus,
  Prisma,
  TaskPriority,
} from "@prisma/client";
import { detectLanguage } from "@/lib/ai/languages";
import { buildFinalAiSystemPrompt, type AiContextBundle } from "@/lib/server/ai-memory";
import { backendLog } from "@/lib/server/dev-log";
import { GoogleApiError, appendLeadToGoogleSheet, getGoogleIntegration, missingSheetsEnv } from "@/lib/server/google";
import { prisma } from "@/lib/server/prisma";

export type WidgetMessage = {
  role: "assistant" | "user";
  content: string;
};

export type WidgetLeadInfo = {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  business?: string;
  requirement?: string;
  budget?: string;
  timeline?: string;
  preferredDemoDate?: string;
  preferredDemoTime?: string;
  detectedLanguage?: string;
  preferredLanguage?: string;
  country?: string;
  timezone?: string;
};

export type WidgetAnalysis = {
  leadInfo: WidgetLeadInfo;
  score: number;
  scoreLabel: "Hot" | "Warm" | "Cold";
  status: "New" | "Contacted" | "Qualified" | "Demo Booked";
  tags: string[];
  summary: string;
  nextAction: string;
  missingFields: Array<keyof WidgetLeadInfo>;
  languageName: string;
  detectedLanguage: string;
};

export type WidgetConversationTurn = {
  reply: string;
  analysis: WidgetAnalysis;
  provider: "openai" | "local";
};

export type WidgetSettings = {
  companyName: string;
  logo: string;
  primaryColor: string;
  greetingMessage: string;
  agentName: string;
  position: string;
  businessHours: string;
  offlineMessage: string;
  theme: "dark" | "light";
  language: string;
  workspaceKey?: string;
};

const requiredFields: Array<keyof WidgetLeadInfo> = [
  "name",
  "phone",
  "email",
  "business",
  "requirement",
  "budget",
  "timeline",
];

const fieldLabel: Record<keyof WidgetLeadInfo, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  company: "company",
  business: "business type",
  requirement: "requirement",
  budget: "budget",
  timeline: "timeline",
  preferredDemoDate: "preferred demo date",
  preferredDemoTime: "preferred demo time",
  detectedLanguage: "detected language",
  preferredLanguage: "preferred language",
  country: "country",
  timezone: "timezone",
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function clean(value?: string) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(is|it is|it's)\s+/i, "")
    .replace(/\s+(hai|hain|hu|hoon|hun|h)$/i, "")
    .replace(/\s+(chahiye|chaahiye|required|needed)$/i, "");
}

function pickAfter(text: string, markers: string[]) {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const index = lower.indexOf(marker);
    if (index >= 0) return clean(text.slice(index + marker.length).split(/[,;\n]/)[0]);
  }
  return "";
}

function mergeBareAnswer(info: WidgetLeadInfo, value: string) {
  const field = requiredFields.find((item) => !info[item]);
  const answer = clean(value);
  return field && answer ? { ...info, [field]: answer } : info;
}

function scoreLabel(score: number): WidgetAnalysis["scoreLabel"] {
  if (score >= 80) return "Hot";
  if (score >= 45) return "Warm";
  return "Cold";
}

function hasQualifiedLead(analysis: WidgetAnalysis) {
  return Boolean(analysis.leadInfo.name && (analysis.leadInfo.phone || analysis.leadInfo.email) && analysis.leadInfo.requirement);
}

function leadPayloadForSheet(analysis: WidgetAnalysis) {
  return {
    name: analysis.leadInfo.name,
    phone: analysis.leadInfo.phone,
    email: analysis.leadInfo.email,
    company: analysis.leadInfo.company || analysis.leadInfo.business,
    business: analysis.leadInfo.business,
    requirement: analysis.leadInfo.requirement,
    budget: analysis.leadInfo.budget,
    source: "Website Widget",
    score: analysis.score,
    leadScore: analysis.scoreLabel,
    summary: analysis.summary,
    aiSummary: analysis.summary,
  };
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function buildSheetRow(analysis: WidgetAnalysis) {
  const lead = leadPayloadForSheet(analysis);
  return [
    text(lead.name),
    text(lead.phone),
    text(lead.email),
    text(lead.company),
    text(lead.requirement),
    text(lead.budget),
    "Website Widget",
    `${analysis.scoreLabel} (${analysis.score})`,
    text(lead.summary),
    new Date().toISOString(),
  ];
}

function contextHasAnswerSource(aiContext?: AiContextBundle) {
  if (!aiContext) return false;
  const business = aiContext.businessMemory;
  const hasBusinessMemory = Boolean(
    business?.businessName ||
      business?.services ||
      business?.products ||
      business?.pricing ||
      business?.faqs ||
      business?.workingHours ||
      business?.address ||
      business?.contactDetails,
  );
  return hasBusinessMemory || aiContext.knowledge.length > 0;
}

function asksBusinessKnowledge(message: string) {
  return /(rdleadify|kya karta|kya karti|what do you do|what does|price|pricing|cost|service|product|hours|timing|address|location|contact|faq|feature|plan|package|refund|support|kya price|kitna|fees|charges)/i.test(
    message,
  );
}

function teamHandoff(languageId: string) {
  if (languageId === "hi") return "Main aapko hamari team se connect kar dungi.";
  if (languageId === "hinglish") return "Main aapko hamari team se connect kar dungi.";
  return "I'll connect you with our team.";
}

function localBusinessAnswer(settings: WidgetSettings, aiContext: AiContextBundle | undefined, languageId: string) {
  const business = aiContext?.businessMemory;
  const answer = [
    business?.businessName || settings.companyName,
    business?.description,
    business?.services,
    business?.products,
    business?.pricing,
  ].filter(Boolean).join(" ");

  const fallback = `${settings.companyName} helps businesses capture website visitors, qualify leads with AI chat and voice agents, sync leads to Google Sheets, and prepare demo booking.`;
  if (languageId === "hi" || languageId === "hinglish") {
    return `${settings.companyName} website visitors ko AI chat aur voice agent se qualify karta hai, lead details capture karta hai, Google Sheet sync karta hai, aur demo booking ke liye ready karta hai.`;
  }
  return answer || fallback;
}

function naturalQuestion(field: keyof WidgetLeadInfo, languageId: string) {
  const questions: Record<string, Partial<Record<keyof WidgetLeadInfo, string>>> = {
    en: {
      name: "May I know your name?",
      phone: "What phone number should our team use for follow-up?",
      email: "Please share your email as well.",
      business: "What kind of business do you run?",
      requirement: "What are you trying to solve right now?",
      budget: "What budget range should we plan around?",
      timeline: "When do you want to get this live?",
    },
    hi: {
      name: "Aapka naam kya hai?",
      phone: "Follow-up ke liye phone number share kar dijiye.",
      email: "Email bhi share kar dijiye.",
      business: "Aap kis type ka business run karte hain?",
      requirement: "Abhi aapko kis cheez mein help chahiye?",
      budget: "Iske liye aapka budget range kya hai?",
      timeline: "Aap ise kab tak live karna chahte hain?",
    },
    hinglish: {
      name: "Aapka naam kya hai?",
      phone: "Follow-up ke liye phone number share kar doge?",
      email: "Email bhi share kar dijiye.",
      business: "Aap kis type ka business run karte ho?",
      requirement: "Abhi aapko exactly kis cheez mein help chahiye?",
      budget: "Iske liye budget range kya socha hai?",
      timeline: "Aap ise kab tak start/live karna chahte ho?",
    },
  };

  return questions[languageId]?.[field] || questions.en[field] || "Can you share a few more details?";
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
  } catch {
    return null;
  }
}

function stringField(record: Record<string, unknown>, key: keyof WidgetLeadInfo) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? clean(value).slice(0, 500) : undefined;
}

function mergeAiLeadInfo(previous: WidgetLeadInfo, record: Record<string, unknown> | null) {
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
    preferredDemoDate: stringField(leadInfo, "preferredDemoDate") ?? previous.preferredDemoDate,
    preferredDemoTime: stringField(leadInfo, "preferredDemoTime") ?? previous.preferredDemoTime,
    country: stringField(leadInfo, "country") ?? previous.country,
    timezone: stringField(leadInfo, "timezone") ?? previous.timezone,
  };
}

async function createWidgetAiConversationTurn(input: {
  messages: WidgetMessage[];
  leadInfo?: WidgetLeadInfo;
  language?: string;
  settings: WidgetSettings;
  aiContext?: AiContextBundle;
  capturedFields?: WidgetLeadInfo;
  missingFields?: Array<keyof WidgetLeadInfo>;
}) {
  const promptBuild = buildFinalAiSystemPrompt({
    businessPrompt: `You are ${input.settings.agentName}, a human-like sales executive for ${input.settings.companyName}.`,
    aiContext: input.aiContext ?? {
      businessMemory: null,
      knowledge: [],
      visitorMemory: null,
      prompt: "No business memory or knowledge base was loaded.",
    },
    messages: input.messages,
    capturedFields: input.capturedFields ?? input.leadInfo ?? {},
    missingFields: input.missingFields?.map(String) ?? [],
    responseRules: [
      "You are the AI sales assistant for this business. Behave like a real human sales executive.",
      "Every reply must feel like a natural conversation, not a form or fixed script.",
      "Answer the visitor's latest question first using Business Memory, Knowledge Base, FAQ, Pricing Rules, Appointment Rules, and Guardrails.",
      `If the answer is not in memory or knowledge, reply with the meaning of: "${teamHandoff("en")}" in the visitor's language.`,
      "Only ask one missing qualification question when useful, after answering the user's question.",
      "Silently extract lead fields from normal conversation: name, phone, email, company, business, requirement, budget, timeline, preferredDemoDate, preferredDemoTime, country, timezone.",
      "Never ask for the same information twice when it exists in Conversation Memory or captured fields.",
      "Never use Step 1, Step 2, fixed forms, numbered qualification flow, or robotic scoring language.",
      "Return only valid JSON with shape: {\"reply\":\"...\",\"leadInfo\":{...}}.",
      `Preferred language setting: ${input.language || input.settings.language}. Continue in English, Hindi, or Hinglish based on the visitor.`,
    ],
  });
  const payload = {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: promptBuild.finalSystemPrompt,
      },
      ...input.messages.map((message) => ({ role: message.role, content: message.content })),
    ],
  };
  console.log("[OpenAI Request]", { source: "widget", payload });
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("OpenAI widget conversation request failed");
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  console.log("[OpenAI Response]", { source: "widget", data });
  const record = safeJsonObject(data.choices?.[0]?.message?.content ?? "");
  const reply = typeof record?.reply === "string" && record.reply.trim() ? record.reply.trim() : "";
  const leadInfo = mergeAiLeadInfo(input.leadInfo ?? {}, record);

  if (!reply) throw new Error("OpenAI widget conversation returned no reply");
  return { reply, leadInfo };
}

function localAgentReply(messages: WidgetMessage[], analysis: WidgetAnalysis, settings: WidgetSettings, aiContext?: AiContextBundle) {
  const latestUser = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const languageId = analysis.detectedLanguage;
  const visitor = aiContext?.visitorMemory;
  const returningPrefix =
    visitor && visitor.previousConversations > 0 && !analysis.leadInfo.name
      ? languageId === "en"
        ? `Welcome back${visitor.name ? `, ${visitor.name}` : ""}. `
        : `Welcome back${visitor.name ? `, ${visitor.name}` : ""}. `
      : "";

  const asksAboutRdleadify = /rdleadify/i.test(latestUser);
  if (asksBusinessKnowledge(latestUser) && !contextHasAnswerSource(aiContext) && !asksAboutRdleadify) {
    return `${returningPrefix}${teamHandoff(languageId)}`;
  }

  const answerPrefix = asksBusinessKnowledge(latestUser) ? `${localBusinessAnswer(settings, aiContext, languageId)} ` : "";

  if (analysis.missingFields.length > 0) {
    const question = naturalQuestion(analysis.missingFields[0], languageId);
    if (languageId === "hi") return `${returningPrefix}${answerPrefix}Samajh gaya. ${question}`;
    if (languageId === "hinglish") return `${returningPrefix}${answerPrefix}Got it. ${question}`;
    return `${returningPrefix}${answerPrefix}Got it. ${question}`;
  }

  if (languageId === "hi") {
    return `${returningPrefix}Perfect, details capture ho gayi hain. ${analysis.summary} Main lead CRM mein save kar rahi hoon aur Google Sheet sync enable kar rahi hoon. Kya aap demo booking karna chahenge?`;
  }
  if (languageId === "hinglish") {
    return `${returningPrefix}Perfect, details capture ho gayi hain. ${analysis.summary} Main lead CRM mein save kar rahi hoon aur Google Sheet sync enable kar rahi hoon. Demo book karna chahoge?`;
  }
  return `${returningPrefix}Perfect, I have the details. ${analysis.summary} I am saving this lead to CRM and enabling Google Sheet sync. Would you like to book a demo next?`;
}

export function getDefaultWidgetSettings(overrides: Partial<WidgetSettings> = {}): WidgetSettings {
  return {
    companyName: process.env.WIDGET_COMPANY_NAME ?? "RDLeadify AI",
    logo: process.env.WIDGET_LOGO_URL ?? "",
    primaryColor: process.env.WIDGET_PRIMARY_COLOR ?? "#10b981",
    greetingMessage:
      process.env.WIDGET_GREETING_MESSAGE ??
      "Hi, I am RDLeadify AI. I can help qualify your requirement and book a demo.",
    agentName: process.env.WIDGET_AGENT_NAME ?? "Riya",
    position: process.env.WIDGET_AGENT_POSITION ?? "AI Sales Consultant",
    businessHours: process.env.WIDGET_BUSINESS_HOURS ?? "Mon-Fri, 9:00 AM - 7:00 PM",
    offlineMessage:
      process.env.WIDGET_OFFLINE_MESSAGE ??
      "We are currently offline, but the AI agent can still collect your details for a fast follow-up.",
    theme: (process.env.WIDGET_THEME as "dark" | "light") ?? "dark",
    language: process.env.WIDGET_LANGUAGE ?? "auto",
    workspaceKey: process.env.WIDGET_WORKSPACE_SLUG,
    ...overrides,
  };
}

export async function resolveWidgetWorkspace(workspaceKey?: string) {
  const key = clean(workspaceKey || process.env.WIDGET_WORKSPACE_SLUG);
  const workspace = key
    ? await prisma.workspace.findFirst({
        where: { OR: [{ slug: key }, { id: key }] },
        select: { id: true, slug: true, name: true },
      })
    : await prisma.workspace.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true, slug: true, name: true },
      });

  if (!workspace) throw new Error("No workspace is available for the website widget.");
  return workspace;
}

export function analyzeWidgetLead(
  messages: WidgetMessage[],
  previous: WidgetLeadInfo = {},
  languagePreference = "auto",
): WidgetAnalysis {
  let leadInfo: WidgetLeadInfo = { ...previous };
  const userMessages = messages.filter((message) => message.role === "user");
  const text = userMessages.map((message) => message.content).join("\n");
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s-]{7,}\d)/);
  const budgetMatch = text.match(/(?:budget\s*(?:is|of|around)?\s*)?((?:rs\.?|inr|\$)?\s?\d[\d,.]*(?:\s?(?:lakh|lac|cr|crore|k|m|million))?)/i);
  const timeMatch = text.match(/(?:\d{1,2}(?::\d{2})?\s?(?:am|pm)|morning|afternoon|evening|today|tomorrow)/i);
  const dateMatch = text.match(/(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i);

  const name = pickAfter(text, ["my name is", "mera naam", "mera name", "main", "mai", "i am", "i'm", "name is", "this is"]);
  const company = pickAfter(text, ["company is", "from company", "from", "at"]);
  const business = pickAfter(text, ["business type is", "business is", "we run", "i run"]);
  const requirement =
    text.match(/(?:mujhe|hume|humko|i need|we need)\s+(.+?)\s+(?:chahiye|chaahiye|needed|required)(?:[,.]|\n|$)/i)?.[1] ||
    pickAfter(text, ["requirement is", "mujhe", "hume", "humko", "need", "looking for", "want", "interested in"]);
  const timeline = pickAfter(text, ["timeline is", "timeline", "by", "within"]);

  if (name) leadInfo.name = name.split(/\s+(?:and|from|with|email|phone)\s+/i)[0];
  if (company) leadInfo.company = company.split(/\s+(?:and|for|with)\s+/i)[0];
  if (business) leadInfo.business = business.split(/\s+(?:and|for|with)\s+/i)[0];
  if (requirement) leadInfo.requirement = requirement;
  if (timeline) leadInfo.timeline = timeline;
  if (emailMatch) leadInfo.email = emailMatch[0];
  if (phoneMatch) leadInfo.phone = phoneMatch[0].trim();
  if (budgetMatch) leadInfo.budget = clean(budgetMatch[1]);
  if (dateMatch) leadInfo.preferredDemoDate = clean(dateMatch[0]);
  if (timeMatch) leadInfo.preferredDemoTime = clean(timeMatch[0]);

  for (const message of userMessages) {
    const content = message.content.trim();
    const explicit = /name|phone|email|company|business|need|requirement|budget|timeline|demo|today|tomorrow|am|pm/i.test(content);
    if (!explicit || content.split(/\s+/).length <= 5) leadInfo = mergeBareAnswer(leadInfo, content);
  }

  const detected = detectLanguage(text, languagePreference);
  const missingFields = requiredFields.filter((field) => !leadInfo[field]);
  let score = 10;
  if (leadInfo.name) score += 8;
  if (leadInfo.phone) score += 10;
  if (leadInfo.email) score += 10;
  if (leadInfo.company) score += 6;
  if (leadInfo.business) score += 10;
  if (leadInfo.requirement) score += 18;
  if (leadInfo.budget) score += 14;
  if (leadInfo.timeline) score += 8;
  if (leadInfo.preferredDemoDate || leadInfo.preferredDemoTime) score += 14;
  if (/urgent|asap|ready|this week|today|tomorrow/i.test(text)) score += 8;
  score = Math.min(score, 100);

  leadInfo.detectedLanguage = detected.name;
  leadInfo.preferredLanguage = detected.name;
  leadInfo.country ||= detected.countries[0] ?? "Not captured";

  const tags = new Set(["Website Lead", "AI Qualified"]);
  const label = scoreLabel(score);
  tags.add(`${label} Lead`);
  if (score >= 70) tags.add("Qualified");
  if (leadInfo.budget) tags.add("Budget Shared");
  if (leadInfo.preferredDemoDate || leadInfo.preferredDemoTime) tags.add("Demo Requested");
  if (/voice|call/i.test(text)) tags.add("Voice Interest");

  const status = score >= 75 && (leadInfo.preferredDemoDate || leadInfo.preferredDemoTime)
    ? "Demo Booked"
    : score >= 70
      ? "Qualified"
      : messages.length > 2
        ? "Contacted"
        : "New";
  const summary = missingFields.length
    ? `Website widget captured ${Object.entries(leadInfo)
        .filter(([, value]) => value)
        .map(([key]) => fieldLabel[key as keyof WidgetLeadInfo])
        .join(", ") || "initial interest"}. Waiting for ${missingFields.map((field) => fieldLabel[field]).join(", ")}.`
    : `${leadInfo.name} from ${leadInfo.company || leadInfo.business} needs ${leadInfo.requirement}, budget ${leadInfo.budget}, timeline ${leadInfo.timeline}, and prefers demo ${leadInfo.preferredDemoDate || ""} ${leadInfo.preferredDemoTime || ""}.`;

  return {
    leadInfo,
    score,
    scoreLabel: label,
    status,
    tags: Array.from(tags),
    summary,
    nextAction: missingFields.length
      ? naturalQuestion(missingFields[0], detected.id)
      : "Lead is qualified. Create CRM lead, sync Google Sheet, and offer demo booking.",
    missingFields,
    languageName: detected.name,
    detectedLanguage: detected.id,
  };
}

export async function runWidgetConversationTurn(input: {
  messages: WidgetMessage[];
  leadInfo?: WidgetLeadInfo;
  language?: string;
  settings: WidgetSettings;
  aiContext?: AiContextBundle;
}): Promise<WidgetConversationTurn> {
  const memory = input.aiContext?.visitorMemory;
  const hydratedLeadInfo: WidgetLeadInfo = {
    ...input.leadInfo,
    name: input.leadInfo?.name ?? memory?.name ?? undefined,
    phone: input.leadInfo?.phone ?? memory?.phone ?? undefined,
    email: input.leadInfo?.email ?? memory?.email ?? undefined,
    business: input.leadInfo?.business ?? memory?.business ?? undefined,
    requirement: input.leadInfo?.requirement ?? memory?.previousRequirements[0] ?? undefined,
    preferredLanguage: input.leadInfo?.preferredLanguage ?? memory?.preferredLanguage ?? undefined,
  };
  const preliminaryAnalysis = analyzeWidgetLead(input.messages, hydratedLeadInfo, input.language || input.settings.language);

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiTurn = await createWidgetAiConversationTurn({
        ...input,
        leadInfo: hydratedLeadInfo,
        capturedFields: preliminaryAnalysis.leadInfo,
        missingFields: preliminaryAnalysis.missingFields,
      });
      const analysis = analyzeWidgetLead(input.messages, aiTurn.leadInfo, input.language || input.settings.language);

      return {
        reply: aiTurn.reply,
        analysis,
        provider: "openai",
      };
    } catch (error) {
      backendLog("widget", "AI conversation failed, using local adaptive fallback", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    reply: localAgentReply(input.messages, preliminaryAnalysis, input.settings, input.aiContext),
    analysis: preliminaryAnalysis,
    provider: "local",
  };
}

function splitName(name?: string) {
  const parts = clean(name || "Website Visitor").split(/\s+/);
  return { firstName: parts[0] || "Website", lastName: parts.slice(1).join(" ") || undefined };
}

function mapStatus(status: WidgetAnalysis["status"]) {
  if (status === "Qualified" || status === "Demo Booked") return LeadStatus.QUALIFIED;
  if (status === "Contacted") return LeadStatus.CONTACTED;
  return LeadStatus.NEW;
}

export async function persistWidgetConversation(input: {
  workspaceId: string;
  conversationId: string;
  visitorId: string;
  messages: WidgetMessage[];
  reply: string;
  analysis: WidgetAnalysis;
  pageUrl?: string;
  referrer?: string;
  forceLead?: boolean;
}) {
  const { workspaceId, conversationId, visitorId, messages, reply, analysis, pageUrl, referrer, forceLead } = input;
  const leadInfo = analysis.leadInfo;
  const shouldCreateLead = Boolean(forceLead || hasQualifiedLead(analysis) || analysis.score >= 55 || leadInfo.email || leadInfo.phone);
  const { firstName, lastName } = splitName(leadInfo.name);
  const widgetLeadId = `widget_${visitorId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || crypto.randomUUID()}`;
  const notes = [
    analysis.summary,
    analysis.nextAction ? `Next action: ${analysis.nextAction}` : null,
    leadInfo.company ? `Company: ${leadInfo.company}` : null,
    leadInfo.business ? `Business type: ${leadInfo.business}` : null,
    leadInfo.requirement ? `Requirement: ${leadInfo.requirement}` : null,
    leadInfo.budget ? `Budget: ${leadInfo.budget}` : null,
    leadInfo.timeline ? `Timeline: ${leadInfo.timeline}` : null,
    leadInfo.preferredDemoDate ? `Preferred demo date: ${leadInfo.preferredDemoDate}` : null,
    leadInfo.preferredDemoTime ? `Preferred demo time: ${leadInfo.preferredDemoTime}` : null,
    pageUrl ? `Page URL: ${pageUrl}` : null,
  ].filter(Boolean).join("\n");
  const duplicateWhere = [
    leadInfo.email ? { email: leadInfo.email } : null,
    leadInfo.phone ? { phone: leadInfo.phone } : null,
  ].filter(Boolean) as Array<{ email: string } | { phone: string }>;
  const existingLead = shouldCreateLead && duplicateWhere.length
    ? await prisma.lead.findFirst({
        where: {
          workspaceId,
          OR: duplicateWhere,
        },
        select: { id: true },
      })
    : null;

  const lead = shouldCreateLead
    ? existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            title: `${leadInfo.name || "Website Visitor"} - Website Widget`,
            firstName,
            lastName,
            email: leadInfo.email,
            phone: leadInfo.phone,
            source: "Website Widget",
            status: mapStatus(analysis.status),
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
          },
          select: { id: true, title: true, score: true, status: true },
        })
      : await prisma.lead.create({
          data: {
            id: widgetLeadId,
            workspaceId,
            title: `${leadInfo.name || "Website Visitor"} - Website Widget`,
            firstName,
            lastName,
            email: leadInfo.email,
            phone: leadInfo.phone,
            source: "Website Widget",
            status: mapStatus(analysis.status),
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
          },
          select: { id: true, title: true, score: true, status: true },
        })
    : null;

  const inbox = await prisma.inboxConversation.upsert({
    where: {
      workspaceId_channel_conversationId: {
        workspaceId,
        channel: InboxChannel.WEBSITE_CHAT,
        conversationId,
      },
    },
    update: {
      leadId: lead?.id,
      customerName: leadInfo.name,
      customerPhone: leadInfo.phone,
      customerEmail: leadInfo.email,
      lastMessage: reply,
      lastMessageType: InboxMessageType.TEXT,
      lastMessageTime: new Date(),
      unreadCount: { increment: 1 },
      language: analysis.languageName,
      leadScore: analysis.score,
      aiSummary: analysis.summary,
      buyingIntent: analysis.scoreLabel,
      sentiment: "Positive",
      recommendedNextAction: analysis.nextAction,
      tags: analysis.tags,
      metadata: toJsonValue({ visitorId, pageUrl, referrer, leadInfo, leadScore: analysis.scoreLabel }),
    },
    create: {
      workspaceId,
      leadId: lead?.id,
      channel: InboxChannel.WEBSITE_CHAT,
      conversationId,
      customerName: leadInfo.name,
      customerPhone: leadInfo.phone,
      customerEmail: leadInfo.email,
      lastMessage: reply,
      lastMessageType: InboxMessageType.TEXT,
      lastMessageTime: new Date(),
      unreadCount: 1,
      language: analysis.languageName,
      leadScore: analysis.score,
      aiSummary: analysis.summary,
      buyingIntent: analysis.scoreLabel,
      sentiment: "Positive",
      recommendedNextAction: analysis.nextAction,
      tags: analysis.tags,
      metadata: toJsonValue({ visitorId, pageUrl, referrer, leadInfo, leadScore: analysis.scoreLabel }),
    },
    select: { id: true },
  });

  const latestUser = [...messages].reverse().find((message) => message.role === "user");
  await prisma.inboxMessage.createMany({
    data: [
      latestUser
        ? {
            conversationId: inbox.id,
            sender: InboxSender.CUSTOMER,
            messageType: InboxMessageType.TEXT,
            text: latestUser.content,
            metadata: toJsonValue({ pageUrl, visitorId }),
          }
        : null,
      {
        conversationId: inbox.id,
        sender: InboxSender.AI,
        messageType: InboxMessageType.TEXT,
        text: reply,
        aiGenerated: true,
        metadata: toJsonValue({ analysis }),
      },
    ].filter(Boolean) as Prisma.InboxMessageCreateManyInput[],
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      leadId: lead?.id,
      action: "WEBSITE_WIDGET_CONVERSATION",
      entityType: "InboxConversation",
      entityId: inbox.id,
      metadata: toJsonValue({
        conversationId,
        visitorId,
        pageUrl,
        referrer,
        leadScore: analysis.score,
        tags: analysis.tags,
        leadInfo,
        duplicatePrevented: Boolean(existingLead),
      }),
    },
  });

  backendLog("widget", "conversation persisted", {
    workspaceId,
    conversationId,
    inboxConversationId: inbox.id,
    leadId: lead?.id,
    duplicatePrevented: Boolean(existingLead),
  });

  const sheetSync = lead ? await autoSyncWidgetLeadToGoogleSheet(workspaceId, lead.id, analysis, conversationId) : null;

  return { lead, inboxConversationId: inbox.id, sheetSync };
}

async function autoSyncWidgetLeadToGoogleSheet(
  workspaceId: string,
  leadId: string,
  analysis: WidgetAnalysis,
  conversationId: string,
) {
  const existing = await prisma.googleSheetSyncLog.findFirst({
    where: {
      workspaceId,
      leadId,
      status: { in: ["SYNC_SUCCESS", "DEMO_SUCCESS"] },
    },
    select: { id: true, status: true },
  });

  if (existing) return { skipped: true, reason: "Already synced", log: existing };

  const integration = await getGoogleIntegration(workspaceId);
  const missingSpreadsheet = missingSheetsEnv();
  const payload = {
    source: "Website Widget",
    lead: leadPayloadForSheet(analysis),
    leadId,
    conversationId,
    requestedAt: new Date().toISOString(),
    automatic: true,
  };
  let response: Record<string, unknown>;
  let status = "DEMO_SUCCESS";
  let mode = "DEMO";

  try {
    if (integration) {
      if (missingSpreadsheet.length) throw new Error("Missing spreadsheet ID.");
      const google = await appendLeadToGoogleSheet(workspaceId, buildSheetRow(analysis));
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
      workspaceId,
      leadId,
      status,
      payload: toJsonValue(payload),
      response: toJsonValue(response),
    },
    select: { id: true, status: true, response: true, createdAt: true },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      leadId,
      action: "WIDGET_AUTO_GOOGLE_SHEET_SYNC",
      entityType: "GoogleSheetSyncLog",
      entityId: log.id,
      metadata: toJsonValue({ source: "Website Widget", conversationId, mode, status }),
    },
  });

  return { skipped: false, mode, log };
}

export async function queueWidgetVoiceFollowUp(input: {
  workspaceId: string;
  leadId?: string;
  conversationId?: string;
  visitorId?: string;
  lead?: Record<string, unknown>;
}) {
  const title = `AI Voice follow-up - ${String(input.lead?.name ?? "Website Lead").slice(0, 80)}`;
  const task = await prisma.task.create({
    data: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      title,
      description: [
        "Voice follow-up queued from Website Widget.",
        input.conversationId ? `Conversation: ${input.conversationId}` : null,
        "Provider adapter ready for Twilio or Exotel.",
      ]
        .filter(Boolean)
        .join("\n"),
      priority: TaskPriority.HIGH,
    },
    select: { id: true, title: true, status: true, priority: true },
  });

  const log = await prisma.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      action: "WIDGET_AI_VOICE_FOLLOW_UP_QUEUED",
      entityType: "Task",
      entityId: task.id,
      metadata: toJsonValue({
        mode: "DEMO",
        providerReady: ["Twilio", "Exotel"],
        source: "Website Widget",
        visitorId: input.visitorId,
        conversationId: input.conversationId,
        lead: input.lead ?? {},
      }),
    },
    select: { id: true, createdAt: true },
  });

  return { task, log };
}

export function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-RDLeadify-Workspace",
    "Cache-Control": "no-store",
  };
}
