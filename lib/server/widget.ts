import { Prisma } from "@/lib/generated/prisma/client";
import {
  InboxChannel,
  InboxMessageType,
  InboxSender,
  LeadStatus,
  TaskPriority,
} from "@/lib/generated/prisma/enums";
import { detectLanguage } from "@/lib/ai/languages";
import { backendLog } from "@/lib/server/dev-log";
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
  status: "New" | "Contacted" | "Qualified" | "Demo Booked";
  tags: string[];
  summary: string;
  nextAction: string;
  missingFields: Array<keyof WidgetLeadInfo>;
  languageName: string;
  detectedLanguage: string;
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
  "company",
  "business",
  "requirement",
  "budget",
  "timeline",
  "preferredDemoDate",
  "preferredDemoTime",
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
    .replace(/^(is|it is|it's)\s+/i, "");
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

  const name = pickAfter(text, ["my name is", "i am", "i'm", "name is", "this is"]);
  const company = pickAfter(text, ["company is", "from company", "from", "at"]);
  const business = pickAfter(text, ["business type is", "business is", "we run", "i run"]);
  const requirement = pickAfter(text, ["requirement is", "need", "looking for", "want", "interested in"]);
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
  if (leadInfo.company) score += 8;
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
  if (score >= 70) tags.add("Qualified");
  if (score >= 85) tags.add("Hot Lead");
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
    status,
    tags: Array.from(tags),
    summary,
    nextAction: missingFields.length
      ? `Please share your ${fieldLabel[missingFields[0]]}.`
      : "Lead is qualified. Create CRM lead, sync Google Sheet, and book calendar appointment.",
    missingFields,
    languageName: detected.name,
    detectedLanguage: detected.id,
  };
}

export async function createWidgetReply(messages: WidgetMessage[], analysis: WidgetAnalysis, settings: WidgetSettings) {
  if (!process.env.OPENAI_API_KEY) {
    return analysis.missingFields.length
      ? `Thanks. ${analysis.nextAction}`
      : `Perfect, I have everything needed. ${analysis.summary} I can send this to CRM and prepare a demo appointment now.`;
  }

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
          content: `You are ${settings.agentName}, ${settings.position} for ${settings.companyName}. Qualify website visitors by collecting name, phone, email, company, business type, requirement, budget, timeline, preferred demo date, and preferred demo time. Reply in ${analysis.languageName}. Keep replies under 80 words. Support markdown when useful.`,
        },
        ...messages,
        {
          role: "system",
          content: `Extracted lead data: ${JSON.stringify(analysis)}. Ask only for the next missing field: ${analysis.nextAction}.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error("OpenAI widget request failed");
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() || `Thanks. ${analysis.nextAction}`;
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
  const shouldCreateLead = Boolean(forceLead || analysis.score >= 55 || leadInfo.email || leadInfo.phone);
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
                create: { workspaceId, name: tag, color: tag === "Hot Lead" ? "#10b981" : "#38bdf8" },
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
                create: { workspaceId, name: tag, color: tag === "Hot Lead" ? "#10b981" : "#38bdf8" },
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
      buyingIntent: analysis.score >= 70 ? "High" : analysis.score >= 45 ? "Medium" : "Low",
      sentiment: "Positive",
      recommendedNextAction: analysis.nextAction,
      tags: analysis.tags,
      metadata: toJsonValue({ visitorId, pageUrl, referrer, leadInfo }),
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
      buyingIntent: analysis.score >= 70 ? "High" : analysis.score >= 45 ? "Medium" : "Low",
      sentiment: "Positive",
      recommendedNextAction: analysis.nextAction,
      tags: analysis.tags,
      metadata: toJsonValue({ visitorId, pageUrl, referrer, leadInfo }),
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

  return { lead, inboxConversationId: inbox.id };
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
