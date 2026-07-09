"use client";

import { useEffect, useState } from "react";
import { Bot, CalendarClock, Save, Send, Sheet } from "lucide-react";

import MvpShell from "@/components/mvp/MvpShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Message = { role: "assistant" | "user"; content: string };
type LeadInfo = Record<string, string | undefined>;
type Analysis = {
  leadInfo: LeadInfo;
  score?: number;
  status?: string;
  summary?: string;
  nextAction?: string;
  tags?: string[];
};

export default function AiAgentMvpModule() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I am your AI sales assistant. Ask me anything, or tell me what you need help with." },
  ]);
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>({ leadInfo: {}, score: 0, status: "New", tags: ["AI Qualified"] });
  const [conversationId, setConversationId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastSavedLeadId, setLastSavedLeadId] = useState<string>();
  const [memory, setMemory] = useState<Array<{ id: string; title: string; detail: string; time: string; type?: string }>>([]);

  useEffect(() => {
    void loadMemory();
  }, []);

  async function loadMemory() {
    const response = await fetch("/api/ai/memory");
    if (!response.ok) return;
    const data = await response.json();
    setMemory(data.timeline || []);
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || busy) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setNotice("");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          leadInfo: analysis.leadInfo,
          conversationId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI chat failed.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      setAnalysis(data.analysis || analysis);
      setConversationId(data.conversationId);
      if (data.lead?.id) {
        setLastSavedLeadId(data.lead.id);
        setNotice(data.sheetSync ? "Lead auto-saved and Google Sheet sync is ready." : "Lead auto-saved.");
      }
      void loadMemory();
    } catch (error) {
      setMessages([...nextMessages, { role: "assistant", content: error instanceof Error ? error.message : "AI chat failed." }]);
    } finally {
      setBusy(false);
    }
  }

  async function saveLead() {
    setNotice("");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadInfo: analysis.leadInfo,
        score: analysis.score,
        status: analysis.status,
        tags: analysis.tags,
        summary: analysis.summary,
        nextAction: analysis.nextAction,
        conversationId,
        source: "AI Chat",
      }),
    });
    const data = await response.json();
    if (data.lead?.id) setLastSavedLeadId(data.lead.id);
    setNotice(response.ok ? "Lead saved." : data.error || "Lead save failed.");
  }

  async function sendToSheet() {
    setNotice("");
    const response = await fetch("/api/integrations/google/sheets/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lastSavedLeadId,
        source: "AI Chat",
        lead: {
          ...analysis.leadInfo,
          leadScore: analysis.score,
          aiSummary: analysis.summary,
          summary: analysis.summary,
          status: analysis.status,
          tags: analysis.tags,
        },
      }),
    });
    const data = await response.json();
    setNotice(response.ok ? data.message || "Sent to Google Sheet." : data.error || "Google Sheet sync failed.");
  }

  const fields = ["name", "phone", "email", "business", "requirement", "budget", "timeline", "demoTime"];

  return (
    <MvpShell eyebrow="AI Core" title="AI Chat Agent">
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="min-h-[640px]">
          <CardHeader>
            <div>
              <CardTitle>AI Chat Agent</CardTitle>
              <CardDescription>Answers from memory first, extracts lead fields silently, and asks one natural follow-up.</CardDescription>
            </div>
            <Badge variant={busy ? "warning" : "success"}>{busy ? "Thinking" : "Ready"}</Badge>
          </CardHeader>
          <CardContent className="flex min-h-[540px] flex-col gap-4">
            <div className="flex-1 space-y-3 overflow-auto rounded-xl border border-white/10 bg-black/20 p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[82%] rounded-xl bg-emerald-500 px-4 py-3 text-sm text-slate-950" : "max-w-[82%] rounded-xl bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100"}>
                  {message.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }}
                placeholder="Type a visitor message..."
                className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-emerald-400/60"
              />
              <Button onClick={sendMessage} disabled={busy}><Send className="h-4 w-4" />Send</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Lead Capture</CardTitle>
                <CardDescription>CRM-ready fields extracted from normal conversation.</CardDescription>
              </div>
              <Badge variant="info">{analysis.score ?? 0}/100</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field) => (
                <div key={field} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{field}</p>
                  <p className="mt-1 break-words text-sm text-white">{analysis.leadInfo?.[field] || "Not captured"}</p>
                </div>
              ))}
              <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-6 text-slate-300">{analysis.summary || "Conversation summary will appear here."}</p>
              <div className="grid gap-2">
                <Button onClick={saveLead}><Save className="h-4 w-4" />Save Lead</Button>
                <Button onClick={sendToSheet} variant="secondary"><Sheet className="h-4 w-4" />Send to Google Sheet</Button>
                <Button type="button" variant="outline" onClick={() => setNotice("Calendar booking placeholder is ready for Google Calendar rollout.")}>
                  <CalendarClock className="h-4 w-4" />Book Calendar
                </Button>
              </div>
              {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Conversation Memory Preview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {memory.length ? memory.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.detail}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No memory yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </MvpShell>
  );
}
