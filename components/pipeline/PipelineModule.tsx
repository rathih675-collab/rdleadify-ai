import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Flame,
  Gauge,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  Trophy,
  Users,
  XCircle,
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
type PipelineStage =
  | "New Lead"
  | "Contacted"
  | "Interested"
  | "Demo Booked"
  | "Negotiation"
  | "Converted"
  | "Lost";

type Deal = {
  id: string;
  leadCompany: string;
  value: string;
  source: "WhatsApp" | "Website" | "Meta Ads" | "Referral" | "Google Ads" | "Inbound Call";
  owner: string;
  score: number;
  tags: string[];
  nextFollowUp: string;
  age: string;
};

type Stage = {
  title: PipelineStage;
  description: string;
  variant: BadgeVariant;
  deals: Deal[];
};

type PipelineKpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type HealthMetric = {
  label: string;
  value: number;
  helper: string;
  variant: BadgeVariant;
};

const kpis: PipelineKpi[] = [
  {
    label: "Pipeline Value",
    value: "$4.82M",
    trend: "+18.4%",
    helper: "Weighted active pipeline",
    icon: CircleDollarSign,
    variant: "success",
  },
  {
    label: "Open Deals",
    value: "486",
    trend: "+32",
    helper: "Across active stages",
    icon: Users,
    variant: "info",
  },
  {
    label: "Won Deals",
    value: "128",
    trend: "+12.6%",
    helper: "Closed in current period",
    icon: Trophy,
    variant: "success",
  },
  {
    label: "Lost Deals",
    value: "34",
    trend: "-6.2%",
    helper: "Loss rate improving",
    icon: XCircle,
    variant: "warning",
  },
];

const stages: Stage[] = [
  {
    title: "New Lead",
    description: "Fresh opportunities awaiting first touch",
    variant: "info",
    deals: [
      {
        id: "deal-4101",
        leadCompany: "Vertex Homes",
        value: "$90,000",
        source: "Meta Ads",
        owner: "Anika Rao",
        score: 82,
        tags: ["Ad Lead", "Budget Fit"],
        nextFollowUp: "Today, 6:15 PM",
        age: "28 min",
      },
      {
        id: "deal-4102",
        leadCompany: "Green Acres",
        value: "$74,000",
        source: "Website",
        owner: "Rahul Mehta",
        score: 76,
        tags: ["New", "Apartment"],
        nextFollowUp: "Tomorrow, 10:00 AM",
        age: "2 hrs",
      },
    ],
  },
  {
    title: "Contacted",
    description: "First conversation started",
    variant: "neutral",
    deals: [
      {
        id: "deal-4201",
        leadCompany: "Urban Cove",
        value: "$360,000",
        source: "Inbound Call",
        owner: "Priya Nair",
        score: 78,
        tags: ["Call Back", "Upsell"],
        nextFollowUp: "Today, 4:45 PM",
        age: "1 day",
      },
    ],
  },
  {
    title: "Interested",
    description: "Intent signals confirmed",
    variant: "warning",
    deals: [
      {
        id: "deal-4301",
        leadCompany: "CloudNine Realty",
        value: "$280,000",
        source: "Website",
        owner: "Rahul Mehta",
        score: 91,
        tags: ["Enterprise", "Pricing"],
        nextFollowUp: "Today, 5:00 PM",
        age: "2 days",
      },
      {
        id: "deal-4302",
        leadCompany: "Riverfront Spaces",
        value: "$125,000",
        source: "Google Ads",
        owner: "Meera Jain",
        score: 84,
        tags: ["High Intent"],
        nextFollowUp: "Tomorrow, 2:30 PM",
        age: "3 days",
      },
    ],
  },
  {
    title: "Demo Booked",
    description: "Scheduled product walkthroughs",
    variant: "success",
    deals: [
      {
        id: "deal-4401",
        leadCompany: "Nova Estates",
        value: "$420,000",
        source: "WhatsApp",
        owner: "Priya Nair",
        score: 96,
        tags: ["Hot", "VIP", "Villa"],
        nextFollowUp: "Today, 3:30 PM",
        age: "4 hrs",
      },
    ],
  },
  {
    title: "Negotiation",
    description: "Commercial review and approvals",
    variant: "warning",
    deals: [
      {
        id: "deal-4501",
        leadCompany: "MetroBuild",
        value: "$610,000",
        source: "Referral",
        owner: "Dev Shah",
        score: 88,
        tags: ["Partner", "Strategic"],
        nextFollowUp: "Tomorrow, 11:00 AM",
        age: "5 days",
      },
    ],
  },
  {
    title: "Converted",
    description: "Won opportunities",
    variant: "success",
    deals: [
      {
        id: "deal-4601",
        leadCompany: "Sofia Khan Group",
        value: "$190,000",
        source: "Referral",
        owner: "Dev Shah",
        score: 86,
        tags: ["Closed", "Expansion"],
        nextFollowUp: "Onboarding call Friday",
        age: "Won today",
      },
    ],
  },
  {
    title: "Lost",
    description: "Closed lost and recovery candidates",
    variant: "danger",
    deals: [
      {
        id: "deal-4701",
        leadCompany: "UrbanLotus",
        value: "$150,000",
        source: "Google Ads",
        owner: "Meera Jain",
        score: 44,
        tags: ["Competitor", "Recovery"],
        nextFollowUp: "Revisit in 30 days",
        age: "Lost last week",
      },
    ],
  },
];

