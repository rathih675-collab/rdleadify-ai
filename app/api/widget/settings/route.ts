import { NextResponse } from "next/server";

import { corsHeaders, getDefaultWidgetSettings, resolveWidgetWorkspace } from "@/lib/server/widget";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceKey = url.searchParams.get("workspace") || request.headers.get("x-rdleadify-workspace") || undefined;

  try {
    const workspace = await resolveWidgetWorkspace(workspaceKey);
    const settings = getDefaultWidgetSettings({
      companyName: process.env.WIDGET_COMPANY_NAME || workspace.name,
      workspaceKey: workspace.slug,
    });

    return NextResponse.json(
      {
        ok: true,
        settings,
      },
      { headers: corsHeaders(request.headers.get("origin")) },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Widget settings unavailable." },
      { status: 404, headers: corsHeaders(request.headers.get("origin")) },
    );
  }
}
