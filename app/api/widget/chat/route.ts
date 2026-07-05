import { NextResponse } from "next/server";

import {
  analyzeWidgetLead,
  corsHeaders,
  createWidgetReply,
  getDefaultWidgetSettings,
  persistWidgetConversation,
  resolveWidgetWorkspace,
  type WidgetLeadInfo,
  type WidgetMessage,
} from "@/lib/server/widget";

type WidgetChatBody = {
  workspaceKey?: string;
  visitorId?: string;
  conversationId?: string;
  messages?: WidgetMessage[];
  leadInfo?: WidgetLeadInfo;
  language?: string;
  pageUrl?: string;
  referrer?: string;
  settings?: Partial<ReturnType<typeof getDefaultWidgetSettings>>;
  saveLead?: boolean;
};

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = (await request.json()) as WidgetChatBody;
    const workspace = await resolveWidgetWorkspace(
      body.workspaceKey || request.headers.get("x-rdleadify-workspace") || undefined,
    );
    const messages = (body.messages ?? [])
      .filter((message) => message && (message.role === "assistant" || message.role === "user"))
      .map((message) => ({ role: message.role, content: String(message.content ?? "").slice(0, 2000) }))
      .filter((message) => message.content);

    if (!messages.length) {
      return NextResponse.json(
        { ok: false, error: "Messages are required." },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const visitorId = String(body.visitorId || crypto.randomUUID()).slice(0, 80);
    const conversationId = String(body.conversationId || `web_${visitorId}`).slice(0, 120);
    const settings = getDefaultWidgetSettings(body.settings);
    const analysis = analyzeWidgetLead(messages, body.leadInfo, body.language || settings.language);
    let reply: string;

    try {
      reply = await createWidgetReply(messages, analysis, settings);
    } catch {
      reply = analysis.missingFields.length
        ? `Thanks. ${analysis.nextAction}`
        : `Perfect, I have captured your details. ${analysis.summary}`;
    }

    const persistence = await persistWidgetConversation({
      workspaceId: workspace.id,
      conversationId,
      visitorId,
      messages,
      reply,
      analysis,
      pageUrl: body.pageUrl,
      referrer: body.referrer,
      forceLead: body.saveLead,
    });

    return NextResponse.json(
      {
        ok: true,
        reply,
        analysis,
        provider: process.env.OPENAI_API_KEY ? "openai" : "local",
        conversationId,
        visitorId,
        lead: persistence.lead,
        inboxConversationId: persistence.inboxConversationId,
        quickReplies: analysis.missingFields.length
          ? ["Share phone", "Share email", "Book demo"]
          : ["Send to Google Sheet", "Book Calendar Appointment", "Talk to AI Voice Agent"],
      },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Widget chat failed." },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
