import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Code2,
  Download,
  FileText,
  MoreHorizontal,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PlayCircle,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Webhook,
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
type CallStatus = "Answered" | "Missed" | "Failed" | "Voicemail" | "AI Qualified";
type CallType = "Inbound" | "Outbound" | "AI Voice";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type CallLog = {
  id: string;
  contact: string;
  phone: string;
  type: CallType;
  status: CallStatus;
  duration: string;
  agent: string;
  aiSummary: string;
  recording: string;
  time: string;
};

type PanelItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const kpis: Kpi[] = [
  {
    label: "Calls Today",
    value: "1,284",
    trend: "+18.2%",
    helper: "Inbound, outbound, and AI voice",
    icon: PhoneCall,
    variant: "success",
  },
  {
    label: "Answered Calls",
    value: "946",
    trend: "73.7%",
    helper: "Answered by agents or AI",
    icon: PhoneIncoming,
    variant: "info",
  },
  {
    label: "Missed Calls",
    value: "128",
    trend: "-9.4%",
    helper: "Needs callback automation",
    icon: PhoneMissed,
    variant: "warning",
  },
  {
    label: "AI Qualified Calls",
    value: "342",
    trend: "+24.8%",
    helper: "Calls qualified by AI agent",
    icon: Bot,
    variant: "success",
  },
];

const callLogs: CallLog[] = [
  {
    id: "call-9001",
    contact: "Aarav Sharma",
    phone: "+91 98765 42110",
    type: "AI Voice",
    status: "AI Qualified",
    duration: "08:42",
    agent: "AI Voice Agent",
    aiSummary: "Budget confirmed, demo accepted, high intent.",
    recording: "Available",
    time: "Today, 2:48 PM",
  },
  {
    id: "call-9002",
    contact: "Maya Iyer",
    phone: "+91 99887 65432",
    type: "Outbound",
    status: "Answered",
    duration: "06:18",
    agent: "Rahul Mehta",
    aiSummary: "Asked for enterprise pricing and security details.",
    recording: "Available",
    time: "Today, 1:16 PM",
  },
  {
    id: "call-9003",
    contact: "Rohan Das",
    phone: "+91 97001 12245",
    type: "Outbound",
    status: "Missed",
    duration: "00:00",
    agent: "Meera Jain",
    aiSummary: "No answer. Auto follow-up recommended.",
    recording: "None",
    time: "Today, 12:22 PM",
  },
  {
    id: "call-9004",
    contact: "Neha Bansal",
    phone: "+91 98112 45009",
    type: "Inbound",
    status: "Voicemail",
    duration: "01:14",
    agent: "Support Queue",
    aiSummary: "Requested callback about automation upgrade.",
    recording: "Available",
    time: "Today, 11:04 AM",
  },
  {
    id: "call-9005",
    contact: "Kabir Kapoor",
    phone: "+91 91234 88770",
    type: "AI Voice",
    status: "Failed",
    duration: "00:08",
    agent: "AI Voice Agent",
    aiSummary: "Provider timeout before connection.",
    recording: "None",
    time: "Today, 10:12 AM",
  },
];

const voiceApiItems: PanelItem[] = [
  { title: "Inbound Call API", description: "Route incoming calls to agents, queues, or AI voice flows.", icon: PhoneIncoming, variant: "success" },
  { title: "Outbound Call API", description: "Trigger outbound calls from leads, workflows, and campaigns.", icon: PhoneForwarded, variant: "info" },
  { title: "Webhook URL", description: "Receive call events, recordings, transcripts, and dispositions.", icon: Webhook, variant: "neutral" },
  { title: "Call Recording", description: "Store call recordings with secure access and CRM linking.", icon: PlayCircle, variant: "warning" },
  { title: "Transcript", description: "Generate searchable transcripts and AI summaries per call.", icon: FileText, variant: "success" },
];

const insights: PanelItem[] = [
  { title: "Best call time", description: "Highest answer rate is 4:00 PM to 6:30 PM for hot leads.", icon: Timer, variant: "success" },
  { title: "Missed call follow-ups", description: "128 missed calls need automated callback tasks today.", icon: PhoneMissed, variant: "warning" },
  { title: "Leads qualified by AI", description: "342 calls qualified with budget, timeline, and requirement captured.", icon: Bot, variant: "info" },
  { title: "Failed call reasons", description: "Most failures are provider timeout and invalid number formatting.", icon: AlertTriangle, variant: "danger" },
];

