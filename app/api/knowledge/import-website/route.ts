import { ApiError, assertPermission, readJson, withWorkspace } from "@/lib/server/api";
import { backendLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";

type ImportWebsiteBody = {
  url?: string;
};

function cleanWebsiteText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 250000);
}

export async function POST(request: Request) {
  return withWorkspace(async (session) => {
    assertPermission(session, "knowledge:write");

    const body = await readJson<ImportWebsiteBody>(request);
    const rawUrl = body?.url?.trim();
    if (!rawUrl) throw new ApiError("Website URL is required.");

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new ApiError("Invalid website URL.");
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new ApiError("Only http and https URLs are supported.");
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "RDLeadifyAI-KnowledgeImporter/1.0",
      },
    });

    if (!response.ok) {
      throw new ApiError(`Website import failed with HTTP ${response.status}.`, 502);
    }

    const html = await response.text();
    const extractedText = cleanWebsiteText(html);
    if (!extractedText) throw new ApiError("No readable text found on this website.", 422);

    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId: session.workspaceId,
        name: url.hostname,
        type: "Website URL",
        sourceUrl: url.toString(),
        mimeType: response.headers.get("content-type") ?? "text/html",
        size: html.length,
        status: "IMPORTED",
        extractedText,
        summary: extractedText.slice(0, 500),
        metadata: {
          importedBy: session.userId,
          finalUrl: response.url,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        sourceUrl: true,
        status: true,
        summary: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "KNOWLEDGE_WEBSITE_IMPORTED",
        entityType: "KnowledgeDocument",
        entityId: document.id,
        metadata: { sourceUrl: document.sourceUrl, name: document.name },
      },
    });

    backendLog("knowledge", "website imported", {
      workspaceId: session.workspaceId,
      documentId: document.id,
      url: url.toString(),
    });

    return { message: "Website imported.", document };
  });
}
