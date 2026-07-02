import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Bot,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  Database,
  Download,
  FileText,
  Gauge,
  Headphones,
  Image,
  KeyRound,
  Layers3,
  Megaphone,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  PhoneCall,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Table2,
  Upload,
  Users,
  Video,
  WalletCards,
  Webhook,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type PhoneNumber = {
  phone: string;
  displayName: string;
  status: "Connected" | "Pending" | "Restricted";
  verified: string;
  quality: "High" | "Medium" | "Low";
  tier: string;
};

type Chat = {
  name: string;
  phone: string;
  tag: string;
  status: "Pinned" | "Unread" | "Starred" | "AI Replied" | "Manual Reply";
  message: string;
  agent: string;
  time: string;
  unread: number;
};

type Template = {
  name: string;
  category: "Marketing" | "Utility" | "Authentication";
  status: "Approved" | "Rejected" | "Pending";
  language: string;
  quality: string;
  updated: string;
};

type Broadcast = {
  name: string;
  audience: string;
  schedule: string;
  delivery: string;
  read: string;
  replies: string;
  conversion: string;
  status: "Running" | "Scheduled" | "Paused";
};

type ApiDoc = {
  title: string;
  description: string;
  endpoint: string;
  icon: LucideIcon;
};

const kpis: Kpi[] = [
  {
    label: "Connected WABA",
    value: "1",
    trend: "Verified",
    helper: "Business account connected",
    icon: BriefcaseBusiness,
    variant: "success",
  },
  {
    label: "Active Phone Numbers",
    value: "6",
    trend: "+2",
    helper: "Live sender numbers",
    icon: Phone,
    variant: "info",
  },
  {
    label: "Messages Today",
    value: "42.8K",
    trend: "+18%",
    helper: "Inbound and outbound messages",
    icon: MessageCircle,
    variant: "success",
  },
  {
    label: "Delivery Rate",
    value: "98.7%",
    trend: "+1.2%",
    helper: "Cloud API delivery success",
    icon: Send,
    variant: "success",
  },
  {
    label: "Read Rate",
    value: "72.4%",
    trend: "+6.8%",
    helper: "Customer message reads",
    icon: CheckCircle2,
    variant: "info",
  },
  {
    label: "Reply Rate",
    value: "44.9%",
    trend: "+8.1%",
    helper: "Customer replies today",
    icon: Radio,
    variant: "warning",
  },
  {
    label: "Failed Messages",
    value: "318",
    trend: "-9%",
    helper: "Template, policy, and delivery failures",
    icon: AlertTriangle,
    variant: "danger",
  },
  {
    label: "AI Conversations",
    value: "3,284",
    trend: "91% handled",
    helper: "AI-assisted threads",
    icon: Bot,
    variant: "success",
  },
];

const tabs = [
  "Dashboard",
  "Inbox",
  "Contacts",
  "Templates",
  "Broadcast",
  "Flows",
  "AI Chatbot",
  "AI Voice",
  "Webhooks",
  "API",
  "Analytics",
];

const wabaStats: Array<[string, string]> = [
  ["Business Name", "RDLeadify Technologies"],
  ["Business ID", "rdl-business-448201"],
  ["WABA ID", "waba_109283746501"],
  ["Quality Rating", "High"],
  ["Messaging Limit", "100K conversations / day"],
  ["Verification Status", "Verified"],
  ["Phone Numbers", "6 connected"],
  ["Webhook Status", "Subscribed"],
  ["Meta Verification", "Business verified"],
  ["Health Status", "Operational"],
];

const phoneNumbers: PhoneNumber[] = [
  {
    phone: "+91 98765 43210",
    displayName: "RDLeadify Sales",
    status: "Connected",
    verified: "Yes",
    quality: "High",
    tier: "100K/day",
  },
  {
    phone: "+91 99887 76655",
    displayName: "RDLeadify Support",
    status: "Connected",
    verified: "Yes",
    quality: "High",
    tier: "10K/day",
  },
  {
    phone: "+1 415 555 0198",
    displayName: "RDLeadify US",
    status: "Pending",
    verified: "In review",
    quality: "Medium",
    tier: "1K/day",
  },
  {
    phone: "+44 20 7946 0821",
    displayName: "Enterprise Desk",
    status: "Restricted",
    verified: "Yes",
    quality: "Low",
    tier: "250/day",
  },
];

