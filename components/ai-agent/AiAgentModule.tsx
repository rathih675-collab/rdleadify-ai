import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  FileQuestion,
  FileText,
  Globe2,
  Headphones,
  Languages,
  Library,
  MessageCircle,
  Mic2,
  PhoneCall,
  Plus,
  Send,
  Sparkles,
  Tags,
  Upload,
  Volume2,
  WandSparkles,
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

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type Capability = {
  label: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type PanelItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const kpis: Kpi[] = [
  {
    label: "Active AI Agents",
    value: "18",
    trend: "+4",
    helper: "Voice, chat, and task agents live",
    icon: Bot,
    variant: "success",
  },
  {
    label: "AI Calls Today",
    value: "1,284",
    trend: "96.8% SLA",
    helper: "Inbound and outbound calls handled",
    icon: PhoneCall,
    variant: "info",
  },
  {
    label: "AI Chats Today",
    value: "4,920",
    trend: "+31.2%",
    helper: "Website and WhatsApp conversations",
    icon: MessageCircle,
    variant: "success",
  },
  {
    label: "Tasks Automated",
    value: "2,146",
    trend: "+18.6%",
    helper: "Follow-ups, bookings, tags, reminders",
    icon: Zap,
    variant: "warning",
  },
];

const voiceCapabilities: Capability[] = [
  {
    label: "ElevenLabs voice status",
    helper: "Connected - latency 310ms",
    icon: Volume2,
    variant: "success",
  },
  {
    label: "Call provider status",
    helper: "Operational - inbound and outbound ready",
    icon: PhoneCall,
    variant: "success",
  },
  {
    label: "Voice selection preview",
    helper: "Aria Pro - warm enterprise sales voice",
    icon: Headphones,
    variant: "info",
  },
  {
    label: "Language support",
    helper: "Hindi, English, Hinglish",
    icon: Languages,
    variant: "success",
  },
];

const chatCapabilities: Capability[] = [
  {
    label: "Website Chat",
    helper: "Embedded assistant active on pricing and demo pages",
    icon: Globe2,
    variant: "success",
  },
  {
    label: "WhatsApp Chat",
    helper: "Connected to WABA inbox and campaign replies",
    icon: MessageCircle,
    variant: "success",
  },
  {
    label: "Instagram/Messenger",
    helper: "Future channel placeholder for Meta inbox expansion",
    icon: Send,
    variant: "neutral",
  },
  {
    label: "Knowledge base connected",
    helper: "184 docs, 42 FAQs, 6 websites indexed",
    icon: Library,
    variant: "info",
  },
];

const taskCapabilities: Capability[] = [
  { label: "Auto follow-up", helper: "Creates tasks when hot leads go idle", icon: CheckCircle2, variant: "success" },
  { label: "Auto reminder", helper: "Sends internal reminders before SLA breach", icon: CalendarClock, variant: "info" },
  { label: "Auto WhatsApp message", helper: "Triggers approved templates by lifecycle stage", icon: MessageCircle, variant: "success" },
  { label: "Auto calendar booking", helper: "Books demos from qualified conversations", icon: CalendarClock, variant: "warning" },
  { label: "Auto lead tagging", helper: "Applies AI tags from intent and sentiment", icon: Tags, variant: "success" },
];

const knowledgeBase: PanelItem[] = [
  { title: "PDF Upload", description: "Train agents on brochures, price sheets, SOPs, and sales docs.", icon: Upload, variant: "info" },
  { title: "Website Training", description: "Crawl product, pricing, support, and listing pages.", icon: Globe2, variant: "success" },
  { title: "FAQ Upload", description: "Add structured objections, answers, and qualification guidance.", icon: FileQuestion, variant: "warning" },
  { title: "Docs Upload", description: "Sync operational docs and internal playbooks.", icon: FileText, variant: "neutral" },
];

const promptLibrary: PanelItem[] = [
  { title: "Sales Qualification Prompt", description: "Identify budget, need, timeline, authority, and intent.", icon: BrainCircuit, variant: "success" },
  { title: "Appointment Booking Prompt", description: "Guide qualified leads into calendar slots.", icon: CalendarClock, variant: "info" },
  { title: "Support Prompt", description: "Resolve FAQs and route complex issues to humans.", icon: Headphones, variant: "neutral" },
  { title: "Follow-up Prompt", description: "Generate contextual nudges after missed replies.", icon: WandSparkles, variant: "warning" },
];

const reports: PanelItem[] = [
  { title: "Best performing agent", description: "Voice Agent - Real Estate Qualifier converted 38 demos today.", icon: Sparkles, variant: "success" },
  { title: "Failed conversations", description: "24 conversations need review due to low confidence or provider failures.", icon: FileQuestion, variant: "warning" },
  { title: "Top customer questions", description: "Pricing, demo availability, project location, and payment plan.", icon: MessageCircle, variant: "info" },
  { title: "Conversion improvement suggestions", description: "Ask budget before location preference for premium campaigns.", icon: ArrowUpRight, variant: "success" },
];

const quickActions = [
  { label: "Create Voice Agent", icon: Mic2 },
  { label: "Create Chat Agent", icon: MessageCircle },
  { label: "Train Knowledge Base", icon: Upload },
  { label: "Test Prompt", icon: BrainCircuit },
];

function KpiCard({ item }: { item: Kpi }) {
  const Icon = item.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant={item.variant}>{item.trend}</Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{item.label}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">{item.value}</h2>
        <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
      </CardContent>
    </Card>
  );
}

