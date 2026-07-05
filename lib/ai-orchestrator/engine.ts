import type {
  ActionPlan,
  IntentResult,
  KnowledgeResult,
  OrchestratorAnalytics,
  OrchestratorDecision,
  OrchestratorDecisionRecord,
  OrchestratorEvent,
  OrchestratorIntent,
  OrchestratorMemory,
  RuleEngineConfig,
} from "./types";

const intentSignals: Record<OrchestratorIntent, RegExp[]> = {
  "Sales Inquiry": [/buy|purchase|interested|solution|service|crm|automation|lead/i],
  Support: [/support|help|issue|problem|not working|error|trouble/i],
  Appointment: [/appointment|schedule|calendar|meeting|slot|available/i],
  Complaint: [/complaint|angry|refund|bad|unhappy|escalate|dispute/i],
  Pricing: [/price|pricing|cost|plan|package|budget|quote/i],
  "Demo Request": [/demo|walkthrough|show me|trial|presentation/i],
  "Follow-up": [/follow up|follow-up|checking|reminder|call back|callback/i],
  Unknown: [],
};

export const supportedOrchestratorSources = [
  "Website Chat",
  "Voice Conversation",
  "Manual Lead",
  "Imported Lead",
  "API Lead",
  "Future WhatsApp",
  "Future Facebook",
  "Future Instagram",
  "Future LinkedIn",
] as const;

export const defaultRuleEngineConfig: RuleEngineConfig = {
  businessRules: [
    "Every event must pass through intent detection before action execution.",
    "Never invent pricing or unsupported product commitments.",
    "Keep CRM, inbox, workflow, calendar, and Google actions traceable.",
  ],
  salesRules: [
    "Ask for name, business, requirement, budget, and preferred appointment time.",
    "Treat budget plus appointment timing as high buying intent.",
    "Create or update CRM records only after useful lead identity is captured.",
  ],
  escalationRules: [
    "Escalate complaints, billing disputes, security reviews, and low-confidence intents.",
    "Escalate if the customer asks for a human or sounds frustrated.",
  ],
  workingHours: "Mon-Fri, 09:00-18:00 workspace timezone",
  appointmentRules: [
    "Confirm date, time, timezone, customer contact, and requirement before booking.",
    "Offer a callback when appointment information is incomplete.",
  ],
  transferRules: [
    "Transfer urgent support and complaint events to a human owner.",
    "Route qualified sales and demo leads to sales workflows.",
  ],
};

export function detectIntent(content: string): IntentResult {
  const text = content.trim();
  const scored = Object.entries(intentSignals)
    .filter(([intent]) => intent !== "Unknown")
    .map(([intent, patterns]) => {
      const matches = patterns.filter((pattern) => pattern.test(text));
      return {
        intent: intent as OrchestratorIntent,
        hits: matches.length,
        evidence: matches.map((pattern) => pattern.source.replaceAll("\\", "")),
      };
    })
    .sort((a, b) => b.hits - a.hits);

  const best = scored[0];
  if (!best || best.hits === 0) {
    return { intent: "Unknown", confidence: 0.42, evidence: ["No strong business intent signal"] };
  }

  return {
    intent: best.intent,
    confidence: Math.min(0.96, 0.62 + best.hits * 0.14),
    evidence: best.evidence,
  };
}

export function buildMemory(event: OrchestratorEvent, intent: IntentResult): OrchestratorMemory {
  const text = event.content.toLowerCase();
  const leadScore =
    25 +
    (event.customerName ? 10 : 0) +
    (event.business ? 15 : 0) +
    (/budget|price|pricing|cost/.test(text) ? 18 : 0) +
    (/demo|appointment|meeting|calendar/.test(text) ? 20 : 0) +
    (/urgent|today|tomorrow|asap/.test(text) ? 12 : 0);
  const cappedScore = Math.min(100, leadScore);

  return {
    customerName: event.customerName,
    business: event.business,
    previousChats: event.source === "Website Chat" ? 1 : 0,
    previousCalls: event.source === "Voice Conversation" ? 1 : 0,
    previousAppointments: /appointment|demo|meeting/i.test(event.content) ? 1 : 0,
    leadScore: cappedScore,
    buyingIntent: cappedScore >= 75 || intent.intent === "Demo Request" ? "High" : cappedScore >= 50 ? "Medium" : "Low",
    lastActivity: event.createdAt,
  };
}

export function lookupKnowledge(event: OrchestratorEvent, intent: IntentResult): KnowledgeResult {
  const matchedSources = new Set<string>();
  if (/price|pricing|cost|budget|plan/i.test(event.content)) matchedSources.add("Pricing rules");
  if (/demo|appointment|calendar|meeting/i.test(event.content)) matchedSources.add("Appointment rules");
  if (/google|sheet|calendar/i.test(event.content)) matchedSources.add("Google integration knowledge");
  if (/voice|call/i.test(event.content)) matchedSources.add("Voice AI operating knowledge");
  if (/workflow|automation/i.test(event.content)) matchedSources.add("Workflow automation knowledge");
  if (matchedSources.size === 0) matchedSources.add("Business FAQ");

  return {
    matchedSources: Array.from(matchedSources),
    answerPolicy:
      intent.intent === "Pricing"
        ? "Use configured pricing rules; escalate if exact pricing is unavailable."
        : "Answer from approved business knowledge and route operational actions through the action engine.",
    confidence: intent.confidence >= 0.75 ? 0.88 : 0.68,
  };
}

