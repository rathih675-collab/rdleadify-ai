-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "leadId" TEXT,
    "title" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'CHAT',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "summary" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMemory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT,
    "visitorKey" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "business" TEXT,
    "requirement" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "preferredLanguage" TEXT,
    "summary" TEXT,
    "lastAiResponse" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ConversationMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPrompt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'CHAT',
    "systemPrompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "AiPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadMemory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "summary" TEXT,
    "requirement" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "buyingIntent" TEXT,
    "preferredLanguage" TEXT,
    "lastConversationId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "LeadMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_workspaceId_idx" ON "Conversation"("workspaceId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Conversation_leadId_idx" ON "Conversation"("leadId");

-- CreateIndex
CREATE INDEX "Conversation_channel_idx" ON "Conversation"("channel");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_role_idx" ON "Message"("role");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMemory_conversationId_key" ON "ConversationMemory"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationMemory_workspaceId_idx" ON "ConversationMemory"("workspaceId");

-- CreateIndex
CREATE INDEX "ConversationMemory_visitorKey_idx" ON "ConversationMemory"("visitorKey");

-- CreateIndex
CREATE INDEX "ConversationMemory_phone_idx" ON "ConversationMemory"("phone");

-- CreateIndex
CREATE INDEX "ConversationMemory_email_idx" ON "ConversationMemory"("email");

-- CreateIndex
CREATE INDEX "ConversationMemory_business_idx" ON "ConversationMemory"("business");

-- CreateIndex
CREATE INDEX "ConversationMemory_preferredLanguage_idx" ON "ConversationMemory"("preferredLanguage");

-- CreateIndex
CREATE INDEX "AiPrompt_workspaceId_idx" ON "AiPrompt"("workspaceId");

-- CreateIndex
CREATE INDEX "AiPrompt_purpose_idx" ON "AiPrompt"("purpose");

-- CreateIndex
CREATE INDEX "AiPrompt_isActive_idx" ON "AiPrompt"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AiPrompt_workspaceId_name_key" ON "AiPrompt"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LeadMemory_leadId_key" ON "LeadMemory"("leadId");

-- CreateIndex
CREATE INDEX "LeadMemory_workspaceId_idx" ON "LeadMemory"("workspaceId");

-- CreateIndex
CREATE INDEX "LeadMemory_buyingIntent_idx" ON "LeadMemory"("buyingIntent");

-- CreateIndex
CREATE INDEX "LeadMemory_preferredLanguage_idx" ON "LeadMemory"("preferredLanguage");

-- CreateIndex
CREATE INDEX "LeadMemory_lastConversationId_idx" ON "LeadMemory"("lastConversationId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMemory" ADD CONSTRAINT "ConversationMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMemory" ADD CONSTRAINT "ConversationMemory_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPrompt" ADD CONSTRAINT "AiPrompt_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadMemory" ADD CONSTRAINT "LeadMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadMemory" ADD CONSTRAINT "LeadMemory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
