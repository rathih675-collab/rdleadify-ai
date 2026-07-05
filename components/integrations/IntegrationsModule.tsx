"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Code2,
  CreditCard,
  DatabaseZap,
  FileText,
  Globe2,
  KeyRound,
  Mail,
  MessageCircle,
  PhoneCall,
  Plug,
  RefreshCw,
  Search,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";
type IntegrationState = "connected" | "disconnected" | "testing" | "warning";

type IntegrationItem = {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  status: IntegrationState;
  health: "Healthy" | "Warning" | "Idle" | "Failed";
  lastSync: string;
  credential: string;
  features: string[];
  fields: string[];
};

type IntegrationCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const categories: IntegrationCategory[] = [
  { id: "ai", title: "AI Providers", description: "LLMs, model routing, usage and API keys.", icon: Bot },
  { id: "voice", title: "Voice Providers", description: "TTS, realtime voice, streaming and language support.", icon: Sparkles },
  { id: "calling", title: "Call Providers", description: "Telephony, numbers, incoming/outgoing calls and logs.", icon: PhoneCall },
  { id: "messaging", title: "Messaging", description: "Team and customer messaging channels.", icon: MessageCircle },
  { id: "google", title: "Google", description: "Workspace productivity and meeting integrations.", icon: Globe2 },
  { id: "meta", title: "Meta", description: "Facebook, Instagram, Messenger and Lead Ads.", icon: Globe2 },
  { id: "email", title: "Email", description: "SMTP and transactional email providers.", icon: Mail },
  { id: "payments", title: "Payments", description: "Payment collection and billing systems.", icon: CreditCard },
  { id: "webhooks", title: "Webhooks", description: "Incoming, outgoing, secrets, retry and logs.", icon: Webhook },
  { id: "custom-api", title: "Custom API", description: "REST, headers, bearer tokens and OAuth placeholders.", icon: Code2 },
];

const providerGroups: Record<string, Array<Omit<IntegrationItem, "category" | "icon" | "status" | "health" | "lastSync" | "credential"> & { icon?: LucideIcon }>> = {
  ai: [
    ["OpenAI", ["Connect", "Disconnect", "Test Connection", "API Key", "Model Selection", "Usage", "Status"]],
    ["Anthropic Claude", ["Connect", "API Key", "Model Selection", "Usage"]],
    ["Google Gemini", ["Connect", "API Key", "Model Selection", "Usage"]],
    ["Azure OpenAI", ["Endpoint", "Deployment", "API Version", "Usage"]],
    ["Groq", ["API Key", "Model Selection", "Low latency"]],
    ["DeepSeek", ["API Key", "Model Selection"]],
    ["Mistral", ["API Key", "Model Selection"]],
    ["Perplexity", ["API Key", "Search-ready models"]],
    ["Ollama (Local)", ["Base URL", "Local model", "Private runtime"]],
  ].map(([name, features]) => ({ id: String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: String(name), features: features as string[], fields: ["API Key", "Model", "Endpoint"] })),
  voice: ["ElevenLabs", "OpenAI Realtime", "Azure Speech", "Google Speech", "Deepgram", "Cartesia", "PlayHT"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["Voice Selection", "Language", "Preview Voice", "Streaming Ready"],
    fields: ["API Key", "Voice", "Language"],
  })),
  calling: ["Twilio", "Exotel", "Knowlarity", "Plivo", "Vonage", "SIP"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["Connect", "Buy Number placeholder", "Assigned Numbers", "Outgoing Calls", "Incoming Calls", "Call Logs"],
    fields: ["Account SID", "Auth Token", "Webhook URL"],
  })),
  messaging: ["WhatsApp Cloud API", "Telegram", "Slack", "Discord", "Microsoft Teams"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["Connect", "Messages", "Templates", "Events", "Logs"],
    fields: ["Access Token", "Bot Token", "Webhook Secret"],
  })),
  google: ["Google Sheets", "Google Calendar", "Gmail", "Google Drive", "Google Meet"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["OAuth", "Sync", "Demo Mode", "Logs", "Health"],
    fields: ["Client ID", "Client Secret", "Scopes"],
    icon: name === "Google Sheets" ? Table2 : name === "Google Calendar" ? CalendarCheck : undefined,
  })),
  meta: ["Facebook", "Instagram", "Messenger", "Facebook Lead Ads"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["OAuth", "Pages", "Forms", "Messages", "Events"],
    fields: ["App ID", "App Secret", "Page Token"],
  })),
  email: ["SMTP", "Resend", "SendGrid", "Mailgun", "Amazon SES"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["Connect", "Sender Domain", "Test Email", "Logs"],
    fields: ["API Key", "Domain", "From Email"],
  })),
  payments: ["Stripe", "Razorpay", "PayPal"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["Connect", "Webhook", "Payments", "Logs"],
    fields: ["Publishable Key", "Secret Key", "Webhook Secret"],
  })),
  webhooks: ["Incoming Webhook", "Outgoing Webhook", "Secret Keys", "Retry", "Logs"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["URL", "Secret Keys", "Retry", "Logs"],
    fields: ["Endpoint URL", "Secret", "Retry Policy"],
  })),
  "custom-api": ["REST API", "Headers", "Bearer Token", "OAuth Placeholder", "Test API"].map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    features: ["REST API", "Headers", "Bearer Token", "OAuth Placeholder", "Test API"],
    fields: ["Base URL", "Headers", "Bearer Token"],
  })),
};

