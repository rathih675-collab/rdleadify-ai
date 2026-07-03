"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Database,
  ExternalLink,
  FileQuestion,
  FileText,
  Globe2,
  GraduationCap,
  Headphones,
  HeartPulse,
  Home,
  Library,
  MessageCircle,
  Mic,
  MicOff,
  NotepadText,
  PhoneCall,
  Play,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Square,
  Tags,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AUTO_LANGUAGE_ID,
  detectLanguage,
  getLanguageById,
  questionForField,
  supportedLanguages,
  voiceLanguageOptions,
} from "@/lib/ai/languages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";
type Role = "assistant" | "user";
type RequiredField = "name" | "business" | "requirement" | "budget" | "demoTime";
type SaveState = "idle" | "saving" | "saved" | "error";
type GoogleActionState = "idle" | "syncing" | "booking";
type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "extracted";
type TabId =
  | "agents"
  | "chat"
  | "voice"
  | "playground"
  | "knowledge"
  | "analytics"
  | "intelligence"
  | "booking"
  | "memory"
  | "logs"
  | "settings";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

type LeadInfo = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  business?: string;
  requirement?: string;
  budget?: string;
  demoTime?: string;
  timeline?: string;
  decisionMaker?: string;
  industry?: string;
  country?: string;
  urgency?: string;
  sentiment?: string;
  buyingIntent?: string;
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

type ChatResponse = {
  reply: string;
  analysis: LeadAnalysis;
  provider: "openai" | "local";
  conversationId?: string;
};

type AgentConfig = {
  id: string;
  name: string;
  avatar: string;
  description: string;
  industry: string;
  systemPrompt: string;
  voice: string;
  temperature: number;
  model?: string;
  color?: string;
  goal?: string;
  businessDescription?: string;
  companyInfo?: string;
  tone?: string;
  language?: string;
  defaultLanguage?: string;
  allowedLanguages?: string[];
  fallbackLanguage?: string;
  accent?: string;
  speakingSpeed?: number;
  personality?: string;
  responseStyle?: string;
  status: "Active" | "Inactive";
  icon: LucideIcon;
};

type KnowledgeDocument = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV" | "URL" | "FAQ" | "TEXT";
  status: "Processed" | "Processing" | "Queued";
  lastTrained: string;
};

type DemoLog = {
  id: string;
  createdAt: string;
  action: string;
  entityType: "AIConversation" | "Lead" | "VoiceDemo" | "Appointment";
  entityId: string;
  metadata: Record<string, string | number | boolean>;
};

type MemoryItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

type SavedConversation = {
  id: string;
  channel: "CHAT" | "VOICE";
  messages: unknown;
  summary: string | null;
  leadScore: number;
  status: string;
  createdAt: string;
  userId?: string | null;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const requiredFields: RequiredField[] = ["name", "business", "requirement", "budget", "demoTime"];

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "voice", label: "Voice", icon: Headphones },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "knowledge", label: "Knowledge Base", icon: Library },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const fieldLabels: Record<keyof LeadInfo, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  business: "Business",
  requirement: "Requirement",
  budget: "Budget",
  demoTime: "Demo time",
  timeline: "Timeline",
  decisionMaker: "Decision maker",
  industry: "Industry",
  country: "Country",
  urgency: "Urgency",
  sentiment: "Sentiment",
  buyingIntent: "Buying intent",
  detectedLanguage: "Detected language",
  preferredLanguage: "Preferred language",
  timezone: "Timezone",
};

const questionByField: Record<RequiredField, string> = {
  name: "Step 1: What is your name?",
  business: "Step 2: What type of business do you run?",
  requirement: "Step 3: What do you need help with?",
  budget: "Step 4: What budget range should we plan around?",
  demoTime: "Step 5: What is your preferred demo time?",
};

const voiceLabels = voiceLanguageOptions.map((voice) => voice.label);

const promptTemplates = {
  "Sales Qualification":
    "You are RDLeadify AI. Qualify leads by asking name, business type, requirement, budget, and preferred demo time. Keep replies short and sales-ready.",
  "Appointment Booking":
    "You are an appointment booking agent. Confirm the buyer's need, preferred slot, timezone, and decision-maker availability before booking.",
  "Support Agent":
    "You are a support agent. Resolve common questions, collect issue details, and escalate urgent or billing-sensitive requests to a human.",
  "Real Estate Agent":
    "You are a real estate lead qualifier. Ask location, property type, budget, timeline, and site-visit availability.",
  "Clinic Receptionist":
    "You are a clinic receptionist. Ask patient name, concern, preferred doctor or department, budget or insurance context, and appointment time.",
};

const initialAgents: AgentConfig[] = [
  {
    id: "sales",
    name: "Sales Agent",
    avatar: "SA",
    description: "Qualifies inbound leads, detects buying intent, and recommends next actions.",
    industry: "B2B Sales",
    systemPrompt: promptTemplates["Sales Qualification"],
    voice: "Hinglish",
    temperature: 0.35,
    model: "gpt-4o-mini",
    color: "#34d399",
    goal: "Turn qualified inbound demand into booked demos.",
    businessDescription: "B2B CRM and automation sales motion.",
    companyInfo: "RDLeadify AI helps teams capture, qualify, and convert leads.",
    tone: "Professional",
    language: "English + Hinglish",
    responseStyle: "Concise consultative sales",
    status: "Active",
    icon: Sparkles,
  },
  {
    id: "support",
    name: "Customer Support Agent",
    avatar: "CS",
    description: "Answers FAQs, triages tickets, and routes sensitive cases to humans.",
    industry: "Support",
    systemPrompt: promptTemplates["Support Agent"],
    voice: "Indian English",
    temperature: 0.25,
    model: "gpt-4o-mini",
    color: "#38bdf8",
    goal: "Resolve questions and escalate complex issues.",
    businessDescription: "Customer support and account assistance.",
    companyInfo: "Support team uses RDLeadify CRM context.",
    tone: "Helpful",
    language: "English",
    responseStyle: "Clear and empathetic",
    status: "Active",
    icon: Headphones,
  },
  {
    id: "booking",
    name: "Appointment Booking Agent",
    avatar: "AB",
    description: "Suggests slots, drafts appointments, and prepares confirmations.",
    industry: "Scheduling",
    systemPrompt: promptTemplates["Appointment Booking"],
    voice: "Hindi",
    temperature: 0.3,
    model: "gpt-4o-mini",
    color: "#f59e0b",
    goal: "Book qualified prospects into calendar-ready demo slots.",
    businessDescription: "Scheduling assistant for sales teams.",
    companyInfo: "RDLeadify schedules demos after qualification.",
    tone: "Efficient",
    language: "English + Hindi",
    responseStyle: "Direct confirmation-focused",
    status: "Active",
    icon: CalendarCheck,
  },
  {
    id: "qualification",
    name: "Lead Qualification Agent",
    avatar: "LQ",
    description: "Extracts lead fields, scores priority, and recommends next action.",
    industry: "Lead Qualification",
    systemPrompt: "Qualify the lead by collecting name, phone, email, company, requirement, budget, timeline, decision maker, industry, and country.",
    voice: "Hinglish",
    temperature: 0.3,
    model: "gpt-4o-mini",
    color: "#a78bfa",
    goal: "Produce complete CRM-ready lead intelligence.",
    businessDescription: "Lead scoring and routing for revenue teams.",
    companyInfo: "RDLeadify AI enriches every lead before handoff.",
    tone: "Precise",
    language: "English",
    responseStyle: "Structured qualification",
    status: "Active",
    icon: BrainCircuit,
  },
  {
    id: "general",
    name: "General Assistant",
    avatar: "GA",
    description: "Answers business questions, summarizes records, and assists CRM workflows.",
    industry: "General Business",
    systemPrompt: "Act as a professional business assistant. Answer questions, summarize CRM context, and suggest practical next actions.",
    voice: "Indian English",
    temperature: 0.4,
    model: "gpt-4o-mini",
    color: "#22c55e",
    goal: "Help teams answer questions and operate CRM faster.",
    businessDescription: "General-purpose assistant for business workflows.",
    companyInfo: "RDLeadify AI combines CRM, automation, and assistant workflows.",
    tone: "Professional",
    language: "English",
    responseStyle: "Brief and actionable",
    status: "Active",
    icon: UserRound,
  },
];

