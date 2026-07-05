"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarCheck, CheckCircle2, ExternalLink, Mail, RefreshCw, ShieldCheck, Table2, Unplug } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GoogleStatus = {
  connected: boolean;
  status: string;
  connectedEmail?: string | null;
  lastSync?: string | null;
  scopes?: string[];
  maskedCredentials?: {
    accessToken?: string;
    refreshToken?: string | null;
    expiryDate?: string | null;
    encrypted?: boolean;
  } | null;
  demoMode: boolean;
  missingOAuthEnv?: string[];
  missingSheetsEnv?: string[];
  missingCalendarEnv?: string[];
  message?: string;
};

export default function GoogleIntegrationPage() {
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<"sheet" | "calendar" | null>(null);

  const connected = Boolean(status?.connected);
  const lastSyncLabel = useMemo(() => {
    if (!status?.lastSync) return "Never";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(status.lastSync));
  }, [status?.lastSync]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNotice(params.get("connected") || params.get("error") || "");
    void refreshStatus();
  }, []);

  async function refreshStatus() {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/google/status");
      const data = (await response.json()) as GoogleStatus & { error?: string };
      if (!response.ok) throw new Error(data.error || "Google status unavailable.");
      setStatus(data);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Google status unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setNotice("");
    const response = await fetch("/api/integrations/google/disconnect", { method: "POST" });
    const data = (await response.json()) as { message?: string; error?: string };
    setNotice(response.ok ? data.message || "Google disconnected." : data.error || "Disconnect failed.");
    await refreshStatus();
  }

  async function testSheet() {
    setTesting("sheet");
    setNotice("");
    try {
      const response = await fetch("/api/integrations/google/sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "Google Integration Setup",
          lead: {
            name: "Integration Test Lead",
            phone: "+91 90000 00000",
            email: "test@rdleadify.ai",
            company: "RDLeadify AI",
            requirement: "Google Sheets test sync",
            budget: "Test",
            leadScore: 100,
            aiSummary: "Test connection from Google integration setup.",
          },
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setNotice(response.ok ? data.message || "Sync successful" : data.error || "Google Sheets test failed.");
      await refreshStatus();
    } finally {
      setTesting(null);
    }
  }

  async function testCalendar() {
    setTesting("calendar");
    setNotice("");
    try {
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const response = await fetch("/api/integrations/google/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Google Integration Test Booking",
          startTime: start.toISOString(),
          endTime: new Date(start.getTime() + 30 * 60 * 1000).toISOString(),
          attendeeEmail: "test@rdleadify.ai",
          requirement: "Google Calendar test booking",
          lead: {
            name: "Integration Test Lead",
            email: "test@rdleadify.ai",
            phone: "+91 90000 00000",
            requirement: "Google Calendar test booking",
            aiSummary: "Test connection from Google integration setup.",
          },
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setNotice(response.ok ? data.message || "Booking successful" : data.error || "Google Calendar test failed.");
      await refreshStatus();
    } finally {
      setTesting(null);
    }
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Topbar eyebrow="Integrations" title="Google Integration" />
        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-300">OAuth-ready Google Workspace connection</p>
              <h1 className="mt-2 text-2xl font-bold text-white">Sheets and Calendar Setup</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Connect once, then qualified AI Agent and Website Widget leads can sync to Google Sheets and book Google Calendar appointments.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void refreshStatus()} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button asChild>
                <a href="/api/integrations/google/connect">
                  <ExternalLink className="h-4 w-4" />
                  Connect Google
                </a>
              </Button>
            </div>
          </div>

          {notice ? (
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-3">
            <SetupCard
              icon={Mail}
              title="Google Account Connection"
              description="OAuth account, profile email, credential mask, and disconnect controls."
              connected={connected}
              connectedEmail={status?.connectedEmail}
              lastSync={lastSyncLabel}
              footer={status?.maskedCredentials ? `Tokens masked: ${status.maskedCredentials.accessToken} / ${status.maskedCredentials.refreshToken || "no refresh token"}` : "Tokens are never exposed in the UI."}
            >
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/api/integrations/google/connect">
                    <ShieldCheck className="h-4 w-4" />
                    {connected ? "Reconnect" : "Connect"}
                  </a>
                </Button>
                <Button variant="outline" onClick={() => void disconnect()} disabled={!connected}>
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </SetupCard>

            <SetupCard
              icon={Table2}
              title="Google Sheets"
              description="Appends qualified lead rows to the configured spreadsheet."
              connected={connected && !status?.missingSheetsEnv?.length}
              connectedEmail={status?.connectedEmail}
              lastSync={lastSyncLabel}
              footer={status?.missingSheetsEnv?.length ? `Missing: ${status.missingSheetsEnv.join(", ")}` : "Spreadsheet ID configured."}
            >
              <Button variant="outline" onClick={() => void testSheet()} disabled={testing !== null}>
                <Table2 className="h-4 w-4" />
                {testing === "sheet" ? "Testing..." : "Test connection"}
              </Button>
            </SetupCard>

            <SetupCard
              icon={CalendarCheck}
              title="Google Calendar"
              description="Creates demo appointments with attendee email and meeting details."
              connected={connected && !status?.missingCalendarEnv?.length}
              connectedEmail={status?.connectedEmail}
              lastSync={lastSyncLabel}
              footer={status?.missingCalendarEnv?.length ? `Missing: ${status.missingCalendarEnv.join(", ")}` : "Calendar ID configured."}
            >
              <Button variant="outline" onClick={() => void testCalendar()} disabled={testing !== null}>
                <CalendarCheck className="h-4 w-4" />
                {testing === "calendar" ? "Testing..." : "Test connection"}
              </Button>
            </SetupCard>
          </div>
        </section>
      </main>
    </div>
  );
}

function SetupCard({
  icon: Icon,
  title,
  description,
  connected,
  connectedEmail,
  lastSync,
  footer,
  children,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  connected: boolean;
  connectedEmail?: string | null;
  lastSync: string;
  footer: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Badge variant={connected ? "success" : "warning"}>{connected ? "Connected" : "Demo"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
          <StatusRow label="Connection status" value={connected ? "Connected" : "Demo mode active"} />
          <StatusRow label="Connected email" value={connectedEmail || "Not connected"} />
          <StatusRow label="Last sync" value={lastSync} />
          <StatusRow label="Credentials" value="Masked server-side only" />
        </div>
        {children}
        <p className="text-xs leading-5 text-slate-500">{footer}</p>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="truncate font-medium text-white">{value}</span>
    </div>
  );
}
