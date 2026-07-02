import {
  ArrowUpRight,
  Bot,
  CalendarClock,
  Clock3,
  GitBranch,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Target,
  TimerReset,
  UserPlus,
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
type DripStatus = "Draft" | "Active" | "Paused" | "Completed";
type DripChannel = "WhatsApp" | "Email" | "SMS" | "AI";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type DripCampaign = {
  id: string;
  name: string;
  channel: DripChannel;
  trigger: string;
  steps: number;
  enrolled: string;
  status: DripStatus;
  engagement: string;
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
    label: "Active Drips",
    value: "42",
    trend: "+9 live",
    helper: "Running lifecycle sequences",
    icon: GitBranch,
    variant: "success",
  },
  {
    label: "Contacts Enrolled",
    value: "18,420",
    trend: "+24.1%",
    helper: "Across active drip journeys",
    icon: UserPlus,
    variant: "info",
  },
  {
    label: "Messages Scheduled",
    value: "64.8K",
    trend: "Next 7 days",
    helper: "Queued WhatsApp, email, and SMS",
    icon: CalendarClock,
    variant: "warning",
  },
  {
    label: "Conversion Rate",
    value: "14.6%",
    trend: "+3.8%",
    helper: "Drip-attributed conversion",
    icon: Target,
    variant: "success",
  },
];

const drips: DripCampaign[] = [
  {
    id: "drip-901",
    name: "Hot Lead Demo Nurture",
    channel: "WhatsApp",
    trigger: "Tag Added",
    steps: 4,
    enrolled: "2,184",
    status: "Active",
    engagement: "48.2%",
    conversion: "18.4%",
    owner: "Growth Team",
  },
  {
    id: "drip-902",
    name: "New Lead Welcome Journey",
    channel: "Email",
    trigger: "New Lead Added",
    steps: 5,
    enrolled: "5,920",
    status: "Active",
    engagement: "34.8%",
    conversion: "9.2%",
    owner: "Rahul Mehta",
  },
  {
    id: "drip-903",
    name: "No Reply Recovery",
    channel: "SMS",
    trigger: "No Reply",
    steps: 3,
    enrolled: "1,420",
    status: "Paused",
    engagement: "11.4%",
    conversion: "2.1%",
    owner: "Revenue Ops",
  },
  {
    id: "drip-904",
    name: "Demo Booked Confirmation",
    channel: "AI",
    trigger: "Demo Booked",
    steps: 4,
    enrolled: "842",
    status: "Completed",
    engagement: "61.2%",
    conversion: "28.6%",
    owner: "AI Agent",
  },
  {
    id: "drip-905",
    name: "Form Submit Qualification",
    channel: "WhatsApp",
    trigger: "Form Submitted",
    steps: 6,
    enrolled: "3,214",
    status: "Draft",
    engagement: "0%",
    conversion: "0%",
    owner: "Priya Nair",
  },
];

const timeline = [
  { day: "Day 0", title: "Welcome WhatsApp", detail: "Confirm interest and ask qualification question." },
  { day: "Day 1", title: "Follow-up Message", detail: "Share relevant offer and recommended next step." },
  { day: "Day 3", title: "Offer Reminder", detail: "Nudge with urgency, proof, and booking CTA." },
  { day: "Day 7", title: "Final Follow-up", detail: "Close the loop and route to long-term nurture." },
];

const triggers = [
  { label: "New Lead Added", icon: UserPlus },
  { label: "Tag Added", icon: Tag },
  { label: "Form Submitted", icon: Send },
  { label: "No Reply", icon: TimerReset },
  { label: "Demo Booked", icon: CalendarClock },
];

