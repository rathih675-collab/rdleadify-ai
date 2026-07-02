import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Code2,
  ExternalLink,
  FileText,
  FormInput,
  Link2,
  ListChecks,
  Mail,
  MessageCircle,
  MoreHorizontal,
  MousePointerClick,
  Phone,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Upload,
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
type FormStatus = "Draft" | "Active" | "Paused" | "Archived";
type FormType = "Lead Capture" | "Demo Booking" | "Survey" | "Support" | "Partner";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type FormRecord = {
  id: string;
  name: string;
  type: FormType;
  status: FormStatus;
  responses: string;
  conversion: string;
  connectedField: string;
  lastUpdated: string;
};

type BuilderField = {
  label: string;
  helper: string;
  icon: LucideIcon;
};

const kpis: Kpi[] = [
  {
    label: "Total Forms",
    value: "86",
    trend: "+12",
    helper: "Published, draft, and archived forms",
    icon: FormInput,
    variant: "success",
  },
  {
    label: "Responses",
    value: "18,420",
    trend: "+26.4%",
    helper: "Responses captured this month",
    icon: ClipboardList,
    variant: "info",
  },
  {
    label: "Conversion Rate",
    value: "18.6%",
    trend: "+4.2%",
    helper: "Visit-to-submit conversion",
    icon: MousePointerClick,
    variant: "warning",
  },
  {
    label: "Active Forms",
    value: "34",
    trend: "Live",
    helper: "Collecting CRM-ready data",
    icon: CheckCircle2,
    variant: "success",
  },
];

const forms: FormRecord[] = [
  {
    id: "form-601",
    name: "Premium Villa Lead Capture",
    type: "Lead Capture",
    status: "Active",
    responses: "4,812",
    conversion: "22.4%",
    connectedField: "Product Interest",
    lastUpdated: "Today, 11:20 AM",
  },
  {
    id: "form-602",
    name: "Enterprise Demo Booking",
    type: "Demo Booking",
    status: "Active",
    responses: "1,246",
    conversion: "31.8%",
    connectedField: "Follow-up Date",
    lastUpdated: "Yesterday",
  },
  {
    id: "form-603",
    name: "Partner Referral Intake",
    type: "Partner",
    status: "Draft",
    responses: "0",
    conversion: "0%",
    connectedField: "Lead Source",
    lastUpdated: "Jul 1, 2026",
  },
  {
    id: "form-604",
    name: "Customer Satisfaction Survey",
    type: "Survey",
    status: "Paused",
    responses: "932",
    conversion: "14.2%",
    connectedField: "Requirement",
    lastUpdated: "Jun 29, 2026",
  },
  {
    id: "form-605",
    name: "Support Request Form",
    type: "Support",
    status: "Active",
    responses: "2,184",
    conversion: "19.1%",
    connectedField: "City",
    lastUpdated: "Jun 28, 2026",
  },
];

const builderFields: BuilderField[] = [
  { label: "Text Field", helper: "Single-line custom input", icon: FileText },
  { label: "Phone Field", helper: "Validated phone capture", icon: Phone },
  { label: "Email Field", helper: "Email validation and dedupe", icon: Mail },
  { label: "Dropdown", helper: "Controlled option set", icon: ListChecks },
  { label: "Date Picker", helper: "Appointment and follow-up date", icon: CalendarDays },
  { label: "File Upload", helper: "Document and attachment capture", icon: Upload },
  { label: "Submit Button", helper: "Conversion action and routing", icon: Send },
];

const responses = [
  { name: "Aarav Sharma", form: "Premium Villa Lead Capture", source: "WhatsApp", time: "8 min ago" },
  { name: "Maya Iyer", form: "Enterprise Demo Booking", source: "Website", time: "22 min ago" },
  { name: "Neha Bansal", form: "Support Request Form", source: "Public Link", time: "1 hr ago" },
  { name: "Sofia Khan", form: "Partner Referral Intake", source: "Partner", time: "Yesterday" },
];

