"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BotMessageSquare, Copy, ExternalLink, Settings2 } from "lucide-react";

import MvpShell from "@/components/mvp/MvpShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WebsiteWidgetMvpModule() {
  const [agentName, setAgentName] = useState("Riya");
  const [welcome, setWelcome] = useState("Hi, I am Riya. How can I help you today?");
  const [color, setColor] = useState("#10b981");
  const [activity, setActivity] = useState<Array<{ id: string; title: string; detail: string; type?: string }>>([]);
  const installScript = useMemo(
    () => `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget/rdleadify-widget.js" data-rdleadify-workspace="default" async></script>`,
    [],
  );

  useEffect(() => {
    fetch("/api/ai/memory")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setActivity((data?.timeline || []).filter((item: { title?: string; detail?: string }) => `${item.title} ${item.detail}`.toLowerCase().includes("widget")).slice(0, 5)))
      .catch(() => setActivity([]));
  }, []);

  async function copyScript() {
    await navigator.clipboard.writeText(installScript);
  }

  return (
    <MvpShell eyebrow="AI Core" title="Website Widget">
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Widget Preview</CardTitle>
              <CardDescription>Customer-facing chat widget for website lead capture.</CardDescription>
            </div>
            <BotMessageSquare className="h-5 w-5 text-emerald-300" />
          </CardHeader>
          <CardContent>
            <div className="min-h-[520px] rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="ml-auto flex h-[460px] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628] shadow-2xl">
                <div className="flex items-center gap-3 p-4" style={{ backgroundColor: color }}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                    <BotMessageSquare className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{agentName}</p>
                    <p className="text-xs text-slate-900">AI Sales Assistant</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 p-4">
                  <div className="max-w-[85%] rounded-xl bg-white/10 p-3 text-sm leading-6 text-white">{welcome}</div>
                  <div className="ml-auto max-w-[85%] rounded-xl p-3 text-sm text-slate-950" style={{ backgroundColor: color }}>I need pricing and a demo.</div>
                  <div className="max-w-[85%] rounded-xl bg-white/10 p-3 text-sm leading-6 text-white">Sure. I can answer from business memory and capture the right details for our team.</div>
                </div>
                <div className="border-t border-white/10 p-3">
                  <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-500">Type your message...</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Widget Settings</CardTitle>
                <CardDescription>Keep the website widget simple for MVP launch.</CardDescription>
              </div>
              <Settings2 className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Agent name" value={agentName} onChange={setAgentName} />
              <Field label="Welcome message" value={welcome} onChange={setWelcome} />
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Brand color
                <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-black/20 p-1" />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Install Script</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <pre className="overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-5 text-emerald-100"><code>{installScript}</code></pre>
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyScript}><Copy className="h-4 w-4" />Copy Script</Button>
                <Button asChild variant="secondary"><Link href="/widget-demo" target="_blank"><ExternalLink className="h-4 w-4" />Test Client Website</Link></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Latest Widget Leads</CardTitle>
                <CardDescription>Recent widget activity from AI memory/logs.</CardDescription>
              </div>
              <Badge variant="info">{activity.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length ? activity.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.detail}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No widget leads yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </MvpShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-300">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-emerald-400/60" />
    </label>
  );
}
