"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Globe2,
  Grid3X3,
  Mail,
  MessageCircle,
  MousePointer2,
  Network,
  NotebookPen,
  PhoneCall,
  Play,
  Plus,
  RefreshCw,
  Route,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Split,
  Tag,
  Target,
  TimerReset,
  UserCheck,
  Users,
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

type ViewId = "dashboard" | "builder" | "analytics" | "templates" | "logs";
type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type WorkflowNode = {
  id: string;
  type: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type ExecutionLog = {
  id: string;
  campaign: string;
  lead: string;
  currentStep: string;
  status: string;
  executionTime: number;
  result: string;
  aiSummary: string;
  errors?: unknown;
};

type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  isSystem?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20";

const views: Array<{ id: ViewId; label: string; href: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "AI Drip Campaigns", href: "/ai-drip-campaigns", icon: Sparkles },
  { id: "builder", label: "Workflow Builder", href: "/workflow-builder", icon: Workflow },
  { id: "analytics", label: "Campaign Analytics", href: "/campaign-analytics", icon: BarChart3 },
  { id: "templates", label: "Templates", href: "/automation-templates", icon: Grid3X3 },
  { id: "logs", label: "Execution Logs", href: "/execution-logs", icon: FileText },
];

const workflowTriggers = [
  "New Lead",
  "Lead Updated",
  "Appointment Booked",
  "Task Completed",
  "Pipeline Changed",
  "Tag Added",
  "Form Submitted",
  "Website Chat",
  "Manual Trigger",
  "API Trigger",
];

const conditionTypes = [
  "Lead Score",
  "Pipeline",
  "Tags",
  "Budget",
  "Country",
  "Business Type",
  "Appointment Status",
  "Reply Status",
  "AI Intent",
  "Previous Campaign",
];

const aiDecisions = [
  "Continue Campaign",
  "Book Demo",
  "Escalate to Human",
  "Assign Sales Rep",
  "Mark Lost",
  "Mark Qualified",
];

const crmActions = [
  "Update Lead",
  "Update Pipeline",
  "Create Activity",
  "Create Task",
  "Book Appointment",
  "Add Notes",
];

const futureProviders = [
  "Twilio",
  "Exotel",
  "Knowlarity",
  "WhatsApp Cloud API",
  "Resend",
  "SMTP",
  "Google Calendar",
  "Stripe",
];

