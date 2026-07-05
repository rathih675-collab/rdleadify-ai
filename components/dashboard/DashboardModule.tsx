"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Gauge,
  Link2,
  MessageCircle,
  PhoneCall,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
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
  title: string;
  value: string;
  change: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

export type WidgetDashboardMetrics = {
  leads: number;
  conversations: number;
  appointments: number;
  sheetSyncs: number;
  aiChats: number;
  websiteConversations: number;
  widgetLeads: number;
};

type HealthItem = {
  name: string;
  status: string;
  health: number;
  variant: BadgeVariant;
};

const tooltipStyle = {
  background: "#0b1628",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
};

const revenueData = [
  { month: "Jan", revenue: 324000, forecast: 342000 },
  { month: "Feb", revenue: 368000, forecast: 381000 },
  { month: "Mar", revenue: 412000, forecast: 430000 },
  { month: "Apr", revenue: 456000, forecast: 472000 },
  { month: "May", revenue: 498000, forecast: 516000 },
  { month: "Jun", revenue: 552000, forecast: 571000 },
  { month: "Jul", revenue: 618000, forecast: 650000 },
];

const leadData = [
  { day: "Mon", captured: 42, qualified: 18, converted: 12 },
  { day: "Tue", captured: 58, qualified: 26, converted: 18 },
  { day: "Wed", captured: 49, qualified: 23, converted: 15 },
  { day: "Thu", captured: 72, qualified: 37, converted: 26 },
  { day: "Fri", captured: 81, qualified: 43, converted: 31 },
  { day: "Sat", captured: 64, qualified: 33, converted: 22 },
  { day: "Sun", captured: 93, qualified: 52, converted: 38 },
];

const funnelData = [
  { name: "Captured", value: 12480, fill: "#10b981" },
  { name: "Qualified", value: 7380, fill: "#38bdf8" },
  { name: "Demo Booked", value: 2920, fill: "#a78bfa" },
  { name: "Proposal", value: 1180, fill: "#f59e0b" },
  { name: "Won", value: 486, fill: "#22c55e" },
];

const recentLeads = [
  { name: "Aarav Sharma", company: "Nova Estates", source: "WhatsApp", score: 96, owner: "Priya", stage: "Hot" },
  { name: "Maya Iyer", company: "CloudNine Realty", source: "Website", score: 91, owner: "Rahul", stage: "Qualified" },
  { name: "Kabir Mehta", company: "Vertex Homes", source: "Ads", score: 84, owner: "Anika", stage: "Nurture" },
  { name: "Sofia Khan", company: "MetroBuild", source: "Referral", score: 78, owner: "Dev", stage: "Contacted" },
  { name: "Rohan Das", company: "UrbanLotus", source: "Campaign", score: 72, owner: "Meera", stage: "New" },
];

const recentCalls = [
  { contact: "Maya Iyer", outcome: "Demo booked", duration: "08:42", agent: "AI Voice Agent", variant: "success" },
  { contact: "Rohan Das", outcome: "Follow-up needed", duration: "04:11", agent: "Nisha", variant: "warning" },
  { contact: "Sofia Khan", outcome: "Budget confirmed", duration: "06:29", agent: "AI Voice Agent", variant: "success" },
] satisfies Array<{
  contact: string;
  outcome: string;
  duration: string;
  agent: string;
  variant: BadgeVariant;
}>;

const appointments = [
  { time: "10:30 AM", title: "Enterprise demo", account: "Nova Estates", owner: "Priya" },
  { time: "01:00 PM", title: "Pricing review", account: "MetroBuild", owner: "Dev" },
  { time: "04:15 PM", title: "Site visit follow-up", account: "UrbanLotus", owner: "Meera" },
];

const teamActivity = [
  "Priya moved Nova Estates to Proposal",
  "AI Agent qualified 31 leads in the last hour",
  "Rahul created a drip sequence for Website leads",
  "Meera resolved 12 overdue follow-ups",
];

const notifications = [
  { title: "High intent spike", detail: "Ads campaign generated 42 hot leads", variant: "success" },
  { title: "SLA risk", detail: "8 WhatsApp replies waiting over 15 minutes", variant: "warning" },
  { title: "Integration sync", detail: "Google Calendar sync completed", variant: "info" },
] satisfies Array<{ title: string; detail: string; variant: BadgeVariant }>;

const integrations: HealthItem[] = [
  { name: "WhatsApp Cloud API", status: "Operational", health: 99.9, variant: "success" },
  { name: "Google Calendar", status: "Operational", health: 99.6, variant: "success" },
  { name: "ElevenLabs Voice", status: "Degraded", health: 93.4, variant: "warning" },
  { name: "Meta Ads", status: "Operational", health: 98.7, variant: "success" },
];

