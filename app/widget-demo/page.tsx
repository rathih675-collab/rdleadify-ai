import { headers } from "next/headers";
import Script from "next/script";
import { Bot, CalendarCheck, CheckCircle2, Code2, MessageCircle, Send, Users } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InboxChannel } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/server/prisma";

async function resolveWorkspace() {
  const workspaceId = (await headers()).get("x-rdleadify-workspace-id");
  const workspace = workspaceId
    ? await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, slug: true, name: true } })
    : await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true, slug: true, name: true } });

  return workspace;
}

export default async function WidgetDemoPage() {
  const workspace = await resolveWorkspace();
  const workspaceId = workspace?.id;
  const workspaceKey = workspace?.slug ?? "default";
  const embedCode = `<script src="https://app.rdleadify.ai/widget.js" data-workspace="${workspaceKey}"></script>`;
  const [conversations, leads] = workspaceId
    ? await Promise.all([
        prisma.inboxConversation.findMany({
          where: { workspaceId, channel: InboxChannel.WEBSITE_CHAT },
          orderBy: { lastMessageTime: "desc" },
          take: 6,
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            lastMessage: true,
            aiSummary: true,
            leadScore: true,
            language: true,
            tags: true,
            updatedAt: true,
          },
        }),
        prisma.lead.findMany({
          where: { workspaceId, source: "Website Widget" },
          orderBy: { updatedAt: "desc" },
          take: 6,
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            score: true,
            status: true,
            notes: true,
            updatedAt: true,
            tags: { select: { name: true } },
          },
        }),
      ])
    : [[], []];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar eyebrow="Live Demo" title="Website Chat Widget Demo" />

        <section className="space-y-6 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card className="overflow-hidden">
              <CardHeader>
                <div>
                  <CardTitle>Live Website Preview</CardTitle>
                  <CardDescription>Use the floating chat bubble in the lower-right corner to run the webinar flow.</CardDescription>
                </div>
                <Badge variant="success">Widget injected</Badge>
              </CardHeader>
              <CardContent>
                <div className="min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">Acme Growth Systems</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">AI CRM and lead automation for modern teams</h2>
                      </div>
                      <Badge variant="info">Preview site</Badge>
                    </div>
                  </div>
                  <div className="grid gap-4 p-5 md:grid-cols-3">
                    {[
                      ["Capture", "Website visitors ask questions and share requirements."],
                      ["Qualify", "AI collects name, phone, email, business type, budget, and demo timing."],
                      ["Convert", "CRM, Inbox, Google demo logs, Calendar, and Voice queue update live."],
                    ].map(([title, detail]) => (
                      <div key={title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="font-semibold text-white">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 p-5 pt-0 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                      <Bot className="h-6 w-6 text-emerald-300" />
                      <p className="mt-4 font-semibold text-white">Suggested test message</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        My name is Riya Shah, phone +91 9876543210, email riya@skyline.in. I run a real estate business and need AI CRM follow-up automation. Budget is 75000 INR. We want this within 2 weeks and prefer a demo tomorrow at 4 PM.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <p className="font-semibold text-white">Demo success path</p>
                      <div className="mt-4 space-y-3 text-sm text-slate-300">
                        {["Chat with AI", "Click Save Lead", "Open /inbox and /leads", "Send to Google Sheet", "Book Demo Appointment", "Start AI Voice Follow-up"].map((step) => (
                          <div key={step} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Install Code</CardTitle>
                    <CardDescription>Client copies one line into any website.</CardDescription>
                  </div>
                  <Code2 className="h-5 w-5 text-emerald-300" />
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-emerald-100"><code>{embedCode}</code></pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Instructions</CardTitle>
                  <CardDescription>Run these clicks during the webinar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Instruction icon={MessageCircle} text="Open the floating widget and send the suggested test message." />
                  <Instruction icon={Users} text="Click Save Lead after the AI captures contact and requirement data." />
                  <Instruction icon={Send} text="Click Send to Google Sheet to create a demo sync log." />
                  <Instruction icon={CalendarCheck} text="Click Book Demo Appointment, then Start AI Voice Follow-up." />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Latest Widget Conversations</CardTitle>
                  <CardDescription>Records written to Omnichannel Inbox with Website channel.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversations.length ? conversations.map((conversation) => (
                  <div key={conversation.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-white">{conversation.customerName || "Website Visitor"}</p>
                      <Badge variant={conversation.leadScore >= 70 ? "success" : "neutral"}>Score {conversation.leadScore}</Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{conversation.customerEmail || conversation.customerPhone || "Contact pending"} - {conversation.language || "Auto"}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{conversation.aiSummary || conversation.lastMessage || "Conversation captured."}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {conversation.tags.slice(0, 4).map((tag) => <Badge key={tag} variant="info">{tag}</Badge>)}
                    </div>
                  </div>
                )) : (
                  <EmptyState text="No widget conversations yet. Use the floating widget to create the first one." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Latest Widget Leads</CardTitle>
                  <CardDescription>CRM leads created from the Save Lead button or qualification flow.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {leads.length ? leads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-white">{[lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.title}</p>
                      <Badge variant={lead.score >= 70 ? "success" : "neutral"}>{lead.status}</Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{lead.email || lead.phone || "Contact pending"}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{lead.notes || "Lead saved from Website Widget."}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lead.tags.map((tag) => <Badge key={tag.name} variant="info">{tag.name}</Badge>)}
                    </div>
                  </div>
                )) : (
                  <EmptyState text="No widget leads yet. Save a qualified conversation from the widget." />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Script
        src="/widget.js"
        strategy="afterInteractive"
        data-workspace={workspaceKey}
        data-company="RDLeadify AI"
        data-greeting="Hi, I am RDLeadify AI. Share your requirement and I will qualify the lead for a demo."
        data-color="#10b981"
      />
    </div>
  );
}

function Instruction({ icon: Icon, text }: { icon: typeof MessageCircle; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-slate-300">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
      <span>{text}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-300">{text}</div>;
}
