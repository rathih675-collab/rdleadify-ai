import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Code2,
  GitBranch,
  ListChecks,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Sheet,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TimerReset,
  UserPlus,
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

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";
type WorkflowStatus = "Active" | "Paused" | "Draft" | "Failed";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type WorkflowRecord = {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  status: WorkflowStatus;
  runs: string;
  successRate: string;
  lastRun: string;
  owner: string;
};

type BuilderNode = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type Suggestion = {
  title: string;
  icon: LucideIcon;
  variant: BadgeVariant;
  detail: string;
};

const kpis: Kpi[] = [
  {
    label: "Active Workflows",
    value: "64",
    trend: "+11",
    helper: "Running production automations",
    icon: Workflow,
    variant: "success",
  },
  {
    label: "Automations Triggered",
    value: "82.4K",
    trend: "+28.6%",
    helper: "Workflow runs this month",
    icon: Zap,
    variant: "info",
  },
  {
    label: "Success Rate",
    value: "98.2%",
    trend: "+1.4%",
    helper: "Completed without manual repair",
    icon: CheckCircle2,
    variant: "success",
  },
  {
    label: "Failed Runs",
    value: "142",
    trend: "-12.8%",
    helper: "Needs review or retry",
    icon: AlertTriangle,
    variant: "warning",
  },
];

const workflows: WorkflowRecord[] = [
  {
    id: "wf-1001",
    name: "Hot Lead WhatsApp Follow-up",
    trigger: "Tag Added",
    actions: "Send WhatsApp, create task, notify owner",
    status: "Active",
    runs: "18,420",
    successRate: "99.1%",
    lastRun: "4 min ago",
    owner: "Revenue Ops",
  },
  {
    id: "wf-1002",
    name: "Form Submit CRM Routing",
    trigger: "Form Submitted",
    actions: "Create lead, assign owner, update sheet",
    status: "Active",
    runs: "9,284",
    successRate: "98.4%",
    lastRun: "12 min ago",
    owner: "Priya Nair",
  },
  {
    id: "wf-1003",
    name: "Demo Booking Confirmation",
    trigger: "Appointment Booked",
    actions: "Calendar invite, WhatsApp template, CRM update",
    status: "Active",
    runs: "3,812",
    successRate: "99.6%",
    lastRun: "28 min ago",
    owner: "AI Agent",
  },
  {
    id: "wf-1004",
    name: "No Reply Recovery",
    trigger: "Time Scheduled",
    actions: "Delay, send reminder, tag at-risk",
    status: "Paused",
    runs: "6,420",
    successRate: "91.8%",
    lastRun: "Yesterday",
    owner: "Meera Jain",
  },
  {
    id: "wf-1005",
    name: "Call Completed Summary",
    trigger: "Call Completed",
    actions: "Summarize call, update CRM, create next task",
    status: "Failed",
    runs: "1,284",
    successRate: "84.2%",
    lastRun: "2 hrs ago",
    owner: "AI Ops",
  },
  {
    id: "wf-1006",
    name: "Partner Lead Intake",
    trigger: "New Lead",
    actions: "Validate lead, webhook, assign partner owner",
    status: "Draft",
    runs: "0",
    successRate: "0%",
    lastRun: "Not run",
    owner: "Dev Shah",
  },
];

const builderNodes: BuilderNode[] = [
  { title: "Trigger Node", description: "Start workflow from CRM, form, call, or schedule events.", icon: GitBranch, variant: "info" },
  { title: "Condition Node", description: "Branch by score, tag, status, owner, or source.", icon: ListChecks, variant: "warning" },
  { title: "Delay Node", description: "Wait minutes, hours, days, or until business hours.", icon: Clock3, variant: "neutral" },
  { title: "WhatsApp Message Node", description: "Send approved templates and dynamic messages.", icon: MessageCircle, variant: "success" },
  { title: "CRM Update Node", description: "Update fields, stage, tags, owner, or lead score.", icon: Workflow, variant: "info" },
  { title: "Google Sheet Node", description: "Append rows and sync operational reports.", icon: Sheet, variant: "success" },
  { title: "Calendar Booking Node", description: "Create meetings and reminders from qualified leads.", icon: CalendarClock, variant: "warning" },
  { title: "Webhook/API Node", description: "Call external APIs and send signed webhooks.", icon: Webhook, variant: "neutral" },
  { title: "AI Agent Node", description: "Ask AI to qualify, summarize, classify, or decide next action.", icon: Bot, variant: "success" },
];

const triggerLibrary = [
  { label: "New Lead", icon: UserPlus },
  { label: "Tag Added", icon: Tag },
  { label: "Form Submitted", icon: Code2 },
  { label: "WhatsApp Reply", icon: MessageCircle },
  { label: "Call Completed", icon: CheckCircle2 },
  { label: "Appointment Booked", icon: CalendarClock },
  { label: "Time Scheduled", icon: TimerReset },
];