function buildIntegrations(): IntegrationItem[] {
  return categories.flatMap((category, categoryIndex) => {
    const Icon = category.icon;
    return (providerGroups[category.id] ?? []).map((provider, index) => ({
      ...provider,
      category: category.id,
      icon: provider.icon ?? Icon,
      status: category.id === "google" && index < 2 ? "connected" : index % 5 === 0 ? "warning" : "disconnected",
      health: category.id === "google" && index < 2 ? "Healthy" : index % 5 === 0 ? "Warning" : "Idle",
      lastSync: category.id === "google" && index < 2 ? "Demo log ready" : categoryIndex % 2 === 0 ? "Never" : "Provider-ready",
      credential: `rd_${category.id}_****${String(index + 17).padStart(2, "0")}`,
    }));
  });
}

const integrations = buildIntegrations();

const healthVariant: Record<IntegrationItem["health"], BadgeVariant> = {
  Healthy: "success",
  Warning: "warning",
  Idle: "neutral",
  Failed: "danger",
};

const statusVariant: Record<IntegrationState, BadgeVariant> = {
  connected: "success",
  disconnected: "neutral",
  testing: "warning",
  warning: "warning",
};

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60";

export default function IntegrationsModule() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [stateById, setStateById] = useState<Record<string, IntegrationState>>({});
  const [toast, setToast] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  const visibleIntegrations = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return integrations.filter((integration) => {
      const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
      const matchesQuery =
        !normalized ||
        integration.name.toLowerCase().includes(normalized) ||
        integration.features.some((feature) => feature.toLowerCase().includes(normalized));
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const connectedCount = integrations.filter((item) => item.status === "connected").length;
  const warningCount = integrations.filter((item) => item.status === "warning").length;

  async function writeLog(provider: string, action: string, status: "SUCCESS" | "FAILED", error?: string) {
    await fetch("/api/integrations/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        action,
        status,
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        error,
      }),
    }).catch(() => undefined);
  }

  async function testConnection(integration: IntegrationItem) {
    setTestingId(integration.id);
    setStateById((current) => ({ ...current, [integration.id]: "testing" }));
    setToast(`Testing ${integration.name}...`);

    try {
      if (integration.id === "google-sheets") {
        const response = await fetch("/api/integrations/google/sheets/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "Integration Hub",
            lead: {
              name: "Integration Demo Lead",
              email: "integration-demo@rdleadify.ai",
              phone: "+91 90000 00000",
              requirement: "Google Sheets test sync",
            },
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Google Sheets test failed.");
        setToast(data.message || "Google Sheets test completed.");
      } else if (integration.id === "google-calendar") {
        const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const response = await fetch("/api/integrations/google/calendar/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Integration Hub Test Booking",
            attendeeEmail: "integration-demo@rdleadify.ai",
            startTime: start.toISOString(),
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Google Calendar test failed.");
        setToast(data.message || "Google Calendar test completed.");
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        setToast(`${integration.name} test completed in Demo Mode.`);
      }

      setStateById((current) => ({ ...current, [integration.id]: "connected" }));
      await writeLog(integration.name, "TEST_CONNECTION", "SUCCESS");
    } catch (error) {
      const message = error instanceof Error ? error.message : `${integration.name} test failed.`;
      setToast(message);
      setStateById((current) => ({ ...current, [integration.id]: "warning" }));
      await writeLog(integration.name, "TEST_CONNECTION", "FAILED", message);
    } finally {
      setTestingId(null);
    }
  }

  async function changeConnection(integration: IntegrationItem, status: IntegrationState) {
    setStateById((current) => ({ ...current, [integration.id]: status }));
    const action = status === "connected" ? "CONNECT" : status === "disconnected" ? "DISCONNECT" : "RECONNECT";
    setToast(`${integration.name} ${status === "connected" ? "connected" : status === "disconnected" ? "disconnected" : "updated"} in demo mode.`);
    await writeLog(integration.name, action, "SUCCESS");
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Platform" title="Integration Hub" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge variant="info">Workspace-isolated credentials</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Enterprise Integration Hub
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Connect AI, voice, calling, messaging, Google, Meta, email, payments, webhooks and custom APIs from one workspace-level control plane.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button><Plug className="h-4 w-4" />Connect New Integration</Button>
              <Button variant="outline"><FileText className="h-4 w-4" />View Logs</Button>
              <Button variant="outline"><ShieldCheck className="h-4 w-4" />Encryption Architecture</Button>
            </div>
          </div>

          {toast ? <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">{toast}</div> : null}

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <Metric icon={Plug} label="Connected" value={connectedCount} detail="Active provider connections" />
            <Metric icon={Activity} label="Warnings" value={warningCount} detail="Needs review or credentials" />
            <Metric icon={DatabaseZap} label="Available Apps" value={integrations.length} detail="Provider-ready adapters" />
            <Metric icon={KeyRound} label="Credential Mode" value="Encrypted" detail="Masked credentials, scoped by workspace" />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Browse Integrations</CardTitle>
                <CardDescription>Search providers or filter by category. All credentials are designed for encrypted workspace-level storage.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button type="button" onClick={() => setSelectedCategory("all")} className={chipClass(selectedCategory === "all")}>All</button>
                  {categories.map((category) => (
                    <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={chipClass(selectedCategory === category.id)}>
                      {category.title}
                    </button>
                  ))}
                </div>
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search provider, model, webhook..." className={cn(inputClass, "pl-10")} />
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {categories
              .filter((category) => selectedCategory === "all" || selectedCategory === category.id)
              .map((category) => {
                const items = visibleIntegrations.filter((integration) => integration.category === category.id);
                if (!items.length) return null;
                const Icon = category.icon;

                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <CardTitle>{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="neutral">{items.length} providers</Badge>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {items.map((integration) => (
                        <IntegrationCard
                          key={`${integration.category}-${integration.id}`}
                          integration={integration}
                          status={stateById[integration.id] ?? integration.status}
                          testing={testingId === integration.id}
                          onTest={() => void testConnection(integration)}
                          onConnect={() => void changeConnection(integration, "connected")}
                          onDisconnect={() => void changeConnection(integration, "disconnected")}
                        />
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Webhook and Custom API Architecture</CardTitle>
                <CardDescription>Incoming webhooks, outgoing webhooks, secret keys, retries, logs, REST headers, bearer tokens and OAuth placeholders.</CardDescription>
              </div>
              <Webhook className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {["Incoming Webhook URL", "Outgoing Retry Policy", "Secret Key Rotation", "Custom REST Test API"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <Code2 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 font-semibold text-white">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Provider-ready configuration block with logs and masked credentials.</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function chipClass(active: boolean) {
  return cn(
    "shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition",
    active ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-100" : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20",
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string | number; detail: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-5 text-sm text-slate-400">{label}</p>
        <h3 className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</h3>
        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function IntegrationCard({
  integration,
  status,
  testing,
  onTest,
  onConnect,
  onDisconnect,
}: {
  integration: IntegrationItem;
  status: IntegrationState;
  testing: boolean;
  onTest: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const Icon = integration.icon;
  const connected = status === "connected";

  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-400/30">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariant[status]}>{testing ? "Testing" : connected ? "Connected" : status === "warning" ? "Warning" : "Disconnected"}</Badge>
          <Badge variant={healthVariant[integration.health]}>{integration.health}</Badge>
        </div>
      </div>

      <h3 className="mt-4 font-semibold text-white">{integration.name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-slate-400">
        <Row label="Last Sync" value={integration.lastSync} />
        <Row label="Credentials" value={integration.credential} />
        <Row label="Storage" value="Encrypted workspace vault" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {integration.features.slice(0, 5).map((feature) => (
          <Badge key={feature} variant="neutral">{feature}</Badge>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Configuration</p>
        <p className="mt-2 text-sm text-slate-300">{integration.fields.join(" | ")}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button onClick={connected ? onDisconnect : onConnect} variant={connected ? "ghost" : "outline"} className="justify-start">
          {connected ? <Unplug className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
          {connected ? "Disconnect" : "Connect"}
        </Button>
        <Button onClick={onTest} variant="outline" className="justify-start" disabled={testing}>
          <RefreshCw className={cn("h-4 w-4", testing ? "animate-spin" : "")} />
          Test
        </Button>
        <Button variant="outline" className="justify-start">
          <Settings className="h-4 w-4" />
          Configure
        </Button>
        <Button variant="outline" className="justify-start">
          <FileText className="h-4 w-4" />
          Logs
        </Button>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="truncate text-right text-slate-300">{value}</span>
    </div>
  );
}
