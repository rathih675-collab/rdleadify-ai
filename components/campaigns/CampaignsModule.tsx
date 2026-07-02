"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  Mail,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Target,
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
type CampaignStatus = "Draft" | "Scheduled" | "Running" | "Completed" | "Failed";
type CampaignChannel = "WhatsApp" | "Email" | "SMS" | "AI";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type Campaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  audience: string;
  status: CampaignStatus;
  sent: string;
  delivered: string;
  replies: string;
  conversion: string;
  owner: string;
};

type Suggestion = {
  title: string;
  icon: LucideIcon;
  variant: BadgeVariant;
  detail: string;
};

const kpis: Kpi[] = [
  {
    label: "Total Campaigns",
    value: "428",
    trend: "+18.4%",
    helper: "All campaign assets and sends",
    icon: Megaphone,
    variant: "success",
  },
  {
    label: "Active Campaigns",
    value: "34",
    trend: "+8 live",
    helper: "Running or scheduled today",
    icon: Zap,
    variant: "info",
  },
  {
    label: "Messages Sent",
    value: "248.6K",
    trend: "98.2% delivered",
    helper: "Across WhatsApp, email and SMS",
    icon: Send,
    variant: "success",
  },
  {
    label: "Conversion Rate",
    value: "12.8%",
    trend: "+3.1%",
    helper: "Campaign-attributed conversion",
    icon: Target,
    variant: "warning",
  },
];

const campaigns: Campaign[] = [
  {
    id: "camp-801",
    name: "Demo Offer - Hot Leads",
    channel: "WhatsApp",
    audience: "Hot Lead Segment",
    status: "Running",
    sent: "18,420",
    delivered: "18,102",
    replies: "4,812",
    conversion: "18.6%",
    owner: "Growth Team",
  },
  {
    id: "camp-802",
    name: "Enterprise Pricing Nurture",
    channel: "Email",
    audience: "Enterprise Buyers",
    status: "Scheduled",
    sent: "9,200",
    delivered: "9,041",
    replies: "842",
    conversion: "9.4%",
    owner: "Rahul Mehta",
  },
  {
    id: "camp-803",
    name: "No Reply Reactivation",
    channel: "SMS",
    audience: "Idle Leads",
    status: "Completed",
    sent: "14,880",
    delivered: "14,102",
    replies: "1,240",
    conversion: "6.8%",
    owner: "Revenue Ops",
  },
  {
    id: "camp-804",
    name: "AI Qualification Sprint",
    channel: "AI",
    audience: "Website Leads",
    status: "Running",
    sent: "4,320",
    delivered: "4,210",
    replies: "1,480",
    conversion: "21.2%",
    owner: "AI Agent",
  },
  {
    id: "camp-805",
    name: "Broker Partner Update",
    channel: "WhatsApp",
    audience: "Partner Contacts",
    status: "Draft",
    sent: "0",
    delivered: "0",
    replies: "0",
    conversion: "0%",
    owner: "Dev Shah",
  },
  {
    id: "camp-806",
    name: "Inactive Lead Recovery",
    channel: "Email",
    audience: "Dormant Leads",
    status: "Failed",
    sent: "6,140",
    delivered: "4,980",
    replies: "112",
    conversion: "1.2%",
    owner: "Meera Jain",
  },
];

const performanceData = [
  { day: "Mon", sent: 12400, replies: 2840, conversions: 420 },
  { day: "Tue", sent: 15200, replies: 3620, conversions: 516 },
  { day: "Wed", sent: 13800, replies: 3180, conversions: 486 },
  { day: "Thu", sent: 18600, replies: 4720, conversions: 690 },
  { day: "Fri", sent: 20400, replies: 5240, conversions: 812 },
  { day: "Sat", sent: 16800, replies: 3920, conversions: 528 },
  { day: "Sun", sent: 14200, replies: 3360, conversions: 448 },
];

