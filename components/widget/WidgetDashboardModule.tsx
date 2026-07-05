import { BarChart3, CalendarCheck, MessageCircle, MousePointer2, Target, Users } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WidgetDashboardProps = {
  visitors: number;
  chats: number;
  qualifiedLeads: number;
  appointments: number;
  conversionRate: string;
  recent: Array<{
    id: string;
    customerName: string | null;
    lastMessage: string | null;
    leadScore: number;
    language: string | null;
    createdAt: string;
    tags: string[];
  }>;
};

export default function WidgetDashboardModule({
  visitors,
  chats,
  qualifiedLeads,
  appointments,
  conversionRate,
  recent,
}: WidgetDashboardProps) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Website Widget" title="Widget Dashboard" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
            <Metric icon={MousePointer2} label="Visitors" value={visitors} helper="Unique widget visitors" />
            <Metric icon={MessageCircle} label="Chats" value={chats} helper="Website chat conversations" />
            <Metric icon={Users} label="Qualified Leads" value={qualifiedLeads} helper="Score 70 and above" />
            <Metric icon={CalendarCheck} label="Appointments" value={appointments} helper="Widget calendar bookings" />
            <Metric icon={Target} label="Conversion Rate" value={conversionRate} helper="Qualified leads / chats" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent Website Conversations</CardTitle>
                  <CardDescription>Omnichannel inbox records created by the embeddable widget.</CardDescription>
                </div>
                <Badge variant="info">Realtime-ready</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {recent.length ? (
                  recent.map((conversation) => (
                    <div key={conversation.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{conversation.customerName || "Website Visitor"}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{conversation.lastMessage || "Conversation started"}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Badge variant={conversation.leadScore >= 70 ? "success" : "neutral"}>Score {conversation.leadScore}</Badge>
                          <Badge variant="info">{conversation.language || "Auto"}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {conversation.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="neutral">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-300">
                    No widget conversations yet. Install the script from `/widget` and start a chat to populate this dashboard.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Conversion Snapshot</CardTitle>
                  <CardDescription>Widget funnel for live demos.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Funnel label="Visitors" value={visitors} total={Math.max(visitors, 1)} />
                <Funnel label="Chats" value={chats} total={Math.max(visitors, chats, 1)} />
                <Funnel label="Qualified Leads" value={qualifiedLeads} total={Math.max(chats, 1)} />
                <Funnel label="Appointments" value={appointments} total={Math.max(qualifiedLeads, 1)} />
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                    <BarChart3 className="h-4 w-4" />
                    Webinar-ready analytics
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Counts are sourced from website chat inbox records, CRM leads, and widget calendar logs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value, helper }: { icon: typeof Users; label: string; value: string | number; helper: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-5 text-sm text-slate-400">{label}</p>
        <h3 className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</h3>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function Funnel({ label, value, total }: { label: string; value: number; total: number }) {
  const width = `${Math.max(4, Math.min(100, Math.round((value / total) * 100)))}%`;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400" style={{ width }} />
      </div>
    </div>
  );
}
