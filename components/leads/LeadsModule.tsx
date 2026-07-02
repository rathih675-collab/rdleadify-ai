import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Download,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Flame,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  UserRoundCheck,
  Users,
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

type LeadStatus = "New" | "Interested" | "Demo Booked" | "Not Interested" | "Converted";
type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type Lead = {
  id: string;
  name: string;
  phone: string;
  source: "WhatsApp" | "Website" | "Meta Ads" | "Referral" | "Google Ads" | "Inbound Call";
  status: LeadStatus;
  score: number;
  tags: string[];
  assignedTo: string;
  customFields: Record<
    "Budget" | "Requirement" | "City" | "Product Interest" | "Follow-up Date" | "Lead Source",
    string
  >;
  lastActivity: string;
  nextFollowUp: string;
};

type LeadKpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const leads: Lead[] = [
  {
    id: "lead-1001",
    name: "Aarav Sharma",
    phone: "+91 98765 42110",
    source: "WhatsApp",
    status: "Demo Booked",
    score: 96,
    tags: ["Hot", "Villa", "Priority"],
    assignedTo: "Priya Nair",
    customFields: {
      Budget: "$420K",
      Requirement: "Villa automation",
      City: "Mumbai",
      "Product Interest": "AI CRM + WhatsApp",
      "Follow-up Date": "Today",
      "Lead Source": "WhatsApp",
    },
    lastActivity: "WhatsApp reply 12 min ago",
    nextFollowUp: "Today, 3:30 PM",
  },
  {
    id: "lead-1002",
    name: "Maya Iyer",
    phone: "+91 99887 65432",
    source: "Website",
    status: "Interested",
    score: 91,
    tags: ["Enterprise", "Demo"],
    assignedTo: "Rahul Mehta",
    customFields: {
      Budget: "$280K",
      Requirement: "Enterprise CRM",
      City: "Bengaluru",
      "Product Interest": "Pipeline + AI Agent",
      "Follow-up Date": "Today",
      "Lead Source": "Website",
    },
    lastActivity: "Viewed pricing page",
    nextFollowUp: "Today, 5:00 PM",
  },
  {
    id: "lead-1003",
    name: "Kabir Kapoor",
    phone: "+91 91234 88770",
    source: "Meta Ads",
    status: "New",
    score: 82,
    tags: ["Ad Lead", "Budget Fit"],
    assignedTo: "Anika Rao",
    customFields: {
      Budget: "$90K",
      Requirement: "Lead capture",
      City: "Pune",
      "Product Interest": "Forms + Campaigns",
      "Follow-up Date": "Today",
      "Lead Source": "Meta Ads",
    },
    lastActivity: "Lead captured 28 min ago",
    nextFollowUp: "Today, 6:15 PM",
  },
  {
    id: "lead-1004",
    name: "Sofia Khan",
    phone: "+91 90045 23188",
    source: "Referral",
    status: "Converted",
    score: 88,
    tags: ["Referral", "Closed"],
    assignedTo: "Dev Shah",
    customFields: {
      Budget: "$190K",
      Requirement: "Partner pipeline",
      City: "Delhi",
      "Product Interest": "CRM + Reports",
      "Follow-up Date": "Tomorrow",
      "Lead Source": "Referral",
    },
    lastActivity: "Deal marked won",
    nextFollowUp: "Tomorrow, 10:00 AM",
  },
  {
    id: "lead-1005",
    name: "Rohan Das",
    phone: "+91 97001 12245",
    source: "Google Ads",
    status: "Not Interested",
    score: 44,
    tags: ["Low Intent", "Archive"],
    assignedTo: "Meera Jain",
    customFields: {
      Budget: "$40K",
      Requirement: "Basic CRM",
      City: "Hyderabad",
      "Product Interest": "Contacts",
      "Follow-up Date": "No follow-up",
      "Lead Source": "Google Ads",
    },
    lastActivity: "Rejected offer yesterday",
    nextFollowUp: "No follow-up",
  },
  {
    id: "lead-1006",
    name: "Neha Bansal",
    phone: "+91 98112 45009",
    source: "Inbound Call",
    status: "Interested",
    score: 76,
    tags: ["Call Back", "Apartment"],
    assignedTo: "Priya Nair",
    customFields: {
      Budget: "$360K",
      Requirement: "Upsell automation",
      City: "Chennai",
      "Product Interest": "AI Agent + Tasks",
      "Follow-up Date": "Tomorrow",
      "Lead Source": "Inbound Call",
    },
    lastActivity: "Call completed 1 hour ago",
    nextFollowUp: "Tomorrow, 12:30 PM",
  },
];