const nodeLibrary: WorkflowNode[] = [
  { id: "lib-start", type: "Start", label: "Start", detail: "Entry point for automation", x: 0, y: 0, icon: Play, variant: "success" },
  { id: "lib-delay", type: "Delay", label: "Delay", detail: "Wait minutes, hours, or days", x: 0, y: 0, icon: Clock3, variant: "neutral" },
  { id: "lib-condition", type: "Condition", label: "Condition", detail: "Evaluate CRM or AI data", x: 0, y: 0, icon: GitBranch, variant: "warning" },
  { id: "lib-ifelse", type: "If / Else", label: "If / Else", detail: "Route yes/no outcomes", x: 0, y: 0, icon: Split, variant: "info" },
  { id: "lib-ai-chat", type: "AI Chat", label: "AI Chat", detail: "Personalized AI conversation", x: 0, y: 0, icon: Bot, variant: "success" },
  { id: "lib-ai-voice", type: "AI Voice Call", label: "AI Voice Call", detail: "Voice campaign adapter", x: 0, y: 0, icon: PhoneCall, variant: "info" },
  { id: "lib-email", type: "Email", label: "Email", detail: "Email adapter placeholder", x: 0, y: 0, icon: Mail, variant: "warning" },
  { id: "lib-whatsapp", type: "WhatsApp", label: "WhatsApp", detail: "Beta placeholder", x: 0, y: 0, icon: MessageCircle, variant: "info" },
  { id: "lib-sms", type: "SMS", label: "SMS", detail: "Coming soon", x: 0, y: 0, icon: Send, variant: "neutral" },
  { id: "lib-assign", type: "Assign User", label: "Assign User", detail: "Route to owner", x: 0, y: 0, icon: UserCheck, variant: "neutral" },
  { id: "lib-task", type: "Create Task", label: "Create Task", detail: "Human follow-up task", x: 0, y: 0, icon: CheckCircle2, variant: "success" },
  { id: "lib-book", type: "Book Appointment", label: "Book Appointment", detail: "Create calendar draft", x: 0, y: 0, icon: CalendarCheck, variant: "success" },
  { id: "lib-lead", type: "Update Lead", label: "Update Lead", detail: "Modify lead fields", x: 0, y: 0, icon: Database, variant: "info" },
  { id: "lib-pipeline", type: "Update Pipeline", label: "Update Pipeline", detail: "Move deal stage", x: 0, y: 0, icon: Workflow, variant: "info" },
  { id: "lib-add-tag", type: "Add Tag", label: "Add Tag", detail: "Attach CRM tag", x: 0, y: 0, icon: Tag, variant: "warning" },
  { id: "lib-remove-tag", type: "Remove Tag", label: "Remove Tag", detail: "Remove CRM tag", x: 0, y: 0, icon: Tag, variant: "neutral" },
  { id: "lib-webhook", type: "Webhook", label: "Webhook", detail: "Emit provider event", x: 0, y: 0, icon: Webhook, variant: "neutral" },
  { id: "lib-http", type: "HTTP Request", label: "HTTP Request", detail: "Call external API", x: 0, y: 0, icon: Globe2, variant: "neutral" },
  { id: "lib-calendar", type: "Google Calendar", label: "Google Calendar", detail: "Calendar adapter", x: 0, y: 0, icon: CalendarCheck, variant: "info" },
  { id: "lib-sheets", type: "Google Sheets", label: "Google Sheets", detail: "Sheets adapter", x: 0, y: 0, icon: Grid3X3, variant: "success" },
  { id: "lib-note", type: "Internal Note", label: "Internal Note", detail: "Add CRM note", x: 0, y: 0, icon: NotebookPen, variant: "neutral" },
  { id: "lib-end", type: "End", label: "End", detail: "Finish automation", x: 0, y: 0, icon: Target, variant: "danger" },
];

const initialNodes: WorkflowNode[] = [
  { ...nodeLibrary[0], id: "start", x: 7, y: 10 },
  { ...nodeLibrary[4], id: "chat", x: 28, y: 10 },
  { ...nodeLibrary[1], id: "delay-1", x: 49, y: 10 },
  { ...nodeLibrary[6], id: "email", x: 70, y: 10 },
  { ...nodeLibrary[1], id: "delay-2", x: 17, y: 45 },
  { ...nodeLibrary[5], id: "voice", x: 38, y: 45 },
  { ...nodeLibrary[2], id: "decision", x: 59, y: 45, label: "AI Decision", detail: "Book demo, escalate, qualify, or mark lost" },
  { ...nodeLibrary[7], id: "whatsapp", x: 80, y: 45 },
  { ...nodeLibrary[10], id: "task", x: 33, y: 78 },
  { ...nodeLibrary[12], id: "crm", x: 54, y: 78 },
  { ...nodeLibrary[21], id: "end", x: 75, y: 78 },
];

const initialEdges = [
  ["start", "chat"],
  ["chat", "delay-1"],
  ["delay-1", "email"],
  ["email", "delay-2"],
  ["delay-2", "voice"],
  ["voice", "decision"],
  ["decision", "whatsapp"],
  ["whatsapp", "task"],
  ["task", "crm"],
  ["crm", "end"],
];

const fallbackTemplates: Template[] = [
  "Lead Qualification",
  "Sales Follow-up",
  "Demo Reminder",
  "Appointment Confirmation",
  "Payment Reminder",
  "Customer Support",
  "Real Estate",
  "Education",
  "Healthcare",
  "Insurance",
].map((name, index) => ({
  id: `template-${index}`,
  name,
  category: index < 5 ? "Sales" : "Industry",
  description: `${name} workflow with AI decisioning, CRM actions, and provider-abstract channel steps.`,
  isSystem: true,
}));