const suggestions: Suggestion[] = [
  {
    title: "Best delay timing",
    icon: Clock3,
    variant: "success",
    detail: "High-intent WhatsApp drips perform best with a 3-hour first delay and Day 1 second touch.",
  },
  {
    title: "Low performing drip",
    icon: Sparkles,
    variant: "warning",
    detail: "No Reply Recovery has only 11.4% engagement. Replace SMS step 2 with a WhatsApp template.",
  },
  {
    title: "Recommended follow-up message",
    icon: Bot,
    variant: "info",
    detail: "Ask one qualification question and include a direct calendar booking CTA for demo-ready leads.",
  },
];

const quickActions = [
  { label: "WhatsApp Drip", icon: MessageCircle },
  { label: "Email Drip", icon: Mail },
  { label: "SMS Drip", icon: Phone },
  { label: "AI Follow-up Drip", icon: Bot },
];

const statusVariant: Record<DripStatus, BadgeVariant> = {
  Draft: "neutral",
  Active: "success",
  Paused: "warning",
  Completed: "info",
};

const channelVariant: Record<DripChannel, BadgeVariant> = {
  WhatsApp: "success",
  Email: "info",
  SMS: "warning",
  AI: "neutral",
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

export default function DripCampaignsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Automation" title="Drip Campaigns" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Lifecycle automation</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Drip Campaigns
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Build timed nurture journeys across WhatsApp, email, SMS, and AI follow-ups
                with trigger logic, conversion tracking, and message scheduling.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Drip Campaign
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
                  <CardTitle>Drip Filters</CardTitle>
                  <CardDescription>
                    Search and segment drip campaigns by channel, status, and trigger.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search drip">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Drip, owner, audience..."
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
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Completed</option>
                  </select>
                </FilterControl>

                <FilterControl label="Trigger filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All triggers</option>
                    <option>New Lead Added</option>
                    <option>Tag Added</option>
                    <option>Form Submitted</option>
                    <option>No Reply</option>
                    <option>Demo Booked</option>
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
                    <CardTitle>Drip Campaigns Table</CardTitle>
                    <CardDescription>
                      Sequenced campaigns with triggers, enrollment, engagement, conversion, and owner.
                    </CardDescription>
                  </div>
                  <Badge variant="neutral">{drips.length} drips</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Drip Name</th>
                          <th className="pb-3 font-semibold">Channel</th>
                          <th className="pb-3 font-semibold">Trigger</th>
                          <th className="pb-3 font-semibold">Steps</th>
                          <th className="pb-3 font-semibold">Enrolled</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Open/Reply Rate</th>
                          <th className="pb-3 font-semibold">Conversion</th>
                          <th className="pb-3 font-semibold">Owner</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {drips.map((drip) => (
                          <tr key={drip.id} className="align-top">
                            <td className="py-4">
                              <p className="font-semibold text-white">{drip.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{drip.id}</p>
                            </td>
                            <td className="py-4">
                              <Badge variant={channelVariant[drip.channel]}>{drip.channel}</Badge>
                            </td>
                            <td className="py-4 text-slate-300">{drip.trigger}</td>
                            <td className="py-4 text-slate-300">{drip.steps}</td>
                            <td className="py-4 text-slate-300">{drip.enrolled}</td>
                            <td className="py-4">
                              <Badge variant={statusVariant[drip.status]}>{drip.status}</Badge>
                            </td>
                            <td className="py-4 font-semibold text-white">{drip.engagement}</td>
                            <td className="py-4 font-semibold text-white">{drip.conversion}</td>
                            <td className="py-4 text-slate-300">{drip.owner}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${drip.name} actions`}>
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
                      <GitBranch className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Visual Drip Timeline</CardTitle>
                      <CardDescription>Sample follow-up cadence for hot lead nurture.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {timeline.map((step) => (
                      <div key={step.day} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <Badge variant="info">{step.day}</Badge>
                        <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Zap className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Trigger Examples</CardTitle>
                      <CardDescription>Common enrollment triggers for automation.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {triggers.map((trigger) => {
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
                      <CardDescription>Optimization recommendations for drip performance.</CardDescription>
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
                  <div>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Create drip journeys by channel.</CardDescription>
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
