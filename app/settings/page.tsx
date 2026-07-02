import {
  Activity,
  BadgeDollarSign,
  BellRing,
  Bot,
  Building2,
  Clock,
  Code2,
  CreditCard,
  FileText,
  Mail,
  MessageCircle,
  Mic2,
  ReceiptText,
  Save,
  ShieldCheck,
  Smartphone,
  Upload,
  UserRound,
  UsersRound,
  Webhook,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";

const settingsNav = [
  { label: "Profile", href: "#profile", icon: UserRound },
  { label: "Workspace", href: "#workspace", icon: Building2 },
  { label: "Security", href: "#security", icon: ShieldCheck },
  { label: "Email", href: "#email", icon: Mail },
  { label: "WhatsApp", href: "#whatsapp", icon: MessageCircle },
  { label: "AI", href: "#ai", icon: Bot },
  { label: "Team", href: "#team", icon: UsersRound },
  { label: "Billing", href: "#billing", icon: CreditCard },
  { label: "Developer", href: "#developer", icon: Code2 },
];

const loginHistory = [
  { device: "Chrome on Windows", location: "Mumbai, IN", time: "Today, 10:42 AM" },
  { device: "Safari on iPhone", location: "Bengaluru, IN", time: "Yesterday, 7:18 PM" },
  { device: "Edge on Windows", location: "Delhi, IN", time: "Jun 30, 2026" },
];

const rolePreview = [
  { role: "Super Admin", access: "All modules, billing, integrations, team controls" },
  { role: "Admin", access: "Workspace operations, settings, reporting, automations" },
  { role: "Manager", access: "Pipelines, teams, reports, campaigns" },
  { role: "Sales Agent", access: "Leads, tasks, contacts, appointments" },
  { role: "Support", access: "Contacts, WhatsApp, tickets, appointments" },
];

function Section({
  id,
  title,
  description,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10 backdrop-blur"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <Button size="sm">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
}: {
  label: string;
  value?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <select
        defaultValue={value}
        className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, description, enabled = false }: { label: string; description: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/30 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm leading-5 text-slate-400">{description}</p>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-emerald-400" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </span>
    </div>
  );
}

function StatusBadge({ tone, children }: { tone: "ok" | "warn" | "muted"; children: ReactNode }) {
  const className =
    tone === "ok"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : tone === "warn"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
        : "border-white/10 bg-white/5 text-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function SecretStatus({ label, value, connected = false }: { label: string; value: string; connected?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-2 font-mono text-xs text-slate-400">{value}</p>
        </div>
        <StatusBadge tone={connected ? "ok" : "warn"}>
          {connected ? "Connected" : "Missing"}
        </StatusBadge>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Operations" title="Enterprise Settings" />

        <section className="p-4 md:p-6 lg:p-8">
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628] p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                  RDLeadify AI Control Center
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Workspace, security, channels, AI, and billing settings.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                  Configure the operating layer for teams, campaigns, verification,
                  automation, WhatsApp, voice agents, and developer access.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="ok">Production ready UI</StatusBadge>
                <StatusBadge tone="warn">Secrets masked</StatusBadge>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[17rem_1fr]">
            <aside className="xl:sticky xl:top-28 xl:self-start">
              <nav className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.045] p-2 backdrop-blur md:grid-cols-3 xl:grid-cols-1">
                {settingsNav.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="h-4 w-4 text-emerald-300" />
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </aside>

            <div className="grid gap-6">
              <Section
                id="profile"
                title="Profile Settings"
                description="Manage your operator identity, communication preferences, and regional defaults."
                icon={UserRound}
              >
                <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl font-bold text-emerald-300">
                      RD
                    </span>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Upload className="h-4 w-4" />
                      Avatar
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name" value="Admin User" />
                    <Field label="Email" value="admin@rdleadify.ai" type="email" />
                    <Field label="Phone" value="+91 98765 43210" />
                    <SelectField label="Timezone" value="Asia/Kolkata" options={["Asia/Kolkata", "UTC", "Asia/Dubai", "America/New_York"]} />
                    <SelectField label="Language" value="English" options={["English", "Hindi", "Arabic", "Spanish"]} />
                  </div>
                </div>
              </Section>

              <Section
                id="workspace"
                title="Workspace Settings"
                description="Brand your workspace and align CRM defaults with your business operating model."
                icon={Building2}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Workspace name" value="RDLeadify AI" />
                  <SelectField label="Business category" value="AI CRM" options={["AI CRM", "Agency", "Real Estate", "Education", "Healthcare", "Financial Services"]} />
                  <Field label="Website" value="https://rdleadify.ai" />
                  <SelectField label="Currency" value="INR" options={["INR", "USD", "AED", "EUR", "GBP"]} />
                  <Field label="Address" value="Mumbai, Maharashtra" />
                  <Field label="Working hours" value="09:30 - 18:30, Monday to Friday" />
                  <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-4 md:col-span-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Logo upload UI</p>
                        <p className="mt-1 text-sm text-slate-400">PNG, JPG, or SVG. Recommended 512x512.</p>
                      </div>
                      <Button variant="outline">
                        <Upload className="h-4 w-4" />
                        Upload logo
                      </Button>
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                id="security"
                title="Security Settings"
                description="Control password policy, two-factor readiness, active sessions, and login history."
                icon={ShieldCheck}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid gap-4">
                    <Field label="Current password" placeholder="••••••••••" type="password" />
                    <Field label="New password" placeholder="Minimum 10 characters" type="password" />
                    <Toggle label="Two-factor authentication" description="Require a second factor for privileged roles." />
                    <Toggle label="Session alerts" description="Notify admins when a new device signs in." enabled />
                  </div>
                  <div className="grid gap-4">
                    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-300" />
                        <p className="text-sm font-semibold text-white">Active sessions</p>
                      </div>
                      <div className="space-y-3">
                        {loginHistory.slice(0, 2).map((item) => (
                          <div key={item.time} className="flex items-start justify-between gap-3 text-sm">
                            <span>
                              <span className="block text-slate-200">{item.device}</span>
                              <span className="block text-slate-500">{item.location}</span>
                            </span>
                            <span className="text-right text-xs text-slate-500">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-300" />
                        <p className="text-sm font-semibold text-white">Login history</p>
                      </div>
                      <div className="space-y-3">
                        {loginHistory.map((item) => (
                          <div key={`${item.device}-${item.time}`} className="flex items-start justify-between gap-3 text-sm">
                            <span className="text-slate-300">{item.device}</span>
                            <span className="text-right text-xs text-slate-500">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                id="email"
                title="Email Settings"
                description="Configure transactional email delivery, templates, and SMTP fallbacks."
                icon={Mail}
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <SecretStatus label="Resend API key status" value="re_••••••••••••••••••••••••" connected={false} />
                  <SecretStatus label="SMTP password" value="smtp_••••••••••••" />
                  <Field label="SMTP host" value="smtp.yourdomain.com" />
                  <Field label="SMTP from email" value="noreply@rdleadify.ai" />
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-white">Email templates</p>
                    </div>
                    <div className="grid gap-3">
                      <button className="rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10">Verification email template</button>
                      <button className="rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10">Password reset template</button>
                    </div>
                  </div>
                  <Toggle label="Developer fallback" description="Show secure dev verification when RESEND_API_KEY is missing." enabled />
                </div>
              </Section>

              <Section
                id="whatsapp"
                title="WhatsApp Settings"
                description="Connect Meta WhatsApp Business assets and protect webhook credentials."
                icon={MessageCircle}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="WABA ID" value="1234567890" />
                  <Field label="Phone Number ID" value="9876543210" />
                  <SecretStatus label="Access Token status" value="EAAG••••••••••••••••••••" connected />
                  <Field label="Webhook Verify Token" value="rdleadify_verify_••••" />
                  <SecretStatus label="App Secret status" value="appsec_••••••••••••" connected />
                  <Toggle label="Webhook health alerts" description="Alert admins when WhatsApp callbacks fail." enabled />
                </div>
              </Section>

              <Section
                id="ai"
                title="AI Settings"
                description="Tune model defaults, voice configuration, and knowledge base availability."
                icon={Bot}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <SecretStatus label="OpenAI API key status" value="sk-••••••••••••••••••••" connected={false} />
                  <SecretStatus label="ElevenLabs API key status" value="el_••••••••••••••••" connected />
                  <SelectField label="Default voice" value="Professional Indian English" options={["Professional Indian English", "Warm Sales Advisor", "Neutral Support Agent"]} />
                  <SelectField label="AI model" value="gpt-4.1-mini" options={["gpt-4.1-mini", "gpt-4.1", "o4-mini"]} />
                  <Field label="Temperature" value="0.4" />
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Mic2 className="h-4 w-4 text-emerald-300" />
                        <p className="text-sm font-semibold text-white">Knowledge base status</p>
                      </div>
                      <StatusBadge tone="ok">Indexed</StatusBadge>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">34 documents indexed for AI agents.</p>
                  </div>
                </div>
              </Section>

              <Section
                id="team"
                title="Team & Permissions"
                description="Set invite rules and preview role-based access before inviting operators."
                icon={UsersRound}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <div className="grid gap-4">
                    <SelectField label="Default role" value="Sales Agent" options={["Admin", "Manager", "Sales Agent", "Support"]} />
                    <Toggle label="Restrict invites to admins" description="Only Super Admin and Admin roles can invite users." enabled />
                    <Toggle label="Require verified domains" description="Allow invites only for approved company domains." />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="mb-3 text-sm font-semibold text-white">Role based access preview</p>
                    <div className="space-y-3">
                      {rolePreview.map((item) => (
                        <div key={item.role} className="rounded-lg border border-white/10 p-3">
                          <p className="text-sm font-semibold text-emerald-200">{item.role}</p>
                          <p className="mt-1 text-sm leading-5 text-slate-400">{item.access}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                id="billing"
                title="Billing Settings"
                description="Track plan usage, invoices, and payment-provider readiness."
                icon={BadgeDollarSign}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-sm text-emerald-200">Plan</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">Enterprise</h3>
                    <p className="mt-2 text-sm text-slate-300">AI CRM suite with automation controls.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm text-slate-400">Usage</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">68%</h3>
                    <p className="mt-2 text-sm text-slate-400">12,400 messages and 310 AI calls.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-white">Invoices</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">June invoice ready for download.</p>
                    <StatusBadge tone="muted">Razorpay/Stripe placeholder</StatusBadge>
                  </div>
                </div>
              </Section>

              <Section
                id="developer"
                title="Developer Settings"
                description="Manage API access, webhooks, operational logs, and rate limit controls."
                icon={Code2}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <SecretStatus label="Primary API key" value="rdlk_live_••••••••••••••••" connected />
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-white">Webhooks</p>
                    </div>
                    <Field label="Lead created endpoint" value="https://api.example.com/rdleadify/leads" />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-white">Logs</p>
                    </div>
                    <p className="text-sm text-slate-400">Retention: 30 days. Export available for admins.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-white">Rate limits</p>
                    </div>
                    <p className="text-sm text-slate-400">1,000 requests/minute per workspace.</p>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
