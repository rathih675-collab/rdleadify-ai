"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Database,
  FileAudio,
  Headphones,
  ListChecks,
  Mic,
  PhoneCall,
  Play,
  Radio,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  XCircle,
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

type CampaignStatus = "Running" | "Scheduled" | "Completed" | "Failed" | "Draft";

type Campaign = {
  name: string;
  agent: string;
  voice: string;
  language: string;
  leadSource: string;
  schedule: string;
  workingHours: string;
  status: CampaignStatus;
  totalCalls: number;
  connected: number;
  qualified: number;
  booked: number;
};

type CallLog = {
  id: string;
  lead: string;
  phone: string;
  outcome: string;
  transcript: string;
  summary: string;
  score: number;
  appointment: string;
  duration: string;
  timestamp: string;
  recordingUrl: string;
};

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "emerald" | "sky" | "amber" | "rose" | "violet";
};

const initialCampaigns: Campaign[] = [
  {
    name: "Q3 Demo Booking Sprint",
    agent: "AI Sales Agent",
    voice: "Hinglish Sales Agent",
    language: "English + Hindi",
    leadSource: "CRM leads tagged Warm",
    schedule: "Today, 2:00 PM",
    workingHours: "10:00 AM - 6:00 PM",
    status: "Running",
    totalCalls: 184,
    connected: 119,
    qualified: 42,
    booked: 18,
  },
  {
    name: "Real Estate Site Visit Follow-up",
    agent: "Appointment Agent",
    voice: "Hindi Female",
    language: "Hindi",
    leadSource: "Pipeline: Site Visit",
    schedule: "Tomorrow, 11:30 AM",
    workingHours: "11:00 AM - 7:00 PM",
    status: "Scheduled",
    totalCalls: 96,
    connected: 0,
    qualified: 0,
    booked: 0,
  },
  {
    name: "Clinic Enquiry Qualification",
    agent: "Receptionist Agent",
    voice: "English Female",
    language: "English",
    leadSource: "Source: Website form",
    schedule: "Completed yesterday",
    workingHours: "9:00 AM - 5:00 PM",
    status: "Completed",
    totalCalls: 74,
    connected: 51,
    qualified: 29,
    booked: 16,
  },
  {
    name: "Dormant Lead Reactivation",
    agent: "Lead Qualification Agent",
    voice: "Hindi Male",
    language: "Hindi",
    leadSource: "Status: Cold",
    schedule: "Paused",
    workingHours: "12:00 PM - 5:00 PM",
    status: "Failed",
    totalCalls: 32,
    connected: 11,
    qualified: 3,
    booked: 1,
  },
];

const initialLogs: CallLog[] = [
  {
    id: "CALL-1087",
    lead: "Aarav Mehta",
    phone: "+91 98765 43210",
    outcome: "Appointment booked",
    transcript:
      "AI: Hi Aarav, this is RDLeadify AI calling about your CRM enquiry. Lead: We need automation for our sales team and can do a demo Friday.",
    summary:
      "Interested in CRM automation for a 12-member sales team. Budget is around INR 75k/month. Demo booked for Friday 4 PM.",
    score: 91,
    appointment: "Friday, 4:00 PM",
    duration: "03:42",
    timestamp: "Today, 12:18 PM",
    recordingUrl: "recordings/provider-placeholder/CALL-1087.mp3",
  },
  {
    id: "CALL-1086",
    lead: "Neha Kapoor",
    phone: "+91 99887 77665",
    outcome: "Qualified lead",
    transcript:
      "AI: What are you looking to improve? Lead: Faster follow-up and missed-call tracking. Please send pricing.",
    summary:
      "Qualified SMB lead. Needs calling workflow and WhatsApp follow-up. Follow-up task created for pricing.",
    score: 82,
    appointment: "Follow-up required",
    duration: "02:56",
    timestamp: "Today, 11:54 AM",
    recordingUrl: "recordings/provider-placeholder/CALL-1086.mp3",
  },
  {
    id: "CALL-1085",
    lead: "Rohan Builders",
    phone: "+91 91234 55678",
    outcome: "Not connected",
    transcript: "Call rang for 22 seconds. No answer. Retry scheduled automatically.",
    summary: "No answer. Retry 2 scheduled after 45 minutes inside working hours.",
    score: 35,
    appointment: "None",
    duration: "00:22",
    timestamp: "Today, 11:26 AM",
    recordingUrl: "recordings/provider-placeholder/CALL-1085.mp3",
  },
];