const chats: Chat[] = [
  {
    name: "Aarav Sharma",
    phone: "+91 90000 11882",
    tag: "Demo Booked",
    status: "Pinned",
    message: "Can we move the product walkthrough to 5 PM today?",
    agent: "Priya",
    time: "2 min",
    unread: 4,
  },
  {
    name: "Maya Iyer",
    phone: "+91 98880 45621",
    tag: "High Intent",
    status: "Unread",
    message: "Please send the enterprise pricing and integration list.",
    agent: "AI Agent",
    time: "8 min",
    unread: 2,
  },
  {
    name: "Kabir Sethi",
    phone: "+91 95555 80221",
    tag: "At Risk",
    status: "AI Replied",
    message: "The chatbot answered the pricing question and suggested a call.",
    agent: "AI Agent",
    time: "18 min",
    unread: 0,
  },
  {
    name: "Neha Bansal",
    phone: "+91 90909 77441",
    tag: "Starred",
    status: "Starred",
    message: "Attach the implementation document and timeline.",
    agent: "Rohan",
    time: "31 min",
    unread: 1,
  },
];

const templates: Template[] = [
  {
    name: "demo_confirmation_v3",
    category: "Utility",
    status: "Approved",
    language: "English",
    quality: "High",
    updated: "Today, 10:24 AM",
  },
  {
    name: "limited_offer_followup",
    category: "Marketing",
    status: "Pending",
    language: "English",
    quality: "Medium",
    updated: "Today, 9:02 AM",
  },
  {
    name: "otp_login_code",
    category: "Authentication",
    status: "Approved",
    language: "English",
    quality: "High",
    updated: "Yesterday",
  },
  {
    name: "reactivation_discount",
    category: "Marketing",
    status: "Rejected",
    language: "Hindi",
    quality: "Low",
    updated: "Jun 30, 2026",
  },
];

const broadcasts: Broadcast[] = [
  {
    name: "Q3 Demo Push",
    audience: "Hot leads",
    schedule: "Today, 6:00 PM",
    delivery: "98.9%",
    read: "74.2%",
    replies: "38.6%",
    conversion: "12.4%",
    status: "Scheduled",
  },
  {
    name: "Real Estate Automation Offer",
    audience: "Builders",
    schedule: "Running",
    delivery: "97.4%",
    read: "69.1%",
    replies: "31.8%",
    conversion: "8.9%",
    status: "Running",
  },
  {
    name: "Inactive Lead Reactivation",
    audience: "No reply 30 days",
    schedule: "Paused",
    delivery: "94.1%",
    read: "51.2%",
    replies: "12.7%",
    conversion: "2.6%",
    status: "Paused",
  },
];

const flowNodes = [
  { title: "Visual Flow", icon: Workflow },
  { title: "Drag & Drop", icon: Layers3 },
  { title: "Condition", icon: Gauge },
  { title: "Buttons", icon: Table2 },
  { title: "List Messages", icon: FileText },
  { title: "Catalog", icon: Archive },
  { title: "Payments", icon: WalletCards },
  { title: "Human Handoff", icon: Headphones },
];

const aiChatbot: Array<[string, string]> = [
  ["GPT Provider", "OpenAI GPT-5"],
  ["Knowledge Base", "124 docs trained"],
  ["Prompt", "Sales qualification prompt v4"],
  ["Temperature", "0.35"],
  ["AI Logs", "8,412 events"],
  ["Conversation History", "90 days retained"],
  ["Fallback", "Human after 2 failed intents"],
  ["Human Transfer", "Sales queue"],
];

const aiVoice: Array<[string, string]> = [
  ["Voice Provider", "ElevenLabs"],
  ["Call Trigger", "Hot lead, missed reply"],
  ["Voice Agent", "RDLeadify Qualifier"],
  ["Transcript", "Enabled"],
  ["Summary", "Auto-generated"],
  ["Recording", "Encrypted storage"],
];

const webhookItems: Array<[string, string]> = [
  ["Webhook URL", "https://api.rdleadify.ai/webhooks/whatsapp"],
  ["Verify Token", "rdl_whatsapp_verify_2026"],
  ["Secret", "whsec_live_..._managed"],
  ["Incoming Events", "messages, statuses, templates"],
  ["Outgoing Events", "lead.created, campaign.replied"],
  ["Retry Logs", "41 retries, 3 failed"],
];

