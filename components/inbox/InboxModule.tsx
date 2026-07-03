"use client";

import {
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCheck,
  Clock3,
  FileText,
  Globe2,
  Mail,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  Sparkles,
  Tag,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Channel =
  | "All"
  | "WhatsApp"
  | "Website"
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "Email"
  | "Voice";

type Conversation = {
  id: string;
  customerName: string;
  company: string;
  channel: Exclude<Channel, "All">;
  lastMessage: string;
  time: string;
  unread: number;
  leadScore: number;
  status: "Open" | "Qualified" | "Follow-up" | "Resolved";
  sentiment: "Positive" | "Neutral" | "Urgent";
  language: string;
  intent: string;
  tags: string[];
};

type ChatMessage = {
  id: string;
  sender: "customer" | "agent" | "ai";
  text: string;
  time: string;
};

const channelFilters: Array<{ label: Channel; icon: LucideIcon }> = [
  { label: "All", icon: Globe2 },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Website", icon: Bot },
  { label: "Facebook", icon: Users },
  { label: "Instagram", icon: Sparkles },
  { label: "LinkedIn", icon: Users },
  { label: "Email", icon: Mail },
  { label: "Voice", icon: Mic },
];

const conversations: Conversation[] = [
  {
    id: "conv-1",
    customerName: "Aarav Mehta",
    company: "Urban Nest Realty",
    channel: "WhatsApp",
    lastMessage: "Can your AI qualify property leads and book site visits?",
    time: "2m",
    unread: 3,
    leadScore: 92,
    status: "Qualified",
    sentiment: "Positive",
    language: "Hinglish",
    intent: "Demo booking",
    tags: ["Hot Lead", "Real Estate", "Budget Shared"],
  },
  {
    id: "conv-2",
    customerName: "Sophia Carter",
    company: "Northline Clinics",
    channel: "Website",
    lastMessage: "We need appointment reminders and missed-call follow-up.",
    time: "11m",
    unread: 1,
    leadScore: 81,
    status: "Open",
    sentiment: "Positive",
    language: "English",
    intent: "Healthcare automation",
    tags: ["Healthcare", "Appointment"],
  },
  {
    id: "conv-3",
    customerName: "Imran Qureshi",
    company: "EduBridge Academy",
    channel: "Voice",
    lastMessage: "Transcript ready. Customer wants fees follow-up tomorrow.",
    time: "24m",
    unread: 0,
    leadScore: 74,
    status: "Follow-up",
    sentiment: "Neutral",
    language: "Urdu",
    intent: "Admissions follow-up",
    tags: ["Education", "Voice Call"],
  },
  {
    id: "conv-4",
    customerName: "Maria Gonzales",
    company: "Bright Ads Co.",
    channel: "Email",
    lastMessage: "Please send pricing for CRM and AI chat assistant.",
    time: "46m",
    unread: 0,
    leadScore: 68,
    status: "Open",
    sentiment: "Neutral",
    language: "Spanish",
    intent: "Pricing",
    tags: ["Agency", "Pricing"],
  },
];

const messages: ChatMessage[] = [
  {
    id: "m1",
    sender: "customer",
    text: "Hi, I run a real estate brokerage and want AI to qualify leads from ads.",
    time: "10:21",
  },
  {
    id: "m2",
    sender: "ai",
    text: "Absolutely. I can capture requirement, budget, preferred location, and book site visits automatically. What monthly lead volume do you handle?",
    time: "10:22",
  },
  {
    id: "m3",
    sender: "customer",
    text: "Around 1,200 leads monthly. Budget is near 80k and we want a demo tomorrow.",
    time: "10:24",
  },
  {
    id: "m4",
    sender: "agent",
    text: "Great, I can arrange a demo slot and sync the lead to CRM.",
    time: "10:25",
  },
];

const aiSuggestions = [
  "Confirm tomorrow's demo time and collect email.",
  "Offer real estate workflow template with site visit automation.",
  "Create high-priority follow-up task for sales team.",
];

function channelIcon(channel: Conversation["channel"]) {
  const match = channelFilters.find((filter) => filter.label === channel);
  return match?.icon ?? MessageCircle;
}

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-300";
  if (score >= 70) return "text-amber-300";
  return "text-slate-300";
}

