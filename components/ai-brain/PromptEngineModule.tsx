"use client";

import { useMemo, useState } from "react";
import { Bot, BrainCircuit, CheckCircle2, Globe2, Save, Settings, Sparkles } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiBrainLanguages, buildBrainSystemPrompt, defaultPromptConfig, personalityPresets, type PromptEngineConfig } from "@/lib/ai/brain";

export default function PromptEngineModule() {
  const [config, setConfig] = useState<PromptEngineConfig>(defaultPromptConfig);
  const [personalityId, setPersonalityId] = useState("sales");
  const [customPersonality, setCustomPersonality] = useState("");
  const [language, setLanguage] = useState("English");
  const [notice, setNotice] = useState("");
  const selectedPreset = personalityPresets.find((item) => item.id === personalityId) ?? personalityPresets[0];
  const activePersonality = customPersonality
    ? { ...selectedPreset, name: customPersonality, description: "Custom admin-defined personality." }
    : selectedPreset;
  const systemPrompt = useMemo(() => buildBrainSystemPrompt(config, activePersonality, language), [config, activePersonality, language]);

  function update(field: keyof PromptEngineConfig, value: string) {
    setConfig((current) => ({ ...current, [field]: value }));
  }

  function publish() {
    setNotice("AI Brain prompt published for Chat Agent and Voice Agent demo mode.");
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="AI Brain" title="Prompt Engine" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          {notice ? <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">{notice}</div> : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>AI Prompt Engine</CardTitle>
                  <CardDescription>Configure the central instructions used by AI Chat Agent, AI Voice Agent, and Website Widget.</CardDescription>
                </div>
                <Button onClick={publish}><Save className="h-4 w-4" />Publish Brain</Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {(Object.keys(config) as Array<keyof PromptEngineConfig>).map((field) => (
                  <label key={field} className={field === "businessDescription" || field === "productsServices" || field === "faqs" ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
                    <span className="text-sm font-semibold capitalize text-slate-300">{labelFor(field)}</span>
                    <textarea value={config[field]} onChange={(event) => update(field, event.target.value)} className="min-h-28 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-emerald-400/50" />
                  </label>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>AI Personality</CardTitle>
                    <CardDescription>Preset or custom behavior profile.</CardDescription>
                  </div>
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {personalityPresets.map((preset) => (
                    <button key={preset.id} type="button" onClick={() => setPersonalityId(preset.id)} className={`w-full rounded-xl border p-3 text-left transition ${personalityId === preset.id ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-black/20"}`}>
                      <p className="font-semibold text-white">{preset.name}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{preset.description}</p>
                    </button>
                  ))}
                  <label className="grid gap-2 text-sm text-slate-300">
                    Custom Personality
                    <input value={customPersonality} onChange={(event) => setCustomPersonality(event.target.value)} placeholder="e.g. Luxury SaaS Advisor" className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none" />
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Language</CardTitle>
                    <CardDescription>Production-ready for English, Hindi and Hinglish.</CardDescription>
                  </div>
                  <Globe2 className="h-5 w-5 text-sky-300" />
                </CardHeader>
                <CardContent className="grid gap-2">
                  {aiBrainLanguages.map((item) => (
                    <button key={item.id} type="button" onClick={() => setLanguage(item.label)} className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${language === item.label ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-black/20 text-slate-300"}`}>
                      {item.label}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Generated System Prompt</CardTitle>
                <CardDescription>Shared prompt contract for consistent chat and voice behavior.</CardDescription>
              </div>
              <Badge variant="success"><CheckCircle2 className="h-3.5 w-3.5" />Guardrails active</Badge>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[520px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-emerald-100"><code>{systemPrompt}</code></pre>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Rule icon={BrainCircuit} title="Knowledge-bound" detail="Answer only from configured business knowledge." />
                <Rule icon={Bot} title="Fallback response" detail={"If unavailable: I'll have our team assist you."} />
                <Rule icon={Settings} title="No hallucination" detail="Never invent pricing, promises, provider status or guarantees." />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function labelFor(field: string) {
  return field.replace(/([A-Z])/g, " $1").trim();
}

function Rule({ icon: Icon, title, detail }: { icon: typeof Bot; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <Icon className="h-5 w-5 text-emerald-300" />
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}
