"use client";

import { useMemo, useState } from "react";
import { Bot, BrainCircuit, MessageCircle, Play, ShieldCheck, UserRound } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiBrainLanguages, buildBrainSystemPrompt, defaultKnowledgeSources, defaultPromptConfig, personalityPresets, simulateBrainAnswer } from "@/lib/ai/brain";

type TestMessage = {
  role: "admin" | "ai";
  text: string;
};

export default function AiBrainPlaygroundModule() {
  const [question, setQuestion] = useState("Can RDLeadify sync leads to Google Sheets and book a demo?");
  const [language, setLanguage] = useState("English");
  const [personalityId, setPersonalityId] = useState("sales");
  const [messages, setMessages] = useState<TestMessage[]>([
    { role: "ai", text: "Ask a question to test how the shared AI Brain will answer across chat and voice." },
  ]);
  const personality = personalityPresets.find((item) => item.id === personalityId) ?? personalityPresets[0];
  const systemPrompt = useMemo(() => buildBrainSystemPrompt(defaultPromptConfig, personality, language), [personality, language]);

  function runTest() {
    const answer = simulateBrainAnswer(question, defaultPromptConfig);
    setMessages((current) => [...current, { role: "admin", text: question }, { role: "ai", text: answer }]);
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="AI Brain" title="AI Playground" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)_420px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Test Controls</CardTitle>
                  <CardDescription>Preview prompt behavior before publishing.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="grid gap-2 text-sm text-slate-300">
                  Question
                  <textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-32 rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none" />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Personality
                  <select value={personalityId} onChange={(event) => setPersonalityId(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none">
                    {personalityPresets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Language
                  <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none">
                    {aiBrainLanguages.map((item) => <option key={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <Button onClick={runTest} className="w-full"><Play className="h-4 w-4" />Run Test</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Conversation Preview</CardTitle>
                  <CardDescription>Same AI Brain behavior for AI Chat Agent and AI Voice Agent.</CardDescription>
                </div>
                <Badge variant="success"><ShieldCheck className="h-3.5 w-3.5" />Knowledge-bound</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[86%] rounded-2xl border p-4 ${message.role === "admin" ? "border-emerald-400/25 bg-emerald-400/10" : "border-white/10 bg-black/20"}`}>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {message.role === "admin" ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        {message.role}
                      </div>
                      <p className="text-sm leading-6 text-slate-200">{message.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Active Knowledge</CardTitle>
                    <CardDescription>Sources available for test answers.</CardDescription>
                  </div>
                  <BrainCircuit className="h-5 w-5 text-emerald-300" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {defaultKnowledgeSources.map((source) => (
                    <div key={source.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="font-semibold text-white">{source.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{source.summary}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Prompt Snapshot</CardTitle>
                  <CardDescription>Generated from Prompt Engine defaults.</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-emerald-100"><code>{systemPrompt}</code></pre>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <Rule title="Unavailable information" detail={"The AI returns: I'll have our team assist you."} />
              <Rule title="Pricing safety" detail="The AI never invents pricing or discounts outside configured rules." />
              <Rule title="Cross-channel consistency" detail="Chat, voice, and widget share the same brain contract." />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Rule({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <MessageCircle className="h-5 w-5 text-emerald-300" />
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}
