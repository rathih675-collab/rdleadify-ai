import { NextResponse } from "next/server";

import { corsHeaders, queueWidgetVoiceFollowUp, resolveWidgetWorkspace } from "@/lib/server/widget";

type VoiceBody = {
  workspaceKey?: string;
  visitorId?: string;
  conversationId?: string;
  leadId?: string;
  lead?: Record<string, unknown>;
};

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = (await request.json()) as VoiceBody;
    const workspace = await resolveWidgetWorkspace(
      body.workspaceKey || request.headers.get("x-rdleadify-workspace") || undefined,
    );

    if (!body.leadId && !body.lead?.name && !body.lead?.phone && !body.lead?.email) {
      return NextResponse.json(
        { ok: false, error: "Missing lead data. Save or capture a lead before queuing voice follow-up." },
        { status: 422, headers: corsHeaders(origin) },
      );
    }

    const queued = await queueWidgetVoiceFollowUp({
      workspaceId: workspace.id,
      leadId: body.leadId,
      visitorId: body.visitorId,
      conversationId: body.conversationId,
      lead: body.lead,
    });

    return NextResponse.json(
      {
        ok: true,
        mode: "DEMO",
        message: "Voice follow-up queued",
        ...queued,
      },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Widget voice action failed." },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