const apiDocs: ApiDoc[] = [
  {
    title: "Send Message",
    description: "Send text, media, template, and interactive WhatsApp messages.",
    endpoint: "POST /v1/whatsapp/messages",
    icon: Send,
  },
  {
    title: "Media Upload",
    description: "Upload images, videos, documents, and voice notes for reuse.",
    endpoint: "POST /v1/whatsapp/media",
    icon: Upload,
  },
  {
    title: "Templates",
    description: "Create, sync, inspect, and localize approved message templates.",
    endpoint: "GET /v1/whatsapp/templates",
    icon: FileText,
  },
  {
    title: "Webhook",
    description: "Receive inbound messages, delivery statuses, and quality events.",
    endpoint: "POST /webhooks/whatsapp",
    icon: Webhook,
  },
  {
    title: "Phone Numbers",
    description: "List phone IDs, display names, tiers, verification, and quality.",
    endpoint: "GET /v1/whatsapp/phone-numbers",
    icon: Phone,
  },
  {
    title: "Authentication",
    description: "Use system user tokens, business access tokens, and app secrets.",
    endpoint: "Bearer wa_live_token",
    icon: KeyRound,
  },
  {
    title: "Rate Limits",
    description: "Monitor throughput, messaging tiers, and app-level limits.",
    endpoint: "GET /v1/whatsapp/limits",
    icon: Activity,
  },
];

const analytics: Array<[string, string, string]> = [
  ["Messages", "42.8K", "+18%"],
  ["Replies", "19.2K", "+8.1%"],
  ["Read Rate", "72.4%", "+6.8%"],
  ["Delivery", "98.7%", "+1.2%"],
  ["Response Time", "1m 42s", "-21%"],
  ["Top Agents", "Priya, AI Agent", "High"],
  ["AI Performance", "91%", "+7%"],
  ["Campaign Performance", "12.4% CVR", "+3.2%"],
];

const insights = [
  {
    title: "Best Send Time",
    detail: "6 PM to 8 PM has the highest read and reply rate for demo campaigns.",
    variant: "success" as BadgeVariant,
  },
  {
    title: "Customers Waiting",
    detail: "38 high-intent contacts are waiting longer than the SLA target.",
    variant: "warning" as BadgeVariant,
  },
  {
    title: "Low Quality Rating",
    detail: "Enterprise Desk has a low rating after template rejection spikes.",
    variant: "danger" as BadgeVariant,
  },
  {
    title: "Template Suggestions",
    detail: "Shorten the offer template and add opt-out context before resubmitting.",
    variant: "info" as BadgeVariant,
  },
  {
    title: "Campaign Suggestions",
    detail: "Duplicate Q3 Demo Push for the builder audience with AI-personalized intros.",
    variant: "success" as BadgeVariant,
  },
];

const statusVariant: Record<string, BadgeVariant> = {
  Connected: "success",
  Pending: "warning",
  Restricted: "danger",
  High: "success",
  Medium: "warning",
  Low: "danger",
  Pinned: "info",
  Unread: "warning",
  Starred: "success",
  "AI Replied": "info",
  "Manual Reply": "neutral",
  Approved: "success",
  Rejected: "danger",
  Running: "success",
  Scheduled: "info",
  Paused: "warning",
};

