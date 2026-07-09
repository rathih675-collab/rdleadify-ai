"use client";

import { useState } from "react";
import { Mic2, PhoneForwarded, Radio, Send } from "lucide-react";

import MvpShell from "@/components/mvp/MvpShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const demoTranscript = "Hi, my name is Riya Shah. I run Skyline Realty and need AI follow-up for property leads. My phone is +91 98765 43210 and budget is 75000 INR. We want to start this month.";

export default function VoiceAgentMvpModule() {
  const [prompt, setPrompt] = useState("You are a friendly AI voice sales assistant. Keep calls natural, qualify the lead, summarize the requirement, and queue follow-up.");
  const [voice, setVoice] = useState("Indian English - Riya");
  const [transcript, setTranscript] = useState(demoTranscript);
  const [lead, setLead] = useState<Record<string, string>>({});
  const [queue, setQueue] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [notice, setNotice] = useState("");

  function extractLead() {
    const email = transcript.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
    const phone = transcript.match(/(?:\+?\d[\d\s-]{7,}\d)/)?.[0]?.trim() || "";
    const name = transcript.match(/(?:my name is|i am|this is)\s+([^,.]+)/i)?.[1]?.trim() || "";
    const budget = transcript.match(/(?:budget\s*(?:is|of)?\s*)?((?:rs\.?|inr|\$)?\s?\d[\d,.]*(?:\s?(?:lakh|lac|k|m|million))?)/i)?.[1]?.trim() || "";
    const business = transcript.match(/(?:run|from|business is)\s+([^,.]+)/i)?.[1]?.trim() || "";
    const requirement = transcript.match(/(?:need|looking for|want)\s+([^,.]+)/i)?.[1]?.trim() || transcript;
    const timeline = transcript.match(/(?:today|tomorrow|this week|this month|next month|in \d+\s?(?:days|weeks|months))/i)?.[0] || "";
    setLead({ name, phone, email, business, requirement, budget, timeline });
    setNotice("Lead extracted from voice transcript.");
  }

  async function queueFollowUp() {
    const response = await fetch("/api/widget/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: `voice_${Date.now()}`,
        conversationId: `voice_${Date.now()}`,
        lead,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setQueue((current) => [{ id: data.taskId || `${Date.now()}`, title: lead.name || "Voice lead", status: "Queued" }, ...current]);
      setNotice(data.message || "Voice follow-up queued.");
    } else {
      setNotice(data.error || "Could not queue voice follow-up.");
    }
  }

  return (
    <MvpShell eyebrow="AI Core" title="Voice Agent">
      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Voice Agent Prompt</CardTitle>
              <CardDescription>Configure the voice employee behavior for demo calls and future telephony.</CardDescription>
            </div>
            <Mic2 className="h-5 w-5 text-emerald-300" />
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Voice agent prompt
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={6} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-emerald-400/60" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Voice selection
              <select value={voice} onChange={(event) => setVoice(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none">
                <option>Indian English - Riya</option>
                <option>Hinglish - Priya</option>
                <option>Hindi - Aarav</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Demo voice conversation simulator
              <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={8} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-emerald-400/60" />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button onClick={extractLead}><Radio className="h-4 w-4" />Run Demo Conversation</Button>
              <Button onClick={queueFollowUp} variant="secondary"><PhoneForwarded className="h-4 w-4" />Queue Voice Follow-up</Button>
            </div>
            {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Lead Extraction</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["name", "phone", "email", "business", "requirement", "budget", "timeline"].map((field) => (
                <div key={field} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{field}</p>
                  <p className="mt-1 text-sm text-white">{lead[field] || "Not captured"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Voice Follow-up Queue</CardTitle>
                <CardDescription>Demo queue now, telephony provider later.</CardDescription>
              </div>
              <Send className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.length ? queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
                  <span className="text-sm text-white">{item.title}</span>
                  <Badge variant="warning">{item.status}</Badge>
                </div>
              )) : <p className="text-sm text-slate-400">No queued voice follow-ups yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Future Twilio/Exotel Status</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="neutral">Twilio pending</Badge>
              <Badge variant="neutral">Exotel pending</Badge>
              <Badge variant="success">Demo simulator ready</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </MvpShell>
  );
}
