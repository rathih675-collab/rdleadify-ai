import { NextResponse } from "next/server";

import { assertPermission, requireWorkspaceSession } from "@/lib/server/api";
import { backendLog } from "@/lib/server/dev-log";
import { prisma } from "@/lib/server/prisma";

const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "application/octet-stream",
]);

function cleanExtractedText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 250000);
}

function extractTextFromPdf(buffer: Buffer) {
  return cleanExtractedText(
    buffer
      .toString("latin1")
      .replace(/\\[nrt]/g, " ")
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
      .replace(/\s+/g, " "),
  );
}

function extractTextFromDocx(buffer: Buffer) {
  const raw = buffer.toString("utf8");
  const matches = Array.from(raw.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)).map((match) =>
    match[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
  );
  return cleanExtractedText(matches.join(" "));
}

async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const mime = file.type || "application/octet-stream";

  if (mime.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) {
    return cleanExtractedText(buffer.toString("utf8"));
  }
  if (mime === "application/pdf" || name.endsWith(".pdf")) return extractTextFromPdf(buffer);
  if (mime.includes("wordprocessingml") || name.endsWith(".docx")) return extractTextFromDocx(buffer);
  return cleanExtractedText(buffer.toString("utf8"));
}

function documentType(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".docx")) return "DOCX";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "Markdown";
  return "TXT";
}

export async function POST(request: Request) {
  try {
    const session = await requireWorkspaceSession();
    assertPermission(session, "knowledge:write");

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "File is required." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type || "application/octet-stream") && !/\.(pdf|docx|txt|md|markdown)$/i.test(file.name)) {
      return NextResponse.json({ ok: false, error: "Unsupported file type." }, { status: 415 });
    }

    const extractedText = await extractText(file);
    if (!extractedText) {
      return NextResponse.json({ ok: false, error: "Could not extract text from file." }, { status: 422 });
    }

    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId: session.workspaceId,
        name: file.name.slice(0, 240),
        type: documentType(file),
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        status: "PROCESSED",
        extractedText,
        summary: extractedText.slice(0, 500),
        metadata: {
          uploadedBy: session.userId,
          originalName: file.name,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        size: true,
        summary: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "KNOWLEDGE_DOCUMENT_UPLOADED",
        entityType: "KnowledgeDocument",
        entityId: document.id,
        metadata: { name: document.name, type: document.type, size: document.size },
      },
    });

    backendLog("knowledge", "document uploaded", {
      workspaceId: session.workspaceId,
      documentId: document.id,
    });

    return NextResponse.json({ ok: true, message: "Knowledge uploaded.", document });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Knowledge upload failed." },
      { status: 500 },
    );
  }
}
