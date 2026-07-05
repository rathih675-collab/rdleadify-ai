export type OrchestratorEventSource =
  | "Website Chat"
  | "Voice Conversation"
  | "Manual Lead"
  | "Imported Lead"
  | "API Lead"
  | "Future WhatsApp"
  | "Future Facebook"
  | "Future Instagram"
  | "Future LinkedIn";

export type OrchestratorIntent =
  | "Sales Inquiry"
  | "Support"
  | "Appointment"
  | "Complaint"
  | "Pricing"
  | "Demo Request"
  | "Follow-up"
  | "Unknown";

export type OrchestratorDecision =
  | "Reply"
  | "Ask Question"
  | "Book Appointment"
  | "Create Lead"
  | "Update CRM"
  | "Escalate to Human"
  | "Trigger Workflow"
  | "Schedule Voice Call"
  | "Send Email"
  | "Send to Google Sheet";

export type OrchestratorStatus = "Queued" | "Running" | "Completed" | "Escalated" | "Failed";

export type OrchestratorMemory = {
  customerName?: string;
  business?: string;
  previousChats: number;
  previousCalls: number;
  previousAppointments: number;
  leadScore: number;
  buyingIntent: "Low" | "Medium" | "High";
  lastActivity: string;
};

export type OrchestratorEvent = {
  id: string;
  workspaceId: string;
  source: OrchestratorEventSource;
  content: string;
  customerName?: string;
  business?: string;
  createdAt: string;
};

export type IntentResult = {
  intent: OrchestratorIntent;
  confidence: number;
  evidence: string[];
};

export type KnowledgeResult = {
  matchedSources: string[];
  answerPolicy: string;
  confidence: number;
};

export type RuleEngineConfig = {
  businessRules: string[];
  salesRules: string[];
  escalationRules: string[];
  workingHours: string;
  appointmentRules: string[];
  transferRules: string[];
};

export type ActionPlan = {
  primaryDecision: OrchestratorDecision;
  actions: OrchestratorDecision[];
  notification: string;
  workflowTrigger?: string;
};

export type OrchestratorDecisionRecord = {
  id: string;
  timestamp: string;
  workspace: string;
  source: OrchestratorEventSource;
  intent: OrchestratorIntent;
  confidence: number;
  decision: OrchestratorDecision;
  actions: OrchestratorDecision[];
  executionTime: number;
  status: OrchestratorStatus;
  memory: OrchestratorMemory;
  knowledge: KnowledgeResult;
  notification: string;
  workflowTrigger?: string;
};

export type OrchestratorAnalytics = {
  totalDecisions: number;
  intentAccuracy: string;
  appointments: number;
  qualifiedLeads: number;
  averageResponseTime: string;
  aiSuccessRate: string;
};
