import { NextResponse } from "next/server";

import { loadAiContext, saveVisitorMemory } from "@/lib/server/ai-memory";
import {
  corsHeaders,
  getDefaultWidgetSettings,
  persistWidgetConversation,
  resolveWidgetWorkspace,
  runWidgetConversationTurn,
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
    const aiContext = await loadAiContext({
      workspaceId: workspace.id,
      conversationId,
      messages,
      leadInfo: body.leadInfo,
    });
    const turn = await runWidgetConversationTurn({
      messages,
      leadInfo: body.leadInfo,
      language: body.language || settings.language,
      settings,
      aiContext,
    });
    const { analysis, reply } = turn;

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
    await saveVisitorMemory({
      workspaceId: workspace.id,
      conversationId,
      analysis,
      leadId: persistence.lead?.id,
      lastAiResponse: reply,
    });
    const leadExtracted = Boolean(
      analysis.leadInfo.name &&
        (analysis.leadInfo.phone || analysis.leadInfo.email) &&
        analysis.leadInfo.business &&
        analysis.leadInfo.requirement &&
        analysis.leadInfo.budget &&
        analysis.leadInfo.timeline,
    );

    return NextResponse.json(
      {
        ok: true,
        reply,
        language: analysis.detectedLanguage,
        leadScore: analysis.scoreLabel,
        numericLeadScore: analysis.score,
        leadExtracted,
        summary: analysis.summary,
        analysis,
        provider: turn.provider,
        conversationId,
        visitorId,
        lead: persistence.lead,
        inboxConversationId: persistence.inboxConversationId,
        sheetSync: persistence.sheetSync,
        memory: {
          businessMemoryLoaded: Boolean(aiContext.businessMemory),
          knowledgeDocumentsUsed: aiContext.knowledge.length,
          visitorMemoryLoaded: Boolean(aiContext.visitorMemory),
        },
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