function KpiCard({ item }: { item: Kpi }) {
  const Icon = item.icon;

  return (
    <Card className="min-w-0 border-white/10 bg-white/[0.04]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant={item.variant}>{item.trend}</Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{item.label}</p>
        <h2 className="mt-1 truncate text-3xl font-bold tracking-tight text-white">
          {item.value}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-emerald-400/40 hover:bg-emerald-400/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function DetailGrid({
  items,
}: {
  items: Array<[string, string]>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

function MiniMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

export default function WhatsAppModule() {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Topbar eyebrow="Engagement" title="WhatsApp Cloud API" />

        <section className="min-w-0 max-w-full space-y-6 p-4 md:p-6 lg:p-8">
          <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <Badge variant="info">Enterprise WhatsApp operations</Badge>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  WhatsApp Cloud API Management
                </h1>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400 md:text-base">
                  Manage WABA health, phone numbers, live inbox, templates,
                  broadcasts, flows, AI chatbot, AI voice, webhooks, API docs,
                  analytics, and AI insights from one production-ready workspace.
                </p>
              </div>

              <div className="flex min-w-0 flex-wrap gap-3">
                {[
                  ["Connect WhatsApp", ShieldCheck],
                  ["Add Phone Number", Phone],
                  ["Create Template", FileText],
                  ["Broadcast Campaign", Megaphone],
                  ["Webhook Settings", Webhook],
                  ["Import Contacts", Upload],
                ].map(([label, Icon]) => (
                  <Button
                    key={label as string}
                    variant={label === "Connect WhatsApp" ? "default" : "outline"}
                  >
                    <Icon className="h-4 w-4" />
                    {label as string}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>

          <Card className="min-w-0 border-white/10 bg-white/[0.04]">
            <CardContent className="p-3">
              <div className="max-w-full overflow-x-auto">
                <div className="flex min-w-max gap-2">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm font-medium transition",
                        index === 0
                          ? "bg-emerald-400 text-slate-950"
                          : "border border-white/10 bg-slate-950/60 text-slate-300 hover:border-emerald-400/40 hover:text-white",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Connected WABA</CardTitle>
                    <CardDescription>
                      Business verification, WABA status, quality, limits, phone
                      inventory, webhook subscription, and Meta health.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DetailGrid items={wabaStats} />
              </CardContent>
            </Card>

            <Card className="min-w-0 border-emerald-500/20 bg-emerald-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Operational recommendations from message, quality, and
                  campaign signals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight) => (
                  <div
                    key={insight.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {insight.title}
                      </p>
                      <Badge variant={insight.variant}>AI</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {insight.detail}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="min-w-0 border-white/10 bg-white/[0.04]">
            <CardHeader>
              <div>
                <CardTitle>Phone Number Section</CardTitle>
                <CardDescription>
                  Phone number status, verification, quality rating, messaging
                  tier, and management actions.
                </CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                Add Phone Number
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[840px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Phone Number</th>
                      <th className="px-4 py-3">Display Name</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Verified</th>
                      <th className="px-4 py-3">Quality</th>
                      <th className="px-4 py-3">Messaging Tier</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {phoneNumbers.map((number) => (
                      <tr key={number.phone} className="text-slate-300">
                        <td className="px-4 py-4 font-semibold text-white">
                          {number.phone}
                        </td>
                        <td className="px-4 py-4">{number.displayName}</td>
                        <td className="px-4 py-4">
                          <Badge variant={statusVariant[number.status]}>
                            {number.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">{number.verified}</td>
                        <td className="px-4 py-4">
                          <Badge variant={statusVariant[number.quality]}>
                            {number.quality}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">{number.tier}</td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Manage ${number.phone}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-300" />
                  Live Chat Inbox
                </CardTitle>
                <CardDescription>
                  WhatsApp-style queue with pinned, unread, starred, AI and
                  manual workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
                    placeholder="Search chats, contacts, tags..."
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Pinned Chats", "18", Star],
                    ["Unread", "126", MessageCircle],
                    ["Starred", "42", Star],
                    ["AI Replied", "3,284", Bot],
                    ["Manual Reply", "612", Headphones],
                    ["Internal Notes", "1,090", FileText],
                    ["Assign Agent", "Ready", Users],
                    ["Transfer Chat", "Enabled", Workflow],
                  ].map(([label, value, Icon]) => (
                    <MiniMetric
                      key={label as string}
                      label={label as string}
                      value={value as string}
                      helper={(Icon as LucideIcon).displayName ?? "Inbox workflow"}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div
                      key={chat.phone}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {chat.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {chat.phone} - {chat.agent} - {chat.time}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={statusVariant[chat.status]}>
                            {chat.status}
                          </Badge>
                          {chat.unread ? (
                            <Badge variant="danger">{chat.unread}</Badge>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {chat.message}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="neutral">{chat.tag}</Badge>
                        <Badge variant="info">Quick Replies</Badge>
                        <Badge variant="neutral">Attachments</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle>Message Composer</CardTitle>
                <CardDescription>
                  Production composer controls for templates, AI assistance,
                  schedules, internal notes, and media.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm text-slate-400">Message draft</p>
                  <div className="mt-3 min-h-32 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
                    Hi Aarav, confirming your RDLeadify AI walkthrough today at
                    5 PM. Reply 1 to confirm, 2 to reschedule, or ask anything
                    and our AI assistant will help.
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Emoji", Smile],
                    ["Attachment", Paperclip],
                    ["Template", FileText],
                    ["Voice", Mic],
                    ["AI Reply", Sparkles],
                    ["Schedule", Clock3],
                    ["Internal Note", FileText],
                    ["Documents", Download],
                    ["Images", Image],
                    ["Videos", Video],
                    ["Voice Notes", Mic],
                    ["Send Message", Send],
                  ].map(([label, Icon]) => (
                    <Button
                      key={label as string}
                      variant={label === "Send Message" ? "default" : "outline"}
                      className="justify-start"
                    >
                      <Icon className="h-4 w-4" />
                      {label as string}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <div>
                  <CardTitle>Templates</CardTitle>
                  <CardDescription>
                    Marketing, utility, and authentication templates with
                    approval status and synchronization controls.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4" />
                    Sync Templates
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Template</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Language</th>
                        <th className="px-4 py-3">Quality</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {templates.map((template) => (
                        <tr key={template.name} className="text-slate-300">
                          <td className="px-4 py-4 font-semibold text-white">
                            {template.name}
                          </td>
                          <td className="px-4 py-4">{template.category}</td>
                          <td className="px-4 py-4">
                            <Badge variant={statusVariant[template.status]}>
                              {template.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">{template.language}</td>
                          <td className="px-4 py-4">{template.quality}</td>
                          <td className="px-4 py-4">{template.updated}</td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Open ${template.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle>Broadcast</CardTitle>
                <CardDescription>
                  Campaign delivery, reads, replies, conversion, and lifecycle
                  controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {broadcasts.map((campaign) => (
                  <div
                    key={campaign.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {campaign.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {campaign.audience} - {campaign.schedule}
                        </p>
                      </div>
                      <Badge variant={statusVariant[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <MiniMetric label="Delivery" value={campaign.delivery} helper="Delivered" />
                      <MiniMetric label="Read" value={campaign.read} helper="Read" />
                      <MiniMetric label="Replies" value={campaign.replies} helper="Replied" />
                      <MiniMetric label="Conversion" value={campaign.conversion} helper="Won" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Pause</Button>
                      <Button variant="outline" size="sm">Resume</Button>
                      <Button variant="outline" size="sm">Duplicate</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-3">
            <Card className="min-w-0 border-white/10 bg-white/[0.04] xl:col-span-2">
              <CardHeader>
                <CardTitle>Flow Builder</CardTitle>
                <CardDescription>
                  Visual flow builder surface prepared for drag and drop,
                  conditions, commerce, and handoff workflows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {flowNodes.map((node) => (
                    <FeatureCard
                      key={node.title}
                      title={node.title}
                      description="Ready for backend node configuration, validation, and versioning."
                      icon={node.icon}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>
                  WhatsApp contact segments for import, consent, tags, and CRM
                  mapping.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <MiniMetric label="Imported Contacts" value="128.4K" helper="Synced to CRM" />
                <MiniMetric label="Opt-in Contacts" value="94.1K" helper="Consent verified" />
                <MiniMetric label="Invalid Numbers" value="1,284" helper="Needs cleanup" />
                <MiniMetric label="Segments" value="36" helper="Audience-ready" />
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-300" />
                  AI Chatbot
                </CardTitle>
                <CardDescription>
                  GPT provider, knowledge, prompt, logs, fallback, and human
                  transfer management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetailGrid items={aiChatbot} />
              </CardContent>
            </Card>

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-emerald-300" />
                  AI Voice
                </CardTitle>
                <CardDescription>
                  Voice provider, call trigger, voice agent, transcript, summary,
                  and recording controls.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetailGrid items={aiVoice} />
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-emerald-300" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  URL, verify token, secret, incoming events, outgoing events,
                  and retry logs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetailGrid items={webhookItems} />
              </CardContent>
            </Card>

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-emerald-300" />
                  API Docs
                </CardTitle>
                <CardDescription>
                  Cloud API endpoints for messaging, media, templates, webhooks,
                  phone numbers, authentication, and rate limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {apiDocs.map((doc) => (
                  <div
                    key={doc.title}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-emerald-300">
                        <doc.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{doc.title}</p>
                        <p className="mt-1 truncate font-mono text-xs text-cyan-100">
                          {doc.endpoint}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {doc.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="min-w-0 border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-300" />
                Analytics
              </CardTitle>
              <CardDescription>
                Messages, replies, read rate, delivery, response time, top
                agents, AI performance, and campaign performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {analytics.map(([label, value, helper]) => (
                  <MiniMetric
                    key={label}
                    label={label}
                    value={value}
                    helper={helper}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle>Operational Controls</CardTitle>
              <CardDescription>
                Platform actions for production teams managing conversations,
                media, assignment, compliance, API, and automation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Quick Replies", Zap],
                ["Attachments", Paperclip],
                ["Voice Notes", Mic],
                ["Documents", FileText],
                ["Images", Image],
                ["Videos", Video],
                ["Assign Agent", Users],
                ["Transfer Chat", Workflow],
                ["Webhook Settings", Settings],
                ["Copy API URL", Copy],
                ["Import Contacts", Upload],
                ["Export Logs", Download],
              ].map(([label, Icon]) => (
                <Button key={label as string} variant="outline" className="justify-start">
                  <Icon className="h-4 w-4" />
                  {label as string}
                </Button>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
