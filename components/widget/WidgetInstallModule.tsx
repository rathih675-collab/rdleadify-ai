"use client";

import { Bot, CheckCircle2, Code2, Copy, Globe2, MessageCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WidgetSettings = {
  companyName: string;
  logo: string;
  primaryColor: string;
  greetingMessage: string;
  agentName: string;
  position: string;
  businessHours: string;
  offlineMessage: string;
  theme: "dark" | "light";
  language: string;
  workspaceKey: string;
};

const defaults: WidgetSettings = {
  companyName: "RDLeadify AI",
  logo: "",
  primaryColor: "#10b981",
  greetingMessage: "Hi, I am RDLeadify AI. I can help qualify your requirement and book a demo.",
  agentName: "Riya",
  position: "AI Sales Consultant",
  businessHours: "Mon-Fri, 9:00 AM - 7:00 PM",
  offlineMessage: "We are currently offline, but the AI agent can still collect your details.",
  theme: "dark",
  language: "auto",
  workspaceKey: "default",
};

export default function WidgetInstallModule() {
  const [settings, setSettings] = useState(defaults);
  const [copied, setCopied] = useState(false);

  const embedCode = useMemo(
    () =>
      `<script src="https://app.rdleadify.ai/widget.js" data-workspace="${settings.workspaceKey}" data-company="${settings.companyName}" data-color="${settings.primaryColor}" data-theme="${settings.theme}"></script>`,
    [settings],
  );

  async function copyEmbed() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function update<K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Website Chat" title="AI Website Widget" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Widget Settings</CardTitle>
                  <CardDescription>Brand, greeting, agent identity, hours, theme, and language for embedded websites.</CardDescription>
                </div>
                <Badge variant="success">Production embed ready</Badge>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Company Name" value={settings.companyName} onChange={(value) => update("companyName", value)} />
                <Field label="Logo URL" value={settings.logo} onChange={(value) => update("logo", value)} />
                <Field label="Primary Color" type="color" value={settings.primaryColor} onChange={(value) => update("primaryColor", value)} />
                <Field label="Agent Name" value={settings.agentName} onChange={(value) => update("agentName", value)} />
                <Field label="Position" value={settings.position} onChange={(value) => update("position", value)} />
                <Field label="Business Hours" value={settings.businessHours} onChange={(value) => update("businessHours", value)} />
                <Field label="Greeting Message" value={settings.greetingMessage} onChange={(value) => update("greetingMessage", value)} wide />
                <Field label="Offline Message" value={settings.offlineMessage} onChange={(value) => update("offlineMessage", value)} wide />
                <label className="grid gap-2 text-sm text-slate-300">
                  Theme
                  <select value={settings.theme} onChange={(event) => update("theme", event.target.value as WidgetSettings["theme"])} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Language
                  <select value={settings.language} onChange={(event) => update("language", event.target.value)} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none">
                    <option value="auto">Auto detect</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                  </select>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>Visual contract for webinar demos and client installs.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className={settings.theme === "dark" ? "rounded-2xl border border-white/10 bg-[#0b1628]" : "rounded-2xl border border-slate-200 bg-white text-slate-950"}>
                  <div className="flex items-center gap-3 rounded-t-2xl p-4 text-slate-950" style={{ background: settings.primaryColor }}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/80 font-bold">RD</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{settings.companyName}</p>
                      <p className="truncate text-xs font-semibold opacity-80">{settings.agentName} - {settings.position}</p>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className={settings.theme === "dark" ? "rounded-2xl bg-white/10 p-3 text-sm text-slate-200" : "rounded-2xl bg-slate-100 p-3 text-sm text-slate-700"}>
                      {settings.greetingMessage}
                    </div>
                    <div className="ml-auto max-w-[82%] rounded-2xl p-3 text-sm font-semibold text-slate-950" style={{ background: settings.primaryColor }}>
                      I need AI CRM and demo booking.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Installation Code</CardTitle>
                <CardDescription>Client copies one script tag and installs the widget on any website.</CardDescription>
              </div>
              <Button onClick={() => void copyEmbed()}>
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-emerald-100"><code>{embedCode}</code></pre>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Capability icon={MessageCircle} title="AI Chat" detail="Memory, multilingual replies, markdown, quick replies, and streaming animation." />
                <Capability icon={Bot} title="CRM + Inbox" detail="Creates leads, updates scores, logs activity, and appears in omnichannel inbox." />
                <Capability icon={Globe2} title="Google Ready" detail="Buttons send demo logs to Sheets and Calendar with OAuth adapter slots ready." />
                <Capability icon={Sparkles} title="Voice Ready" detail="Talk to AI Voice Agent button records demo requests for Twilio or Exotel." />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, type = "text", wide, onChange }: { label: string; value: string; type?: string; wide?: boolean; onChange: (value: string) => void }) {
  return (
    <label className={wide ? "grid gap-2 text-sm text-slate-300 md:col-span-2" : "grid gap-2 text-sm text-slate-300"}>
      {label}
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none" />
    </label>
  );
}

function Capability({ icon: Icon, title, detail }: { icon: typeof Code2; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <Icon className="h-5 w-5 text-emerald-300" />
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}