export function decideAction(intent: IntentResult, memory: OrchestratorMemory): ActionPlan {
  const actions: OrchestratorDecision[] = [];
  let primaryDecision: OrchestratorDecision = "Reply";

  if (intent.confidence < 0.55 || intent.intent === "Unknown") {
    primaryDecision = "Ask Question";
    actions.push("Ask Question", "Update CRM");
  } else if (intent.intent === "Complaint" || intent.intent === "Support") {
    primaryDecision = "Escalate to Human";
    actions.push("Reply", "Escalate to Human", "Update CRM", "Trigger Workflow");
  } else if (intent.intent === "Appointment" || intent.intent === "Demo Request") {
    primaryDecision = "Book Appointment";
    actions.push("Reply", "Book Appointment", "Update CRM", "Send Email", "Send to Google Sheet");
  } else if (intent.intent === "Pricing") {
    primaryDecision = memory.buyingIntent === "High" ? "Schedule Voice Call" : "Reply";
    actions.push("Reply", "Update CRM", "Schedule Voice Call");
  } else if (intent.intent === "Follow-up") {
    primaryDecision = "Trigger Workflow";
    actions.push("Reply", "Trigger Workflow", "Schedule Voice Call");
  } else {
    primaryDecision = memory.leadScore >= 60 ? "Create Lead" : "Reply";
    actions.push("Reply", "Create Lead", "Update CRM", "Trigger Workflow");
  }

  return {
    primaryDecision,
    actions: Array.from(new Set(actions)),
    notification:
      primaryDecision === "Escalate to Human"
        ? "Notify human owner immediately."
        : primaryDecision === "Book Appointment"
          ? "Notify sales owner after appointment confirmation."
          : "Notify dashboard monitor with decision summary.",
    workflowTrigger: actions.includes("Trigger Workflow") ? `${intent.intent} orchestration workflow` : undefined,
  };
}

export function orchestrateEvent(event: OrchestratorEvent): OrchestratorDecisionRecord {
  const startedAt = performance.now();
  const intent = detectIntent(event.content);
  const memory = buildMemory(event, intent);
  const knowledge = lookupKnowledge(event, intent);
  const actionPlan = decideAction(intent, memory);

  return {
    id: `or-${event.id}`,
    timestamp: new Date().toISOString(),
    workspace: event.workspaceId,
    source: event.source,
    intent: intent.intent,
    confidence: intent.confidence,
    decision: actionPlan.primaryDecision,
    actions: actionPlan.actions,
    executionTime: Math.round(performance.now() - startedAt + 38),
    status: actionPlan.primaryDecision === "Escalate to Human" ? "Escalated" : "Completed",
    memory,
    knowledge,
    notification: actionPlan.notification,
    workflowTrigger: actionPlan.workflowTrigger,
  };
}

export const pipelineStages = [
  "Incoming Event",
  "Intent Detection",
  "Knowledge Lookup",
  "Memory",
  "Decision",
  "Action",
  "CRM",
  "Dashboard",
] as const;

export const engineArchitecture = [
  "Intent Engine",
  "Decision Engine",
  "Memory Engine",
  "Knowledge Engine",
  "Workflow Engine",
  "Action Engine",
  "Notification Engine",
  "Analytics Engine",
] as const;

export const demoDecisionRecords: OrchestratorDecisionRecord[] = [
  orchestrateEvent({
    id: "demo-website-chat",
    workspaceId: "demo",
    source: "Website Chat",
    customerName: "Riya Shah",
    business: "Skyline Realty",
    content: "I need pricing and a demo for AI CRM, WhatsApp automation, and voice calls tomorrow.",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  }),
  orchestrateEvent({
    id: "demo-voice",
    workspaceId: "demo",
    source: "Voice Conversation",
    customerName: "Arjun Mehta",
    business: "Mehta Clinics",
    content: "I have a support issue with appointment reminders and want a human to call back.",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  }),
  orchestrateEvent({
    id: "demo-api",
    workspaceId: "demo",
    source: "API Lead",
    customerName: "Priya Nair",
    business: "GrowthOps",
    content: "New lead imported from partner campaign, interested in lead automation and follow-up workflows.",
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
  }),
];

export const orchestratorAnalytics: OrchestratorAnalytics = {
  totalDecisions: 12842,
  intentAccuracy: "94.8%",
  appointments: 426,
  qualifiedLeads: 1836,
  averageResponseTime: "1.4s",
  aiSuccessRate: "97.2%",
};