const fallbackLogs: ExecutionLog[] = [
  {
    id: "log-1",
    campaign: "Hot Lead Demo Nurture",
    lead: "Aarav Mehta",
    currentStep: "AI Decision",
    status: "QUALIFIED",
    executionTime: 1240,
    result: "Demo booking path selected",
    aiSummary: "Lead has high intent, confirmed budget, and requested a CRM automation demo.",
  },
  {
    id: "log-2",
    campaign: "Proposal Follow-up",
    lead: "Neha Kapoor",
    currentStep: "Email",
    status: "SENT",
    executionTime: 480,
    result: "Personalized pricing follow-up sent",
    aiSummary: "Lead requested pricing and WhatsApp automation details.",
  },
  {
    id: "log-3",
    campaign: "Missed Call Recovery",
    lead: "Rohan Builders",
    currentStep: "AI Voice Call",
    status: "RETRY_SCHEDULED",
    executionTime: 910,
    result: "No answer, retry queued",
    aiSummary: "Lead remains open. Retry inside working hours after delay.",
  },
];

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  variant = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  variant?: BadgeVariant;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
          <span
            className={cn(
              "rounded-xl p-3 ring-1",
              variant === "success" && "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
              variant === "info" && "bg-sky-400/10 text-sky-300 ring-sky-400/20",
              variant === "warning" && "bg-amber-400/10 text-amber-300 ring-amber-400/20",
              variant === "danger" && "bg-rose-400/10 text-rose-300 ring-rose-400/20",
              variant === "neutral" && "bg-white/10 text-slate-300 ring-white/10",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

function AutomationHero({ view }: { view: ViewId }) {
  const title =
    view === "builder"
      ? "Visual Workflow Builder"
      : view === "analytics"
        ? "Campaign Analytics"
        : view === "templates"
          ? "Automation Templates"
          : view === "logs"
            ? "Execution Logs"
            : "Enterprise AI Drip Campaigns";

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,18,32,0.98))] p-5 shadow-2xl shadow-black/20 md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">
              <Sparkles className="h-3.5 w-3.5" />
              AI automation engine
            </Badge>
            <Badge variant="info">
              <ShieldCheck className="h-3.5 w-3.5" />
              Provider abstracted
            </Badge>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Build CRM-connected AI automations with visual nodes, multi-channel sequences, intelligent decisions, execution logs, templates, and future-ready provider adapters.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {views.map((item) => {
            const Icon = item.icon;
            return (
              <Button key={item.id} asChild variant={item.id === view ? "default" : "outline"} size="sm">
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowCanvas({ nodes }: { nodes: WorkflowNode[] }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#091426] p-4">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {initialEdges.map(([from, to]) => {
          const start = nodes.find((node) => node.id === from);
          const end = nodes.find((node) => node.id === to);
          if (!start || !end) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={`${start.x + 8}%`}
              y1={`${start.y + 6}%`}
              x2={`${end.x + 8}%`}
              y2={`${end.y + 6}%`}
              stroke="rgba(52,211,153,.48)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          );
        })}
      </svg>
      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.id}
            className="absolute w-40 rounded-2xl border border-white/10 bg-[#0f1c31]/95 p-3 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-emerald-400/40"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="flex items-start gap-2">
              <span className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{node.label}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-400">{node.detail}</p>
              </div>
            </div>
            <Badge className="mt-3" variant={node.variant}>{node.type}</Badge>
          </div>
        );
      })}
    </div>
  );
}