const initialDocs: KnowledgeDocument[] = [
  { id: "doc-1", name: "RDLeadify pricing.pdf", type: "PDF", status: "Processed", lastTrained: "Today, 10:20 AM" },
  { id: "doc-2", name: "crm-feature-faq.csv", type: "CSV", status: "Processed", lastTrained: "Today, 10:24 AM" },
  { id: "doc-3", name: "https://rdleadify.ai/features", type: "URL", status: "Processing", lastTrained: "In progress" },
];

const initialAnalysis: LeadAnalysis = {
  leadInfo: {},
  score: 15,
  status: "New",
  tags: ["AI Agent", "Needs Qualification"],
  summary: "Start a guided conversation to qualify the lead.",
  nextAction: questionByField.name,
  missingFields: [...requiredFields],
  priority: "Low",
  detectedLanguage: "en",
  preferredLanguage: "en",
  languageName: "English",
};

const initialMessages: ChatMessage[] = [
  {
    id: "assistant-0",
    role: "assistant",
    content: "Hi, I am RDLeadify AI. I will qualify this lead in five quick steps. Step 1: What is your name?",
  },
];

const demoTranscript =
  "My name is Riya Shah, email riya@skylinerealty.in, phone +91 98765 43210. I run Skyline Realty. We need AI CRM, WhatsApp follow-up, and voice calling for new property leads. Budget is 75000 INR. Tomorrow 4 pm works for a demo. This is urgent because we launch ads this week.";

function splitWords(text: string) {
  return text.replace(/[^\w\s+@.-]/g, " ").split(/\s+/).filter(Boolean);
}

function pickAfter(text: string, markers: string[]) {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const index = lower.indexOf(marker);
    if (index >= 0) {
      return text.slice(index + marker.length).split(/[,.;\n]/)[0].trim().replace(/^is\s+/i, "");
    }
  }

  return "";
}

