import { withWorkspace } from "@/lib/server/api";
import { buildFinalAiSystemPrompt, loadAiContext } from "@/lib/server/ai-memory";

export async function GET() {
  return withWorkspace(async (session) => {
    const messages = [
      {
        role: "user" as const,
        content: "Test memory: explain what the business offers and how demo booking should work.",
      },
    ];
    const aiContext = await loadAiContext({
      workspaceId: session.workspaceId,
      messages,
    });
    const promptBuild = buildFinalAiSystemPrompt({
      businessPrompt: aiContext.businessMemory?.description ?? undefined,
      aiContext,
      messages,
      capturedFields: {},
      missingFields: ["name", "phone", "email", "business", "requirement", "budget", "timeline"],
      responseRules: [
        "Answer from loaded AI Memory and Knowledge Base.",
        "Ask only one natural missing lead question after answering.",
        "Never invent details that are not present in memory.",
      ],
    });

    return {
      success: true,
      loadedSections: promptBuild.loadedSections,
      sections: promptBuild.sections,
      finalSystemPrompt: promptBuild.finalSystemPrompt,
    };
  });
}
