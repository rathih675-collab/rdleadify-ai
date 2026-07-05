import { NextResponse } from "next/server";

import {
  analyzeWidgetLead,
  corsHeaders,
  persistWidgetConversation,
  resolveWidgetWorkspace,
  type WidgetLeadInfo,
  type WidgetMessage,
} from "@/lib/server/widget";

type SaveLeadBody = {
  workspaceKey?: string;
  visitorId?: string;
  conversationId?: string;
  messages?: WidgetMessage[];
  leadInfo?: WidgetLeadInfo;
  pageUrl?: string;
  referrer?: string;
};

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = (await request.json()) as SaveLeadBody;
    const workspace = await resolveWidgetWorkspace(
      body.workspaceKey || request.headers.get("x-rdleadify-workspace") || undefined,
    );
    const messages = (body.messages ?? [])
      .filter((message) => message && (message.role === "assistant" || message.role === "user"))
      .map((message) => ({ role: message.role, content: String(message.content ?? "").slice(0, 2000) }))
      .filter((message) => message.content);
    const analysis = analyzeWidgetLead(messages, body.leadInfo);
    const hasRequiredContact = Boolean(analysis.leadInfo.name && (analysis.leadInfo.phone || analysis.leadInfo.email));

    if (!hasRequiredContact) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing lead data. Capture at least name and phone or email before saving.",
        },
        { status: 422, headers: corsHeaders(origin) },
      );
    }

    const visitorId = String(body.visitorId || crypto.randomUUID()).slice(0, 80);
    const conversationId = String(body.conversationId || `web_${visitorId}`).slice(0, 120);
    const result = await persistWidgetConversation({
      workspaceId: workspace.id,
      conversationId,
      visitorId,
      messages,
      reply: "Lead saved to CRM from Website Widget.",
      analysis,
      pageUrl: body.pageUrl,
      referrer: body.referrer,
      forceLead: true,
    });

    if (!result.lead) {
      return NextResponse.json(
        { ok: false, error: "Save lead failed. CRM record was not created." },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Lead saved to CRM.",
        lead: result.lead,
        inboxConversationId: result.inboxConversationId,
        analysis,
      },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Save lead failed." },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
