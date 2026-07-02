import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  CreditCard,
  DatabaseZap,
  Globe2,
  KeyRound,
  Mail,
  MessageCircle,
  PhoneCall,
  Plug,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Unplug,
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

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";
type IntegrationStatus = "Connected" | "Disconnected";
type Health = "Healthy" | "Warning" | "Failed" | "Idle";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
  variant: BadgeVariant;
};

type Integration = {
  name: string;
  category: string;
  icon: LucideIcon;
  status: IntegrationStatus;
  lastSync: string;
  health: Health;
};

type MonitorItem = {
  label: string;
  value: number;
  helper: string;
  variant: BadgeVariant;
};

const kpis: Kpi[] = [
  {
    label: "Connected Apps",
    value: "18",
    trend: "+4",
    helper: "Apps actively connected",
    icon: Plug,
    variant: "success",
  },
  {
    label: "Active APIs",
    value: "12",
    trend: "99.2% uptime",
    helper: "API credentials in use",
    icon: Code2,
    variant: "info",
  },
  {
    label: "Sync Success Rate",
    value: "98.6%",
    trend: "+1.8%",
    helper: "Successful sync jobs",
    icon: CheckCircle2,
    variant: "success",
  },
  {
    label: "Failed Syncs",
    value: "42",
    trend: "-12.4%",
    helper: "Needs retry or repair",
    icon: AlertTriangle,
    variant: "warning",
  },
];

const integrations: Integration[] = [
  { name: "Google Sheets", category: "Google", icon: Table2, status: "Connected", lastSync: "4 min ago", health: "Healthy" },
  { name: "Google Calendar", category: "Google", icon: CheckCircle2, status: "Connected", lastSync: "12 min ago", health: "Healthy" },
  { name: "Gmail", category: "Google", icon: Mail, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "Google Drive", category: "Google", icon: DatabaseZap, status: "Connected", lastSync: "1 hr ago", health: "Warning" },
  { name: "WhatsApp Cloud API", category: "Meta", icon: MessageCircle, status: "Connected", lastSync: "2 min ago", health: "Healthy" },
  { name: "Facebook Login", category: "Meta", icon: Globe2, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "Facebook Lead Ads", category: "Meta", icon: Globe2, status: "Connected", lastSync: "18 min ago", health: "Healthy" },
  { name: "Instagram", category: "Meta", icon: MessageCircle, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "OpenAI", category: "AI", icon: Bot, status: "Connected", lastSync: "Live", health: "Healthy" },
  { name: "ElevenLabs", category: "AI", icon: Bot, status: "Connected", lastSync: "8 min ago", health: "Warning" },
  { name: "Deepgram", category: "AI", icon: Bot, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "OpenRouter", category: "AI", icon: Bot, status: "Connected", lastSync: "Live", health: "Healthy" },
  { name: "Twilio", category: "Calling", icon: PhoneCall, status: "Connected", lastSync: "6 min ago", health: "Healthy" },
  { name: "Exotel", category: "Calling", icon: PhoneCall, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "Plivo", category: "Calling", icon: PhoneCall, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "Razorpay", category: "Payments", icon: CreditCard, status: "Connected", lastSync: "Today", health: "Healthy" },
  { name: "Stripe", category: "Payments", icon: CreditCard, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "Webhooks", category: "Automation", icon: Webhook, status: "Connected", lastSync: "Live", health: "Healthy" },
  { name: "REST API", category: "Automation", icon: Code2, status: "Connected", lastSync: "Live", health: "Healthy" },
  { name: "Zapier", category: "Automation", icon: Globe2, status: "Disconnected", lastSync: "Never", health: "Idle" },
  { name: "Make", category: "Automation", icon: Globe2, status: "Connected", lastSync: "42 min ago", health: "Healthy" },
  { name: "n8n", category: "Automation", icon: DatabaseZap, status: "Disconnected", lastSync: "Never", health: "Idle" },
];

const categories = ["Google", "Meta", "AI", "Calling", "Payments", "Automation"];

const healthVariant: Record<Health, BadgeVariant> = {
  Healthy: "success",
  Warning: "warning",
  Failed: "danger",
  Idle: "neutral",
};

const statusVariant: Record<IntegrationStatus, BadgeVariant> = {
  Connected: "success",
  Disconnected: "neutral",
};

const syncMonitor: MonitorItem[] = [
  { label: "Google Sheets Sync", value: 98, helper: "Lead rows synced", variant: "success" },
  { label: "Calendar Sync", value: 96, helper: "Events synchronized", variant: "success" },
  { label: "WhatsApp Sync", value: 99, helper: "Messages and templates", variant: "success" },
  { label: "CRM Sync", value: 94, helper: "Contacts, leads, companies", variant: "info" },
  { label: "AI Sync", value: 89, helper: "Model and voice services", variant: "warning" },
];