export default function AiDripCampaignsModule({ initialView = "dashboard" }: { initialView?: ViewId }) {
  const [activeView] = useState<ViewId>(initialView);
  const [nodes, setNodes] = useState(initialNodes);
  const [templates, setTemplates] = useState<Template[]>(fallbackTemplates);
  const [logs, setLogs] = useState<ExecutionLog[]>(fallbackLogs);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notice, setNotice] = useState("Automation engine is in simulation mode. Providers remain abstract.");
  const [builder, setBuilder] = useState({
    name: "Enterprise AI Demo Booking Workflow",
    description: "Qualify new leads, follow up across channels, route hot leads, and book demos.",
    goal: "Book qualified demos and update CRM automatically",
    aiAgent: "AI Sales Agent",
    pipeline: "Default Sales Pipeline",
    leadSource: "Website, WhatsApp, Voice Campaigns",
    triggerEvent: "New Lead",
    workingHours: "10:00 AM - 6:00 PM",
    timezone: "Asia/Kolkata",
    retryCount: "3",
    retryDelay: "45 minutes",
    status: "DRAFT",
  });

  useEffect(() => {
    async function loadAutomationData() {
      try {
        const [templatesResponse, logsResponse] = await Promise.all([
          fetch("/api/automation/templates"),
          fetch("/api/automation/execution-logs"),
        ]);

        if (templatesResponse.ok) {
          const data = (await templatesResponse.json()) as { templates?: Template[] };
          if (data.templates?.length) setTemplates(data.templates);
        }

        if (logsResponse.ok) {
          const data = (await logsResponse.json()) as { logs?: ExecutionLog[] };
          if (data.logs?.length) setLogs(data.logs);
        }
      } catch {
        setNotice("Using demo automation data. Sign in to load workspace workflows and logs.");
      }
    }

    void loadAutomationData();
  }, []);

  const metrics = useMemo(
    () => [
      { label: "Total Campaigns", value: "48", detail: "Across AI drip and workflow automations", icon: Network, variant: "info" as const },
      { label: "Active Campaigns", value: "18", detail: "Published and accepting leads", icon: Activity, variant: "success" as const },
      { label: "Draft Campaigns", value: "11", detail: "Builder drafts awaiting publish", icon: FileText, variant: "warning" as const },
      { label: "Completed Campaigns", value: "19", detail: "Finished journeys with outcomes", icon: CheckCircle2, variant: "neutral" as const },
      { label: "Leads In Campaign", value: "2,840", detail: "Currently enrolled leads", icon: Users, variant: "info" as const },
      { label: "Qualified Leads", value: "684", detail: "AI-qualified opportunities", icon: Target, variant: "success" as const },
      { label: "Conversion Rate", value: "24.8%", detail: "Campaign attributed conversion", icon: BarChart3, variant: "success" as const },
      { label: "Appointments Booked", value: "176", detail: "Booked by AI workflows", icon: CalendarCheck, variant: "warning" as const },
    ],
    [],
  );

  function updateBuilder(field: keyof typeof builder, value: string) {
    setBuilder((current) => ({ ...current, [field]: value }));
  }

  function addNode(node: WorkflowNode) {
    const nextNode = {
      ...node,
      id: `${node.type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nodes.length + 1}`,
      x: 8 + ((nodes.length * 17) % 70),
      y: 12 + ((nodes.length * 23) % 70),
    };
    setNodes((current) => [...current, nextNode]);
    setNotice(`${node.type} node added. Drag-and-drop execution can plug into this node model later.`);
  }

  async function saveWorkflow(status: "DRAFT" | "ACTIVE") {
    setSaveState("saving");
    setNotice(status === "ACTIVE" ? "Publishing workflow..." : "Saving draft...");

    try {
      const response = await fetch("/api/automation/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...builder,
          status,
          retryCount: Number(builder.retryCount),
          nodes: nodes.map(({ icon: _icon, ...node }) => node),
          edges: initialEdges.map(([from, to]) => ({ from, to })),
          triggers: workflowTriggers,
          conditions: conditionTypes,
          crmActions,
          providerConfig: {
            twilio: "adapter-placeholder",
            exotel: "adapter-placeholder",
            knowlarity: "adapter-placeholder",
            whatsappCloudApi: "beta-adapter-placeholder",
            resend: "adapter-placeholder",
            smtp: "adapter-placeholder",
            googleCalendar: "adapter-placeholder",
            stripe: "adapter-placeholder",
          },
        }),
      });

      if (!response.ok) throw new Error("Save failed");
      setSaveState("saved");
      setNotice(status === "ACTIVE" ? "Workflow published and ActivityLog created." : "Workflow draft saved to database.");
    } catch {
      setSaveState("error");
      setNotice("Could not save workflow. Sign in and ensure the database migration is applied.");
    }
  }

  async function simulateExecution() {
    const newLog: ExecutionLog = {
      id: `demo-${logs.length + 1}`,
      campaign: builder.name,
      lead: "Simulated Enterprise Lead",
      currentStep: "AI Decision",
      status: "QUALIFIED",
      executionTime: 1180,
      result: "AI selected Book Demo and CRM Update path",
      aiSummary: "Lead matched high-intent conditions, budget threshold, and appointment readiness.",
    };

    setLogs((current) => [newLog, ...current]);
    setNotice("Execution simulated. Future engine can persist each node result and CRM action.");

    await fetch("/api/automation/execution-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog),
    }).catch(() => undefined);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="flex min-w-0">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Topbar eyebrow="Automation" title="Enterprise AI Workflow Automation" />

          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
            <AutomationHero view={activeView} />

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
                  </span>
                  <p className="min-w-0 text-sm text-slate-300">{notice}</p>
                </div>
                <Badge variant={saveState === "error" ? "danger" : saveState === "saved" ? "success" : "neutral"}>
                  {saveState === "idle" ? "Simulation Ready" : saveState}
                </Badge>
              </div>
            </div>

            {activeView === "dashboard" ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                  ))}
                </section>
                <section className="grid gap-6 xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Campaign Performance</CardTitle><CardDescription>Demo performance across enterprise campaigns.</CardDescription></CardHeader><CardContent className="space-y-4"><ProgressBar label="Lead Qualification" value={78} /><ProgressBar label="Follow-up Completion" value={64} /><ProgressBar label="Demo Booking" value={42} /></CardContent></Card>
                  <Card><CardHeader><CardTitle>Daily Executions</CardTitle><CardDescription>Node executions across all automations.</CardDescription></CardHeader><CardContent className="space-y-4"><ProgressBar label="Monday" value={52} /><ProgressBar label="Tuesday" value={68} /><ProgressBar label="Wednesday" value={84} /><ProgressBar label="Thursday" value={76} /></CardContent></Card>
                  <Card><CardHeader><CardTitle>Lead Conversion</CardTitle><CardDescription>Conversion by CRM stage and AI score.</CardDescription></CardHeader><CardContent className="space-y-4"><ProgressBar label="New to Qualified" value={59} /><ProgressBar label="Qualified to Appointment" value={46} /><ProgressBar label="Appointment to Won" value={31} /></CardContent></Card>
                  <Card><CardHeader><CardTitle>AI Success Rate</CardTitle><CardDescription>Estimated outcome quality from AI decisions.</CardDescription></CardHeader><CardContent className="space-y-4"><ProgressBar label="Correct Routing" value={91} /><ProgressBar label="Useful Summary" value={88} /><ProgressBar label="Human Escalation Accuracy" value={82} /></CardContent></Card>
                </section>
              </>
            ) : null}

            {activeView === "dashboard" || activeView === "builder" ? (
              <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Campaign Builder</CardTitle>
                      <CardDescription>Save as draft or publish a workflow-backed campaign.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => void saveWorkflow("DRAFT")}>
                        <Save className="h-4 w-4" />
                        Draft
                      </Button>
                      <Button size="sm" onClick={() => void saveWorkflow("ACTIVE")}>
                        <Play className="h-4 w-4" />
                        Publish
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {[
                      ["name", "Campaign Name"],
                      ["goal", "Campaign Goal"],
                      ["aiAgent", "AI Agent"],
                      ["pipeline", "Pipeline"],
                      ["leadSource", "Lead Source"],
                      ["workingHours", "Working Hours"],
                      ["timezone", "Timezone"],
                      ["retryDelay", "Retry Delay"],
                    ].map(([key, label]) => (
                      <label key={key} className="space-y-2">
                        <span className="text-sm font-medium text-slate-300">{label}</span>
                        <input className={inputClass} value={builder[key as keyof typeof builder]} onChange={(event) => updateBuilder(key as keyof typeof builder, event.target.value)} />
                      </label>
                    ))}
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Trigger Event</span>
                      <select className={inputClass} value={builder.triggerEvent} onChange={(event) => updateBuilder("triggerEvent", event.target.value)}>
                        {workflowTriggers.map((trigger) => <option key={trigger}>{trigger}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Retry Count</span>
                      <input className={inputClass} value={builder.retryCount} onChange={(event) => updateBuilder("retryCount", event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Status</span>
                      <select className={inputClass} value={builder.status} onChange={(event) => updateBuilder("status", event.target.value)}>
                        <option>DRAFT</option>
                        <option>ACTIVE</option>
                        <option>PAUSED</option>
                        <option>COMPLETED</option>
                      </select>
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-slate-300">Description</span>
                      <textarea className={cn(inputClass, "min-h-24 resize-none")} value={builder.description} onChange={(event) => updateBuilder("description", event.target.value)} />
                    </label>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Visual Workflow Builder</CardTitle>
                      <CardDescription>Drag-and-drop-ready canvas with node connections and abstract providers.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void simulateExecution()}>
                      <RefreshCw className="h-4 w-4" />
                      Simulate
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <WorkflowCanvas nodes={nodes} />
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {activeView === "builder" ? (
              <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Card>
                  <CardHeader><CardTitle>Node Library</CardTitle><CardDescription>Click any node to add it to the canvas.</CardDescription></CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {nodeLibrary.map((node) => {
                      const Icon = node.icon;
                      return (
                        <button key={node.type} type="button" onClick={() => addNode(node)} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-emerald-400/40 hover:bg-emerald-400/10">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{node.type}</p>
                              <p className="truncate text-xs text-slate-500">{node.detail}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
                <div className="grid gap-6">
                  <Card><CardHeader><CardTitle>Workflow Triggers</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{workflowTriggers.map((item) => <Badge key={item} variant="info">{item}</Badge>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle>Conditions</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{conditionTypes.map((item) => <Badge key={item} variant="warning">{item}</Badge>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle>AI Decision Node</CardTitle><CardDescription>Intelligent routing outcomes available to the execution engine.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{aiDecisions.map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{item}</div>)}</CardContent></Card>
                </div>
              </section>
            ) : null}

            {activeView === "analytics" ? (
              <section className="grid gap-6 xl:grid-cols-2">
                {[
                  ["Open Rate", 72],
                  ["Reply Rate", 44],
                  ["Call Answer Rate", 38],
                  ["Qualification Rate", 57],
                  ["Appointment Rate", 29],
                  ["Conversion Rate", 24],
                ].map(([label, value]) => (
                  <Card key={label}><CardHeader><CardTitle>{label}</CardTitle><CardDescription>Campaign analytics chart placeholder.</CardDescription></CardHeader><CardContent><ProgressBar label={String(label)} value={Number(value)} /></CardContent></Card>
                ))}
              </section>
            ) : null}

            {activeView === "templates" ? (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white">{template.name}</h3>
                          <p className="mt-2 text-sm leading-5 text-slate-400">{template.description}</p>
                        </div>
                        <Badge variant={template.isSystem ? "success" : "info"}>{template.category}</Badge>
                      </div>
                      <Button className="mt-4 w-full" variant="outline">
                        <Plus className="h-4 w-4" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </section>
            ) : null}

            {activeView === "logs" ? (
              <section className="grid gap-4">
                {logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white">{log.campaign}</h3>
                            <Badge variant={log.status.includes("QUALIFIED") ? "success" : log.status.includes("RETRY") ? "warning" : "info"}>{log.status}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-400">{log.lead} | Current step: {log.currentStep} | {log.executionTime}ms</p>
                          <p className="mt-3 text-sm leading-6 text-slate-300">{log.aiSummary}</p>
                        </div>
                        <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300 lg:w-72">
                          <p className="font-semibold text-white">Result</p>
                          <p className="mt-1 leading-5">{log.result}</p>
                          <p className="mt-3 text-xs text-slate-500">Errors: {log.errors ? "Review required" : "None"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            ) : null}

            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>CRM Integration</CardTitle><CardDescription>Every workflow emits CRM action events for the future execution engine.</CardDescription></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">{crmActions.map((action) => <div key={action} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{action}</div>)}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Future Provider Adapters</CardTitle><CardDescription>Provider keys are abstract and do not change workflow logic.</CardDescription></CardHeader>
                <CardContent className="flex flex-wrap gap-2">{futureProviders.map((provider) => <Badge key={provider} variant="neutral">{provider}</Badge>)}</CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
