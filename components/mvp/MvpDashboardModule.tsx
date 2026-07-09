"use client";

import Link from "next/link";
import { Bot, BotMessageSquare, BrainCircuit, CalendarCheck, Inbox, MessageCircle, Mic2, PhoneCall, Plug, Sheet, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import MvpShell from "@/components/mvp/MvpShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Metrics = {
  leads?: number;
  conversations?: number;
  appointments?: number;
  sheetSyncs?: number;
  aiChats?: number;
  websiteConversations?: number;
  widgetLeads?: number;
};

export default function MvpDashboardModule({ metrics = {} }: { metrics?: Metrics }) {
  const cards = [
    { label: "AI chats", value: metrics.aiChats ?? 0, icon: Bot },
    { label: "Widget leads", value: metrics.widgetLeads ?? 0, icon: BotMessageSquare },
    { label: "Google Sheet syncs", value: metrics.sheetSyncs ?? 0, icon: Sheet },
    { label: "Calendar bookings", value: metrics.appointments ?? 0, icon: CalendarCheck },
  ];

  return (
    <MvpShell eyebrow="Workspace" title="AI Employee Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-emerald-300" />
                <p className="mt-5 text-sm text-slate-400">{item.label}</p>
                <p className="mt-1 text-3xl font-bold text-white">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Core</CardTitle>
              <CardDescription>Memory, chat, voice, and website widget are the active MVP surface.</CardDescription>
            </div>
            <Badge variant="success">Focused</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/ai-memory" icon={BrainCircuit} label="AI Memory" />
            <QuickLink href="/ai-agent" icon={Bot} label="AI Chat Agent" />
            <QuickLink href="/voice-agent/playground" icon={Mic2} label="Voice Agent" />
            <QuickLink href="/knowledge-base" icon={BrainCircuit} label="Knowledge Base" />
            <QuickLink href="/widget" icon={BotMessageSquare} label="Website Widget" />
            <QuickLink href="/inbox" icon={Inbox} label="Unified Inbox" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Platform Areas</CardTitle>
              <CardDescription>One entry point per product area. No duplicate pages in the MVP navigation.</CardDescription>
            </div>
            <Badge variant="info">MVP</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/leads" icon={Users} label="Leads" />
            <QuickLink href="/whatsapp" icon={MessageCircle} label="WhatsApp" />
            <QuickLink href="/voice" icon={PhoneCall} label="Voice" />
            <QuickLink href="/integrations" icon={Plug} label="Integrations" />
          </CardContent>
        </Card>
      </div>
    </MvpShell>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4 text-sm font-semibold text-white transition hover:border-emerald-400/40">
      <Icon className="h-5 w-5 text-emerald-300" />
      {label}
    </Link>
  );
}