const aiInsights = [
  {
    title: "Deals likely to close",
    icon: Flame,
    variant: "success" as const,
    items: ["Nova Estates", "MetroBuild", "CloudNine Realty"],
  },
  {
    title: "Deals stuck too long",
    icon: AlertTriangle,
    variant: "warning" as const,
    items: ["MetroBuild", "Riverfront Spaces"],
  },
  {
    title: "Follow-ups needed today",
    icon: CalendarClock,
    variant: "info" as const,
    items: ["Nova Estates", "CloudNine Realty", "Urban Cove"],
  },
];

const healthMetrics: HealthMetric[] = [
  { label: "Lead response SLA", value: 92, helper: "First response under 5 minutes", variant: "success" },
  { label: "Stage velocity", value: 74, helper: "Average movement across open deals", variant: "info" },
  { label: "Negotiation risk", value: 41, helper: "Deals needing executive attention", variant: "warning" },
  { label: "Win probability", value: 68, helper: "AI-weighted close confidence", variant: "success" },
];

function KpiCard({ item }: { item: PipelineKpi }) {
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

function ScoreBar({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-emerald-400" : score >= 70 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">AI score</span>
        <span className="text-xs font-semibold text-white">{score}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#07111f]/80 p-4 shadow-xl shadow-black/10 transition hover:border-emerald-400/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{deal.leadCompany}</h3>
          <p className="mt-1 text-xs text-slate-500">{deal.id} - {deal.age}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label={`Open ${deal.leadCompany} actions`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-bold text-white">{deal.value}</p>
        <Badge variant="neutral">{deal.source}</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Owner</span>
          <span className="font-medium text-slate-200">{deal.owner}</span>
        </div>
        <ScoreBar score={deal.score} />
        <div className="flex flex-wrap gap-2">
          {deal.tags.map((tag) => (
            <Badge key={`${deal.id}-${tag}`} variant="info">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            Next follow-up
          </div>
          <p className="mt-2 text-sm text-slate-300">{deal.nextFollowUp}</p>
        </div>
      </div>
    </article>
  );
}

function KanbanColumn({ stage }: { stage: Stage }) {
  const totalValue = stage.deals.reduce((sum, deal) => {
    const numericValue = Number(deal.value.replace(/[$,]/g, ""));
    return sum + numericValue;
  }, 0);

  return (
    <section className="flex h-full w-[320px] shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.045]">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">{stage.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{stage.description}</p>
          </div>
          <Badge variant={stage.variant}>{stage.deals.length}</Badge>
        </div>
        <p className="mt-3 text-sm font-semibold text-emerald-300">
          ${totalValue.toLocaleString()}
        </p>
      </div>

      <div className="grid gap-3 p-3">
        {stage.deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  );
}

function HealthBar({ metric }: { metric: HealthMetric }) {
  const tone =
    metric.variant === "warning"
      ? "bg-amber-400"
      : metric.variant === "danger"
        ? "bg-rose-400"
        : metric.variant === "info"
          ? "bg-sky-400"
          : "bg-emerald-400";

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{metric.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{metric.helper}</p>
        </div>
        <span className="text-sm font-bold text-white">{metric.value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${metric.value}%` }} />
      </div>
    </div>
  );
}

export default function PipelineModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="CRM" title="Sales Pipeline" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Revenue pipeline board</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Sales Pipeline
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Manage deals by stage, prioritize follow-ups, inspect AI scoring, and
                monitor pipeline health from a drag-and-drop-ready Kanban workspace.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Deal
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
                  <CardTitle>Pipeline Filters</CardTitle>
                  <CardDescription>
                    Segment deal boards by search, pipeline, owner, and lead source.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search deal">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Deal, lead, company..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Pipeline filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All pipelines</option>
                    <option>Enterprise Sales</option>
                    <option>Inbound Sales</option>
                    <option>Partner Sales</option>
                  </select>
                </FilterControl>

                <FilterControl label="Owner filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All owners</option>
                    <option>Priya Nair</option>
                    <option>Rahul Mehta</option>
                    <option>Dev Shah</option>
                    <option>Meera Jain</option>
                    <option>Anika Rao</option>
                  </select>
                </FilterControl>

                <FilterControl label="Source filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All sources</option>
                    <option>WhatsApp</option>
                    <option>Website</option>
                    <option>Meta Ads</option>
                    <option>Referral</option>
                    <option>Google Ads</option>
                  </select>
                </FilterControl>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-9">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Kanban Pipeline</CardTitle>
                    <CardDescription>
                      Horizontally scrollable board with stable stage data ready for future drag-and-drop.
                    </CardDescription>
                  </div>
                  <Badge variant="neutral">{stages.length} stages</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex min-h-[640px] gap-4">
                      {stages.map((stage) => (
                        <KanbanColumn key={stage.title} stage={stage} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 2xl:col-span-3">
              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Pipeline Insights</CardTitle>
                      <CardDescription>
                        Prioritized deal movement and follow-up recommendations.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.map((group) => {
                    const Icon = group.icon;

                    return (
                      <div key={group.title} className="rounded-xl bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-emerald-300" />
                            <p className="text-sm font-semibold text-white">{group.title}</p>
                          </div>
                          <Badge variant={group.variant}>{group.items.length}</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <Badge key={`${group.title}-${item}`} variant="neutral">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Gauge className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Pipeline Health</CardTitle>
                      <CardDescription>Operational signals across active deals.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthMetrics.map((metric) => (
                    <HealthBar key={metric.label} metric={metric} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Board Readiness</CardTitle>
                    <CardDescription>Designed for future drag-and-drop workflows.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Stage and deal IDs are stable for API-backed updates.",
                    "Columns use fixed widths for smooth horizontal board scrolling.",
                    "Deal cards isolate metadata needed for drag handles and optimistic updates.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <p className="text-sm leading-6 text-slate-300">{item}</p>
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