export default function InboxModule() {
  const [activeChannel, setActiveChannel] = useState<Channel>("All");
  const [activeId, setActiveId] = useState(conversations[0].id);

  const filteredConversations = useMemo(
    () =>
      activeChannel === "All"
        ? conversations
        : conversations.filter((conversation) => conversation.channel === activeChannel),
    [activeChannel],
  );

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const ActiveChannelIcon = channelIcon(activeConversation.channel);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Omnichannel AI" title="Unified Inbox" />

        <section className="grid min-h-[calc(100vh-89px)] min-w-0 gap-0 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
          <aside className="min-w-0 border-b border-white/10 bg-[#091426] xl:border-b-0 xl:border-r">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Live conversations</p>
                  <p className="mt-1 text-xs text-slate-500">Realtime-ready channel queue</p>
                </div>
                <Badge variant="success">AI Active</Badge>
              </div>

              <label className="relative mt-4 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  placeholder="Search name, phone, email, tag..."
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
                />
              </label>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {channelFilters.map((filter) => {
                  const Icon = filter.icon;
                  const active = activeChannel === filter.label;

                  return (
                    <button
                      key={filter.label}
                      type="button"
                      onClick={() => setActiveChannel(filter.label)}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                        active
                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-100"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto p-3 xl:max-h-[calc(100vh-260px)]">
              {filteredConversations.map((conversation) => {
                const Icon = channelIcon(conversation.channel);
                const active = activeConversation.id === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={cn(
                      "mb-3 w-full rounded-xl border p-4 text-left transition",
                      active
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-white">
                            {conversation.customerName}
                          </span>
                          <span className="shrink-0 text-xs text-slate-500">{conversation.time}</span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-500">
                          {conversation.company}
                        </span>
                        <span className="mt-3 block line-clamp-2 text-sm leading-5 text-slate-300">
                          {conversation.lastMessage}
                        </span>
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant={conversation.status === "Qualified" ? "success" : "neutral"}>
                        {conversation.status}
                      </Badge>
                      <span className={cn("text-xs font-bold", scoreTone(conversation.leadScore))}>
                        {conversation.leadScore}
                      </span>
                      {conversation.unread ? (
                        <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-bold text-slate-950">
                          {conversation.unread}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0 bg-[#07111f]">
            <div className="flex flex-col gap-4 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
                  <ActiveChannelIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-white">{activeConversation.customerName}</h1>
                  <p className="truncate text-sm text-slate-400">
                    {activeConversation.channel} - {activeConversation.language} - {activeConversation.intent}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <Phone className="h-4 w-4" />
                  Callback
                </Button>
                <Button>
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>

            <div className="min-h-[520px] space-y-4 p-4 md:p-6">
              {messages.map((message) => {
                const isCustomer = message.sender === "customer";
                const isAi = message.sender === "ai";

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isCustomer ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[min(680px,92%)] rounded-2xl border px-4 py-3 shadow-2xl shadow-black/10",
                        isCustomer
                          ? "border-white/10 bg-white/[0.055] text-slate-200"
                          : isAi
                            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-50"
                            : "border-sky-400/25 bg-sky-400/10 text-sky-50",
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {isAi ? <Bot className="h-3.5 w-3.5" /> : isCustomer ? <UserRound className="h-3.5 w-3.5" /> : <CheckCheck className="h-3.5 w-3.5" />}
                        {message.sender}
                        <span className="normal-case text-slate-500">{message.time}</span>
                      </div>
                      <p className="break-words text-sm leading-6">{message.text}</p>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                  <BrainCircuit className="h-4 w-4" />
                  AI reply suggestions
                </div>
                <div className="mt-3 grid gap-2">
                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-emerald-400/40 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                <input
                  placeholder="Write a reply or ask AI to generate one..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
                <Button size="icon" aria-label="More actions" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button>
                  <Sparkles className="h-4 w-4" />
                  AI Reply
                </Button>
              </div>
            </div>
          </section>

          <aside className="min-w-0 border-t border-white/10 bg-[#091426] p-4 xl:border-l xl:border-t-0">
            <Card>
              <CardHeader>
                <CardTitle>Lead Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
                    {activeConversation.customerName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{activeConversation.customerName}</p>
                    <p className="truncate text-sm text-slate-400">{activeConversation.company}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Lead Score" value={String(activeConversation.leadScore)} />
                  <Metric label="Sentiment" value={activeConversation.sentiment} />
                  <Metric label="Language" value={activeConversation.language} />
                  <Metric label="Status" value={activeConversation.status} />
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Tag className="h-4 w-4 text-emerald-300" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeConversation.tags.map((tag) => (
                      <Badge key={tag} variant="info">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
                <p>
                  Customer is evaluating RDLeadify AI for omnichannel lead qualification,
                  CRM updates, and automated demo booking. Budget and urgency indicate a
                  high-priority sales opportunity.
                </p>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="font-semibold text-white">Recommended next action</p>
                  <p className="mt-1 text-slate-400">
                    Confirm demo time, capture email, and create a sales follow-up task.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>CRM Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Activity icon={Clock3} title="Conversation opened" detail="Assigned to Sales Ops" />
                <Activity icon={FileText} title="AI summary generated" detail="Intent and language detected" />
                <Activity icon={CalendarClock} title="Demo action ready" detail="Calendar booking available" />
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Activity({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
      </div>
    </div>
  );
}
