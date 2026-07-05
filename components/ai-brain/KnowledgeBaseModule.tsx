"use client";

import { useMemo, useState } from "react";
import { BookOpen, Database, FileText, Globe2, HelpCircle, Link2, Search, Upload, type LucideIcon } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultKnowledgeSources, type KnowledgeSource, type KnowledgeSourceType } from "@/lib/ai/brain";

const sourceTypes: Array<{ type: KnowledgeSourceType; icon: LucideIcon; detail: string }> = [
  { type: "PDF", icon: FileText, detail: "Upload pricing decks, brochures, and product docs." },
  { type: "DOCX", icon: FileText, detail: "Import team documents and SOPs." },
  { type: "TXT", icon: FileText, detail: "Plain-text knowledge snippets." },
  { type: "Markdown", icon: BookOpen, detail: "Structured product docs and release notes." },
  { type: "Website URL", icon: Globe2, detail: "Import public website pages." },
  { type: "Manual Q&A", icon: HelpCircle, detail: "Curated admin answers." },
  { type: "Business FAQ", icon: HelpCircle, detail: "High-confidence answers for chat and voice." },
];

export default function KnowledgeBaseModule() {
  const [sources, setSources] = useState<KnowledgeSource[]>(defaultKnowledgeSources);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return sources.filter((source) => !text || source.name.toLowerCase().includes(text) || source.summary.toLowerCase().includes(text));
  }, [query, sources]);

  function addSource(type: KnowledgeSourceType) {
    setSources((current) => [
      {
        id: `kb-${Date.now()}`,
        workspaceId: "current-workspace",
        name: `${type} source`,
        type,
        status: type === "Website URL" ? "Queued" : "Processed",
        chunks: type === "Manual Q&A" || type === "Business FAQ" ? 4 : 12,
        lastTrained: "Just now",
        summary: `${type} knowledge source prepared for workspace-level AI Brain retrieval.`,
      },
      ...current,
    ]);
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="AI Brain" title="Knowledge Base" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Workspace Knowledge Sources</CardTitle>
                  <CardDescription>Upload documents, import website URLs, and curate manual answers for both AI Chat and AI Voice.</CardDescription>
                </div>
                <Badge variant="success">Workspace isolated</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search knowledge..." className="h-11 w-full rounded-lg border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none" />
                </label>
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {sourceTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.type} type="button" onClick={() => addSource(item.type)} className="rounded-xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-emerald-400/40">
                        <Icon className="h-5 w-5 text-emerald-300" />
                        <p className="mt-3 font-semibold text-white">{item.type}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>RAG Architecture</CardTitle>
                  <CardDescription>Prepared for future vector search and retrieval pipelines.</CardDescription>
                </div>
                <Database className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="space-y-3">
                {["Parser queue", "Chunking service", "Embedding adapter", "Vector index", "Similarity search", "Answer guardrails"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="font-semibold text-white">{item}</p>
                    <p className="mt-1 text-sm text-slate-500">Architecture ready</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Knowledge Library</CardTitle>
                  <CardDescription>Processed sources become the answer boundary for chat and voice agents.</CardDescription>
                </div>
                <Button><Upload className="h-4 w-4" />Upload</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {filtered.map((source) => (
                  <div key={source.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{source.name}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{source.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="info">{source.type}</Badge>
                        <Badge variant={source.status === "Processed" ? "success" : "warning"}>{source.status}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{source.chunks} chunks</span>
                      <span>Last trained: {source.lastTrained}</span>
                      <span>Workspace: {source.workspaceId}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>AI Memory</CardTitle>
                  <CardDescription>Conversation memory shared by chat and voice.</CardDescription>
                </div>
                <Link2 className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Customer name", "Remember names across previous chats and calls."],
                  ["Business", "Store company/business type for lead continuity."],
                  ["Previous chats", "Use recent conversation summaries."],
                  ["Previous calls", "Use voice transcript summaries."],
                  ["Previous appointments", "Avoid duplicate booking questions."],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