const flowSteps = [
  { title: "Start", detail: "Load lead, check consent, verify retry limit" },
  { title: "Greeting", detail: "Introduce business and confirm availability" },
  { title: "Ask Name", detail: "Confirm contact identity and company" },
  { title: "Qualify Requirement", detail: "Capture pain point, product interest, urgency" },
  { title: "Budget", detail: "Detect range, buying intent, decision authority" },
  { title: "Appointment", detail: "Suggest slot and create appointment draft" },
  { title: "CRM Update", detail: "Update lead, log activity, create task if needed" },
  { title: "End Call", detail: "Summarize next step and close politely" },
];

const analytics = {
  callsPerDay: [38, 54, 49, 72, 66, 84, 91],
  qualificationRate: [31, 38, 42, 47, 44, 51, 56],
  appointmentRate: [12, 16, 18, 21, 24, 25, 29],
  duration: [2.4, 2.9, 3.1, 3.4, 3.2, 3.8, 4.1],
  successRate: [58, 61, 63, 66, 70, 72, 76],
};

const campaignStatusVariant: Record<CampaignStatus, "success" | "warning" | "danger" | "neutral" | "info"> = {
  Running: "success",
  Scheduled: "info",
  Completed: "neutral",
  Failed: "danger",
  Draft: "warning",
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20";

function MiniBarChart({
  data,
  suffix = "",
}: {
  data: number[];
  suffix?: string;
}) {
  const max = Math.max(...data);

  return (
    <div className="flex h-28 items-end gap-2">
      {data.map((value, index) => (
        <div key={`${value}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end rounded-md bg-white/[0.04]">
            <div
              className="w-full rounded-md bg-gradient-to-t from-emerald-500 to-sky-400"
              style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
              title={`${value}${suffix}`}
            />
          </div>
          <span className="text-[10px] text-slate-500">D{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const toneClass = {
    emerald: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    sky: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
    amber: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    rose: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    violet: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
  }[metric.tone];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
          </div>
          <span className={cn("rounded-xl p-3 ring-1", toneClass)}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-400">{metric.detail}</p>
      </CardContent>
    </Card>
  );
}

export default function VoiceCampaignsModule() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [logs, setLogs] = useState(initialLogs);
  const [builder, setBuilder] = useState({
    name: "July Demo Calling Campaign",
    agent: "AI Sales Agent",
    voice: "Hinglish Sales Agent",
    language: "English + Hindi",
    leadSource: "Warm leads from CRM",
    script:
      "Greet the lead, confirm their interest, qualify requirement and budget, then offer two demo slots. Keep the call under four minutes.",
    maxRetries: "3",
    retryDelay: "45 minutes",
    callSchedule: "Weekdays, 10:30 AM",
    workingHours: "10:00 AM - 6:00 PM",
    status: "Draft",
  });
  const [simulationState, setSimulationState] = useState<"Idle" | "Dialing" | "Completed">("Idle");
  const [notice, setNotice] = useState("Simulation mode is active. No real phone calls will be placed.");

  const totals = useMemo(() => {
    const totalCalls = campaigns.reduce((sum, campaign) => sum + campaign.totalCalls, 0);
    const connected = campaigns.reduce((sum, campaign) => sum + campaign.connected, 0);
    const qualified = campaigns.reduce((sum, campaign) => sum + campaign.qualified, 0);
    const booked = campaigns.reduce((sum, campaign) => sum + campaign.booked, 0);

    return {
      totalCampaigns: campaigns.length,
      running: campaigns.filter((campaign) => campaign.status === "Running").length,
      scheduled: campaigns.filter((campaign) => campaign.status === "Scheduled").length,
      completed: campaigns.filter((campaign) => campaign.status === "Completed").length,
      failed: campaigns.filter((campaign) => campaign.status === "Failed").length,
      totalCalls,
      connected,
      qualified,
      booked,
    };
  }, [campaigns]);

  const metrics: Metric[] = [
    { label: "Total Campaigns", value: String(totals.totalCampaigns), detail: "All outbound voice campaigns", icon: Radio, tone: "emerald" },
    { label: "Running", value: String(totals.running), detail: "Active simulated campaigns", icon: Activity, tone: "sky" },
    { label: "Scheduled", value: String(totals.scheduled), detail: "Queued inside working hours", icon: Clock3, tone: "amber" },
    { label: "Completed", value: String(totals.completed), detail: "Finished campaign batches", icon: CheckCircle2, tone: "emerald" },
    { label: "Failed", value: String(totals.failed), detail: "Needs operator review", icon: XCircle, tone: "rose" },
    { label: "Total Calls", value: String(totals.totalCalls), detail: "Simulated outbound attempts", icon: PhoneCall, tone: "violet" },
    { label: "Connected Calls", value: String(totals.connected), detail: "Answered calls and conversations", icon: Headphones, tone: "sky" },
    { label: "Qualified Leads", value: String(totals.qualified), detail: "Leads with positive buying signals", icon: Users, tone: "emerald" },
    { label: "Booked Appointments", value: String(totals.booked), detail: "Demo or follow-up appointments", icon: CalendarCheck, tone: "amber" },
  ];

  function updateBuilder(field: keyof typeof builder, value: string) {
    setBuilder((current) => ({ ...current, [field]: value }));
  }

  function runSimulation() {
    setSimulationState("Dialing");
    setNotice("Dialing simulated lead queue. CRM updates are previewed, not sent to a telephony provider.");

    window.setTimeout(() => {
      const nextId = `CALL-${1088 + logs.length}`;
      const newLog: CallLog = {
        id: nextId,
        lead: "Simulated Lead",
        phone: "+91 90000 00000",
        outcome: "Qualified lead",
        transcript:
          "AI: Thanks for taking the call. Lead: We are evaluating CRM automation this month and want a product demo.",
        summary:
          "Simulated lead qualified with CRM automation requirement, medium urgency, and demo interest. Follow-up task prepared.",
        score: 86,
        appointment: "Tomorrow, 3:30 PM",
        duration: "03:18",
        timestamp: "Just now",
        recordingUrl: `recordings/provider-placeholder/${nextId}.mp3`,
      };

      setLogs((current) => [newLog, ...current]);
      setCampaigns((current) =>
        current.map((campaign, index) =>
          index === 0
            ? {
                ...campaign,
                totalCalls: campaign.totalCalls + 1,
                connected: campaign.connected + 1,
                qualified: campaign.qualified + 1,
              }
            : campaign,
        ),
      );
      setSimulationState("Completed");
      setNotice("Simulated call completed. Lead, activity log, appointment draft and follow-up task are ready for CRM automation.");
    }, 900);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="flex min-w-0">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Topbar eyebrow="Voice Campaigns" title="AI Voice Campaign Command Center" />

          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,18,32,0.98))] p-5 shadow-2xl shadow-black/20 md:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Simulation mode
                    </Badge>
                    <Badge variant="info">
                      <Zap className="h-3.5 w-3.5" />
                      Provider-ready architecture
                    </Badge>
                  </div>
                  <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
                    Outbound AI voice campaigns for lead qualification and demo booking
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                    Build campaigns, select CRM leads, simulate AI calls, qualify buyers, book appointments, and preview the exact CRM updates your voice agent will automate.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={runSimulation} disabled={simulationState === "Dialing"}>
                    {simulationState === "Dialing" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Run Simulated Call
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4" />
                    Review CRM Actions
                  </Button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
                    </span>
                    <p className="min-w-0 text-sm text-slate-300">{notice}</p>
                  </div>
                  <Badge variant={simulationState === "Completed" ? "success" : simulationState === "Dialing" ? "warning" : "neutral"}>
                    {simulationState}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Campaign Builder</CardTitle>
                    <CardDescription>Configure outbound campaigns without connecting a telephony provider yet.</CardDescription>
                  </div>
                  <Badge variant="warning">Draft safe</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Campaign Name</span>
                      <input className={inputClass} value={builder.name} onChange={(event) => updateBuilder("name", event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">AI Agent</span>
                      <select className={inputClass} value={builder.agent} onChange={(event) => updateBuilder("agent", event.target.value)}>
                        <option>AI Sales Agent</option>
                        <option>Appointment Agent</option>
                        <option>Lead Qualification Agent</option>
                        <option>Receptionist Agent</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Voice</span>
                      <select className={inputClass} value={builder.voice} onChange={(event) => updateBuilder("voice", event.target.value)}>
                        <option>Hinglish Sales Agent</option>
                        <option>Hindi Female</option>
                        <option>Hindi Male</option>
                        <option>English Female</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Language</span>
                      <select className={inputClass} value={builder.language} onChange={(event) => updateBuilder("language", event.target.value)}>
                        <option>English + Hindi</option>
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Regional language ready</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Lead Source</span>
                      <input className={inputClass} value={builder.leadSource} onChange={(event) => updateBuilder("leadSource", event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Status</span>
                      <select className={inputClass} value={builder.status} onChange={(event) => updateBuilder("status", event.target.value)}>
                        <option>Draft</option>
                        <option>Scheduled</option>
                        <option>Running</option>
                        <option>Paused</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Max Retries</span>
                      <input className={inputClass} value={builder.maxRetries} onChange={(event) => updateBuilder("maxRetries", event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Retry Delay</span>
                      <input className={inputClass} value={builder.retryDelay} onChange={(event) => updateBuilder("retryDelay", event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Call Schedule</span>
                      <input className={inputClass} value={builder.callSchedule} onChange={(event) => updateBuilder("callSchedule", event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Working Hours</span>
                      <input className={inputClass} value={builder.workingHours} onChange={(event) => updateBuilder("workingHours", event.target.value)} />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-slate-300">Call Script</span>
                      <textarea className={cn(inputClass, "min-h-28 resize-none")} value={builder.script} onChange={(event) => updateBuilder("script", event.target.value)} />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Lead Selection</CardTitle>
                    <CardDescription>Select who the campaign should call from CRM segments.</CardDescription>
                  </div>
                  <Tag className="h-5 w-5 text-emerald-300" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ["Tags", "Warm, Demo Requested, High Intent"],
                    ["Pipeline", "New Enquiry, Discovery, Proposal"],
                    ["Status", "New, Contacted, Qualified"],
                    ["Source", "Website, WhatsApp, Import, Referral"],
                    ["Manual Selection", "12 hand-picked priority leads"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p className="mt-1 text-sm leading-5 text-slate-400">{value}</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500"
                          aria-label={`Select ${label}`}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Visual Call Flow Builder</CardTitle>
                    <CardDescription>Campaign logic prepared for future Twilio, Exotel, Knowlarity and SIP adapters.</CardDescription>
                  </div>
                  <Route className="h-5 w-5 text-sky-300" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flowSteps.map((step, index) => (
                      <div key={step.title} className="relative">
                        {index < flowSteps.length - 1 ? (
                          <span className="absolute left-5 top-11 h-6 w-px bg-emerald-400/30" />
                        ) : null}
                        <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/20">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{step.title}</p>
                            <p className="mt-1 text-sm leading-5 text-slate-400">{step.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Live Campaign Monitor</CardTitle>
                      <CardDescription>Real-time operational view for simulated calls.</CardDescription>
                    </div>
                    <Badge variant="success">Live</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ["Current Calls", simulationState === "Dialing" ? "3" : "2"],
                        ["Queue", "87"],
                        ["Completed", String(logs.length)],
                        ["Failed", "4"],
                        ["Average Duration", "03:24"],
                        ["Success Rate", "76%"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>CRM Automation Preview</CardTitle>
                      <CardDescription>Actions the campaign will perform after each call outcome.</CardDescription>
                    </div>
                    <Database className="h-5 w-5 text-emerald-300" />
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Update Lead", "Status, score, tags, last contacted"],
                      ["Activity Log", "Call transcript, outcome, AI summary"],
                      ["Create Appointment", "Confirmed demo or consultation slot"],
                      ["Create Task", "Follow-up for pricing, retry, or human handoff"],
                    ].map(([title, description]) => (
                      <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-400">{description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Call Logs</CardTitle>
                    <CardDescription>Recording placeholders, transcripts, AI summaries and CRM outcomes.</CardDescription>
                  </div>
                  <FileAudio className="h-5 w-5 text-amber-300" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {logs.map((log) => (
                    <article key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">{log.lead}</p>
                            <Badge variant={log.score >= 80 ? "success" : log.score >= 60 ? "warning" : "neutral"}>
                              Score {log.score}
                            </Badge>
                            <Badge variant={log.outcome === "Not connected" ? "neutral" : "info"}>{log.outcome}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{log.id} | {log.phone} | {log.timestamp} | {log.duration}</p>
                        </div>
                        <Badge variant="neutral">
                          <Mic className="h-3.5 w-3.5" />
                          {log.recordingUrl}
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-3 lg:grid-cols-3">
                        <div className="rounded-xl bg-black/20 p-3 lg:col-span-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transcript</p>
                          <p className="mt-2 text-sm leading-5 text-slate-300">{log.transcript}</p>
                        </div>
                        <div className="rounded-xl bg-black/20 p-3 lg:col-span-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI Summary</p>
                          <p className="mt-2 text-sm leading-5 text-slate-300">{log.summary}</p>
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Appointment</p>
                          <p className="mt-2 text-sm leading-5 text-slate-300">{log.appointment}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>Campaign performance trends for client demos.</CardDescription>
                    </div>
                    <BarChart3 className="h-5 w-5 text-sky-300" />
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-300">Calls per day</span>
                        <span className="font-semibold text-white">91 today</span>
                      </div>
                      <MiniBarChart data={analytics.callsPerDay} />
                    </div>
                    {[
                      ["Qualification Rate", analytics.qualificationRate.at(-1), "56%"],
                      ["Appointment Rate", analytics.appointmentRate.at(-1), "29%"],
                      ["Call Duration", analytics.duration.at(-1), "4.1 min"],
                      ["AI Success Rate", analytics.successRate.at(-1), "76%"],
                    ].map(([label, width, value]) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-300">{label}</span>
                          <span className="font-semibold text-white">{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-400"
                            style={{ width: `${typeof width === "number" ? Math.min(100, width) : 50}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Telephony Architecture</CardTitle>
                      <CardDescription>No providers are connected yet. The module is designed for adapter-based integration later.</CardDescription>
                    </div>
                    <Bot className="h-5 w-5 text-emerald-300" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Twilio", "Exotel", "Knowlarity", "SIP Gateway"].map((provider) => (
                      <div key={provider} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{provider}</p>
                          <p className="text-xs text-slate-500">Adapter placeholder prepared</p>
                        </div>
                        <Badge variant="neutral">Not connected</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              {campaigns.map((campaign) => (
                <Card key={campaign.name}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">{campaign.name}</h3>
                          <Badge variant={campaignStatusVariant[campaign.status]}>{campaign.status}</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-slate-400">
                          {campaign.agent} | {campaign.voice} | {campaign.language}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{campaign.leadSource} | {campaign.schedule} | {campaign.workingHours}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ListChecks className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        ["Calls", campaign.totalCalls],
                        ["Connected", campaign.connected],
                        ["Qualified", campaign.qualified],
                        ["Booked", campaign.booked],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-black/20 p-3">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="mt-1 text-lg font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