const suggestions = [
  {
    title: "Missing fields",
    icon: Sparkles,
    variant: "warning" as const,
    detail: "Add Budget and City to Premium Villa Lead Capture to improve routing.",
  },
  {
    title: "Best converting form",
    icon: MousePointerClick,
    variant: "success" as const,
    detail: "Enterprise Demo Booking converts at 31.8% with only four fields.",
  },
  {
    title: "Recommended questions",
    icon: Bot,
    variant: "info" as const,
    detail: "Ask timeline, budget, and preferred contact channel before submit.",
  },
];

const statusVariant: Record<FormStatus, BadgeVariant> = {
  Draft: "neutral",
  Active: "success",
  Paused: "warning",
  Archived: "danger",
};

const typeVariant: Record<FormType, BadgeVariant> = {
  "Lead Capture": "success",
  "Demo Booking": "info",
  Survey: "warning",
  Support: "neutral",
  Partner: "info",
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

export default function FormsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="CRM" title="Form Builder" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Lead capture studio</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Form Builder
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Build CRM-connected forms, map responses to fields, embed forms across channels,
                and optimize conversion with AI recommendations.
              </p>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Form
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
                  <CardTitle>Form Filters</CardTitle>
                  <CardDescription>Search and segment forms by type and publication status.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FilterControl label="Search form">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Form name, field, owner..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Type filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All types</option>
                    <option>Lead Capture</option>
                    <option>Demo Booking</option>
                    <option>Survey</option>
                    <option>Support</option>
                    <option>Partner</option>
                  </select>
                </FilterControl>

                <FilterControl label="Status filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All statuses</option>
                    <option>Draft</option>
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Archived</option>
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
                    <CardTitle>Forms Table</CardTitle>
                    <CardDescription>CRM-connected forms with response, conversion, and field mapping data.</CardDescription>
                  </div>
                  <Badge variant="neutral">{forms.length} forms</Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-left text-sm">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Form Name</th>
                          <th className="pb-3 font-semibold">Type</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Responses</th>
                          <th className="pb-3 font-semibold">Conversion</th>
                          <th className="pb-3 font-semibold">Connected CRM Field</th>
                          <th className="pb-3 font-semibold">Last Updated</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {forms.map((form) => (
                          <tr key={form.id} className="align-top">
                            <td className="py-4">
                              <p className="font-semibold text-white">{form.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{form.id}</p>
                            </td>
                            <td className="py-4">
                              <Badge variant={typeVariant[form.type]}>{form.type}</Badge>
                            </td>
                            <td className="py-4">
                              <Badge variant={statusVariant[form.status]}>{form.status}</Badge>
                            </td>
                            <td className="py-4 text-slate-300">{form.responses}</td>
                            <td className="py-4 font-semibold text-white">{form.conversion}</td>
                            <td className="py-4 text-slate-300">{form.connectedField}</td>
                            <td className="py-4 text-slate-400">{form.lastUpdated}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="icon" aria-label={`Open ${form.name} actions`}>
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
                      <FormInput className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Drag-and-Drop Builder Preview</CardTitle>
                      <CardDescription>Field palette ready for future interactive builder logic.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {builderFields.map((field) => {
                      const Icon = field.icon;

                      return (
                        <div key={field.label} className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-400/30">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                            <Icon className="h-5 w-5" />
                          </span>
                          <h3 className="mt-4 font-semibold text-white">{field.label}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{field.helper}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Form Responses</CardTitle>
                    <CardDescription>Latest submissions from live forms.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {responses.map((response) => (
                    <div key={`${response.name}-${response.time}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{response.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{response.form}</p>
                        </div>
                        <Badge variant="neutral">{response.time}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-400">Source: {response.source}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Link2 className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Embed & Share</CardTitle>
                      <CardDescription>Deploy forms across web, public links, and WhatsApp.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Embed Code", icon: Code2, value: "<script src='rdleadify-form.js' />" },
                    { label: "Public Link", icon: ExternalLink, value: "rdleadify.ai/forms/demo-booking" },
                    { label: "WhatsApp Form Link", icon: MessageCircle, value: "wa.me/?text=Book%20a%20demo" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-emerald-300" />
                          <p className="text-sm font-semibold text-white">{item.label}</p>
                        </div>
                        <p className="mt-2 break-all text-xs leading-5 text-slate-400">{item.value}</p>
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
                      <CardDescription>Conversion and field recommendations.</CardDescription>
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
