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
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  Filter,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  PhoneCall,
  RefreshCw,
  Sparkles,
  Table2,
  Target,
  TrendingUp,
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

type ReportSection = {
  title: string;
  description: string;
  metric: string;
  trend: string;
  icon: LucideIcon;
};

type ReportRecord = {
  name: string;
  category: string;
  dateRange: string;
  generatedBy: string;
  status: "Ready" | "Scheduled" | "Processing" | "Needs Review";
  lastGenerated: string;
};

const tooltipStyle = {
  background: "#0b1628",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
};

const kpis: Kpi[] = [
  {
    title: "Total Revenue",
    value: "$2.48M",
    change: "+18.4%",
    helper: "Closed revenue across all teams",
    icon: DollarSign,
    variant: "success",
  },
  {
    title: "Lead Conversion Rate",
    value: "31.8%",
    change: "+4.2%",
    helper: "Lead to customer conversion",
    icon: Target,
    variant: "info",
  },
  {
    title: "Campaign ROI",
    value: "6.7x",
    change: "+1.1x",
    helper: "Weighted marketing return",
    icon: Megaphone,
    variant: "success",
  },
  {
    title: "AI Performance Score",
    value: "94/100",
    change: "+7 pts",
    helper: "Automation quality and coverage",
    icon: Bot,
    variant: "warning",
  },
];

const filters = [
  { label: "Date range", value: "Last 30 days" },
  { label: "Team member", value: "All revenue teams" },
  { label: "Channel", value: "All channels" },
  { label: "Campaign", value: "All campaigns" },
  { label: "Lead source", value: "All lead sources" },
];

const reportSections: ReportSection[] = [
  {
    title: "Sales Report",
    description: "Revenue, win rate, average deal size, and sales cycle trends.",
    metric: "$812K",
    trend: "+16.2%",
    icon: DollarSign,
  },
  {
    title: "Lead Report",
    description: "Source quality, lead velocity, qualification, and conversion.",
    metric: "8,492",
    trend: "+11.5%",
    icon: Target,
  },
  {
    title: "Campaign Report",
    description: "Campaign delivery, response, cost, ROI, and attribution.",
    metric: "6.7x ROI",
    trend: "+1.1x",
    icon: Megaphone,
  },
  {
    title: "WhatsApp Report",
    description: "Reply rates, template performance, broadcasts, and inbox SLA.",
    metric: "48.2%",
    trend: "+8.4%",
    icon: MessageCircle,
  },
  {
    title: "Call Report",
    description: "Connect rates, missed calls, AI summaries, and qualification.",
    metric: "72.6%",
    trend: "+5.6%",
    icon: PhoneCall,
  },
  {
    title: "AI Agent Report",
    description: "AI call, chat, and task automation impact across the funnel.",
    metric: "94/100",
    trend: "+7 pts",
    icon: Bot,
  },
  {
    title: "Team Report",
    description: "Agent activity, response time, conversion, and workload balance.",
    metric: "88%",
    trend: "+6.9%",
    icon: Users,
  },
  {
    title: "Automation Report",
    description: "Workflow runs, success rate, failures, and automation savings.",
    metric: "97.4%",
    trend: "+2.5%",
    icon: Zap,
  },
  {
    title: "Revenue Report",
    description: "Forecast, recurring revenue, pipeline risk, and opportunity gaps.",
    metric: "$3.1M",
    trend: "+21.3%",
    icon: TrendingUp,
  },
];

const revenueTrend = [
  { month: "Jan", revenue: 280, forecast: 310 },
  { month: "Feb", revenue: 330, forecast: 350 },
  { month: "Mar", revenue: 390, forecast: 405 },
  { month: "Apr", revenue: 460, forecast: 475 },
  { month: "May", revenue: 520, forecast: 545 },
  { month: "Jun", revenue: 610, forecast: 640 },
];

const leadConversionTrend = [
  { week: "W1", leads: 920, conversions: 242 },
  { week: "W2", leads: 1080, conversions: 318 },
  { week: "W3", leads: 1130, conversions: 365 },
  { week: "W4", leads: 1240, conversions: 394 },
];

const campaignPerformance = [
  { name: "WhatsApp", sent: 14800, replies: 6120, conversions: 1320 },
  { name: "Email", sent: 9200, replies: 2140, conversions: 560 },
  { name: "SMS", sent: 5400, replies: 1180, conversions: 310 },
  { name: "AI", sent: 3300, replies: 1760, conversions: 620 },
];