const recommendations = [
  { title: "Broken integrations", detail: "Google Drive has warning status and 3 retry events pending.", variant: "warning" as const },
  { title: "API rate limit warning", detail: "WhatsApp Cloud API is at 82% of hourly send quota.", variant: "warning" as const },
  { title: "Token expiry warning", detail: "Razorpay token expires in 5 days. Rotate credentials soon.", variant: "danger" as const },
  { title: "Recommended integrations", detail: "Connect Gmail and Instagram to unify engagement history.", variant: "info" as const },
];

const activity = [
  { title: "Connected apps", detail: "Make scenario connected by Revenue Ops", variant: "success" as const },
  { title: "Failed sync", detail: "Google Drive sync failed on folder permissions", variant: "danger" as const },
  { title: "Successful sync", detail: "Google Sheets synced 1,284 lead rows", variant: "success" as const },
  { title: "Webhook triggered", detail: "Incoming webhook created 18 leads from partner form", variant: "info" as const },
];

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

function IntegrationCard({ item }: { item: Integration }) {
  const Icon = item.icon;

  return (
    <article className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-400/30">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
      </div>
      <h3 className="mt-4 font-semibold text-white">{item.name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-slate-400">
        <div className="flex items-center justify-between gap-3">
          <span>Last Sync</span>
          <span className="text-slate-300">{item.lastSync}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Health</span>
          <Badge variant={healthVariant[item.health]}>{item.health}</Badge>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <Button variant="outline" className="justify-start">
          <Settings className="h-4 w-4" />
          Configure
        </Button>
        <Button variant="outline" className="justify-start">
          <ShieldCheck className="h-4 w-4" />
          Test Connection
        </Button>
        <Button variant="ghost" className="justify-start">
          <Unplug className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    </article>
  );
}

function SyncBar({ item }: { item: MonitorItem }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{item.label}</p>
          <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
        </div>
        <Badge variant={item.variant}>{item.value}%</Badge>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.value}%` }} />
      </div>
    </div>
  );
}

export default function IntegrationsModule() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Platform" title="Integrations Hub" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Enterprise integration control plane</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Integrations Hub
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Connect apps, manage APIs, monitor sync health, configure webhooks,
                and keep RDLeadify AI connected to your revenue stack.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>
                <Plug className="h-4 w-4" />
                Connect New Integration
              </Button>
              <Button variant="outline">
                <Code2 className="h-4 w-4" />
                API Documentation
              </Button>
              <Button variant="outline">
                <Webhook className="h-4 w-4" />
                Webhook Manager
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Refresh Connections
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>

          <div className="grid gap-6 2xl:grid-cols-12">
            <div className="space-y-6 2xl:col-span-8">
              {categories.map((category) => {
                const categoryItems = integrations.filter((item) => item.category === category);

                return (
                  <Card key={category}>
                    <CardHeader>
                      <div>
                        <CardTitle>{category}</CardTitle>
                        <CardDescription>{categoryItems.length} available integrations.</CardDescription>
                      </div>
                      <Badge variant="neutral">{categoryItems.length} apps</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {categoryItems.map((item) => (
                          <IntegrationCard key={`${item.category}-${item.name}`} item={item} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Webhook className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>Webhook Manager</CardTitle>
                      <CardDescription>Incoming, outgoing, secret, retry, and failed events.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ["Incoming Webhooks", "18 active endpoints"],
                    ["Outgoing Webhooks", "12 destinations"],
                    ["Secret Key", "rd_whsec_••••••••"],
                    ["Retry Status", "3 events retrying"],
                    ["Failed Events", "7 failed events"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <Badge variant={label === "Failed Events" ? "warning" : "neutral"}>{value}</Badge>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>Credential management for apps and services.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Public Key</p>
                    <p className="mt-2 text-sm font-semibold text-white">rd_pub_live_9a72••••</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Secret Key</p>
                    <p className="mt-2 text-sm font-semibold text-white">rd_sec_live_••••••••</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline">Regenerate</Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">Last Used: Today, 3:18 PM</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sync Monitor</CardTitle>
                  <CardDescription>Live sync health across core systems.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {syncMonitor.map((item) => (
                    <SyncBar key={item.label} item={item} />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle>AI Recommendations</CardTitle>
                      <CardDescription>Integration risk and next-best setup guidance.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((item) => (
                    <div key={item.title} className="rounded-xl bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <Badge variant={item.variant}>AI</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest integration events and sync outcomes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <Badge variant={item.variant}>Event</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
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