const kpis: LeadKpi[] = [
  {
    label: "Total Leads",
    value: "12,480",
    trend: "+18.2%",
    helper: "All active CRM records",
    icon: Users,
    variant: "success",
  },
  {
    label: "Hot Leads",
    value: "384",
    trend: "+31.4%",
    helper: "Score above 85",
    icon: Flame,
    variant: "warning",
  },
  {
    label: "Follow-ups Today",
    value: "127",
    trend: "42 urgent",
    helper: "Due before end of day",
    icon: CalendarClock,
    variant: "info",
  },
  {
    label: "Demo Booked",
    value: "342",
    trend: "+12.6%",
    helper: "From current pipeline",
    icon: UserRoundCheck,
    variant: "success",
  },
];

const recentActivity = [
  "Aarav Sharma replied on WhatsApp and confirmed demo timing.",
  "AI Agent qualified Kabir Kapoor as budget-fit.",
  "Maya Iyer opened the pricing page for the third time.",
  "Dev Shah converted Sofia Khan from referral pipeline.",
  "Meera Jain archived Rohan Das after negative intent signal.",
];

const aiSuggestions = [
  {
    title: "Leads missing phone/email",
    icon: Mail,
    variant: "danger" as const,
    items: ["2 imported leads missing phone", "5 leads missing email"],
  },
  {
    title: "Duplicate leads found",
    icon: AlertTriangle,
    variant: "warning" as const,
    items: ["Maya Iyer", "CloudNine Realty duplicate"],
  },
  {
    title: "Hot leads ready for export",
    icon: FileDown,
    variant: "success" as const,
    items: ["Aarav Sharma", "Maya Iyer", "Sofia Khan"],
  },
  {
    title: "Recommended custom fields",
    icon: Database,
    variant: "info" as const,
    items: ["Budget", "City", "Product Interest"],
  },
];

const customFields = [
  { name: "Budget", type: "Number", usage: "Forecast value and qualification" },
  { name: "Requirement", type: "Text", usage: "Buyer need and context" },
  { name: "City", type: "Dropdown", usage: "Territory and routing" },
  { name: "Product Interest", type: "Dropdown", usage: "Solution segmentation" },
  { name: "Follow-up Date", type: "Date", usage: "Task automation" },
  { name: "Lead Source", type: "Dropdown", usage: "Attribution reporting" },
];

const fieldTypes = ["Text", "Number", "Date", "Dropdown", "Checkbox", "URL", "Email", "Phone"];

const importMappings = [
  { fileColumn: "Lead Name", crmField: "Lead Name", status: "Mapped" },
  { fileColumn: "Mobile", crmField: "Phone", status: "Mapped" },
  { fileColumn: "Interested Product", crmField: "Product Interest", status: "Custom Field" },
  { fileColumn: "Budget Range", crmField: "Budget", status: "Custom Field" },
];

const statusVariant: Record<LeadStatus, BadgeVariant> = {
  New: "info",
  Interested: "warning",
  "Demo Booked": "success",
  "Not Interested": "danger",
  Converted: "success",
};