const whatsappReplyRate = [
  { day: "Mon", rate: 41 },
  { day: "Tue", rate: 44 },
  { day: "Wed", rate: 48 },
  { day: "Thu", rate: 52 },
  { day: "Fri", rate: 49 },
  { day: "Sat", rate: 45 },
  { day: "Sun", rate: 39 },
];

const callSuccessRate = [
  { agent: "Priya", answered: 64, qualified: 28, missed: 8 },
  { agent: "Arjun", answered: 58, qualified: 24, missed: 11 },
  { agent: "Meera", answered: 72, qualified: 33, missed: 6 },
  { agent: "Kabir", answered: 51, qualified: 19, missed: 13 },
];

const teamPerformance = [
  { name: "North", revenue: 420, meetings: 86, conversions: 34 },
  { name: "West", revenue: 380, meetings: 79, conversions: 31 },
  { name: "South", revenue: 312, meetings: 68, conversions: 25 },
  { name: "Enterprise", revenue: 690, meetings: 102, conversions: 49 },
];

const pipelineFunnel = [
  { name: "New Leads", value: 4200, fill: "#38bdf8" },
  { name: "Qualified", value: 2380, fill: "#22c55e" },
  { name: "Demo Booked", value: 1120, fill: "#f59e0b" },
  { name: "Negotiation", value: 540, fill: "#a78bfa" },
  { name: "Won", value: 318, fill: "#14b8a6" },
];

const aiReportItems = [
  {
    title: "Daily business summary",
    detail:
      "Revenue is pacing 12% above target, with enterprise deals contributing the strongest lift.",
    variant: "success" as BadgeVariant,
  },
  {
    title: "Top performing channel",
    detail:
      "WhatsApp campaigns generated 42% of replies and the highest booked-demo rate this week.",
    variant: "info" as BadgeVariant,
  },
  {
    title: "Leads at risk",
    detail:
      "183 high-fit leads have not received a touchpoint in the last 72 hours.",
    variant: "warning" as BadgeVariant,
  },
  {
    title: "Missed follow-ups",
    detail:
      "27 overdue follow-ups are linked to open deals above $10K in pipeline value.",
    variant: "danger" as BadgeVariant,
  },
  {
    title: "Revenue opportunity",
    detail:
      "AI detected $142K in likely-close opportunities if demos are scheduled this week.",
    variant: "success" as BadgeVariant,
  },
  {
    title: "Recommended actions",
    detail:
      "Prioritize WhatsApp nudges, reassign delayed callbacks, and refresh two low-reply templates.",
    variant: "info" as BadgeVariant,
  },
];

const reports: ReportRecord[] = [
  {
    name: "Executive Revenue Snapshot",
    category: "Revenue Report",
    dateRange: "Jun 1 - Jun 30, 2026",
    generatedBy: "AI Analyst",
    status: "Ready",
    lastGenerated: "Today, 9:14 AM",
  },
  {
    name: "Campaign ROI Deep Dive",
    category: "Campaign Report",
    dateRange: "Last 30 days",
    generatedBy: "Nisha Verma",
    status: "Scheduled",
    lastGenerated: "Yesterday, 6:30 PM",
  },
  {
    name: "Team Conversion Scorecard",
    category: "Team Report",
    dateRange: "Q2 2026",
    generatedBy: "Rahul Mehta",
    status: "Ready",
    lastGenerated: "Jul 1, 2026",
  },
  {
    name: "AI Agent Quality Review",
    category: "AI Agent Report",
    dateRange: "Last 7 days",
    generatedBy: "AI Analyst",
    status: "Processing",
    lastGenerated: "In progress",
  },
  {
    name: "WhatsApp Reply Audit",
    category: "WhatsApp Report",
    dateRange: "May 2026",
    generatedBy: "Sana Khan",
    status: "Needs Review",
    lastGenerated: "Jun 29, 2026",
  },
];

const statusVariant: Record<ReportRecord["status"], BadgeVariant> = {
  Ready: "success",
  Scheduled: "info",
  Processing: "warning",
  "Needs Review": "danger",
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{kpi.title}</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-3xl font-semibold tracking-tight text-white">
                {kpi.value}
              </p>
              <Badge variant={kpi.variant}>{kpi.change}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">{kpi.helper}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-cyan-200">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterControl({ label, value }: { label: string; value: string }) {
  return (
    <button className="flex min-h-16 w-full flex-col items-start justify-center rounded-xl border border-white/10 bg-slate-950/50 px-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="mt-1 text-sm font-medium text-slate-200">{value}</span>
    </button>
  );
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-white/10 bg-white/[0.04]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">{children}</div>
      </CardContent>
    </Card>
  );
}

