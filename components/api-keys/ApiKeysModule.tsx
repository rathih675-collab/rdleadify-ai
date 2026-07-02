import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Braces,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  FileCode2,
  Gauge,
  Globe2,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Server,
  ShieldCheck,
  Sparkles,
  Table2,
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
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type Kpi = {
  title: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type ApiKey = {
  name: string;
  publicKey: string;
  permissions: string[];
  status: "Active" | "Restricted" | "Revoked";
  lastUsed: string;
  createdBy: string;
};

type WebhookRecord = {
  name: string;
  endpoint: string;
  events: string[];
  status: "Live" | "Paused" | "Failed";
  lastTriggered: string;
  retryCount: number;
};

type ApiLog = {
  time: string;
  endpoint: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  statusCode: number;
  responseTime: string;
  ip: string;
  apiKey: string;
};

const kpis: Kpi[] = [
  {
    title: "Active API Keys",
    value: "12",
    trend: "+3",
    helper: "Production keys currently enabled",
    icon: KeyRound,
    variant: "success",
  },
  {
    title: "API Requests Today",
    value: "184.2K",
    trend: "+24%",
    helper: "REST and webhook traffic",
    icon: Activity,
    variant: "info",
  },
  {
    title: "Failed Requests",
    value: "318",
    trend: "-9%",
    helper: "4xx and 5xx responses",
    icon: AlertTriangle,
    variant: "warning",
  },
  {
    title: "Webhook Events",
    value: "42.8K",
    trend: "99.4%",
    helper: "Delivery success rate",
    icon: Webhook,
    variant: "success",
  },
];

const sections = [
  {
    title: "API Keys",
    description: "Issue scoped public keys and rotate secrets safely.",
    icon: KeyRound,
    metric: "12 active",
  },
  {
    title: "Webhooks",
    description: "Deliver CRM events to external systems with retries.",
    icon: Webhook,
    metric: "9 endpoints",
  },
  {
    title: "API Logs",
    description: "Inspect requests, status codes, latency, and IP usage.",
    icon: Table2,
    metric: "184K today",
  },
  {
    title: "Rate Limits",
    description: "Control quota usage, burst windows, and tenant safety.",
    icon: Gauge,
    metric: "78% used",
  },
  {
    title: "SDKs",
    description: "Ship faster with JavaScript, Python, PHP, and cURL examples.",
    icon: Code2,
    metric: "4 libraries",
  },
  {
    title: "OAuth Apps",
    description: "Manage third-party apps, callbacks, scopes, and consent.",
    icon: ShieldCheck,
    metric: "3 apps",
  },
];

const apiKeys: ApiKey[] = [
  {
    name: "Production CRM Sync",
    publicKey: "pk_live_rdl_8H41...K29Q",
    permissions: ["Leads Read/Write", "Contacts Read/Write", "Calendar Access"],
    status: "Active",
    lastUsed: "2 minutes ago",
    createdBy: "Nisha Verma",
  },
  {
    name: "WhatsApp Automation",
    publicKey: "pk_live_rdl_74PA...Z8LM",
    permissions: ["WhatsApp Send", "Campaigns Read/Write", "AI Agent Access"],
    status: "Active",
    lastUsed: "12 minutes ago",
    createdBy: "AI Ops",
  },
  {
    name: "Reporting Warehouse",
    publicKey: "pk_live_rdl_PQ92...M4RX",
    permissions: ["Leads Read/Write", "Contacts Read/Write"],
    status: "Restricted",
    lastUsed: "Today, 9:20 AM",
    createdBy: "Rahul Mehta",
  },
  {
    name: "Legacy Import Tool",
    publicKey: "pk_test_rdl_62LX...D0QJ",
    permissions: ["Leads Read/Write"],
    status: "Revoked",
    lastUsed: "Jun 21, 2026",
    createdBy: "Sana Khan",
  },
];

const webhooks: WebhookRecord[] = [
  {
    name: "Lead Created to Sheets",
    endpoint: "https://hooks.rdl.ai/google-sheets/leads",
    events: ["lead.created", "lead.updated"],
    status: "Live",
    lastTriggered: "48 seconds ago",
    retryCount: 0,
  },
  {
    name: "Appointment Confirmation",
    endpoint: "https://api.customer.app/calendar/webhook",
    events: ["appointment.booked", "appointment.cancelled"],
    status: "Live",
    lastTriggered: "8 minutes ago",
    retryCount: 1,
  },
  {
    name: "Campaign Reply Processor",
    endpoint: "https://automation.rdl.ai/webhooks/replies",
    events: ["whatsapp.reply", "campaign.converted"],
    status: "Paused",
    lastTriggered: "Yesterday, 5:10 PM",
    retryCount: 0,
  },
  {
    name: "Billing CRM Update",
    endpoint: "https://billing.example.com/rdleadify",
    events: ["company.updated", "deal.won"],
    status: "Failed",
    lastTriggered: "Today, 7:42 AM",
    retryCount: 3,
  },
];

const apiLogs: ApiLog[] = [
  {
    time: "15:28:42",
    endpoint: "/v1/leads",
    method: "POST",
    statusCode: 201,
    responseTime: "184ms",
    ip: "103.48.91.22",
    apiKey: "Production CRM Sync",
  },
  {
    time: "15:27:18",
    endpoint: "/v1/whatsapp/messages",
    method: "POST",
    statusCode: 202,
    responseTime: "231ms",
    ip: "49.36.114.88",
    apiKey: "WhatsApp Automation",
  },
  {
    time: "15:25:03",
    endpoint: "/v1/contacts/merge",
    method: "PATCH",
    statusCode: 200,
    responseTime: "142ms",
    ip: "122.161.44.10",
    apiKey: "Production CRM Sync",
  },
  {
    time: "15:23:59",
    endpoint: "/v1/campaigns",
    method: "GET",
    statusCode: 429,
    responseTime: "64ms",
    ip: "13.235.27.90",
    apiKey: "Reporting Warehouse",
  },
  {
    time: "15:20:11",
    endpoint: "/v1/ai-agent/run",
    method: "POST",
    statusCode: 500,
    responseTime: "912ms",
    ip: "34.93.122.10",
    apiKey: "WhatsApp Automation",
  },
];

const permissions = [
  "Leads Read/Write",
  "Contacts Read/Write",
  "Campaigns Read/Write",
  "WhatsApp Send",
  "AI Agent Access",
  "Calendar Access",
];

const rateLimits = [
  { label: "Requests per minute", value: "7,800 / 10,000", progress: 78 },
  { label: "Daily quota", value: "184,200 / 250,000", progress: 74 },
  { label: "Webhook retries", value: "41 / 1,000", progress: 4 },
];

const docs = [
  {
    title: "Authentication",
    detail: "Use bearer tokens with scoped API keys and rotate secrets from this console.",
    icon: LockKeyhole,
  },
  {
    title: "REST API",
    detail: "Manage leads, contacts, companies, campaigns, calls, AI agents, and appointments.",
    icon: Braces,
  },
  {
    title: "Webhook Events",
    detail: "Subscribe to lead, contact, campaign, WhatsApp, calendar, and automation events.",
    icon: Webhook,
  },
  {
    title: "SDK Examples",
    detail: "Start with JavaScript, Python, PHP, and cURL request examples.",
    icon: FileCode2,
  },
];

const sdks = [
  { name: "JavaScript SDK", version: "v1.8.0", status: "Stable" },
  { name: "Python SDK", version: "v1.6.4", status: "Stable" },
  { name: "PHP SDK", version: "v1.2.1", status: "Beta" },
  { name: "cURL Recipes", version: "v1", status: "Updated" },
];

const oauthApps = [
  { name: "Partner Portal", scopes: "Leads, Contacts, Calendar", status: "Approved" },
  { name: "Revenue BI", scopes: "Reports, Campaigns", status: "Review" },
  { name: "Field Sales App", scopes: "Leads, Calls, WhatsApp", status: "Approved" },
];

const statusVariant: Record<string, BadgeVariant> = {
  Active: "success",
  Restricted: "warning",
  Revoked: "danger",
  Live: "success",
  Paused: "warning",
  Failed: "danger",
  Stable: "success",
  Beta: "warning",
  Updated: "info",
  Approved: "success",
  Review: "warning",
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;

  return (
    <Card className="min-w-0 border-white/10 bg-white/[0.04]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-slate-400">{kpi.title}</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="truncate text-3xl font-semibold tracking-tight text-white">
                {kpi.value}
              </p>
              <Badge variant={kpi.variant}>{kpi.trend}</Badge>
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

function SectionCard({
  title,
  description,
  icon: Icon,
  metric,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  metric: string;
}) {
  return (
    <Card className="min-w-0 border-white/10 bg-slate-950/50 transition hover:border-cyan-400/50 hover:bg-cyan-400/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-cyan-200">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="info">{metric}</Badge>
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function PermissionBadge({ permission }: { permission: string }) {
  return (
    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
      {permission}
    </span>
  );
}

function ProgressItem({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium text-white">{label}</span>
        <span className="shrink-0 text-sm text-slate-400">{value}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-800">
        <div
          className={cn(
            "h-full rounded-full",
            progress > 85 ? "bg-amber-400" : "bg-cyan-400",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ApiKeysModule() {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Topbar eyebrow="Developers" title="API Keys & Developers" />

        <div className="min-w-0 max-w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="min-w-0 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <Badge variant="info">Developer platform</Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  API Keys & Developers
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                  Govern secure API access, webhook delivery, logs, quotas,
                  SDKs, OAuth applications, and developer documentation from one
                  enterprise control plane.
                </p>
              </div>
              <div className="flex min-w-0 flex-wrap gap-3">
                <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View API Docs
                </Button>
                <Button variant="outline">
                  <Webhook className="mr-2 h-4 w-4" />
                  Create Webhook
                </Button>
                <Button variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Regenerate Secret
                </Button>
              </div>
            </div>
          </section>

          <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.title} kpi={kpi} />
            ))}
          </section>

          <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <SectionCard key={section.title} {...section} />
            ))}
          </section>

          <Card className="min-w-0 border-white/10 bg-white/[0.04]">
            <CardHeader>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <KeyRound className="h-5 w-5 text-cyan-200" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Scoped credentials ready for external apps, automations, and
                    internal services.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Permission audit
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Key Name</th>
                      <th className="px-4 py-3">Public Key</th>
                      <th className="px-4 py-3">Permissions</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Used</th>
                      <th className="px-4 py-3">Created By</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.name} className="text-slate-300">
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{apiKey.name}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Secret hidden and vault-managed
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-cyan-100">
                          {apiKey.publicKey}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex max-w-sm flex-wrap gap-2">
                            {apiKey.permissions.map((permission) => (
                              <PermissionBadge
                                key={`${apiKey.name}-${permission}`}
                                permission={permission}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusVariant[apiKey.status]}>
                            {apiKey.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">{apiKey.lastUsed}</td>
                        <td className="px-4 py-4">{apiKey.createdBy}</td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Manage ${apiKey.name}`}
                          >
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

          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Webhook className="h-5 w-5 text-cyan-200" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Delivery endpoints, subscribed events, retry health, and
                  failure visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full min-w-[840px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Webhook Name</th>
                        <th className="px-4 py-3">Endpoint URL</th>
                        <th className="px-4 py-3">Events</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Last Triggered</th>
                        <th className="px-4 py-3">Retry Count</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {webhooks.map((webhook) => (
                        <tr key={webhook.name} className="text-slate-300">
                          <td className="px-4 py-4 font-medium text-white">
                            {webhook.name}
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-slate-400">
                            {webhook.endpoint}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex max-w-xs flex-wrap gap-2">
                              {webhook.events.map((event) => (
                                <span
                                  key={`${webhook.name}-${event}`}
                                  className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300"
                                >
                                  {event}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={statusVariant[webhook.status]}>
                              {webhook.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">{webhook.lastTriggered}</td>
                          <td className="px-4 py-4">{webhook.retryCount}</td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Manage ${webhook.name}`}
                            >
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

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Gauge className="h-5 w-5 text-cyan-200" />
                  Rate Limit Panel
                </CardTitle>
                <CardDescription>
                  Usage progress and quota controls for tenant safety.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rateLimits.map((limit) => (
                  <ProgressItem key={limit.label} {...limit} />
                ))}
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                    <AlertTriangle className="h-4 w-4" />
                    Rate limit warning
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Reporting Warehouse hit a burst limit on `/v1/campaigns`.
                    Consider moving exports to scheduled jobs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="min-w-0 border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Server className="h-5 w-5 text-cyan-200" />
                API Logs
              </CardTitle>
              <CardDescription>
                Request traces for debugging endpoints, permissions, status
                codes, latency, IP address, and key usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Endpoint</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status Code</th>
                      <th className="px-4 py-3">Response Time</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">API Key</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {apiLogs.map((log) => (
                      <tr key={`${log.time}-${log.endpoint}`} className="text-slate-300">
                        <td className="px-4 py-4 font-mono text-xs">{log.time}</td>
                        <td className="px-4 py-4 font-mono text-xs text-cyan-100">
                          {log.endpoint}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="neutral">{log.method}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              log.statusCode >= 500
                                ? "danger"
                                : log.statusCode >= 400
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {log.statusCode}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">{log.responseTime}</td>
                        <td className="px-4 py-4">{log.ip}</td>
                        <td className="px-4 py-4">{log.apiKey}</td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Inspect ${log.endpoint}`}
                          >
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

          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-cyan-200" />
                  Permissions
                </CardTitle>
                <CardDescription>
                  Granular scopes prepared for backend policy enforcement.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm font-medium text-slate-200">
                      {permission}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="min-w-0 border-cyan-400/20 bg-cyan-400/[0.05]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5 text-cyan-200" />
                  Developer Docs Preview
                </CardTitle>
                <CardDescription>
                  Core developer entry points for secure RDLeadify AI
                  integrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {docs.map((doc) => {
                  const Icon = doc.icon;

                  return (
                    <div
                      key={doc.title}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-cyan-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          {doc.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {doc.detail}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section className="grid min-w-0 gap-4 lg:grid-cols-2">
            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Code2 className="h-5 w-5 text-cyan-200" />
                  SDKs
                </CardTitle>
                <CardDescription>
                  Client libraries and implementation examples for developer
                  teams.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sdks.map((sdk) => (
                  <div
                    key={sdk.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {sdk.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Latest package {sdk.version}
                      </div>
                    </div>
                    <Badge variant={statusVariant[sdk.status]}>{sdk.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="min-w-0 border-white/10 bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe2 className="h-5 w-5 text-cyan-200" />
                  OAuth Apps
                </CardTitle>
                <CardDescription>
                  Third-party app access, scopes, redirect URLs, and consent
                  review readiness.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {oauthApps.map((app) => (
                  <div
                    key={app.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">
                        {app.name}
                      </div>
                      <Badge variant={statusVariant[app.status]}>{app.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Scopes: {app.scopes}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid min-w-0 gap-4 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "AI Risk Review",
                copy: "Flags unused keys, suspicious IPs, broad scopes, and stale webhook secrets.",
              },
              {
                icon: Database,
                title: "Backend Ready",
                copy: "Every table and panel is structured for API-backed pagination, filters, and audit logs.",
              },
              {
                icon: Copy,
                title: "Copy-Safe Tokens",
                copy: "Public keys, webhook URLs, and secrets have clear future copy and regeneration controls.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="min-w-0 border-white/10 bg-white/[0.04]">
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