function CapabilityRow({ item }: { item: Capability }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <Badge variant={item.variant}>Ready</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.helper}</p>
        </div>
      </div>
    </div>
  );
}

function PanelCard({ item }: { item: PanelItem }) {
  const Icon = item.icon;

  return (
    <article className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{item.title}</h3>
            <Badge variant={item.variant}>AI</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
        </div>
      </div>
    </article>
  );
}

export default function AiAgentModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="AI Operations" title="AI Agent" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Autonomous revenue workforce</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                AI Agent
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Configure voice, chat, and task agents for qualification, follow-up,
                booking, support, tagging, and CRM automation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Bot className="h-4 w-4" />
                Agents Healthy
              </Button>
              <Button>
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Mic2 className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Voice Agent</CardTitle>
                    <CardDescription>AI calls powered by voice provider and qualification logic.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/10 p-2">
                  <Button>Inbound</Button>
                  <Button variant="outline">Outbound</Button>
                </div>
                {voiceCapabilities.map((item) => (
                  <CapabilityRow key={item.label} item={item} />
                ))}
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">Call script preview</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Hi, this is RDLeadify AI calling to understand your requirement,
                    preferred location, budget, and timeline before booking a demo.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">AI lead qualification settings</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Budget", "Timeline", "Authority", "Need", "Location"].map((item) => (
                      <Badge key={item} variant="neutral">{item}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Chat Agent</CardTitle>
                    <CardDescription>Website, WhatsApp, and future social inbox assistance.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatCapabilities.map((item) => (
                  <CapabilityRow key={item.label} item={item} />
                ))}
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">Chat prompt preview</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Qualify the visitor politely, answer from the knowledge base,
                    recommend the next best action, and escalate when confidence is low.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                    <Zap className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Task Agent</CardTitle>
                    <CardDescription>Autonomous CRM execution and next-step automation.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskCapabilities.map((item) => (
                  <CapabilityRow key={item.label} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="space-y-6 2xl:col-span-8">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Library className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Knowledge Base</CardTitle>
                      <CardDescription>Training sources used by voice, chat, and task agents.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {knowledgeBase.map((item) => (
                      <PanelCard key={item.title} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <BrainCircuit className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Prompt Library</CardTitle>
                      <CardDescription>Reusable prompt templates for high-value workflows.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {promptLibrary.map((item) => (
                      <PanelCard key={item.title} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Reports</CardTitle>
                      <CardDescription>Performance, failure, question, and conversion insights.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.map((item) => (
                    <PanelCard key={item.title} item={item} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                      <WandSparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Launch agent workflows and testing tools.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <Button key={action.label} variant="outline" className="justify-start">
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