const apiHealth: HealthItem[] = [
  { name: "CRM API", status: "Operational", health: 99.98, variant: "success" },
  { name: "Automation API", status: "Operational", health: 99.91, variant: "success" },
  { name: "Webhook Queue", status: "Operational", health: 99.7, variant: "success" },
  { name: "AI Gateway", status: "Monitoring", health: 94.3, variant: "warning" },
];

const quickActions = [
  "Add Lead",
  "Create Campaign",
  "Book Appointment",
  "Start AI Call",
  "Create Automation",
  "Invite Team Member",
];

function MetricCard({ metric }: { metric: Kpi }) {
  const Icon = metric.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant={metric.variant}>
            <ArrowUpRight className="h-3 w-3" />
            {metric.change}
          </Badge>
        </div>
        <p className="mt-5 text-sm text-slate-400">{metric.title}</p>
        <h3 className="mt-1 text-3xl font-bold tracking-tight text-white">{metric.value}</h3>
        <p className="mt-2 text-sm text-slate-500">{metric.helper}</p>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <CardHeader>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </div>
    </CardHeader>
  );
}

function HealthRow({ name, status, health, variant }: HealthItem) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="mt-1 text-xs text-slate-500">{health}% uptime</p>
        </div>
        <Badge variant={variant}>{status}</Badge>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full",
            variant === "warning" ? "bg-amber-400" : "bg-emerald-400",
          )}
          style={{ width: `${health}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardModule({ widgetMetrics }: { widgetMetrics?: WidgetDashboardMetrics }) {
  const realKpis: Kpi[] = [
    {
      title: "Leads",
      value: String(widgetMetrics?.leads ?? 0),
      change: "Live",
      helper: "Total CRM leads",
      icon: Users,
      variant: "success",
    },
    {
      title: "Conversations",
      value: String(widgetMetrics?.conversations ?? 0),
      change: "Live",
      helper: "Inbox conversations",
      icon: MessageCircle,
      variant: "info",
    },
    {
      title: "Appointments",
      value: String(widgetMetrics?.appointments ?? 0),
      change: "Live",
      helper: "Calendar booking logs",
      icon: CalendarDays,
      variant: "success",
    },
    {
      title: "Sheet Syncs",
      value: String(widgetMetrics?.sheetSyncs ?? 0),
      change: "Live",
      helper: "Google Sheet sync logs",
      icon: PlugZap,
      variant: "info",
    },
    {
      title: "AI Chats",
      value: String(widgetMetrics?.aiChats ?? 0),
      change: "Live",
      helper: "AI chat/voice logs",
      icon: Bot,
      variant: "info",
    },
    {
      title: "Website Conversations",
      value: String(widgetMetrics?.websiteConversations ?? 0),
      change: "Live",
      helper: "Widget conversations in Inbox",
      icon: MessageCircle,
      variant: "info",
    },
    {
      title: "Widget Leads",
      value: String(widgetMetrics?.widgetLeads ?? 0),
      change: "CRM",
      helper: "Source: Website Widget",
      icon: Users,
      variant: "success",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Dashboard" title="Revenue Command Center" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Enterprise CRM Dashboard</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                RDLeadify AI growth workspace
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Monitor revenue, lead flow, AI operations, communication health,
                appointments, integrations, and team execution from one command center.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <ShieldCheck className="h-4 w-4" />
                API Healthy
              </Button>
              <Button>
                <Zap className="h-4 w-4" />
                Quick Create
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {realKpis.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-7">
              <SectionHeader
                icon={DollarSign}
                title="Revenue Analytics"
                description="Actual revenue versus AI-assisted forecast."
              />
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis
                        stroke="#94a3b8"
                        tickFormatter={(value) => `$${Number(value) / 1000}k`}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="forecast" stroke="#38bdf8" fill="#38bdf833" />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98133" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-5">
              <SectionHeader
                icon={Target}
                title="Leads Analytics"
                description="Captured, qualified, and converted lead velocity."
              />
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="captured" stroke="#10b981" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="qualified" stroke="#38bdf8" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="converted" stroke="#a78bfa" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-4">
              <SectionHeader
                icon={Gauge}
                title="Pipeline Funnel"
                description="Stage conversion across active opportunities."
              />
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Funnel dataKey="value" data={funnelData} nameKey="name" isAnimationActive>
                        {funnelData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/10 xl:col-span-4">
              <SectionHeader
                icon={Bot}
                title="AI Business Report"
                description="Generated from live sales, campaign, and conversation signals."
              />
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-300">
                  WhatsApp leads are converting 31% better than call-first leads today.
                  There are 27 hot leads requiring follow-up before 6 PM, and the Demo
                  Offer campaign is outperforming the seven-day baseline by 18%.
                </p>
                <div className="rounded-xl bg-black/20 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Recommended action</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Assign the top 10 hot leads to senior agents and trigger a reminder
                    sequence for all uncontacted leads with scores above 85.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-4">
              <SectionHeader
                icon={Sparkles}
                title="AI Insights"
                description="Prioritized recommendations for revenue teams."
              />
              <CardContent className="space-y-3">
                {[
                  "Increase WhatsApp retargeting budget by 12% for high-intent segments.",
                  "Move budget review calls before demos for enterprise accounts.",
                  "Route weekend form leads to AI Agent within 90 seconds.",
                ].map((insight) => (
                  <div
                    key={insight}
                    className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-slate-300"
                  >
                    {insight}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <SectionHeader
                icon={MessageCircle}
                title="WhatsApp Status"
                description="Conversation automation health."
              />
              <CardContent className="space-y-4">
                <HealthRow name="Message delivery" status="Operational" health={99.4} variant="success" />
                <HealthRow name="Template approval" status="Operational" health={98.8} variant="success" />
                <HealthRow name="Reply SLA" status="At risk" health={91.2} variant="warning" />
              </CardContent>
            </Card>

            <Card>
              <SectionHeader
                icon={Bot}
                title="AI Agent Status"
                description="Voice and qualification performance."
              />
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Answered", value: 84 },
                        { name: "Qualified", value: 62 },
                        { name: "Booked", value: 38 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <SectionHeader
                icon={CalendarDays}
                title="Calendar Widget"
                description="Today in revenue operations."
              />
              <CardContent className="space-y-3">
                {appointments.map((item) => (
                  <div key={`${item.time}-${item.title}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <Badge variant="info">{item.time}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.account} with {item.owner}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <Card className="2xl:col-span-8">
              <SectionHeader
                icon={Users}
                title="Recent Leads Table"
                description="High-signal lead records ready for API-backed pagination and filtering."
              />
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="pb-3 font-semibold">Lead</th>
                        <th className="pb-3 font-semibold">Source</th>
                        <th className="pb-3 font-semibold">Score</th>
                        <th className="pb-3 font-semibold">Owner</th>
                        <th className="pb-3 text-right font-semibold">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {recentLeads.map((lead) => (
                        <tr key={`${lead.name}-${lead.company}`}>
                          <td className="py-4">
                            <p className="font-semibold text-white">{lead.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{lead.company}</p>
                          </td>
                          <td className="py-4 text-slate-300">{lead.source}</td>
                          <td className="py-4">
                            <Badge variant={lead.score > 85 ? "success" : "info"}>{lead.score}</Badge>
                          </td>
                          <td className="py-4 text-slate-300">{lead.owner}</td>
                          <td className="py-4 text-right">
                            <Badge variant={lead.stage === "Hot" ? "success" : "neutral"}>
                              {lead.stage}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="2xl:col-span-4">
              <SectionHeader
                icon={PhoneCall}
                title="Recent Calls"
                description="Latest sales and AI call outcomes."
              />
              <CardContent className="space-y-3">
                {recentCalls.map((call) => (
                  <div key={`${call.contact}-${call.duration}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{call.contact}</p>
                      <Badge variant={call.variant}>{call.duration}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{call.outcome}</p>
                    <p className="mt-1 text-xs text-slate-500">{call.agent}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-4">
            <Card>
              <SectionHeader icon={Clock3} title="Recent Appointments" />
              <CardContent className="space-y-3">
                {appointments.map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-xl bg-black/10 p-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.account}</p>
                    </div>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <SectionHeader icon={Activity} title="Team Activity" />
              <CardContent className="space-y-3">
                {teamActivity.map((item) => (
                  <div key={item} className="rounded-xl bg-black/10 p-3 text-sm leading-6 text-slate-300">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <SectionHeader icon={AlertTriangle} title="Notifications" />
              <CardContent className="space-y-3">
                {notifications.map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-black/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <Badge variant={item.variant}>{item.variant}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <SectionHeader icon={Zap} title="Quick Actions" />
              <CardContent className="grid gap-2">
                {quickActions.map((action) => (
                  <Button key={action} variant="outline" className="justify-start">
                    <CheckCircle2 className="h-4 w-4" />
                    {action}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <SectionHeader
                icon={ShieldCheck}
                title="API Health"
                description="Backend-ready service observability."
              />
              <CardContent className="grid gap-4 md:grid-cols-2">
                {apiHealth.map((item) => (
                  <HealthRow key={item.name} {...item} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <SectionHeader
                icon={PlugZap}
                title="Integration Status"
                description="Connected systems and sync reliability."
              />
              <CardContent className="grid gap-4 md:grid-cols-2">
                {integrations.map((item) => (
                  <HealthRow key={item.name} {...item} />
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                  <Link2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">Backend integration contract</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Dashboard data is isolated in typed collections and reusable sections
                    so API responses can replace mock data without changing layout code.
                  </p>
                </div>
              </div>
              <Button variant="secondary">View data map</Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
