import {
  Activity,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  Headphones,
  MessageCircle,
  Sparkles,
  Timer,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoDecisionRecords } from "@/lib/ai-orchestrator";

const liveStats = [
  { label: "Active Conversations", value: 38, icon: MessageCircle, variant: "success" as const },
  { label: "Running Decisions", value: 12, icon: BrainCircuit, variant: "info" as const },
  { label: "Current Actions", value: 26, icon: Activity, variant: "warning" as const },
  { label: "Lead Qualification", value: "82%", icon: CheckCircle2, variant: "success" as const },
  { label: "Memory Updates", value: 147, icon: Database, variant: "neutral" as const },
  { label: "Workflow Triggers", value: 19, icon: GitBranch, variant: "info" as const },
];

const activeConversations = [
  { name: "Riya Shah", channel: "Website Chat", state: "Qualifying", score: 92, action: "Book Appointment" },
  { name: "Arjun Mehta", channel: "Voice Conversation", state: "Escalating", score: 68, action: "Escalate to Human" },
  { name: "Priya Nair", channel: "API Lead", state: "Routing", score: 74, action: "Trigger Workflow" },
  { name: "New visitor", channel: "Future WhatsApp", state: "Waiting", score: 32, action: "Ask Question" },
];

export default function AiOrchestratorLiveModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="AI Orchestrator" title="Live Monitor" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div>
            <Badge variant="success"><Sparkles className="h-3 w-3" /> Live orchestration</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Real-time AI decisions, memory updates, actions, and workflow triggers.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
              Monitor the operating layer that coordinates AI Chat, AI Voice, CRM, Workflow Automation, Calendar, Google Sheets, and future integrations.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
            {liveStats.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <Badge variant={item.variant}>Now</Badge>
                    </div>
                    <p className="mt-5 text-sm text-slate-400">{item.label}</p>
                    <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">{item.value}</h2>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <Card className="2xl:col-span-7">
              <CardHeader>
                <div>
                  <CardTitle>Active Conversations</CardTitle>
                  <CardDescription>Current AI routing state by customer and source.</CardDescription>
                </div>
                <Badge variant="success">Live</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeConversations.map((conversation) => (
                  <div key={`${conversation.channel}-${conversation.name}`} className="grid gap-4 rounded-xl border border-white/10 bg-black/15 p-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
                    <div>
                      <p className="font-semibold text-white">{conversation.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{conversation.channel}</p>
                    </div>
                    <Badge variant={conversation.state === "Escalating" ? "warning" : "info"}>{conversation.state}</Badge>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Lead Qualification</p>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${conversation.score}%` }} />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white">{conversation.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="2xl:col-span-5">
              <CardHeader>
                <div>
                  <CardTitle>Current Actions</CardTitle>
                  <CardDescription>Action engine, notification engine, and workflow execution stream.</CardDescription>
                </div>
                <Timer className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="space-y-3">
                {demoDecisionRecords.flatMap((record) =>
                  record.actions.slice(0, 3).map((action) => (
                    <div key={`${record.id}-${action}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/15 p-4">
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                        {action === "Schedule Voice Call" ? <Headphones className="h-4 w-4" /> : action === "Trigger Workflow" ? <GitBranch className="h-4 w-4" /> : action === "Escalate to Human" ? <BellRing className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{action}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{record.intent} from {record.source} - {record.executionTime}ms</p>
                      </div>
                    </div>
                  )),
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Running Decisions</CardTitle>
                <CardDescription>Intent, action, memory, workflow, and status snapshots.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3 font-semibold">Source</th>
                      <th className="pb-3 font-semibold">Intent</th>
                      <th className="pb-3 font-semibold">Decision</th>
                      <th className="pb-3 font-semibold">Memory Update</th>
                      <th className="pb-3 font-semibold">Workflow Trigger</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {demoDecisionRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="py-4 text-slate-300">{record.source}</td>
                        <td className="py-4 font-semibold text-white">{record.intent}</td>
                        <td className="py-4 text-slate-300">{record.decision}</td>
                        <td className="py-4 text-slate-300">{record.memory.buyingIntent} intent, score {record.memory.leadScore}</td>
                        <td className="py-4 text-slate-300">{record.workflowTrigger ?? "No workflow trigger"}</td>
                        <td className="py-4"><Badge variant={record.status === "Escalated" ? "warning" : "success"}>{record.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