const suggestions: Suggestion[] = [
  {
    title: "Best sending time",
    icon: CalendarDays,
    variant: "success",
    detail: "WhatsApp campaigns perform best between 4:00 PM and 6:30 PM for hot leads.",
  },
  {
    title: "Low reply campaign",
    icon: Sparkles,
    variant: "warning",
    detail: "Inactive Lead Recovery has a 1.8% reply rate. Refresh the subject and first message.",
  },
  {
    title: "Template improvement",
    icon: Bot,
    variant: "info",
    detail: "Add price range and demo CTA to the Enterprise Pricing Nurture template.",
  },
];

const quickActions = [
  { label: "WhatsApp Campaign", icon: MessageCircle },
  { label: "Email Campaign", icon: Mail },
  { label: "SMS Campaign", icon: Phone },
  { label: "AI Campaign", icon: Bot },
];

const statusVariant: Record<CampaignStatus, BadgeVariant> = {
  Draft: "neutral",
  Scheduled: "info",
  Running: "success",
  Completed: "success",
  Failed: "danger",
};

const channelVariant: Record<CampaignChannel, BadgeVariant> = {
  WhatsApp: "success",
  Email: "info",
  SMS: "warning",
  AI: "neutral",
};

const tooltipStyle = {
  background: "#0b1628",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#fff",
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

export default function CampaignsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Marketing" title="Campaigns" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Campaign command center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Campaigns
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Plan, launch, monitor, and optimize WhatsApp, email, SMS, and
                AI-assisted outreach campaigns from one enterprise workspace.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Campaign
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
                  <CardTitle>Campaign Filters</CardTitle>
                  <CardDescription>
                    Segment campaign performance by channel, status, and send date.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search campaign">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Campaign, audience, owner..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Channel filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All channels</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>AI</option>
                  </select>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>Draft</option>
                    <option>Scheduled</option>
                    <option>Running</option>
                    <option>Completed</option>
                    <option>Failed</option>
                  </select>
                </FilterControl>

                <FilterControl label="Date filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>This quarter</option>
                    <option>Custom range</option>
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
                    <CardTitle>Campaign Performance</CardTitle>
                    <CardDescription>
                      Sent volume, replies, and attributed conversions over the last week.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="sent" stroke="#10b981" fill="#10b98133" />
                        <Area type="monotone" dataKey="replies" stroke="#38bdf8" fill="#38bdf833" />
                        <Area type="monotone" dataKey="conversions" stroke="#a78bfa" fill="#a78bfa33" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Campaign Table</CardTitle>
                    <CardDescription>
                      Multi-channel campaign list with delivery, replies, conversion, and ownership.
                    </CardDescription>
                  </div>
                  <Badge variant="neutral">{campaigns.length} campaigns</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Campaign Name</th>
                          <th className="pb-3 font-semibold">Channel</th>
                          <th className="pb-3 font-semibold">Audience</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Sent</th>
                          <th className="pb-3 font-semibold">Delivered</th>
                          <th className="pb-3 font-semibold">Replies</th>
                          <th className="pb-3 font-semibold">Conversion</th>
                          <th className="pb-3 font-semibold">Owner</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="align-top">
                            <td className="py-4">
                              <p className="font-semibold text-white">{campaign.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{campaign.id}</p>
                            </td>
                            <td className="py-4">
                              <Badge variant={channelVariant[campaign.channel]}>{campaign.channel}</Badge>
                            </td>
                            <td className="py-4 text-slate-300">{campaign.audience}</td>
                            <td className="py-4">
                              <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
                            </td>
                            <td className="py-4 text-slate-300">{campaign.sent}</td>
                            <td className="py-4 text-slate-300">{campaign.delivered}</td>
                            <td className="py-4 text-slate-300">{campaign.replies}</td>
                            <td className="py-4 font-semibold text-white">{campaign.conversion}</td>
                            <td className="py-4 text-slate-300">{campaign.owner}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${campaign.name} actions`}>
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
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Campaign Suggestions</CardTitle>
                      <CardDescription>Optimization guidance from engagement signals.</CardDescription>
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

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Zap className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Create a campaign by channel.</CardDescription>
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