function KpiCard({ item }: { item: LeadKpi }) {
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

function ScoreIndicator({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-emerald-400" : score >= 70 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="min-w-32">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{score}</span>
        <span className="text-xs text-slate-500">AI score</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function LeadsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">No leads match this view</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        Adjust filters, clear search terms, or create a new lead to start building this segment.
      </p>
      <Button className="mt-5">
        <Plus className="h-4 w-4" />
        Add Lead
      </Button>
    </div>
  );
}

function LeadsTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Lead Pipeline</CardTitle>
          <CardDescription>
            Prioritized records with AI score, ownership, activity, and follow-up timing.
          </CardDescription>
        </div>
        <Badge variant="neutral">{leads.length} records</Badge>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3 font-semibold">Lead Name</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Tags</th>
                  <th className="pb-3 font-semibold">Assigned To</th>
                  <th className="pb-3 font-semibold">Custom Fields</th>
                  <th className="pb-3 font-semibold">Last Activity</th>
                  <th className="pb-3 font-semibold">Next Follow-up</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leads.map((lead) => (
                  <tr key={lead.id} className="align-top">
                    <td className="py-4">
                      <p className="font-semibold text-white">{lead.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{lead.id}</p>
                    </td>
                    <td className="py-4 text-slate-300">{lead.phone}</td>
                    <td className="py-4">
                      <Badge variant="neutral">{lead.source}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="py-4">
                      <ScoreIndicator score={lead.score} />
                    </td>
                    <td className="py-4">
                      <div className="flex max-w-56 flex-wrap gap-2">
                        {lead.tags.map((tag) => (
                          <Badge key={`${lead.id}-${tag}`} variant="info">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{lead.assignedTo}</td>
                    <td className="py-4">
                      <div className="grid gap-1 text-xs text-slate-400">
                        <span>Budget: {lead.customFields.Budget}</span>
                        <span>City: {lead.customFields.City}</span>
                        <span>Interest: {lead.customFields["Product Interest"]}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400">{lead.lastActivity}</td>
                    <td className="py-4 text-slate-300">{lead.nextFollowUp}</td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="icon" aria-label={`Open ${lead.name} actions`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <LeadsEmptyState />
        )}
      </CardContent>
    </Card>
  );
}

export default function LeadsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="CRM" title="Leads CRM" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Lead command center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Leads CRM
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Manage lead capture, qualification, scoring, ownership, follow-ups,
                and AI-guided prioritization from one enterprise sales workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
              <Button variant="outline">
                <FileUp className="h-4 w-4" />
                Import Leads
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Leads
              </Button>
              <Button variant="outline">
                <Database className="h-4 w-4" />
                Manage Custom Fields
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
                  <CardTitle>Lead Filters</CardTitle>
                  <CardDescription>
                    Search and segment leads by status, source, and campaign tags.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search lead">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Name, phone, company..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>New</option>
                    <option>Interested</option>
                    <option>Demo Booked</option>
                    <option>Not Interested</option>
                    <option>Converted</option>
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

                <FilterControl label="Tag filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All tags</option>
                    <option>Hot</option>
                    <option>Priority</option>
                    <option>Budget Fit</option>
                    <option>Demo</option>
                    <option>Low Intent</option>
                  </select>
                </FilterControl>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <FileUp className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Import Leads</CardTitle>
                    <CardDescription>CSV/XLSX upload, duplicate handling, and field mapping preview.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-6 text-center">
                  <FileSpreadsheet className="mx-auto h-8 w-8 text-emerald-300" />
                  <p className="mt-3 font-semibold text-white">Upload CSV or XLSX</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Import leads with tags, owners, source, and custom qualification fields.
                  </p>
                  <Button className="mt-4" variant="outline">Choose file</Button>
                </div>
                <Button variant="secondary" className="w-full">
                  <FileDown className="h-4 w-4" />
                  Download sample CSV
                </Button>
                <div className="rounded-xl bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">Duplicate handling</p>
                  <div className="mt-3 grid gap-2">
                    {["Merge by phone/email", "Skip duplicate leads", "Create review queue"].map((item) => (
                      <Badge key={item} variant="neutral">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">Field mapping preview</p>
                  <div className="mt-3 space-y-2">
                    {importMappings.map((item) => (
                      <div key={item.fileColumn} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-400">{item.fileColumn}</span>
                        <span className="text-slate-500">→</span>
                        <Badge variant={item.status === "Custom Field" ? "info" : "success"}>
                          {item.crmField}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                    <FileDown className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Export Leads</CardTitle>
                    <CardDescription>Export lead lists for sales, marketing, and operations workflows.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Export all leads", "Export filtered leads", "Export selected leads"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <p className="text-sm font-semibold text-white">{item}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Includes statuses, AI scores, tags, owners, and custom fields.
                    </p>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">CSV</Button>
                  <Button variant="outline">XLSX</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                    <Database className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>Custom Fields</CardTitle>
                    <CardDescription>Capture qualification and product-fit details on every lead.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  <Plus className="h-4 w-4" />
                  Create custom field
                </Button>
                <div>
                  <p className="text-sm font-semibold text-white">Field types</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fieldTypes.map((item) => (
                      <Badge key={item} variant="neutral">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {customFields.map((field) => (
                    <div key={field.name} className="rounded-xl border border-white/10 bg-black/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{field.name}</p>
                        <Badge variant="info">{field.type}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{field.usage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-9">
              <LeadsTable />
            </div>

            <div className="space-y-6 2xl:col-span-3">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Live sales signals from lead records.</CardDescription>
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
                        Prioritized next actions from lead intent and activity.
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
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Empty State Design</CardTitle>
                      <CardDescription>
                        Reusable zero-result state for future filtered views.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadsEmptyState />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <CircleDollarSign className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">Backend-ready data model</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Leads, KPIs, activity, and AI suggestions are typed separately so API
                    data can replace sample records without changing the UI structure.
                  </p>
                </div>
              </div>
              <Badge variant="success">Ready for API integration</Badge>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
