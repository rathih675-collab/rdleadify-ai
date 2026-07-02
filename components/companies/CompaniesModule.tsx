import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  Crown,
  DollarSign,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Target,
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

type CompanyStatus = "Prospect" | "Active" | "At Risk" | "Lost";
type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type Company = {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: CompanyStatus;
  dealValue: string;
  owner: string;
  lastActivity: string;
  renewalDate: string;
  priority: "Standard" | "High" | "Strategic";
};

type CompanyKpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const companies: Company[] = [
  {
    id: "co-3001",
    name: "Nova Estates",
    industry: "Real Estate",
    contactPerson: "Aarav Sharma",
    phone: "+91 98765 42110",
    email: "aarav@novaestates.example",
    status: "Active",
    dealValue: "$420,000",
    owner: "Priya Nair",
    lastActivity: "Renewal call booked today",
    renewalDate: "Aug 18, 2026",
    priority: "Strategic",
  },
  {
    id: "co-3002",
    name: "CloudNine Realty",
    industry: "Property Sales",
    contactPerson: "Maya Iyer",
    phone: "+91 99887 65432",
    email: "maya.iyer@cloudnine.example",
    status: "Prospect",
    dealValue: "$280,000",
    owner: "Rahul Mehta",
    lastActivity: "Viewed enterprise pricing",
    renewalDate: "Pipeline",
    priority: "High",
  },
  {
    id: "co-3003",
    name: "MetroBuild",
    industry: "Construction",
    contactPerson: "Sofia Khan",
    phone: "+91 90045 23188",
    email: "sofia@metrobuild.example",
    status: "Active",
    dealValue: "$610,000",
    owner: "Dev Shah",
    lastActivity: "Partner referral added yesterday",
    renewalDate: "Sep 04, 2026",
    priority: "Strategic",
  },
  {
    id: "co-3004",
    name: "UrbanLotus",
    industry: "Real Estate",
    contactPerson: "Rohan Das",
    phone: "+91 97001 12245",
    email: "rohan.das@urbanlotus.example",
    status: "At Risk",
    dealValue: "$150,000",
    owner: "Meera Jain",
    lastActivity: "No response for 11 days",
    renewalDate: "Jul 22, 2026",
    priority: "High",
  },
  {
    id: "co-3005",
    name: "Urban Cove",
    industry: "Hospitality",
    contactPerson: "Neha Bansal",
    phone: "+91 98112 45009",
    email: "neha@urbancove.example",
    status: "Active",
    dealValue: "$360,000",
    owner: "Priya Nair",
    lastActivity: "Upsell campaign reply",
    renewalDate: "Oct 12, 2026",
    priority: "High",
  },
  {
    id: "co-3006",
    name: "Vertex Homes",
    industry: "Real Estate",
    contactPerson: "Kabir Kapoor",
    phone: "+91 91234 88770",
    email: "kabir@vertexhomes.example",
    status: "Lost",
    dealValue: "$90,000",
    owner: "Anika Rao",
    lastActivity: "Lost to competitor last week",
    renewalDate: "Closed",
    priority: "Standard",
  },
];

const kpis: CompanyKpi[] = [
  {
    label: "Total Companies",
    value: "6,420",
    trend: "+12.4%",
    helper: "Accounts across all segments",
    icon: Building2,
    variant: "success",
  },
  {
    label: "Active Clients",
    value: "1,284",
    trend: "+8.7%",
    helper: "Companies with live contracts",
    icon: BriefcaseBusiness,
    variant: "success",
  },
  {
    label: "High Value Companies",
    value: "318",
    trend: "$4.8M",
    helper: "Strategic and expansion accounts",
    icon: Crown,
    variant: "warning",
  },
  {
    label: "Renewal Due",
    value: "74",
    trend: "30 days",
    helper: "Renewals requiring action",
    icon: CalendarClock,
    variant: "info",
  },
];

const statusVariant: Record<CompanyStatus, BadgeVariant> = {
  Prospect: "info",
  Active: "success",
  "At Risk": "warning",
  Lost: "danger",
};