function cleanValue(value: string) {
  return value.trim().replace(/\s+/g, " ").replace(/^(is|it is|it's)\s+/i, "");
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
  if (business && !info.company) info.company = info.business;
  if (requirement) info.requirement = cleanValue(requirement);
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

  info.industry = detectIndustry(text);
  info.country = detectCountry(text);
  info.urgency = /urgent|asap|today|tomorrow|this week|launch/i.test(text) ? "High" : "Medium";
  info.sentiment = /great|perfect|interested|ready|need|want/i.test(text) ? "Positive" : "Neutral";
  info.buyingIntent = info.budget && info.demoTime ? "High" : info.requirement ? "Medium" : "Low";

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
  if (leadInfo.business) score += 14;
  if (leadInfo.requirement) score += 20;
  if (leadInfo.budget) score += 20;
  if (leadInfo.demoTime) score += 16;
  if (/urgent|asap|this week|today|tomorrow|hot|ready/i.test(transcript)) score += 10;
  score = Math.min(score, 100);

  const tags = new Set(["AI Agent"]);
  if (score >= 80) tags.add("Hot Lead");
  if (score >= 65) tags.add("Qualified");
  if (leadInfo.budget) tags.add("Budget Shared");
  if (leadInfo.demoTime) tags.add("Demo Ready");
  if (leadInfo.industry) tags.add(leadInfo.industry);
  if (/whatsapp/i.test(transcript)) tags.add("WhatsApp Interest");
  if (/voice|call/i.test(transcript)) tags.add("Voice Demo");
  if (/crm|sales|lead|pipeline/i.test(transcript)) tags.add("CRM Fit");

  const priority = score >= 85 || leadInfo.urgency === "High" ? "Urgent" : score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";
  const status =
    leadInfo.demoTime && score >= 70
      ? "Demo Booked"
      : score >= 70
        ? "Qualified"
        : messages.length > 2
          ? "Contacted"
          : "New";
  const summary = missingFields.length
    ? `Captured ${Object.entries(leadInfo)
        .filter(([, value]) => value)
        .map(([key]) => fieldLabels[key as keyof LeadInfo])
        .join(", ") || "initial interest"}. Waiting for ${missingFields.map((field) => fieldLabels[field]).join(", ")}.`
    : `${leadInfo.name} from ${leadInfo.business} needs ${leadInfo.requirement}, has budget ${leadInfo.budget}, and prefers a demo ${leadInfo.demoTime}.`;

  leadInfo.detectedLanguage = detected.name;
  leadInfo.preferredLanguage = detected.name;
  leadInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Not captured";
  if (!leadInfo.country || leadInfo.country === "Not captured") leadInfo.country = detected.countries[0] ?? "Not captured";

  return {
    leadInfo,
    score,
    status,
    tags: Array.from(tags),
    summary,
    nextAction: missingFields.length ? questionForField(missingFields[0], detected.id) : "Create appointment draft and hand this lead to sales.",
    missingFields,
    priority,
    detectedLanguage: detected.id,
    preferredLanguage: languagePreference === AUTO_LANGUAGE_ID ? detected.id : languagePreference,
    languageName: detected.name,
  };
}

function isComplete(analysis: LeadAnalysis) {
  return analysis.missingFields.length === 0;
}

function voiceStatusVariant(status: VoiceStatus): BadgeVariant {
  if (status === "listening" || status === "speaking" || status === "extracted") return "success";
  if (status === "thinking") return "warning";
  return "neutral";
}

function StatCard({ label, value, helper, icon: Icon, variant = "info" }: {
  label: string;
  value: number | string;
  helper: string;
  icon: LucideIcon;
  variant?: BadgeVariant;
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant={variant}>Live</Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{label}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</h2>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function MiniBar({ label, value, color = "bg-emerald-400" }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-16 items-center justify-center gap-1 rounded-xl border border-white/10 bg-black/20">
      {[32, 48, 28, 56, 36, 64, 30, 50, 40, 58, 34, 46].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={cn("w-1.5 rounded-full bg-emerald-300/80", active ? "animate-pulse" : "opacity-40")}
          style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}

function TypingIndicator({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-300">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
      AI is typing
    </div>
  );
}

function PanelField({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function LeadSnapshot({ analysis, onSave, saveState, saveLabel }: {
  analysis: LeadAnalysis;
  onSave: () => void;
  saveState: SaveState;
  saveLabel: string;
}) {
  const ready = isComplete(analysis);
  const fields: Array<keyof LeadInfo> = ["name", "email", "phone", "company", "business", "requirement", "budget", "timeline", "demoTime", "decisionMaker", "industry", "country", "detectedLanguage", "preferredLanguage", "timezone", "urgency", "sentiment", "buyingIntent"];

  return (
    <Card className="min-w-0 border-emerald-500/20 bg-emerald-500/10">
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <CardTitle>Lead Intelligence</CardTitle>
            <CardDescription>Live CRM-ready detection and scoring.</CardDescription>
          </div>
        </div>
        <Badge variant={analysis.priority === "Urgent" || analysis.priority === "High" ? "success" : "warning"}>{analysis.score}/100</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${analysis.score}%` }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field} className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">{fieldLabels[field]}</p>
              <p className="mt-1 min-h-5 break-words text-sm font-medium text-white">
                {analysis.leadInfo[field] || "Not captured"}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={ready ? "success" : "info"}>{analysis.status}</Badge>
            <Badge variant={analysis.priority === "Urgent" ? "danger" : analysis.priority === "High" ? "warning" : "neutral"}>
              {analysis.priority} priority
            </Badge>
            {analysis.tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                <Tags className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{analysis.summary}</p>
          <p className="mt-2 text-sm font-semibold text-emerald-300">{analysis.nextAction}</p>
        </div>
        {ready ? (
          <Button onClick={onSave} disabled={saveState === "saving"} className="w-full">
            <Save className="h-4 w-4" />
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveLabel}
          </Button>
        ) : (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
            Save unlocks after name, business, requirement, budget, and demo time are captured.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AiAgentModule({ initialTab = "agents" }: { initialTab?: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [agents, setAgents] = useState<AgentConfig[]>(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState("sales");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [analysis, setAnalysis] = useState<LeadAnalysis>(initialAnalysis);
  const [provider, setProvider] = useState<"openai" | "local">("local");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [languagePreference, setLanguagePreference] = useState(AUTO_LANGUAGE_ID);
  const [voiceChoice, setVoiceChoice] = useState("Hinglish");
  const [voiceAnalysis, setVoiceAnalysis] = useState<LeadAnalysis>(initialAnalysis);
  const [chatSaveState, setChatSaveState] = useState<SaveState>("idle");
  const [voiceSaveState, setVoiceSaveState] = useState<SaveState>("idle");
  const [googleActionState, setGoogleActionState] = useState<GoogleActionState>("idle");
  const [latestGoogleResult, setLatestGoogleResult] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [lastSavedLeadId, setLastSavedLeadId] = useState<string>();
  const [systemPrompt, setSystemPrompt] = useState(promptTemplates["Sales Qualification"]);
  const [playgroundPrompt, setPlaygroundPrompt] = useState("Qualify a real estate lead asking about CRM and voice calls.");
  const [playgroundResponse, setPlaygroundResponse] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.35);
  const [maxTokens, setMaxTokens] = useState(450);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initialDocs);
  const [demoMode, setDemoMode] = useState(false);
  const [toast, setToast] = useState("");
  const [appointmentDraft, setAppointmentDraft] = useState(false);
  const [appointmentSaved, setAppointmentSaved] = useState(false);
  const [settings, setSettings] = useState({
    language: "Auto Detect",
    defaultLanguage: "English",
    allowedLanguages: "All supported languages",
    fallbackLanguage: "English",
    tone: "Professional",
    creativity: "Balanced",
    responseLength: "Concise",
    voice: "Hinglish",
    accent: "Indian",
    speakingSpeed: "0.94",
    personality: "Consultative sales assistant",
  });
  const [stats, setStats] = useState({
    chats: 0,
    voiceDemos: 0,
    qualifiedLeads: 0,
    savedLeads: 0,
  });
  const [logs, setLogs] = useState<DemoLog[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceTranscriptRef = useRef("");
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [conversationLoadState, setConversationLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [clientTimestamps, setClientTimestamps] = useState<Record<string, string>>({});

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];
  const activeAnalysis = activeTab === "voice" ? voiceAnalysis : analysis;
  const selectedLanguage = getLanguageById(languagePreference === AUTO_LANGUAGE_ID ? activeAnalysis.detectedLanguage : languagePreference);
  const selectedVoice = voiceLanguageOptions.find((voice) => voice.label === voiceChoice) ?? voiceLanguageOptions[2];

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    setLogs((current) =>
      current.length > 0
        ? current
        : [
            {
              id: "log-0",
              createdAt: new Date().toISOString(),
              action: "CONVERSATION_STARTED",
              entityType: "AIConversation",
              entityId: "demo-chat",
              metadata: { channel: "chat", source: "AI Agent" },
            },
          ],
    );
  }, []);

  useEffect(() => {
    const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });

    const nextTimestamps: Record<string, string> = {};

    for (const conversation of savedConversations) {
      nextTimestamps[`conversation-${conversation.id}`] = dateTimeFormatter.format(
        new Date(conversation.createdAt),
      );
    }

    for (const log of logs) {
      nextTimestamps[`log-${log.id}`] = timeFormatter.format(new Date(log.createdAt));
    }

    setClientTimestamps(nextTimestamps);
  }, [logs, savedConversations]);

  const analytics = useMemo(() => {
    const boost = demoMode ? 12 : 0;
    return {
      totalConversations: 1284 + stats.chats + boost,
      qualifiedLeads: 342 + stats.qualifiedLeads + boost,
      avgResponse: "1.4s",
      conversionRate: `${24 + (demoMode ? 6 : 0)}%`,
      appointmentsBooked: 87 + (appointmentSaved ? 1 : 0) + (demoMode ? 8 : 0),
      accuracy: `${91 + (demoMode ? 3 : 0)}%`,
      handoffs: 38,
    };
  }, [appointmentSaved, demoMode, stats.chats, stats.qualifiedLeads]);

  const memoryTimeline: MemoryItem[] = [
    { id: "mem-1", title: "Customer name", detail: activeAnalysis.leadInfo.name || "Waiting to capture", time: "Live" },
    { id: "mem-2", title: "Business", detail: activeAnalysis.leadInfo.business || "Waiting to capture", time: "Live" },
    { id: "mem-3", title: "Previous conversation", detail: messages.length > 1 ? messages[messages.length - 1].content : "No prior context yet", time: "Current session" },
    { id: "mem-4", title: "Preferences", detail: `${settings.language}, ${settings.tone}, ${settings.responseLength}`, time: "Saved setting" },
  ];

  function addLog(action: DemoLog["action"], entityType: DemoLog["entityType"], metadata: DemoLog["metadata"] = {}) {
    setLogs((current) => [
      {
        id: `log-${Date.now()}`,
        createdAt: new Date().toISOString(),
        action,
        entityType,
        entityId: String(metadata.leadId ?? metadata.channel ?? "demo"),
        metadata,
      },
      ...current,
    ]);
  }

  async function loadConversations() {
    setConversationLoadState("loading");
    try {
      const response = await fetch("/api/ai/conversations");
      if (!response.ok) throw new Error("Unable to load conversations");
      const data = (await response.json()) as { conversations?: SavedConversation[] };
      setSavedConversations(data.conversations ?? []);
      setConversationLoadState("idle");
    } catch {
      setConversationLoadState("error");
    }
  }

  async function persistVoiceConversation(transcript: string, nextAnalysis: LeadAnalysis) {
    try {
      const response = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "VOICE",
          messages: [{ role: "user", content: transcript }],
          summary: nextAnalysis.summary,
          leadScore: nextAnalysis.score,
          status: nextAnalysis.status,
        }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { conversation?: SavedConversation };
      if (data.conversation) {
        setSavedConversations((current) => [data.conversation as SavedConversation, ...current]);
        setCurrentConversationId(data.conversation.id);
      }
    } catch {
      // Voice logging is helpful for demos, but should not block the live voice flow.
    }
  }

  async function convertConversation(conversationId: string) {
    setToast("");
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}/convert`, {
        method: "POST",
      });
      const data = (await response.json()) as { lead?: { id?: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not convert conversation.");
      setToast("Conversation converted to lead successfully.");
      setStats((current) => ({ ...current, savedLeads: current.savedLeads + 1 }));
      setSavedConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, status: "CONVERTED_TO_LEAD" }
            : conversation,
        ),
      );
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not convert conversation.");
    }
  }

  function speak(text: string, onDone?: () => void) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onDone?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = selectedVoice.speed;
    utterance.pitch = voiceChoice.includes("Male") ? 0.85 : 1.02;
    utterance.lang = selectedVoice.speechLocale;
    utterance.onend = () => onDone?.();
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage() {
    const content = chatInput.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { id: `user-${Date.now()}`, role: "user" as const, content }];
    const liveAnalysis = analyzeLead(nextMessages, analysis.leadInfo, languagePreference);
    setMessages(nextMessages);
    setAnalysis(liveAnalysis);
    setChatInput("");
    setIsSending(true);
    setChatSaveState("idle");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, leadInfo: liveAnalysis.leadInfo, systemPrompt: selectedAgent.systemPrompt, languagePreference }),
      });
      const data = (await response.json()) as ChatResponse;
      const finalAnalysis = data.analysis ?? liveAnalysis;
      const reply = finalAnalysis.missingFields.length
        ? data.reply
        : "Great, the lead profile is complete. I generated the score, tags, priority, summary, and recommended next action.";

      setMessages([...nextMessages, { id: `assistant-${Date.now()}`, role: "assistant", content: reply }]);
      setAnalysis(finalAnalysis);
      setProvider(data.provider);
      setCurrentConversationId(data.conversationId);
      if (data.conversationId) void loadConversations();
      setStats((current) => ({
        ...current,
        chats: current.chats + 1,
        qualifiedLeads: finalAnalysis.score >= 70 ? current.qualifiedLeads + 1 : current.qualifiedLeads,
      }));
      if (finalAnalysis.score >= 70) addLog("LEAD_QUALIFIED", "Lead", { channel: "chat", score: finalAnalysis.score });
    } catch {
      setMessages([...nextMessages, { id: `assistant-${Date.now()}`, role: "assistant", content: liveAnalysis.nextAction }]);
    } finally {
      setIsSending(false);
    }
  }

  function resetConversation() {
    setMessages(initialMessages);
    setAnalysis(initialAnalysis);
    setChatInput("");
    setChatSaveState("idle");
    addLog("CONVERSATION_STARTED", "AIConversation", { channel: "chat", reset: true });
  }

  function processVoiceTranscript(transcript: string) {
    setVoiceStatus("thinking");
    const nextAnalysis = analyzeLead([{ id: "voice-user", role: "user", content: transcript }], {}, languagePreference === AUTO_LANGUAGE_ID ? selectedVoice.languageId : languagePreference);
    const reply = nextAnalysis.missingFields.length
      ? `I captured the transcript and extracted the profile. ${nextAnalysis.nextAction}`
      : `Lead extracted. ${nextAnalysis.summary} Priority is ${nextAnalysis.priority}.`;

    window.setTimeout(() => {
      setVoiceAnalysis(nextAnalysis);
      setVoiceReply(reply);
      void persistVoiceConversation(transcript, nextAnalysis);
      setVoiceStatus("speaking");
      speak(reply, () => {
        setVoiceStatus("extracted");
        addLog("VOICE_DEMO_COMPLETED", "VoiceDemo", { channel: "voice", score: nextAnalysis.score, leadExtracted: isComplete(nextAnalysis) });
      });
    }, 350);
  }

  function startVoiceDemo() {
    setActiveTab("voice");
    setVoiceSaveState("idle");
    setVoiceTranscript("");
    setVoiceReply("");
    voiceTranscriptRef.current = "";
    setVoiceStatus("listening");
    setStats((current) => ({ ...current, voiceDemos: current.voiceDemos + 1 }));
    addLog("CONVERSATION_STARTED", "VoiceDemo", { channel: "voice", voice: voiceChoice });
    speak(`${selectedLanguage.greeting}. ${questionForField("name", selectedLanguage.id)}`);

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition || demoMode) {
      setVoiceTranscript(demoTranscript);
      voiceTranscriptRef.current = demoTranscript;
      processVoiceTranscript(demoTranscript);
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedVoice.speechLocale;
    recognition.onresult = (event) => {
      let transcript = voiceTranscriptRef.current;
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript = `${transcript} ${event.results[index][0].transcript}`.trim();
      }
      voiceTranscriptRef.current = transcript;
      setVoiceTranscript(transcript);
    };
    recognition.onend = () => {
      const transcript = voiceTranscriptRef.current.trim();
      if (transcript) processVoiceTranscript(transcript);
      else setVoiceStatus("idle");
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoiceDemo() {
    recognitionRef.current?.stop();
    const transcript = voiceTranscriptRef.current.trim() || voiceTranscript.trim();
    if (transcript) processVoiceTranscript(transcript);
    else setVoiceStatus("idle");
  }

  function runDemoMode() {
    setDemoMode((current) => !current);
    const demoMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: demoTranscript };
    const demoAnalysis = analyzeLead([demoMessage], {}, languagePreference);
    setMessages([initialMessages[0], demoMessage, { id: `assistant-${Date.now()}`, role: "assistant", content: "Demo lead generated with realistic chat, buying intent, and appointment readiness." }]);
    setAnalysis(demoAnalysis);
    setVoiceTranscript(demoTranscript);
    setVoiceReply(`Demo voice call completed. ${demoAnalysis.summary}`);
    setVoiceAnalysis(demoAnalysis);
    setStats((current) => ({
      ...current,
      chats: current.chats + 1,
      voiceDemos: current.voiceDemos + 1,
      qualifiedLeads: current.qualifiedLeads + 1,
    }));
    addLog("LEAD_QUALIFIED", "Lead", { channel: "demo", score: demoAnalysis.score, autoGenerated: true });
  }

  async function saveLead(source: "chat" | "voice") {
    const targetAnalysis = source === "voice" ? voiceAnalysis : analysis;
    const setState = source === "voice" ? setVoiceSaveState : setChatSaveState;
    setState("saving");
    setToast("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...targetAnalysis, conversationId: currentConversationId }),
      });
      const data = (await response.json()) as { lead?: { id?: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      setState("saved");
      setLastSavedLeadId(data.lead?.id);
      setToast("Lead saved successfully in CRM.");
      setStats((current) => ({ ...current, savedLeads: current.savedLeads + 1 }));
      addLog("LEAD_SAVED", "Lead", { channel: source, leadId: data.lead?.id ?? "crm-lead", score: targetAnalysis.score });
    } catch (error) {
      setState("error");
      setToast(error instanceof Error ? error.message : "Could not save the lead.");
    }
  }

  async function sendToGoogleSheet(source: "chat" | "voice" = activeTab === "voice" ? "voice" : "chat") {
    const targetAnalysis = source === "voice" ? voiceAnalysis : analysis;
    const info = targetAnalysis.leadInfo;
    setToast("");
    setLatestGoogleResult("");

    if (!info.name && !info.phone && !info.email && !info.requirement) {
      setToast("Missing extracted lead data. Qualify a lead before sending to Google Sheets.");
      return;
    }

    try {
      setGoogleActionState("syncing");
      const response = await fetch("/api/integrations/google/sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lastSavedLeadId,
          source: "AI Agent",
          lead: {
            name: info.name,
            phone: info.phone,
            email: info.email,
            business: info.business,
            requirement: info.requirement,
            budget: info.budget,
            leadScore: targetAnalysis.score,
            tags: targetAnalysis.tags,
            source: "AI Agent",
            aiSummary: targetAnalysis.summary,
            status: targetAnalysis.status,
          },
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string; demoMode?: boolean; log?: { id?: string; status?: string } };
      if (!response.ok) throw new Error(data.error ?? "Google Sheet sync failed.");
      const message = `${data.message ?? "Demo sync completed"}${data.demoMode ? " Demo Mode." : ""}`;
      setToast(message);
      setLatestGoogleResult(`Sheet: ${data.log?.status ?? "SUCCESS"} (${data.log?.id ?? "log saved"})`);
      addLog("GOOGLE_SHEET_SYNC", "Lead", { channel: source, leadId: lastSavedLeadId ?? "unsaved-lead", demoMode: Boolean(data.demoMode) });
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Google Sheet sync failed.");
    } finally {
      setGoogleActionState("idle");
    }
  }

  async function bookGoogleDemo(source: "chat" | "voice" = activeTab === "voice" ? "voice" : "chat") {
    const targetAnalysis = source === "voice" ? voiceAnalysis : analysis;
    const info = targetAnalysis.leadInfo;
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    setToast("");
    setLatestGoogleResult("");

    if (!info.name && !info.email && !info.phone) {
      setToast("Missing extracted lead data. Capture name plus email or phone before booking a Google Calendar demo.");
      return;
    }
    if (!info.email && !info.phone) {
      setToast("Missing attendee info. Capture lead email or phone before booking a Google Calendar demo.");
      return;
    }

    try {
      setGoogleActionState("booking");
      const response = await fetch("/api/integrations/google/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lastSavedLeadId,
          title: `Demo with ${info.name || "AI qualified lead"}`,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          attendeeEmail: info.email,
          attendeePhone: info.phone,
          requirement: info.requirement,
          description: [
            `Requirement: ${info.requirement || "Not captured"}`,
            `Preferred demo time: ${info.demoTime || "Generated default slot"}`,
            `Phone: ${info.phone || "Not captured"}`,
            `Email: ${info.email || "Not captured"}`,
            `AI summary: ${targetAnalysis.summary}`,
          ].join("\n"),
          lead: info,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string; demoMode?: boolean; log?: { id?: string; status?: string; title?: string } };
      if (!response.ok) throw new Error(data.error ?? "Calendar booking failed.");
      const message = `${data.message ?? "Demo calendar booking completed"}${data.demoMode ? " Demo Mode." : ""}`;
      setToast(message);
      setLatestGoogleResult(`Calendar: ${data.log?.status ?? "BOOKED"} (${data.log?.title ?? "Demo appointment"})`);
      addLog("GOOGLE_CALENDAR_BOOKING", "Appointment", { channel: source, leadId: lastSavedLeadId ?? "unsaved-lead", demoMode: Boolean(data.demoMode) });
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Calendar booking failed.");
    } finally {
      setGoogleActionState("idle");
    }
  }

  function testPlaygroundPrompt() {
    setPlaygroundResponse(
      `Model ${model} responded with temperature ${temperature}: I would qualify the lead, detect industry and buying intent, suggest a demo slot, and update memory ${memoryEnabled ? "with" : "without"} conversation context.`,
    );
  }

  function savePromptTemplate() {
    setToast("Prompt template saved for this demo session.");
  }

  function addDocument(type: KnowledgeDocument["type"]) {
    setDocuments((current) => [
      {
        id: `doc-${Date.now()}`,
        name: type === "URL" ? "https://example.com/product-page" : type === "FAQ" ? "New FAQ entry" : type === "TEXT" ? "Manual sales notes" : `Uploaded ${type} document`,
        type,
        status: "Queued",
        lastTrained: "Pending",
      },
      ...current,
    ]);
  }

  async function saveAppointment() {
    setAppointmentDraft(true);
    setToast("");
    try {
      const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `AI demo with ${activeAnalysis.leadInfo.name || "qualified lead"}`,
          description: activeAnalysis.summary,
          startsAt: startsAt.toISOString(),
        }),
      });
      const data = (await response.json()) as { appointment?: { id?: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save appointment.");
      setAppointmentSaved(true);
      addLog("APPOINTMENT_DRAFT_CREATED", "Appointment", { appointmentId: data.appointment?.id ?? "appointment", source: "AI Agent" });
      setToast("Appointment saved to database.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not save appointment.");
    }
  }

  async function runCrmAction(action: "CREATE_TASK" | "CREATE_NOTE" | "UPDATE_LEAD") {
    setToast("");
    try {
      const response = await fetch("/api/ai/crm-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title:
            action === "CREATE_TASK"
              ? "Follow up AI qualified lead"
              : action === "CREATE_NOTE"
                ? "AI lead qualification note"
                : "AI lead update",
          description: `${activeAnalysis.summary}\nNext action: ${activeAnalysis.nextAction}`,
          metadata: {
            source: "AI Agent",
            score: activeAnalysis.score,
            priority: activeAnalysis.priority,
          },
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "CRM action failed.");
      setToast(
        action === "CREATE_TASK"
          ? "CRM task created."
          : action === "CREATE_NOTE"
            ? "CRM note activity created."
            : "Lead update activity created.",
      );
      addLog(action, "Lead", { source: "AI Agent", score: activeAnalysis.score });
    } catch (error) {
      setToast(error instanceof Error ? error.message : "CRM action failed.");
    }
  }

  function updateAgent(agentId: string, updates: Partial<AgentConfig>) {
    setAgents((current) => current.map((agent) => agent.id === agentId ? { ...agent, ...updates } : agent));
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Topbar eyebrow="AI Operations" title="AI Agent" />
        <section className="max-w-full space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Production demo ready</Badge>
                <Badge variant="info">AI online</Badge>
                <Badge variant="success">{selectedLanguage.name}</Badge>
                <Badge variant="neutral">Detected: {activeAnalysis.languageName}</Badge>
                <Badge variant="warning">WhatsApp Beta</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                RDLeadify AI Business Assistant
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Multi-agent chat, voice, knowledge, analytics, lead intelligence,
                appointment drafting, memory, and demo mode in one premium assistant.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="min-w-56">
                <span className="sr-only">Language</span>
                <select
                  value={languagePreference}
                  onChange={(event) => setLanguagePreference(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm font-semibold text-white outline-none focus:border-emerald-400/60"
                >
                  <option value={AUTO_LANGUAGE_ID}>Auto Detect</option>
                  {supportedLanguages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name} - {language.nativeName}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant={demoMode ? "default" : "outline"} onClick={runDemoMode}>
                <Sparkles className="h-4 w-4" />
                Demo Mode {demoMode ? "On" : "Off"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/leads"><ExternalLink className="h-4 w-4" />View Saved Leads</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard"><Database className="h-4 w-4" />Open Dashboard</Link>
              </Button>
            </div>
          </div>

          {toast ? (
            <div className={cn("rounded-xl border p-3 text-sm", toast.includes("success") || toast.includes("saved") ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-rose-400/25 bg-rose-400/10 text-rose-200")}>
              {toast}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <StatCard label="Total Conversations" value={analytics.totalConversations} helper="Chat, voice, and demo sessions" icon={MessageCircle} variant="success" />
            <StatCard label="Qualified Leads" value={analytics.qualifiedLeads} helper="AI-scored opportunities" icon={CheckCircle2} variant="success" />
            <StatCard label="Avg Response Time" value={analytics.avgResponse} helper="Estimated AI latency" icon={Activity} variant="info" />
            <StatCard label="Conversion Rate" value={analytics.conversionRate} helper="Demo-ready revenue signal" icon={BarChart3} variant="warning" />
            <StatCard label="Languages Used" value={supportedLanguages.length} helper="Unlimited-language architecture" icon={Globe2} variant="info" />
            <StatCard label="Top Language" value={activeAnalysis.languageName} helper="Auto-detected from latest conversation" icon={MessageCircle} variant="success" />
            <StatCard label="Country" value={activeAnalysis.leadInfo.country || selectedLanguage.countries[0] || "Global"} helper="Saved to CRM lead profile" icon={Database} variant="neutral" />
            <StatCard label="Voice Locale" value={selectedVoice.speechLocale} helper={`${selectedVoice.accent} accent, speed ${selectedVoice.speed}`} icon={Headphones} variant="warning" />
          </div>

          <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn("inline-flex h-10 min-w-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-400 transition", activeTab === tab.id ? "bg-emerald-500 text-slate-950" : "hover:bg-white/10 hover:text-white")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "agents" ? (
            <div className="grid gap-6 xl:grid-cols-12">
              <Card className="min-w-0 xl:col-span-8">
                <CardHeader>
                  <div>
                    <CardTitle>Multi-Agent System</CardTitle>
                    <CardDescription>Business assistants configured by industry, prompt, voice, and status.</CardDescription>
                  </div>
                  <Badge variant="success">{agents.filter((agent) => agent.status === "Active").length} Active</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {agents.map((agent) => {
                    const Icon = agent.icon;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setSystemPrompt(agent.systemPrompt);
                          setVoiceChoice(agent.voice);
                        }}
                        className={cn("min-w-0 rounded-xl border p-4 text-left transition", selectedAgentId === agent.id ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-black/20 hover:border-white/20")}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white" style={{ backgroundColor: agent.color ?? "#334155" }}>{agent.avatar}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Icon className="h-4 w-4 text-emerald-300" />
                              <p className="font-semibold text-white">{agent.name}</p>
                              <Badge variant={agent.status === "Active" ? "success" : "neutral"}>{agent.status}</Badge>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{agent.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="info">{agent.industry}</Badge>
                              <Badge variant="neutral">{agent.model ?? "gpt-4o-mini"}</Badge>
                              <Badge variant="neutral">{agent.voice}</Badge>
                              <Badge variant="neutral">Temp {agent.temperature}</Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
              <Card className="min-w-0 xl:col-span-4">
                <CardHeader>
                  <CardTitle>Visual Agent Builder</CardTitle>
                  <CardDescription>Edit the selected assistant goal, context, voice, tone, and behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="grid gap-2 text-sm text-slate-300">Agent Name<input value={selectedAgent.name} onChange={(event) => updateAgent(selectedAgent.id, { name: event.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                  <label className="grid gap-2 text-sm text-slate-300">Agent Goal<input value={selectedAgent.goal ?? ""} onChange={(event) => updateAgent(selectedAgent.id, { goal: event.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                  <label className="grid gap-2 text-sm text-slate-300">Business Description<textarea value={selectedAgent.businessDescription ?? ""} onChange={(event) => updateAgent(selectedAgent.id, { businessDescription: event.target.value })} className="min-h-20 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none" /></label>
                  <label className="grid gap-2 text-sm text-slate-300">Company Information<textarea value={selectedAgent.companyInfo ?? ""} onChange={(event) => updateAgent(selectedAgent.id, { companyInfo: event.target.value })} className="min-h-20 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none" /></label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-2 text-sm text-slate-300">Tone<input value={selectedAgent.tone ?? ""} onChange={(event) => updateAgent(selectedAgent.id, { tone: event.target.value })} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                    <label className="grid gap-2 text-sm text-slate-300">Default Language<select value={selectedAgent.defaultLanguage ?? "en"} onChange={(event) => updateAgent(selectedAgent.id, { defaultLanguage: event.target.value, language: getLanguageById(event.target.value).name })} className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none">{supportedLanguages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label>
                    <label className="grid gap-2 text-sm text-slate-300">Fallback Language<select value={selectedAgent.fallbackLanguage ?? "en"} onChange={(event) => updateAgent(selectedAgent.id, { fallbackLanguage: event.target.value })} className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none">{supportedLanguages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label>
                    <label className="grid gap-2 text-sm text-slate-300">Voice<select value={selectedAgent.voice} onChange={(event) => updateAgent(selectedAgent.id, { voice: event.target.value })} className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none">{voiceLanguageOptions.map((voice) => <option key={voice.id}>{voice.label}</option>)}</select></label>
                    <label className="grid gap-2 text-sm text-slate-300">Accent<input value={selectedAgent.accent ?? "Auto"} onChange={(event) => updateAgent(selectedAgent.id, { accent: event.target.value })} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                    <label className="grid gap-2 text-sm text-slate-300">Speaking Speed<input type="number" min="0.5" max="1.5" step="0.05" value={selectedAgent.speakingSpeed ?? 0.95} onChange={(event) => updateAgent(selectedAgent.id, { speakingSpeed: Number(event.target.value) })} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                    <label className="grid gap-2 text-sm text-slate-300">Allowed Languages<input value={(selectedAgent.allowedLanguages ?? ["All supported languages"]).join(", ")} onChange={(event) => updateAgent(selectedAgent.id, { allowedLanguages: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                  </div>
                  <label className="grid gap-2 text-sm text-slate-300">Personality<input value={selectedAgent.personality ?? ""} onChange={(event) => updateAgent(selectedAgent.id, { personality: event.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                  <label className="grid gap-2 text-sm text-slate-300">Response Style<input value={selectedAgent.responseStyle ?? ""} onChange={(event) => updateAgent(selectedAgent.id, { responseStyle: event.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none" /></label>
                  <label className="grid gap-2 text-sm text-slate-300">System Prompt<textarea value={selectedAgent.systemPrompt} onChange={(event) => updateAgent(selectedAgent.id, { systemPrompt: event.target.value })} className="min-h-36 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none" /></label>
                  <select value={selectedAgent.status} onChange={(event) => updateAgent(selectedAgent.id, { status: event.target.value as AgentConfig["status"] })} className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <label className="grid gap-2 text-sm text-slate-300">
                    Temperature {selectedAgent.temperature}
                    <input type="range" min="0" max="1" step="0.05" value={selectedAgent.temperature} onChange={(event) => updateAgent(selectedAgent.id, { temperature: Number(event.target.value) })} />
                  </label>
                  <Button onClick={() => setToast(`${selectedAgent.name} test passed. Prompt, goal, tone, and language are ready for chat testing.`)}>
                    <WandSparkles className="h-4 w-4" />
                    Test Agent
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeTab === "chat" ? (
            <div className="grid gap-6 xl:grid-cols-12">
              <Card className="min-w-0 xl:col-span-8">
                <CardHeader>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Bot className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <CardTitle>AI Chat Agent</CardTitle>
                      <CardDescription>Guided lead qualification with streaming-style replies and typing state.</CardDescription>
                    </div>
                  </div>
                  <Badge variant={provider === "openai" ? "success" : "neutral"}>{provider === "openai" ? "OpenAI" : "Local fallback"}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-5">
                    {requiredFields.map((field, index) => (
                      <div key={field} className={cn("rounded-xl border p-3 text-xs", analysis.leadInfo[field] ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : analysis.missingFields[0] === field ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-black/20 text-slate-400")}>
                        <p className="font-semibold">Step {index + 1}</p>
                        <p className="mt-1">{fieldLabels[field]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-[420px] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[88%] break-words rounded-2xl px-4 py-3 text-sm leading-6", message.role === "user" ? "bg-emerald-500 text-slate-950" : "border border-white/10 bg-white/10 text-slate-100")}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                      <TypingIndicator show={isSending} />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} placeholder={analysis.missingFields.length ? analysis.nextAction : "Lead profile complete. Save or reset."} className="h-11 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60" />
                    <Button onClick={() => void sendMessage()} disabled={isSending}><Send className="h-4 w-4" />Send</Button>
                    <Button variant="outline" onClick={resetConversation}><RefreshCw className="h-4 w-4" />Reset</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="min-w-0 xl:col-span-4">
                <LeadSnapshot analysis={analysis} onSave={() => void saveLead("chat")} saveState={chatSaveState} saveLabel="Save Lead" />
                <Card className="mt-6 min-w-0">
                  <CardHeader>
                    <CardTitle>CRM Integration</CardTitle>
                    <CardDescription>Create follow-up work from the current AI qualification.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Button variant="outline" onClick={() => void runCrmAction("CREATE_TASK")}>
                      <Plus className="h-4 w-4" />
                      Create Task
                    </Button>
                    <Button variant="outline" onClick={() => void runCrmAction("CREATE_NOTE")}>
                      <NotepadText className="h-4 w-4" />
                      Create Note
                    </Button>
                    <Button variant="outline" onClick={() => void runCrmAction("UPDATE_LEAD")}>
                      <Activity className="h-4 w-4" />
                      Create Lead Update
                    </Button>
                    <Button onClick={saveAppointment}>
                      <CalendarCheck className="h-4 w-4" />
                      Create Appointment
                    </Button>
                    <Button variant="outline" onClick={() => void sendToGoogleSheet("chat")} disabled={googleActionState !== "idle"}>
                      <Database className="h-4 w-4" />
                      {googleActionState === "syncing" ? "Syncing..." : "Send to Google Sheet"}
                    </Button>
                    <Button variant="outline" onClick={() => void bookGoogleDemo("chat")} disabled={googleActionState !== "idle"}>
                      <CalendarCheck className="h-4 w-4" />
                      {googleActionState === "booking" ? "Booking..." : "Book Demo Appointment"}
                    </Button>
                    {latestGoogleResult ? (
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                        Latest Google result: {latestGoogleResult}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          {activeTab === "voice" ? (
            <div className="grid gap-6 xl:grid-cols-12">
              <Card className="min-w-0 xl:col-span-8">
                <CardHeader>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300"><Headphones className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <CardTitle>AI Voice Agent</CardTitle>
                      <CardDescription>Listen, transcribe, reply, speak, extract, and save.</CardDescription>
                    </div>
                  </div>
                  <Badge variant={voiceStatusVariant(voiceStatus)}>{voiceStatus === "idle" ? "Ready" : voiceStatus}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(["listening", "thinking", "speaking", "extracted"] as VoiceStatus[]).map((status) => (
                      <Badge key={status} variant={voiceStatus === status ? voiceStatusVariant(status) : "neutral"}>
                        {status === "listening" ? "Listening" : status === "thinking" ? "Thinking" : status === "speaking" ? "Speaking" : "Lead Extracted"}
                      </Badge>
                    ))}
                  </div>
                  <Waveform active={voiceStatus === "listening" || voiceStatus === "speaking"} />
                  <div className="grid gap-3 md:grid-cols-4">
                    {voiceLabels.map((label) => (
                      <button key={label} onClick={() => setVoiceChoice(label)} className={cn("rounded-xl border px-3 py-3 text-sm font-semibold transition", voiceChoice === label ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100" : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20")}>{label}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={startVoiceDemo}><Play className="h-4 w-4" />Start Voice Demo</Button>
                    <Button variant="outline" onClick={stopVoiceDemo}><Square className="h-4 w-4" />Stop</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">{voiceStatus === "listening" ? <Mic className="h-4 w-4 text-emerald-300" /> : <MicOff className="h-4 w-4 text-slate-500" />} Live transcript</div>
                      <p className="min-h-44 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{voiceTranscript || "Start voice demo. Demo Mode uses a realistic fallback transcript."}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <p className="text-sm font-semibold text-white">AI reply transcript</p>
                      <p className="mt-3 min-h-44 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{voiceReply || "The AI reply appears here after transcription."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="min-w-0 xl:col-span-4">
                <LeadSnapshot analysis={voiceAnalysis} onSave={() => void saveLead("voice")} saveState={voiceSaveState} saveLabel="Save Voice Lead" />
                <Card className="mt-6 min-w-0">
                  <CardHeader>
                    <CardTitle>Google Actions</CardTitle>
                    <CardDescription>Push the voice-qualified lead into demo Google integrations.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Button variant="outline" onClick={() => void sendToGoogleSheet("voice")} disabled={googleActionState !== "idle"}>
                      <Database className="h-4 w-4" />
                      {googleActionState === "syncing" ? "Syncing..." : "Send to Google Sheet"}
                    </Button>
                    <Button onClick={() => void bookGoogleDemo("voice")} disabled={googleActionState !== "idle"}>
                      <CalendarCheck className="h-4 w-4" />
                      {googleActionState === "booking" ? "Booking..." : "Book Demo Appointment"}
                    </Button>
                    {latestGoogleResult ? (
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                        Latest Google result: {latestGoogleResult}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          {activeTab === "playground" ? (
            <Card className="min-w-0">
              <CardHeader>
                <div>
                  <CardTitle>AI Playground</CardTitle>
                  <CardDescription>Test prompts, models, temperature, max tokens, memory, and reusable templates.</CardDescription>
                </div>
                <Button variant="outline" asChild><Link href="/ai-playground"><ExternalLink className="h-4 w-4" />Open Page</Link></Button>
              </CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-4">
                  <select value={model} onChange={(event) => setModel(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none">
                    <option>gpt-4o-mini</option>
                    <option>gpt-4.1-mini</option>
                    <option>local-fallback</option>
                  </select>
                  <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} className="min-h-36 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none" />
                  <textarea value={playgroundPrompt} onChange={(event) => setPlaygroundPrompt(event.target.value)} className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-slate-300">Temperature {temperature}<input type="range" min="0" max="1" step="0.05" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="w-full" /></label>
                    <label className="text-sm text-slate-300">Max tokens<input type="number" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white" /></label>
                  </div>
                  <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={memoryEnabled} onChange={(event) => setMemoryEnabled(event.target.checked)} /> Conversation memory</label>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={testPlaygroundPrompt}><Play className="h-4 w-4" />Test Prompt</Button>
                    <Button variant="outline" onClick={savePromptTemplate}><Save className="h-4 w-4" />Save Prompt Template</Button>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <p className="text-sm font-semibold text-white">Test response</p>
                  <p className="mt-4 min-h-80 whitespace-pre-wrap text-sm leading-6 text-slate-300">{playgroundResponse || "Run a prompt test to preview assistant behavior."}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === "knowledge" ? (
            <div className="grid gap-6 xl:grid-cols-12">
              <Card className="min-w-0 xl:col-span-5">
                <CardHeader>
                  <div><CardTitle>Knowledge Base</CardTitle><CardDescription>Upload documents, URLs, FAQs, and manual text.</CardDescription></div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="warning">Training pipeline placeholder</Badge>
                    <Badge variant="info">Answers in customer language</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {(["PDF", "DOCX", "TXT", "CSV", "URL", "FAQ", "TEXT"] as KnowledgeDocument["type"][]).map((type) => (
                    <Button key={type} variant="outline" onClick={() => addDocument(type)}><Upload className="h-4 w-4" />Add {type}</Button>
                  ))}
                </CardContent>
              </Card>
              <Card className="min-w-0 xl:col-span-7">
                <CardHeader><CardTitle>Document List</CardTitle><CardDescription>Processing status, last trained time, and delete controls.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-white">{doc.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{doc.type} - Last trained: {doc.lastTrained}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === "Processed" ? "success" : doc.status === "Processing" ? "warning" : "neutral"}>{doc.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => setDocuments((current) => current.filter((item) => item.id !== doc.id))} aria-label={`Delete ${doc.name}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeTab === "analytics" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
                <StatCard label="Total Conversations" value={analytics.totalConversations} helper="All channels" icon={MessageCircle} />
                <StatCard label="Qualified Leads" value={analytics.qualifiedLeads} helper="AI qualified" icon={CheckCircle2} variant="success" />
                <StatCard label="Appointments Booked" value={analytics.appointmentsBooked} helper="Saved or drafted" icon={CalendarCheck} variant="success" />
                <StatCard label="Avg Response Time" value={analytics.avgResponse} helper="Estimated" icon={Activity} />
                <StatCard label="Conversion Rate" value={analytics.conversionRate} helper="Lead to demo" icon={BarChart3} />
                <StatCard label="Languages Used" value={supportedLanguages.length} helper="Global language catalog" icon={Globe2} variant="info" />
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                <Card><CardHeader><CardTitle>Daily Conversations</CardTitle></CardHeader><CardContent className="space-y-4"><MiniBar label="Mon" value={54} /><MiniBar label="Tue" value={68} /><MiniBar label="Wed" value={76} /><MiniBar label="Thu" value={88} /><MiniBar label="Fri" value={72} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Lead Qualification Trend</CardTitle></CardHeader><CardContent className="space-y-4"><MiniBar label="New" value={46} color="bg-sky-400" /><MiniBar label="Qualified" value={74} /><MiniBar label="Demo Booked" value={58} color="bg-amber-400" /></CardContent></Card>
                <Card><CardHeader><CardTitle>Agent Usage</CardTitle></CardHeader><CardContent className="space-y-4"><MiniBar label="Sales" value={82} /><MiniBar label="Support" value={48} color="bg-sky-400" /><MiniBar label="Receptionist" value={36} color="bg-amber-400" /></CardContent></Card>
                <Card><CardHeader><CardTitle>Voice vs Chat</CardTitle></CardHeader><CardContent className="space-y-4"><MiniBar label="Chat" value={64} /><MiniBar label="Voice" value={36} color="bg-sky-400" /></CardContent></Card>
                <Card><CardHeader><CardTitle>Languages Used</CardTitle></CardHeader><CardContent className="space-y-4"><MiniBar label="English" value={62} /><MiniBar label="Hindi/Hinglish" value={48} color="bg-sky-400" /><MiniBar label="Spanish" value={31} color="bg-amber-400" /><MiniBar label="Arabic" value={22} color="bg-rose-400" /></CardContent></Card>
                <Card><CardHeader><CardTitle>Countries</CardTitle></CardHeader><CardContent className="space-y-4"><MiniBar label="India" value={71} /><MiniBar label="United States" value={44} color="bg-sky-400" /><MiniBar label="UAE" value={29} color="bg-amber-400" /><MiniBar label="Spain" value={18} color="bg-rose-400" /></CardContent></Card>
              </div>
            </div>
          ) : null}

          {activeTab === "intelligence" ? (
            <div className="grid gap-6 xl:grid-cols-12">
              <div className="xl:col-span-5"><LeadSnapshot analysis={activeAnalysis} onSave={() => void saveLead("chat")} saveState={chatSaveState} saveLabel="Save Lead" /></div>
              <Card className="min-w-0 xl:col-span-7">
                <CardHeader><CardTitle>Recommended Next Action</CardTitle><CardDescription>Lead score, priority, intent, and AI summary.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <PanelField title="Priority" description={`${activeAnalysis.priority} priority based on score, urgency, budget, and demo intent.`} icon={Activity} />
                  <PanelField title="Buying Intent" description={activeAnalysis.leadInfo.buyingIntent || "Waiting for requirement, budget, and demo timing."} icon={BrainCircuit} />
                  <PanelField title="AI Summary" description={activeAnalysis.summary} icon={FileText} />
                  <PanelField title="Next Action" description={activeAnalysis.nextAction} icon={Sparkles} />
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeTab === "booking" ? (
            <Card className="min-w-0">
              <CardHeader><CardTitle>Appointment Booking</CardTitle><CardDescription>AI suggests slots, creates a draft, and shows confirmation. Calendar integration remains placeholder.</CardDescription></CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-3">
                {["Today 4:30 PM", "Tomorrow 11:00 AM", "Tomorrow 4:00 PM"].map((slot) => (
                  <div key={slot} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">{slot}</p>
                    <p className="mt-2 text-sm text-slate-400">Suggested from lead preference and sales availability.</p>
                    <Button className="mt-4" variant="outline" onClick={() => setAppointmentDraft(true)}>Create appointment draft</Button>
                  </div>
                ))}
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 xl:col-span-3">
                  <p className="font-semibold text-white">Confirmation screen</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {appointmentDraft ? `${activeAnalysis.leadInfo.name || "Lead"} is ready for a demo at ${activeAnalysis.leadInfo.demoTime || "Tomorrow 4:00 PM"}.` : "Create a draft to preview confirmation."}
                  </p>
                  <Button className="mt-4" onClick={saveAppointment}><CalendarCheck className="h-4 w-4" />Save Appointment</Button>
                  {appointmentSaved ? <p className="mt-3 text-sm text-emerald-300">Appointment saved as draft.</p> : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === "memory" ? (
            <Card className="min-w-0">
              <CardHeader><CardTitle>AI Memory</CardTitle><CardDescription>Conversation memory for customer identity, business, history, and preferences.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {memoryTimeline.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-white">{item.title}</p><Badge variant="info">{item.time}</Badge></div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{memoryEnabled ? item.detail : "Memory disabled"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {activeTab === "settings" ? (
            <Card className="min-w-0">
              <CardHeader><CardTitle>AI Settings</CardTitle><CardDescription>Model, temperature, max tokens, language, tone, creativity, response length, and voice.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">Model<select value={model} onChange={(event) => setModel(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-white"><option>gpt-4o-mini</option><option>gpt-4.1-mini</option><option>local-fallback</option></select></label>
                <label className="grid gap-2 text-sm text-slate-300">Max Tokens<input type="number" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white" /></label>
                <label className="grid gap-2 text-sm text-slate-300">Temperature {temperature}<input type="range" min="0" max="1" step="0.05" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /></label>
                {(["language", "defaultLanguage", "allowedLanguages", "fallbackLanguage", "tone", "creativity", "responseLength", "voice", "accent", "speakingSpeed", "personality"] as const).map((key) => (
                  <label key={key} className="grid gap-2 text-sm text-slate-300">{key}<input value={settings[key]} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white" /></label>
                ))}
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 md:col-span-2">
                  <p className="font-semibold text-white">Translation Provider Architecture</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["OpenAI", "ElevenLabs", "Google Translate", "DeepL", "Azure Translator"].map((providerName) => (
                      <Badge key={providerName} variant="neutral">{providerName}</Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Providers remain abstract. The agent detects language, reasons in English when needed, and responds in the customer language while preserving CRM memory.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="min-w-0">
            <CardHeader>
              <div>
                <CardTitle>Saved AI Conversations</CardTitle>
                <CardDescription>Authenticated chat and voice logs saved to Prisma. Convert only when you want a real CRM lead.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => void loadConversations()}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversationLoadState === "loading" ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-xl bg-white/10" />
                  ))}
                </div>
              ) : null}
              {conversationLoadState === "error" ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Sign in to load saved AI conversations.
                </div>
              ) : null}
              {conversationLoadState !== "loading" && savedConversations.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  No saved AI conversations yet. Send a chat message or complete a voice transcript to create one.
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {savedConversations.map((conversation) => (
                  <div key={conversation.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{conversation.channel} conversation</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {clientTimestamps[`conversation-${conversation.id}`] ?? "Timestamp loading"}
                        </p>
                      </div>
                      <Badge variant={conversation.status === "CONVERTED_TO_LEAD" ? "success" : "info"}>
                        {conversation.status}
                      </Badge>
                    </div>
                    <p className="mt-3 max-h-20 overflow-hidden text-sm leading-6 text-slate-300">
                      {conversation.summary || "Conversation captured without summary."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={conversation.leadScore >= 70 ? "success" : "warning"}>
                        Score {conversation.leadScore}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void convertConversation(conversation.id)}
                        disabled={conversation.status === "CONVERTED_TO_LEAD"}
                      >
                        <Save className="h-4 w-4" />
                        Convert to Lead
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader><CardTitle>ActivityLog-Ready Events</CardTitle><CardDescription>Demo events map cleanly to the existing ActivityLog model.</CardDescription></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{log.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{log.entityType} - {clientTimestamps[`log-${log.id}`] ?? "Timestamp loading"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
