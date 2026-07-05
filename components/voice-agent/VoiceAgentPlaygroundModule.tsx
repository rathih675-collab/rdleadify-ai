"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Bot,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Database,
  FileJson,
  Mic,
  PhoneCall,
  Play,
  Radio,
  Save,
  Send,
  Sparkles,
  UserRound,
  Volume2,
  type LucideIcon,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VoiceId = "male" | "female" | "indian" | "hindi" | "hinglish" | "us" | "uk";
type ActionState = "idle" | "working" | "success" | "error";

type PromptConfig = {
  business: string;
  goal: string;
  tone: string;
  knowledge: string;
  rules: string;
  forbiddenResponses: string;
  callClosing: string;
  appointmentRules: string;
  transferRules: string;
};

type SimulatorInput = {
  customerName: string;
  phone: string;
  requirement: string;
  language: string;
  scenario: string;
};

type ExtractedLead = {
  name: string;
  phone: string;
  email: string;
  company: string;
  budget: string;
  requirement: string;
  buyingIntent: "Low" | "Medium" | "High";
  appointmentTime: string;
};

type VoiceCard = {
  id: VoiceId;
  label: string;
  detail: string;
  provider: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20";

const voices: VoiceCard[] = [
  { id: "male", label: "Male", detail: "Confident consultative caller", provider: "ElevenLabs ready" },
  { id: "female", label: "Female", detail: "Warm appointment setter", provider: "OpenAI Realtime ready" },
  { id: "indian", label: "Indian English", detail: "Natural Indian business English", provider: "Azure ready" },
  { id: "hindi", label: "Hindi", detail: "Hindi-first sales qualification", provider: "Google TTS ready" },
  { id: "hinglish", label: "Hinglish", detail: "Hindi + English mixed flow", provider: "ElevenLabs ready" },
  { id: "us", label: "English US", detail: "US SaaS sales accent", provider: "OpenAI Realtime ready" },
  { id: "uk", label: "English UK", detail: "UK professional voice", provider: "Azure ready" },
];

const initialPrompt: PromptConfig = {
  business: "RDLeadify AI helps businesses capture, qualify, and convert leads using CRM, AI chat, omnichannel inbox, automation, Google integrations, and AI voice.",
  goal: "Qualify the prospect, identify business need, collect budget and timeline, and book a product demo.",
  tone: "Professional, concise, friendly, calm, and consultative.",
  knowledge: "Pricing depends on CRM users, channels, automation volume, and AI voice usage. The platform supports website chat, WhatsApp, Google Sheets, Calendar, CRM pipeline, and voice follow-up.",
  rules: "Confirm the customer has time to speak. Ask one question at a time. Never invent pricing. Repeat appointment details before closing.",
  forbiddenResponses: "Do not promise guaranteed revenue. Do not claim a provider is connected in demo mode. Do not ask for passwords, OTPs, or payment card data.",
  callClosing: "Close with a clear next action, demo time, and confirmation that a sales specialist will follow up.",
  appointmentRules: "Collect preferred date, preferred time, timezone, email or phone, and requirement before booking.",
  transferRules: "Transfer to human sales for enterprise pricing, legal/security review, angry customers, or complex integrations.",
};

const initialSimulator: SimulatorInput = {
  customerName: "Riya Shah",
  phone: "+91 9876543210",
  requirement: "AI CRM, WhatsApp follow-up, and voice calling for real estate leads",
  language: "Hinglish",
  scenario: "Hot inbound lead wants a demo tomorrow and has budget approval.",
};

const stages = [
  "Greeting",
  "Qualification",
  "Objection Handling",
  "Closing",
  "Appointment",
  "Summary",
];

const providers = ["ElevenLabs", "OpenAI Realtime", "Azure Speech", "Google TTS", "Twilio", "Exotel", "Knowlarity"];

function makeLead(input: SimulatorInput): ExtractedLead {
  const requirement = input.requirement || "AI voice and CRM automation";
  const intent = /hot|urgent|tomorrow|budget|approval|demo/i.test(`${input.scenario} ${requirement}`) ? "High" : "Medium";

  return {
    name: input.customerName || "Demo Customer",
    phone: input.phone || "+91 9000000000",
    email: `${(input.customerName || "demo").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "demo"}@example.com`,
    company: /real estate|property|builder/i.test(requirement) ? "Skyline Realty" : "Demo Company",
    budget: /budget/i.test(input.scenario) ? "INR 75,000/month" : "Budget to be confirmed",
    requirement,
    buyingIntent: intent,
    appointmentTime: /tomorrow/i.test(input.scenario) ? "Tomorrow, 4:00 PM" : "Next available business slot",
  };
}

function scoreLead(lead: ExtractedLead) {
  let score = 30;
  if (lead.name) score += 8;
  if (lead.phone) score += 10;
  if (lead.email) score += 8;
  if (lead.company) score += 8;
  if (lead.requirement) score += 18;
  if (!/confirmed/i.test(lead.budget)) score += 14;
  if (lead.buyingIntent === "High") score += 14;
  return Math.min(score, 100);
}

export default function VoiceAgentPlaygroundModule() {
  const [voiceId, setVoiceId] = useState<VoiceId>("hinglish");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [simulator, setSimulator] = useState(initialSimulator);
  const [started, setStarted] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});
  const [notice, setNotice] = useState("Demo mode is active. No real phone calls will be placed.");

  const selectedVoice = voices.find((voice) => voice.id === voiceId) ?? voices[0];
  const extractedLead = useMemo(() => makeLead(simulator), [simulator]);
  const leadScore = useMemo(() => scoreLead(extractedLead), [extractedLead]);
  const summary = useMemo(
    () => ({
      summary: `${extractedLead.name} from ${extractedLead.company} is evaluating ${extractedLead.requirement}. Preferred appointment: ${extractedLead.appointmentTime}.`,
      leadScore,
      buyingIntent: extractedLead.buyingIntent,
      sentiment: leadScore >= 80 ? "Positive" : "Neutral",
      nextAction: leadScore >= 75 ? "Save lead, book demo appointment, and send details to Google Sheet." : "Collect missing budget or timeline before handoff.",
    }),
    [extractedLead, leadScore],
  );

  const timeline = useMemo(
    () => [
      { stage: "Greeting", customer: "Hi, yes, I submitted the enquiry.", ai: `Hi ${extractedLead.name}, this is RDLeadify AI. Is this a good time for a quick qualification call?` },
      { stage: "Qualification", customer: `We need ${extractedLead.requirement}.`, ai: "Got it. What business type are you in and what timeline are you planning for implementation?" },
      { stage: "Objection Handling", customer: "I need to know if this works before we commit.", ai: "Absolutely. We can show the CRM, inbox, Google sync, and voice follow-up flow in a focused demo." },
      { stage: "Closing", customer: "That sounds useful. We can evaluate this week.", ai: "Great. I will capture this as a qualified opportunity and prepare the demo context." },
      { stage: "Appointment", customer: `${extractedLead.appointmentTime} works.`, ai: `Perfect. I will book the demo for ${extractedLead.appointmentTime} and send the details to your team.` },
      { stage: "Summary", customer: "Thanks.", ai: "Thanks. Your demo is queued and our sales specialist will follow up with the meeting details." },
    ],
    [extractedLead],
  );

  function updatePrompt(field: keyof PromptConfig, value: string) {
    setPrompt((current) => ({ ...current, [field]: value }));
  }

  function updateSimulator(field: keyof SimulatorInput, value: string) {
    setSimulator((current) => ({ ...current, [field]: value }));
  }

  function startConversation() {
    setStarted(true);
    setActiveStage(0);
    setNotice("Simulated call started. The voice timeline is being generated from your prompt and scenario.");
    stages.forEach((_, index) => {
      window.setTimeout(() => setActiveStage(index), 420 * (index + 1));
    });
    window.setTimeout(() => setNotice("Demo conversation completed. Lead extraction, summary, and CRM actions are ready."), 3100);
  }

  async function runAction(action: "save" | "pipeline" | "appointment" | "sheet") {
    setActionState((current) => ({ ...current, [action]: "working" }));
    setNotice(`${actionLabel(action)} running in demo mode...`);

    try {
      if (action === "save") {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadInfo: {
              name: extractedLead.name,
              phone: extractedLead.phone,
              email: extractedLead.email,
              company: extractedLead.company,
              business: selectedVoice.label,
              requirement: extractedLead.requirement,
              budget: extractedLead.budget,
              demoTime: extractedLead.appointmentTime,
              intent: extractedLead.buyingIntent,
            },
            score: leadScore,
            status: leadScore >= 75 ? "Qualified" : "Contacted",
            tags: ["AI Voice", "Voice Playground", extractedLead.buyingIntent],
            summary: summary.summary,
            nextAction: summary.nextAction,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Save lead failed.");
        setSavedLeadId(data.lead.id);
      }

      if (action === "appointment") {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: savedLeadId || undefined,
            title: `AI Voice Demo - ${extractedLead.name}`,
            description: summary.summary,
            startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Book appointment failed.");
      }

      if (action === "sheet") {
        const response = await fetch("/api/integrations/google/sheets/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: savedLeadId || undefined,
            source: "AI Voice Playground",
            lead: {
              ...extractedLead,
              summary: summary.summary,
              leadScore,
            },
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Google Sheet demo failed.");
      }

      if (action === "pipeline") {
        await new Promise((resolve) => window.setTimeout(resolve, 420));
      }

      setActionState((current) => ({ ...current, [action]: "success" }));
      setNotice(`${actionLabel(action)} completed.`);
    } catch (error) {
      setActionState((current) => ({ ...current, [action]: "error" }));
      setNotice(error instanceof Error ? error.message : `${actionLabel(action)} failed.`);
    }
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="AI Voice" title="Voice Agent Playground" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),linear-gradient(135deg,#0b1628,#07111f)] p-5 shadow-2xl shadow-black/20 md:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success"><Mic className="h-3.5 w-3.5" />Demo mode</Badge>
                  <Badge variant="info"><Radio className="h-3.5 w-3.5" />Twilio/Exotel/Knowlarity ready</Badge>
                </div>
                <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Test AI phone calls before connecting telephony
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                  Configure voice, prompt rules, call scenario, lead extraction, CRM actions, and appointment flow in a complete simulated voice environment.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <VoiceWave active={started} />
                <p className="mt-4 font-semibold text-white">{selectedVoice.label}</p>
                <p className="mt-1 text-sm text-slate-300">{selectedVoice.detail}</p>
                <p className="mt-3 text-sm leading-6 text-emerald-100">{notice}</p>
              </div>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric icon={PhoneCall} label="Voice Mode" value="Simulated" detail="No live calls placed" />
            <SummaryMetric icon={BrainCircuit} label="Lead Score" value={leadScore} detail="Generated from extraction" />
            <SummaryMetric icon={BadgeCheck} label="Buying Intent" value={summary.buyingIntent} detail="AI qualification" />
            <SummaryMetric icon={CalendarCheck} label="Appointment" value={extractedLead.appointmentTime} detail="Demo slot preview" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Voice Selection</CardTitle>
                  <CardDescription>Choose a demo voice. Provider adapters are ready for future TTS/realtime engines.</CardDescription>
                </div>
                <Volume2 className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="grid gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setVoiceId(voice.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      voiceId === voice.id
                        ? "border-emerald-400/50 bg-emerald-400/10"
                        : "border-white/10 bg-black/20 hover:border-white/20",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{voice.label}</p>
                      <Badge variant={voiceId === voice.id ? "success" : "neutral"}>{voice.provider}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-slate-400">{voice.detail}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Prompt Builder</CardTitle>
                  <CardDescription>System prompt sections for qualification, rules, transfers, and closing behavior.</CardDescription>
                </div>
                <Bot className="h-5 w-5 text-sky-300" />
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {(Object.keys(prompt) as Array<keyof PromptConfig>).map((key) => (
                  <label key={key} className={cn("grid gap-2", key === "knowledge" || key === "rules" ? "md:col-span-2" : "")}>
                    <span className="text-sm font-semibold capitalize text-slate-300">{labelFor(key)}</span>
                    <textarea
                      className={cn(inputClass, "min-h-24 resize-none")}
                      value={prompt[key]}
                      onChange={(event) => updatePrompt(key, event.target.value)}
                    />
                  </label>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Conversation Simulator</CardTitle>
                  <CardDescription>Enter a customer scenario and run a voice call demo.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField label="Customer Name" value={simulator.customerName} onChange={(value) => updateSimulator("customerName", value)} />
                <TextField label="Phone" value={simulator.phone} onChange={(value) => updateSimulator("phone", value)} />
                <TextField label="Requirement" value={simulator.requirement} onChange={(value) => updateSimulator("requirement", value)} />
                <TextField label="Language" value={simulator.language} onChange={(value) => updateSimulator("language", value)} />
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-300">Scenario</span>
                  <textarea className={cn(inputClass, "min-h-28 resize-none")} value={simulator.scenario} onChange={(event) => updateSimulator("scenario", event.target.value)} />
                </label>
                <Button className="w-full" onClick={startConversation}>
                  <Play className="h-4 w-4" />
                  Start Demo Conversation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Conversation Timeline</CardTitle>
                  <CardDescription>Customer message, AI reply, next response, and qualification flow.</CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={item.stage} className={cn("rounded-2xl border p-4 transition", index <= activeStage && started ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/20")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.stage}</p>
                      <Badge variant={index <= activeStage && started ? "success" : "neutral"}>{index <= activeStage && started ? "Active" : "Queued"}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Bubble icon={UserRound} label="Customer" text={item.customer} />
                      <Bubble icon={Bot} label="AI reply" text={item.ai} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Lead Extraction JSON</CardTitle>
                  <CardDescription>Structured data generated from the simulated voice call.</CardDescription>
                </div>
                <FileJson className="h-5 w-5 text-amber-300" />
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-emerald-100">
                  <code>{JSON.stringify(extractedLead, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>AI Summary</CardTitle>
                  <CardDescription>Sales-ready analysis for CRM handoff.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SummaryRow label="Summary" value={summary.summary} />
                <SummaryRow label="Lead Score" value={String(summary.leadScore)} />
                <SummaryRow label="Buying Intent" value={summary.buyingIntent} />
                <SummaryRow label="Sentiment" value={summary.sentiment} />
                <SummaryRow label="Next Action" value={summary.nextAction} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Voice Call Timeline</CardTitle>
                  <CardDescription>Full call stages from greeting to summary.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {stages.map((stage, index) => (
                    <div key={stage} className={cn("rounded-xl border p-4", index <= activeStage && started ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/20")}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">{index + 1}</span>
                      <p className="mt-4 font-semibold text-white">{stage}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{stageDetail(stage)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>CRM Actions</CardTitle>
                  <CardDescription>Demo-safe actions connected to existing CRM and Google endpoints.</CardDescription>
                </div>
                <Database className="h-5 w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="grid gap-3">
                <ActionButton icon={Save} label="Save Lead" state={actionState.save} onClick={() => void runAction("save")} />
                <ActionButton icon={Database} label="Update Pipeline" state={actionState.pipeline} onClick={() => void runAction("pipeline")} />
                <ActionButton icon={CalendarCheck} label="Book Appointment" state={actionState.appointment} onClick={() => void runAction("appointment")} />
                <ActionButton icon={Send} label="Send to Google Sheet" state={actionState.sheet} onClick={() => void runAction("sheet")} />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Provider Architecture</CardTitle>
                <CardDescription>Demo mode today, adapter-ready for telephony and voice synthesis later.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
              {providers.map((provider) => (
                <div key={provider} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <Radio className="h-4 w-4 text-emerald-300" />
                  <p className="mt-3 text-sm font-semibold text-white">{provider}</p>
                  <p className="mt-1 text-xs text-slate-500">Adapter slot ready</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function labelFor(key: keyof PromptConfig) {
  return key.replace(/([A-Z])/g, " $1").trim();
}

function actionLabel(action: "save" | "pipeline" | "appointment" | "sheet") {
  return {
    save: "Save Lead",
    pipeline: "Update Pipeline",
    appointment: "Book Appointment",
    sheet: "Send to Google Sheet",
  }[action];
}

function stageDetail(stage: string) {
  return {
    Greeting: "Confirm availability and context.",
    Qualification: "Capture requirement, company, budget, and timeline.",
    "Objection Handling": "Address fit, pricing, timing, and trust concerns.",
    Closing: "Confirm intent and next action.",
    Appointment: "Book or draft the preferred demo slot.",
    Summary: "Generate CRM-ready transcript summary and next action.",
  }[stage] ?? "Voice agent stage.";
}

function VoiceWave({ active }: { active: boolean }) {
  return (
    <div className="flex h-20 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20">
      {[20, 36, 54, 70, 44, 62, 30, 48, 26].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={cn("w-2 rounded-full bg-emerald-300", active ? "animate-pulse" : "")}
          style={{ height, animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string | number; detail: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-5 text-sm text-slate-400">{label}</p>
        <h3 className="mt-1 truncate text-2xl font-bold tracking-tight text-white">{value}</h3>
        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Bubble({ icon: Icon, label, text }: { icon: LucideIcon; label: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, state = "idle", onClick }: { icon: LucideIcon; label: string; state?: ActionState; onClick: () => void }) {
  return (
    <Button variant={state === "success" ? "secondary" : "outline"} onClick={onClick} disabled={state === "working"} className="justify-start">
      {state === "success" ? <CheckCircle2 className="h-4 w-4" /> : <Icon className={cn("h-4 w-4", state === "working" ? "animate-pulse" : "")} />}
      {state === "working" ? `${label}...` : state === "success" ? `${label} done` : state === "error" ? `${label} failed` : label}
    </Button>
  );
}