const providers = [
  { name: "Twilio", status: "Connected", latency: "210ms", variant: "success" as const },
  { name: "Exotel", status: "Standby", latency: "260ms", variant: "info" as const },
  { name: "Plivo", status: "Not connected", latency: "N/A", variant: "neutral" as const },
  { name: "ElevenLabs Voice", status: "Operational", latency: "310ms", variant: "success" as const },
];

const statusVariant: Record<CallStatus, BadgeVariant> = {
  Answered: "success",
  Missed: "warning",
  Failed: "danger",
  Voicemail: "neutral",
  "AI Qualified": "info",
};

const typeVariant: Record<CallType, BadgeVariant> = {
  Inbound: "success",
  Outbound: "info",
  "AI Voice": "neutral",
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

function PanelCard({ item }: { item: PanelItem }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{item.title}</h3>
            <Badge variant={item.variant}>Voice</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function CallingModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Voice" title="Calling & Voice API" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Voice operations center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Calling & Voice API
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Manage inbound and outbound calls, recordings, transcripts, voice providers,
                AI qualification, and programmable call APIs from one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>
                <PhoneCall className="h-4 w-4" />
                Start Call
              </Button>
              <Button variant="outline">
                <ShieldCheck className="h-4 w-4" />
                Connect Provider
              </Button>
              <Button variant="outline">
                <Code2 className="h-4 w-4" />
                View API Docs
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Call Logs
              </Button>
            </div>
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
                  <CardTitle>Call Filters</CardTitle>
                  <CardDescription>Search and segment call logs by type, status, and agent.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search call/contact">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Contact, phone, summary..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Call type filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All call types</option>
                    <option>Inbound</option>
                    <option>Outbound</option>
                    <option>AI Voice</option>
                  </select>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>Answered</option>
                    <option>Missed</option>
                    <option>Failed</option>
                    <option>Voicemail</option>
                    <option>AI Qualified</option>
                  </select>
                </FilterControl>

                <FilterControl label="Agent filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All agents</option>
                    <option>AI Voice Agent</option>
                    <option>Rahul Mehta</option>
                    <option>Meera Jain</option>
                    <option>Support Queue</option>
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
                    <CardTitle>Call Logs</CardTitle>
                    <CardDescription>Call history with outcomes, summaries, recordings, and ownership.</CardDescription>
                  </div>
                  <Badge variant="neutral">{callLogs.length} calls</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Contact</th>
                          <th className="pb-3 font-semibold">Phone</th>
                          <th className="pb-3 font-semibold">Type</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Duration</th>
                          <th className="pb-3 font-semibold">Agent</th>
                          <th className="pb-3 font-semibold">AI Summary</th>
                          <th className="pb-3 font-semibold">Recording</th>
                          <th className="pb-3 font-semibold">Time</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {callLogs.map((call) => (
                          <tr key={call.id} className="align-top">
                            <td className="py-4">
                              <p className="font-semibold text-white">{call.contact}</p>
                              <p className="mt-1 text-xs text-slate-500">{call.id}</p>
                            </td>
                            <td className="py-4 text-slate-300">{call.phone}</td>
                            <td className="py-4">
                              <Badge variant={typeVariant[call.type]}>{call.type}</Badge>
                            </td>
                            <td className="py-4">
                              <Badge variant={statusVariant[call.status]}>{call.status}</Badge>
                            </td>
                            <td className="py-4 text-slate-300">{call.duration}</td>
                            <td className="py-4 text-slate-300">{call.agent}</td>
                            <td className="max-w-72 py-4 text-slate-400">{call.aiSummary}</td>
                            <td className="py-4">
                              <Badge variant={call.recording === "Available" ? "success" : "neutral"}>
                                {call.recording}
                              </Badge>
                            </td>
                            <td className="py-4 text-slate-400">{call.time}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${call.contact} call actions`}>
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
                      <Webhook className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Voice API Panel</CardTitle>
                      <CardDescription>Programmable voice capabilities for CRM and AI workflows.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {voiceApiItems.map((item) => (
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
                      <CardTitle>AI Call Insights</CardTitle>
                      <CardDescription>Revenue and reliability recommendations from call data.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((item) => (
                    <PanelCard key={item.title} item={item} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Radio className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Provider Status</CardTitle>
                      <CardDescription>Voice and AI provider connectivity.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {providers.map((provider) => (
                    <div key={provider.name} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{provider.name}</p>
                          <p className="mt-1 text-xs text-slate-500">Latency: {provider.latency}</p>
                        </div>
                        <Badge variant={provider.variant}>{provider.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