const suggestions: Suggestion[] = [
  {
    title: "Failed workflows",
    icon: AlertTriangle,
    variant: "warning",
    detail: "Call Completed Summary has provider errors. Retry failed runs after updating transcript webhook timeout.",
  },
  {
    title: "Automation improvement",
    icon: Sparkles,
    variant: "success",
    detail: "Add a condition before WhatsApp follow-up to skip converted leads and reduce message waste.",
  },
  {
    title: "Leads missing follow-up",
    icon: Bot,
    variant: "info",
    detail: "127 hot leads have no upcoming task. Create an auto-reminder workflow for score above 80.",
  },
];

const statusVariant: Record<WorkflowStatus, BadgeVariant> = {
  Active: "success",
  Paused: "warning",
  Draft: "neutral",
  Failed: "danger",
};

function KpiCard({ item }: { item: Kpi }) {
  const Icon = item.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant={item.variant}>
            <ArrowUpRight className="h-3 w-3" />
            {item.trend}
          </Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{item.label}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">{item.value}</h2>
        <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
      </CardContent>
    </Card>
  );
}

function FilterControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AutomationModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Automation" title="Automation Builder" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Workflow operations</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Automation Builder
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Design CRM workflows that trigger from lead activity, branch by conditions,
                run AI actions, update records, and connect external systems.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>Workflow Filters</CardTitle>
                  <CardDescription>Search and segment workflows by trigger, status, and owner.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search workflow">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Workflow, action, owner..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Trigger filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All triggers</option>
                    <option>New Lead</option>
                    <option>Tag Added</option>
                    <option>Form Submitted</option>
                    <option>WhatsApp Reply</option>
                    <option>Call Completed</option>
                    <option>Appointment Booked</option>
                  </select>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Draft</option>
                    <option>Failed</option>
                  </select>
                </FilterControl>

                <FilterControl label="Owner filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All owners</option>
                    <option>Revenue Ops</option>
                    <option>AI Agent</option>
                    <option>Priya Nair</option>
                    <option>Meera Jain</option>
                    <option>Dev Shah</option>
                  </select>
                </FilterControl>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="space-y-6 2xl:col-span-8">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Workflow Table</CardTitle>
                    <CardDescription>Production workflow inventory with run health and ownership.</CardDescription>
                  </div>
                  <Badge variant="neutral">{workflows.length} workflows</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1020px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Workflow Name</th>
                          <th className="pb-3 font-semibold">Trigger</th>
                          <th className="pb-3 font-semibold">Actions</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Runs</th>
                          <th className="pb-3 font-semibold">Success Rate</th>
                          <th className="pb-3 font-semibold">Last Run</th>
                          <th className="pb-3 font-semibold">Owner</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {workflows.map((workflow) => (
                          <tr key={workflow.id} className="align-top">
                            <td className="py-4">
                              <p className="font-semibold text-white">{workflow.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{workflow.id}</p>
                            </td>
                            <td className="py-4 text-slate-300">{workflow.trigger}</td>
                            <td className="max-w-64 py-4 text-slate-300">{workflow.actions}</td>
                            <td className="py-4">
                              <Badge variant={statusVariant[workflow.status]}>{workflow.status}</Badge>
                            </td>
                            <td className="py-4 text-slate-300">{workflow.runs}</td>
                            <td className="py-4 font-semibold text-white">{workflow.successRate}</td>
                            <td className="py-4 text-slate-400">{workflow.lastRun}</td>
                            <td className="py-4 text-slate-300">{workflow.owner}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${workflow.name} actions`}>
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

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Workflow className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Visual Workflow Builder Preview</CardTitle>
                      <CardDescription>Drag-ready node palette for workflow construction.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {builderNodes.map((node) => {
                      const Icon = node.icon;

                      return (
                        <div key={node.title} className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-400/30">
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                              <Icon className="h-5 w-5" />
                            </span>
                            <Badge variant={node.variant}>Node</Badge>
                          </div>
                          <h3 className="mt-4 font-semibold text-white">{node.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{node.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <GitBranch className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Trigger Library</CardTitle>
                      <CardDescription>Start workflows from CRM and engagement events.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {triggerLibrary.map((trigger) => {
                    const Icon = trigger.icon;

                    return (
                      <div key={trigger.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3">
                        <Icon className="h-4 w-4 text-emerald-300" />
                        <p className="text-sm font-semibold text-white">{trigger.label}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Suggestions</CardTitle>
                      <CardDescription>Workflow reliability and revenue automation improvements.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="rounded-xl bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-emerald-300" />
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                          </div>
                          <Badge variant={item.variant}>AI</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
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
