import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Crown,
  Database,
  Download,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Tag,
  UserRoundPlus,
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

type ContactType = "Lead" | "Customer" | "Partner" | "Vendor";
type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  type: ContactType;
  source: "WhatsApp" | "Website" | "Referral" | "Partner Portal" | "Import" | "Campaign";
  tags: string[];
  owner: string;
  customFields: Record<"Budget" | "Requirement" | "City" | "Lead Source" | "Follow-up Date", string>;
  lastInteraction: string;
  duplicateRisk?: boolean;
  valueTier: "Standard" | "High" | "Strategic";
};

type ContactKpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

const contacts: Contact[] = [
  {
    id: "contact-2001",
    name: "Maya Iyer",
    phone: "+91 99887 65432",
    email: "maya.iyer@cloudnine.example",
    company: "CloudNine Realty",
    type: "Lead",
    source: "Website",
    tags: ["Enterprise", "Demo", "High Intent"],
    owner: "Rahul Mehta",
    customFields: {
      Budget: "$280K",
      Requirement: "CRM automation",
      City: "Bengaluru",
      "Lead Source": "Website",
      "Follow-up Date": "Today",
    },
    lastInteraction: "Pricing page visit 18 min ago",
    valueTier: "High",
  },
  {
    id: "contact-2002",
    name: "Aarav Sharma",
    phone: "+91 98765 42110",
    email: "aarav@novaestates.example",
    company: "Nova Estates",
    type: "Customer",
    source: "WhatsApp",
    tags: ["VIP", "Expansion"],
    owner: "Priya Nair",
    customFields: {
      Budget: "$420K",
      Requirement: "Renewal + expansion",
      City: "Mumbai",
      "Lead Source": "WhatsApp",
      "Follow-up Date": "Tomorrow",
    },
    lastInteraction: "Renewal call booked today",
    valueTier: "Strategic",
  },
  {
    id: "contact-2003",
    name: "Sofia Khan",
    phone: "+91 90045 23188",
    email: "sofia@metrobuild.example",
    company: "MetroBuild",
    type: "Partner",
    source: "Referral",
    tags: ["Referral", "Channel"],
    owner: "Dev Shah",
    customFields: {
      Budget: "$610K",
      Requirement: "Partner pipeline",
      City: "Delhi",
      "Lead Source": "Referral",
      "Follow-up Date": "Friday",
    },
    lastInteraction: "Shared partner lead yesterday",
    valueTier: "High",
  },
  {
    id: "contact-2004",
    name: "Rohan Das",
    phone: "+91 97001 12245",
    email: "rohan.das@urbanlotus.example",
    company: "UrbanLotus",
    type: "Vendor",
    source: "Partner Portal",
    tags: ["Vendor", "Billing"],
    owner: "Meera Jain",
    customFields: {
      Budget: "$150K",
      Requirement: "Vendor contract",
      City: "Pune",
      "Lead Source": "Partner Portal",
      "Follow-up Date": "Next week",
    },
    lastInteraction: "Contract update 2 days ago",
    valueTier: "Standard",
  },
  {
    id: "contact-2005",
    name: "Maya Iyer",
    phone: "+91 99887 65432",
    email: "m.iyer@cloudnine.example",
    company: "CloudNine Realty",
    type: "Lead",
    source: "Import",
    tags: ["Duplicate", "Needs Merge"],
    owner: "Anika Rao",
    customFields: {
      Budget: "$280K",
      Requirement: "Duplicate import",
      City: "Bengaluru",
      "Lead Source": "Import",
      "Follow-up Date": "Review",
    },
    lastInteraction: "CSV import yesterday",
    duplicateRisk: true,
    valueTier: "High",
  },
  {
    id: "contact-2006",
    name: "Neha Bansal",
    phone: "+91 98112 45009",
    email: "neha@urbancove.example",
    company: "Urban Cove",
    type: "Customer",
    source: "Campaign",
    tags: ["Upsell", "Active"],
    owner: "Priya Nair",
    customFields: {
      Budget: "$360K",
      Requirement: "Upsell automation",
      City: "Hyderabad",
      "Lead Source": "Campaign",
      "Follow-up Date": "Today",
    },
    lastInteraction: "Responded to upsell campaign",
    valueTier: "Strategic",
  },
];