function ReportSectionCard({ section }: { section: ReportSection }) {
  const Icon = section.icon;

  return (
    <Card className="border-white/10 bg-slate-950/50 transition hover:border-cyan-400/50 hover:bg-cyan-400/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-cyan-200">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="success">{section.trend}</Badge>
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">
          {section.title}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
          {section.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Primary metric
          </span>
          <span className="text-sm font-semibold text-white">
            {section.metric}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Analytics" title="Reports & Analytics" />

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge variant="info">Executive analytics suite</Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Reports & Analytics
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                  Unified reporting for revenue, leads, campaigns, WhatsApp,
                  calls, AI agents, teams, automations, and executive decisions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Report
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Schedule Report
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.title} kpi={kpi} />
            ))}
          </section>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Report Filters
                  </h2>
                  <p className="text-sm text-slate-400">
                    Segment analytics by date, owner, channel, campaign, and
                    lead source.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {filters.map((filter) => (
                  <FilterControl key={filter.label} {...filter} />
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportSections.map((section) => (
              <ReportSectionCard key={section.title} section={section} />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Revenue Trend"
              description="Actual revenue compared with AI forecast."
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    dataKey="revenue"
                    fill="url(#revenueFill)"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Line
                    dataKey="forecast"
                    dot={false}
                    stroke="#a78bfa"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Lead Conversion Trend"
              description="Lead intake and qualified conversions by week."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadConversionTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="week" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    dataKey="leads"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Line
                    dataKey="conversions"
                    stroke="#22c55e"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Campaign Performance"
              description="Sent volume, replies, and conversions by channel."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="sent" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="replies" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="conversions"
                    fill="#f59e0b"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="WhatsApp Reply Rate"
              description="Daily reply rate across inbox and broadcasts."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={whatsappReplyRate}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    dataKey="rate"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Call Success Rate"
              description="Answered, qualified, and missed call outcomes by agent."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callSuccessRate}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="agent" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="answered" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="qualified" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="missed" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Team Performance"
              description="Revenue, meetings, and conversions by team."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformance}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="meetings" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="conversions"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              className="xl:col-span-2"
              title="Pipeline Funnel"
              description="Lead progression from new lead to won customer."
            >
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Funnel
                    data={pipelineFunnel}
                    dataKey="value"
                    isAnimationActive
                    nameKey="name"
                  >
                    {pipelineFunnel.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-cyan-400/20 bg-cyan-400/[0.05]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-cyan-200" />
                      AI Report
                    </CardTitle>
                    <CardDescription>
                      AI-generated business summary and recommended actions.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {aiReportItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                      <Badge variant={item.variant}>AI</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="text-white">Analytics Health</CardTitle>
                <CardDescription>
                  Data freshness and reporting readiness across business systems.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["CRM Sync", "Live", 98, "success"],
                  ["Campaign Attribution", "Stable", 92, "success"],
                  ["AI Report Engine", "Queued", 84, "warning"],
                  ["Call Transcripts", "Review", 76, "info"],
                ].map(([name, status, value, variant]) => (
                  <div key={name} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">{name}</span>
                      <Badge variant={variant as BadgeVariant}>{status}</Badge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Table2 className="h-5 w-5 text-cyan-200" />
                    Report Library
                  </CardTitle>
                  <CardDescription>
                    Saved and scheduled reports ready for export, automation, or
                    executive review.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View all reports
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Report Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date Range</th>
                      <th className="px-4 py-3">Generated By</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Generated</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {reports.map((report) => (
                      <tr key={report.name} className="text-slate-300">
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{report.name}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Export-ready report template
                          </div>
                        </td>
                        <td className="px-4 py-4">{report.category}</td>
                        <td className="px-4 py-4">{report.dateRange}</td>
                        <td className="px-4 py-4">{report.generatedBy}</td>
                        <td className="px-4 py-4">
                          <Badge variant={statusVariant[report.status]}>
                            {report.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">{report.lastGenerated}</td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="icon" aria-label={`Open ${report.name}`}>
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

          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: CheckCircle2,
                title: "Scheduled Delivery",
                copy: "Send recurring board, sales, and campaign reports to teams automatically.",
              },
              {
                icon: BarChart3,
                title: "Custom Dashboards",
                copy: "Compose role-specific analytics views from reusable reporting blocks.",
              },
              {
                icon: Download,
                title: "Export Controls",
                copy: "Prepare CSV, PDF, and BI-ready exports with future permission policies.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="border-white/10 bg-white/[0.04]">
                  <CardContent className="p-5">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.copy}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
