"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Save, Sparkles } from "lucide-react";

import MvpShell from "@/components/mvp/MvpShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MemoryForm = {
  businessName: string;
  businessPrompt: string;
  businessMemory: string;
  knowledgeBase: string;
  faq: string;
  pricingRules: string;
  appointmentRules: string;
  guardrails: string;
};

const emptyForm: MemoryForm = {
  businessName: "",
  businessPrompt: "",
  businessMemory: "",
  knowledgeBase: "",
  faq: "",
  pricingRules: "",
  appointmentRules: "",
  guardrails: "",
};

export default function AiMemoryMvpModule() {
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; status: string; summary?: string | null }>>([]);
  const [notice, setNotice] = useState("");
  const [testReply, setTestReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    void loadMemory();
  }, []);

  async function loadMemory() {
    const [memoryResponse, knowledgeResponse] = await Promise.all([
      fetch("/api/business-memory"),
      fetch("/api/knowledge"),
    ]);
    const memoryData = memoryResponse.ok ? await memoryResponse.json() : {};
    const knowledgeData = knowledgeResponse.ok ? await knowledgeResponse.json() : {};
    const memory = memoryData.memory || {};
    const extra = memory.socialLinks && typeof memory.socialLinks === "object" ? memory.socialLinks : {};

    setForm({
      businessName: memory.businessName || "",
      businessPrompt: memory.description || "",
      businessMemory: [memory.products, memory.services, memory.workingHours, memory.address, memory.contactDetails].filter(Boolean).join("\n\n"),
      knowledgeBase: memory.products || "",
      faq: memory.faqs || "",
      pricingRules: memory.pricing || "",
      appointmentRules: typeof extra.appointmentRules === "string" ? extra.appointmentRules : "",
      guardrails: typeof extra.guardrails === "string" ? extra.guardrails : "",
    });
    setDocuments(knowledgeData.documents || []);
  }

  async function saveMemory() {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/business-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          description: form.businessPrompt,
          services: form.businessMemory,
          products: form.knowledgeBase,
          pricing: form.pricingRules,
          faqs: form.faq,
          socialLinks: {
            appointmentRules: form.appointmentRules,
            guardrails: form.guardrails,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Memory save failed.");
      setNotice("AI Memory saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Memory save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function testMemory() {
    setTesting(true);
    setTestReply("");
    try {
      const response = await fetch("/api/ai/memory/test");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI Memory test failed.");
      const loaded = Object.entries(data.loadedSections || {})
        .map(([key, value]) => `${value ? "Loaded" : "Missing"}: ${key}`)
        .join("\n");
      setTestReply([
        "Memory Sections",
        loaded || "No memory sections returned.",
        "",
        "Final System Prompt Preview",
        data.finalSystemPrompt || "No prompt returned.",
      ].join("\n"));
    } catch (error) {
      setTestReply(error instanceof Error ? error.message : "AI Memory test failed.");
    } finally {
      setTesting(false);
    }
  }

  function update(key: keyof MemoryForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <MvpShell eyebrow="AI Core" title="AI Memory">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Business Brain</CardTitle>
              <CardDescription>These fields are loaded before every AI Chat and Widget reply.</CardDescription>
            </div>
            <Badge variant="success">Live memory</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Business Prompt" value={form.businessPrompt} onChange={(value) => update("businessPrompt", value)} rows={5} />
            <Field label="Business Memory" value={form.businessMemory} onChange={(value) => update("businessMemory", value)} rows={6} />
            <Field label="Knowledge Base" value={form.knowledgeBase} onChange={(value) => update("knowledgeBase", value)} rows={4} />
            <Field label="FAQ" value={form.faq} onChange={(value) => update("faq", value)} rows={5} />
            <Field label="Pricing Rules" value={form.pricingRules} onChange={(value) => update("pricingRules", value)} rows={4} />
            <Field label="Appointment Rules" value={form.appointmentRules} onChange={(value) => update("appointmentRules", value)} rows={4} />
            <Field label="Guardrails" value={form.guardrails} onChange={(value) => update("guardrails", value)} rows={4} />
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveMemory} disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Memory"}</Button>
              <Button onClick={testMemory} disabled={testing} variant="secondary"><Sparkles className="h-4 w-4" />{testing ? "Testing..." : "Test AI Memory"}</Button>
            </div>
            {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Knowledge Files</CardTitle>
                <CardDescription>Current documents available to the AI.</CardDescription>
              </div>
              <BrainCircuit className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length ? documents.slice(0, 6).map((doc) => (
                <div key={doc.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-white">{doc.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{doc.status}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No knowledge documents yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Test Result</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{testReply || "Run Test AI Memory to verify the prompt, memory, and knowledge context."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MvpShell>
  );
}

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-300">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-normal leading-6 text-white outline-none focus:border-emerald-400/60"
      />
    </label>
  );
}
