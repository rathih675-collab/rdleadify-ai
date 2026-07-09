import { paginationFromUrl, withWorkspace } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request) {
  return withWorkspace(async (session) => {
    const { take } = paginationFromUrl(request, { take: 50, max: 100 });
    const documents = await prisma.knowledgeDocument.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        type: true,
        sourceUrl: true,
        mimeType: true,
        size: true,
        status: true,
        summary: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { documents };
  });
}
