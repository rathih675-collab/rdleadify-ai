import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  Bot,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Database,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  defaultRuleEngineConfig,
  demoDecisionRecords,
  engineArchitecture,
  orchestratorAnalytics,
  pipelineStages,
} from "@/lib/ai-orchestrator";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type EngineCard = {
  name: string;
  description: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const engineCards: EngineCard[] = [
  { name: "Intent Engine", description: "Classifies source, intent, confidence, and evidence for every event.", icon: MessageSquareText, variant: "info" },
  { name: "Decision Engine", description: "Chooses reply, question, booking, CRM update, workflow, call, email, or sheet actions.", icon: BrainCircuit, variant: "success" },
  { name: "Memory Engine", description: "Maintains customer, business, chats, calls, appointments, score, intent, and last activity.", icon: Database, variant: "warning" },
  { name: "Knowledge Engine", description: "Maps questions to pricing, appointment, Google, voice, workflow, and FAQ knowledge.", icon: Bot, variant: "neutral" },
  { name: "Workflow Engine", description: "Turns decisions into workflow triggers and CRM automation paths.", icon: GitBranch, variant: "success" },
  { name: "Action Engine", description: "Executes CRM, calendar, email, voice, Google Sheet, and escalation actions.", icon: Route, variant: "info" },
  { name: "Notification Engine", description: "Pushes handoff, success, and monitor events to owners and dashboards.", icon: BellRing, variant: "warning" },
  { name: "Analytics Engine", description: "Measures decisions, intent accuracy, appointments, qualified leads, response time, and success.", icon: BarChart3, variant: "success" },
];

const decisionMatrix = [
  "Reply",
  "Ask Question",
  "Book Appointment",
  "Create Lead",
  "Update CRM",
  "Escalate to Human",
  "Trigger Workflow",
  "Schedule Voice Call",
  "Send Email",
  "Send to Google Sheet",
];

const supportedEvents = [
  "Website Chat",
  "Voice Conversation",
  "Manual Lead",
  "Imported Lead",
  "API Lead",
  "Future WhatsApp",
  "Future Facebook",
  "Future Instagram",
  "Future LinkedIn",
];

const intentTypes = [
  "Sales Inquiry",
  "Support",
  "Appointment",
  "Complaint",
  "Pricing",
  "Demo Request",
  "Follow-up",
  "Unknown",
];

function MetricCard({ label, value, helper, icon: Icon }: { label: string; value: string | number; helper: string; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant="success">AI</Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{label}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</h2>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function RuleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 p-4">
      <p className="font-semibold text-white">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-6 text-slate-300">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AiOrchestratorModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Central AI Operating System" title="AI Orchestrator" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Controls every AI decision</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Central intelligence layer for chat, voice, CRM, workflows, calendar, Google Sheets, and future channels.
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400 md:text-base">
                Every incoming event moves through intent detection, knowledge lookup, memory, decisioning, action execution, CRM updates, and dashboard visibility.
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/ai-orchestrator/live">
                <Activity className="h-4 w-4" />
                Open Live Monitor
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
            <MetricCard label="Total Decisions" value={orchestratorAnalytics.totalDecisions.toLocaleString()} helper="All AI decisions" icon={BrainCircuit} />
            <MetricCard label="Intent Accuracy" value={orchestratorAnalytics.intentAccuracy} helper="Confidence-backed routing" icon={Sparkles} />
            <MetricCard label="Appointments" value={orchestratorAnalytics.appointments} helper="Booked or ready" icon={CalendarCheck} />
            <MetricCard label="Qualified Leads" value={orchestratorAnalytics.qualifiedLeads.toLocaleString()} helper="High-intent CRM records" icon={CheckCircle2} />
            <MetricCard label="Avg Response Time" value={orchestratorAnalytics.averageResponseTime} helper="Event to decision" icon={Activity} />
            <MetricCard label="AI Success Rate" value={orchestratorAnalytics.aiSuccessRate} helper="Completed decisions" icon={ShieldCheck} />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Action Pipeline</CardTitle>
                <CardDescription>Visual path every event follows before it reaches CRM and dashboard reporting.</CardDescription>
              </div>
              <Badge variant="success">Required path</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
                {pipelineStages.map((stage, index) => (
                  <div key={stage} className="min-h-28 rounded-xl border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-sm font-bold text-emerald-300">
                        {index + 1}
                      </span>
                      {index < pipelineStages.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-500" /> : <LayoutDashboard className="h-4 w-4 text-emerald-300" />}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-white">{stage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-12">
            <Card className="2xl:col-span-8">
              <CardHeader>
                <div>
                  <CardTitle>Architecture</CardTitle>
                  <CardDescription>{engineArchitecture.length} orchestration engines compose the central AI OS.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {engineCards.map((engine) => {
                  const Icon = engine.icon;
                  return (
                    <div key={engine.name} className="rounded-xl border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                          <Icon className="h-5 w-5" />
                        </span>
                        <Badge variant={engine.variant}>Engine</Badge>
                      </div>
                      <h3 className="mt-4 font-semibold text-white">{engine.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{engine.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="2xl:col-span-4">
              <CardHeader>
                <div>
                  <CardTitle>Intent + Decision Matrix</CardTitle>
                  <CardDescription>Classify the request, store confidence, then choose allowed actions.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-white">Supported Events</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportedEvents.map((event) => <Badge key={event} variant={event.startsWith("Future") ? "neutral" : "info"}>{event}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Intent Detection</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {intentTypes.map((intent) => <Badge key={intent} variant={intent === "Unknown" ? "warning" : "success"}>{intent}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Decision Actions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {decisionMatrix.map((decision) => <Badge key={decision} variant="neutral">{decision}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <Card className="2xl:col-span-7">
              <CardHeader>
                <div>
                  <CardTitle>Recent Event Logs</CardTitle>
                  <CardDescription>Timestamp, workspace, source, intent, decision, action, execution time, and status.</CardDescription>
                </div>
                <Badge variant="info">ActivityLog-backed</Badge>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="pb-3 font-semibold">Source</th>
                        <th className="pb-3 font-semibold">Intent</th>
                        <th className="pb-3 font-semibold">Confidence</th>
                        <th className="pb-3 font-semibold">Decision</th>
                        <th className="pb-3 font-semibold">Action</th>
                        <th className="pb-3 font-semibold">Execution</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {demoDecisionRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="py-4 text-slate-300">{record.source}</td>
                          <td className="py-4 font-semibold text-white">{record.intent}</td>
                          <td className="py-4 text-slate-300">{Math.round(record.confidence * 100)}%</td>
                          <td className="py-4 text-slate-300">{record.decision}</td>
                          <td className="py-4 text-slate-300">{record.actions.join(", ")}</td>
                          <td className="py-4 text-slate-300">{record.executionTime}ms</td>
                          <td className="py-4"><Badge variant={record.status === "Escalated" ? "warning" : "success"}>{record.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="2xl:col-span-5">
              <CardHeader>
                <div>
                  <CardTitle>Rule Engine</CardTitle>
                  <CardDescription>Admin-configurable business, sales, escalation, working-hour, appointment, and transfer rules.</CardDescription>
                </div>
                <Settings2 className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <RuleList title="Business Rules" items={defaultRuleEngineConfig.businessRules} />
                <RuleList title="Sales Rules" items={defaultRuleEngineConfig.salesRules} />
                <RuleList title="Escalation Rules" items={defaultRuleEngineConfig.escalationRules} />
                <div className="rounded-xl border border-white/10 bg-black/15 p-4">
                  <p className="font-semibold text-white">Working Hours</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{defaultRuleEngineConfig.workingHours}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
