export type KnowledgeSourceType = "PDF" | "DOCX" | "TXT" | "Markdown" | "Website URL" | "Manual Q&A" | "Business FAQ";

export type KnowledgeSource = {
  id: string;
  workspaceId: string;
  name: string;
  type: KnowledgeSourceType;
  status: "Processed" | "Processing" | "Queued";
  chunks: number;
  lastTrained: string;
  summary: string;
};

export type PromptEngineConfig = {
  businessDescription: string;
  productsServices: string;
  companyInformation: string;
  faqs: string;
  salesRules: string;
  appointmentRules: string;
  pricingRules: string;
  escalationRules: string;
  forbiddenTopics: string;
  toneOfVoice: string;
  greeting: string;
  closingMessage: string;
};

export type PersonalityPreset = {
  id: string;
  name: string;
  description: string;
  tone: string;
  defaultGoal: string;
};

export const aiBrainLanguages = [
  { id: "en", label: "English" },
  { id: "hi", label: "Hindi" },
  { id: "hinglish", label: "Hinglish" },
] as const;

export const personalityPresets: PersonalityPreset[] = [
  { id: "sales", name: "Sales Expert", description: "Qualifies buyers, handles objections, and guides toward demo booking.", tone: "Consultative and concise", defaultGoal: "Convert qualified prospects into booked demos." },
  { id: "receptionist", name: "Receptionist", description: "Greets visitors, captures details, and routes requests politely.", tone: "Warm and organized", defaultGoal: "Collect context and route to the right team." },
  { id: "support", name: "Customer Support", description: "Answers known support questions and escalates unknown issues.", tone: "Helpful and precise", defaultGoal: "Resolve known questions from the knowledge base." },
  { id: "appointment", name: "Appointment Setter", description: "Collects availability and books demos or consultations.", tone: "Efficient and confirmation-focused", defaultGoal: "Book confirmed appointments with contact details." },
  { id: "real-estate", name: "Real Estate Agent", description: "Qualifies property leads by location, budget, and site visit readiness.", tone: "Professional and responsive", defaultGoal: "Book property consultation or site visit." },
  { id: "clinic", name: "Clinic Assistant", description: "Captures patient context and appointment preferences without medical claims.", tone: "Calm and careful", defaultGoal: "Route patient enquiries and book appointments." },
  { id: "education", name: "Education Counsellor", description: "Guides students or parents through programs, fees, eligibility, and counselling slots.", tone: "Encouraging and clear", defaultGoal: "Book counselling or admissions follow-up." },
];

export const defaultKnowledgeSources: KnowledgeSource[] = [
  { id: "kb-pricing", workspaceId: "demo", name: "RDLeadify pricing FAQ", type: "Business FAQ", status: "Processed", chunks: 18, lastTrained: "Today, 10:20 AM", summary: "Pricing depends on workspace size, channels, automation volume, and AI usage." },
  { id: "kb-product", workspaceId: "demo", name: "Product overview.md", type: "Markdown", status: "Processed", chunks: 24, lastTrained: "Today, 10:32 AM", summary: "CRM, AI chat, website widget, omnichannel inbox, Google sync, and voice follow-up." },
  { id: "kb-website", workspaceId: "demo", name: "https://rdleadify.ai/features", type: "Website URL", status: "Processing", chunks: 9, lastTrained: "Queued", summary: "Website import architecture ready for crawler and vector indexing." },
];

export const defaultPromptConfig: PromptEngineConfig = {
  businessDescription: "RDLeadify AI is an AI CRM and automation platform for capturing, qualifying, and converting leads across website chat, voice, WhatsApp, inbox, Google, and CRM workflows.",
  productsServices: "AI Website Chat Widget, AI Voice Agent, CRM, Omnichannel Inbox, Google Sheets sync, Google Calendar booking, campaigns, automation workflows, and reports.",
  companyInformation: "RDLeadify AI helps revenue teams respond faster, qualify leads consistently, and centralize customer conversations.",
  faqs: "Q: Do you support Google Sheets? A: Yes, demo mode works now and OAuth architecture is ready. Q: Is voice live? A: Demo mode is available, provider adapters are ready.",
  salesRules: "Ask one question at a time. Collect name, phone/email, business type, requirement, budget, timeline, and preferred demo time.",
  appointmentRules: "Before booking, confirm date, time, timezone, contact details, and requirement.",
  pricingRules: "Never invent pricing. If exact pricing is not configured, say: I'll have our team assist you.",
  escalationRules: "Escalate legal, billing disputes, security reviews, angry customers, and unknown technical claims.",
  forbiddenTopics: "No guarantees of revenue, no medical/legal/financial advice, no unsupported discounts, no password/OTP/card collection.",
  toneOfVoice: "Professional, warm, concise, and consultative.",
  greeting: "Hi, I am RDLeadify AI. How can I help you today?",
  closingMessage: "Thanks. I'll share this with our team and help arrange the next step.",
};

export function buildBrainSystemPrompt(config: PromptEngineConfig, personality: PersonalityPreset, language = "English") {
  return [
    `You are RDLeadify AI using the "${personality.name}" personality.`,
    `Language: ${language}.`,
    `Business: ${config.businessDescription}`,
    `Products and Services: ${config.productsServices}`,
    `Company Information: ${config.companyInformation}`,
    `FAQs: ${config.faqs}`,
    `Sales Rules: ${config.salesRules}`,
    `Appointment Rules: ${config.appointmentRules}`,
    `Pricing Rules: ${config.pricingRules}`,
    `Escalation Rules: ${config.escalationRules}`,
    `Forbidden Topics: ${config.forbiddenTopics}`,
    `Tone: ${config.toneOfVoice}. Personality tone: ${personality.tone}.`,
    `Greeting: ${config.greeting}`,
    `Closing: ${config.closingMessage}`,
    "Critical response rule: answer only from configured business knowledge. If information is unavailable, say exactly: I'll have our team assist you.",
    "Never hallucinate pricing, timelines, provider status, legal promises, medical advice, or revenue guarantees.",
  ].join("\n");
}

export function simulateBrainAnswer(question: string, config: PromptEngineConfig) {
  const text = question.toLowerCase();
  if (/price|pricing|cost|budget|plan/.test(text)) return config.pricingRules.includes("Never invent")
    ? "I'll have our team assist you."
    : config.pricingRules;
  if (/appointment|demo|calendar|book/.test(text)) return `${config.appointmentRules} ${config.closingMessage}`;
  if (/google|sheet|calendar/.test(text)) return "RDLeadify AI supports Google Sheets sync and Google Calendar booking in demo mode, with OAuth architecture ready for production.";
  if (/voice|call|twilio|exotel/.test(text)) return "RDLeadify AI includes an AI Voice Agent demo mode and architecture ready for Twilio, Exotel, and other providers.";
  if (/crm|inbox|lead|automation/.test(text)) return config.productsServices;
  return "I'll have our team assist you.";
}