const recentActivity = [
  "Nova Estates booked a renewal review with Priya Nair.",
  "UrbanLotus was flagged at risk after 11 days without response.",
  "CloudNine Realty viewed enterprise pricing twice today.",
  "MetroBuild added a partner referral into the active pipeline.",
  "Urban Cove replied to the expansion campaign on WhatsApp.",
];

const aiSuggestions = [
  {
    title: "High-value follow-up",
    icon: DollarSign,
    variant: "success" as const,
    items: ["MetroBuild", "Nova Estates", "Urban Cove"],
  },
  {
    title: "Companies at risk",
    icon: AlertTriangle,
    variant: "warning" as const,
    items: ["UrbanLotus", "Vertex Homes"],
  },
  {
    title: "Renewal opportunities",
    icon: RefreshCw,
    variant: "info" as const,
    items: ["Nova Estates", "UrbanLotus", "MetroBuild"],
  },
];

function KpiCard({ item }: { item: CompanyKpi }) {
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

function CompaniesTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Company Accounts</CardTitle>
          <CardDescription>
            Account records with contact ownership, commercial value, status, and renewal context.
          </CardDescription>
        </div>
        <Badge variant="neutral">{companies.length} accounts</Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-3 font-semibold">Company Name</th>
                <th className="pb-3 font-semibold">Industry</th>
                <th className="pb-3 font-semibold">Contact Person</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Deal Value</th>
                <th className="pb-3 font-semibold">Owner</th>
                <th className="pb-3 font-semibold">Last Activity</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {companies.map((company) => (
                <tr key={company.id} className="align-top">
                  <td className="py-4">
                    <p className="font-semibold text-white">{company.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {company.id} - {company.priority} priority
                    </p>
                  </td>
                  <td className="py-4 text-slate-300">{company.industry}</td>
                  <td className="py-4 text-slate-300">{company.contactPerson}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="h-4 w-4 text-slate-500" />
                      {company.phone}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="h-4 w-4 text-slate-500" />
                      {company.email}
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge variant={statusVariant[company.status]}>{company.status}</Badge>
                  </td>
                  <td className="py-4 font-semibold text-white">{company.dealValue}</td>
                  <td className="py-4 text-slate-300">{company.owner}</td>
                  <td className="py-4">
                    <p className="text-slate-300">{company.lastActivity}</p>
                    <p className="mt-1 text-xs text-slate-500">Renewal: {company.renewalDate}</p>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="icon" aria-label={`Open ${company.name} actions`}>
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
  );
}

export default function CompaniesModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="CRM" title="Companies" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Account command center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Companies
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Track account health, commercial value, renewal timing, owner accountability,
                and AI-prioritized company opportunities.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Company
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
                  <CardTitle>Company Filters</CardTitle>
                  <CardDescription>
                    Segment accounts by industry, status, owner, and search intent.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search company">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Company, contact, email..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Industry filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All industries</option>
                    <option>Real Estate</option>
                    <option>Construction</option>
                    <option>Hospitality</option>
                    <option>Property Sales</option>
                  </select>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>Prospect</option>
                    <option>Active</option>
                    <option>At Risk</option>
                    <option>Lost</option>
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
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-9">
              <CompaniesTable />
            </div>

            <div className="space-y-6 2xl:col-span-3">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Recent Company Activity</CardTitle>
                    <CardDescription>Latest account-level updates and risk signals.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-black/10 p-3">
                      <div className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <p className="text-sm leading-6 text-slate-300">{item}</p>
                      </div>
                    </div>
                  ))}
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
                      <CardDescription>
                        Account recommendations based on value, activity, and renewal risk.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiSuggestions.map((group) => {
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
                      <Target className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Account Focus</CardTitle>
                      <CardDescription>Top operating priorities for the current book.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl bg-black/10 p-4">
                    <p className="text-sm font-semibold text-white">$1.39M renewal pipeline</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Prioritize companies with renewal dates before October 2026 and high
                      engagement in the last seven days.
                    </p>
                  </div>
                  <div className="rounded-xl bg-black/10 p-4">
                    <p className="text-sm font-semibold text-white">2 risk accounts</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      UrbanLotus and Vertex Homes need executive recovery workflows.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