const kpis: ContactKpi[] = [
  {
    label: "Total Contacts",
    value: "28,940",
    trend: "+14.8%",
    helper: "Unified relationship records",
    icon: Users,
    variant: "success",
  },
  {
    label: "New Contacts",
    value: "1,284",
    trend: "+22.1%",
    helper: "Added in the last 30 days",
    icon: UserRoundPlus,
    variant: "info",
  },
  {
    label: "Active Customers",
    value: "4,812",
    trend: "+9.6%",
    helper: "Customers with recent activity",
    icon: Crown,
    variant: "success",
  },
  {
    label: "Duplicate Contacts",
    value: "86",
    trend: "Needs review",
    helper: "Potential records to merge",
    icon: ShieldAlert,
    variant: "warning",
  },
];

const typeVariant: Record<ContactType, BadgeVariant> = {
  Lead: "info",
  Customer: "success",
  Partner: "warning",
  Vendor: "neutral",
};

const recentInteractions = [
  "Maya Iyer opened the pricing page for the fourth time this week.",
  "Aarav Sharma booked a renewal call with Priya Nair.",
  "Sofia Khan shared a partner referral into the pipeline.",
  "Neha Bansal replied to the upsell campaign from WhatsApp.",
  "Duplicate risk detected for Maya Iyer from latest CSV import.",
];

const aiSuggestions = [
  {
    title: "Duplicate contacts found",
    icon: AlertTriangle,
    variant: "warning" as const,
    items: ["Maya Iyer", "CloudNine Realty duplicate"],
  },
  {
    title: "Contacts missing phone/email",
    icon: Mail,
    variant: "danger" as const,
    items: ["3 imports missing email", "2 contacts missing phone"],
  },
  {
    title: "Contacts ready for export",
    icon: FileDown,
    variant: "success" as const,
    items: ["Active customers", "High value contacts", "Partner contacts"],
  },
  {
    title: "Recommended custom fields",
    icon: Database,
    variant: "info" as const,
    items: ["Budget", "City", "Follow-up Date"],
  },
];

const customFields = [
  { name: "Budget", type: "Number", usage: "High value segmentation" },
  { name: "Requirement", type: "Text", usage: "Sales qualification notes" },
  { name: "City", type: "Dropdown", usage: "Territory routing" },
  { name: "Lead Source", type: "Dropdown", usage: "Attribution reporting" },
  { name: "Follow-up Date", type: "Date", usage: "Task automation" },
];

const fieldTypes = ["Text", "Number", "Date", "Dropdown", "Checkbox", "URL", "Email", "Phone"];

const importMappings = [
  { fileColumn: "Full Name", crmField: "Name", status: "Mapped" },
  { fileColumn: "Mobile", crmField: "Phone", status: "Mapped" },
  { fileColumn: "Email Address", crmField: "Email", status: "Mapped" },
  { fileColumn: "Budget Range", crmField: "Budget", status: "Custom Field" },
];

function KpiCard({ item }: { item: ContactKpi }) {
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

function DuplicateIndicator({ active }: { active?: boolean }) {
  if (!active) {
    return <span className="text-xs text-slate-500">Clean record</span>;
  }

  return (
    <Badge variant="warning">
      <AlertTriangle className="h-3 w-3" />
      Duplicate risk
    </Badge>
  );
}

function ContactsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        <Users className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">No contacts found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        Adjust filters, import a contact list, or add a new contact to build this relationship view.
      </p>
      <Button className="mt-5">
        <Plus className="h-4 w-4" />
        Add Contact
      </Button>
    </div>
  );
}

function ContactsTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Contact Directory</CardTitle>
          <CardDescription>
            Relationship records with ownership, segmentation, interaction history, and duplicate signals.
          </CardDescription>
        </div>
        <Badge variant="neutral">{contacts.length} records</Badge>
      </CardHeader>
      <CardContent>
        {contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Tags</th>
                <th className="pb-3 font-semibold">Owner</th>
                <th className="pb-3 font-semibold">Custom Fields</th>
                <th className="pb-3 font-semibold">Last Interaction</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="align-top">
                    <td className="py-4">
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="font-semibold text-white">{contact.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{contact.id}</p>
                        </div>
                        <DuplicateIndicator active={contact.duplicateRisk} />
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{contact.phone}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="h-4 w-4 text-slate-500" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{contact.company}</td>
                    <td className="py-4">
                      <Badge variant={typeVariant[contact.type]}>{contact.type}</Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex max-w-60 flex-wrap gap-2">
                        {contact.tags.map((tag) => (
                          <Badge key={`${contact.id}-${tag}`} variant="info">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{contact.owner}</td>
                    <td className="py-4">
                      <div className="grid gap-1 text-xs text-slate-400">
                        <span>Budget: {contact.customFields.Budget}</span>
                        <span>City: {contact.customFields.City}</span>
                        <span>Follow-up: {contact.customFields["Follow-up Date"]}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-slate-300">{contact.lastInteraction}</p>
                      <p className="mt-1 text-xs text-slate-500">{contact.valueTier} value</p>
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="icon" aria-label={`Open ${contact.name} actions`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ContactsEmptyState />
        )}
      </CardContent>
    </Card>
  );
}

export default function ContactsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="CRM" title="Contacts" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Relationship command center</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Contacts
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Manage people, ownership, lifecycle type, duplicate quality, and interaction history
                across every revenue relationship in RDLeadify AI.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
              <Button variant="outline">
                <FileUp className="h-4 w-4" />
                Import Contacts
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Contacts
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
                  <CardTitle>Contact Filters</CardTitle>
                  <CardDescription>
                    Search and segment contacts by relationship type, source, and tags.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterControl label="Search contact">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Name, phone, email..."
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </FilterControl>

                <FilterControl label="Type filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All types</option>
                    <option>Lead</option>
                    <option>Customer</option>
                    <option>Partner</option>
                    <option>Vendor</option>
                  </select>
                </FilterControl>

                <FilterControl label="Source filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All sources</option>
                    <option>WhatsApp</option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Partner Portal</option>
                    <option>Import</option>
                  </select>
                </FilterControl>

                <FilterControl label="Tag filter">
                  <select className="h-11 rounded-lg border border-white/10 bg-[#0b1628] px-3 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20">
                    <option>All tags</option>
                    <option>VIP</option>
                    <option>Enterprise</option>
                    <option>Duplicate</option>
                    <option>Upsell</option>
                    <option>Partner</option>
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
                    <CardTitle>Import Contacts</CardTitle>
                    <CardDescription>CSV/XLSX upload, duplicate handling, and mapping preview.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-6 text-center">
                  <FileSpreadsheet className="mx-auto h-8 w-8 text-emerald-300" />
                  <p className="mt-3 font-semibold text-white">Upload CSV or XLSX</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Drag and drop a file or choose from your computer.
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
                    {["Merge by phone/email", "Skip duplicates", "Create review queue"].map((item) => (
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
                    <CardTitle>Export Contacts</CardTitle>
                    <CardDescription>Export complete, filtered, or selected contact datasets.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Export all contacts", "Export filtered contacts", "Export selected contacts"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <p className="text-sm font-semibold text-white">{item}</p>
                    <p className="mt-2 text-sm text-slate-400">Includes standard fields, custom fields, tags, and ownership.</p>
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
                    <CardDescription>Create fields for CRM-specific contact intelligence.</CardDescription>
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
              <ContactsTable />
            </div>

            <div className="space-y-6 2xl:col-span-3">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Recent Interactions</CardTitle>
                    <CardDescription>Latest relationship touchpoints and data quality signals.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentInteractions.map((item) => (
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
                        Follow-up, duplicate merge, and value prioritization signals.
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
                      <BriefcaseBusiness className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Data Hygiene</CardTitle>
                      <CardDescription>
                        Keep contact records trusted before syncing with backend systems.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ContactsEmptyState />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
