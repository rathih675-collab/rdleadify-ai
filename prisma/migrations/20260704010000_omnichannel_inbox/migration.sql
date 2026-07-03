CREATE TYPE "InboxChannel" AS ENUM (
    'WHATSAPP',
    'WEBSITE_CHAT',
    'FACEBOOK_MESSENGER',
    'INSTAGRAM',
    'FACEBOOK_LEAD_ADS',
    'LINKEDIN',
    'EMAIL',
    'VOICE_AGENT',
    'API_WEBHOOK',
    'MANUAL'
);

CREATE TYPE "InboxMessageType" AS ENUM (
    'TEXT',
    'IMAGE',
    'PDF',
    'AUDIO',
    'VOICE',
    'VIDEO',
    'DOCUMENT',
    'LOCATION',
    'CONTACT',
    'TEMPLATE'
);

CREATE TYPE "InboxSender" AS ENUM (
    'CUSTOMER',
    'AGENT',
    'AI',
    'SYSTEM',
    'INTERNAL'
);

CREATE TYPE "InboxConversationStatus" AS ENUM (
    'OPEN',
    'PENDING',
    'RESOLVED',
    'LOST',
    'SPAM'
);

CREATE TYPE "InboxMessageStatus" AS ENUM (
    'QUEUED',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED'
);

CREATE TABLE "InboxConversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "leadId" TEXT,
    "assignedUserId" TEXT,
    "channel" "InboxChannel" NOT NULL,
    "conversationId" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "lastMessage" TEXT,
    "lastMessageType" "InboxMessageType",
    "lastMessageTime" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "status" "InboxConversationStatus" NOT NULL DEFAULT 'OPEN',
    "language" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "aiSummary" TEXT,
    "buyingIntent" TEXT,
    "sentiment" TEXT,
    "recommendedNextAction" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,

    CONSTRAINT "InboxConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "sender" "InboxSender" NOT NULL,
    "messageType" "InboxMessageType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT,
    "mediaUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InboxMessageStatus" NOT NULL DEFAULT 'SENT',
    "metadata" JSONB,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InboxConversation_workspaceId_channel_conversationId_key" ON "InboxConversation"("workspaceId", "channel", "conversationId");
CREATE INDEX "InboxConversation_workspaceId_idx" ON "InboxConversation"("workspaceId");
CREATE INDEX "InboxConversation_leadId_idx" ON "InboxConversation"("leadId");
CREATE INDEX "InboxConversation_assignedUserId_idx" ON "InboxConversation"("assignedUserId");
CREATE INDEX "InboxConversation_channel_idx" ON "InboxConversation"("channel");
CREATE INDEX "InboxConversation_status_idx" ON "InboxConversation"("status");
CREATE INDEX "InboxConversation_lastMessageTime_idx" ON "InboxConversation"("lastMessageTime");
CREATE INDEX "InboxConversation_leadScore_idx" ON "InboxConversation"("leadScore");

CREATE INDEX "InboxMessage_conversationId_idx" ON "InboxMessage"("conversationId");
CREATE INDEX "InboxMessage_userId_idx" ON "InboxMessage"("userId");
CREATE INDEX "InboxMessage_sender_idx" ON "InboxMessage"("sender");
CREATE INDEX "InboxMessage_messageType_idx" ON "InboxMessage"("messageType");
CREATE INDEX "InboxMessage_timestamp_idx" ON "InboxMessage"("timestamp");
CREATE INDEX "InboxMessage_status_idx" ON "InboxMessage"("status");

ALTER TABLE "InboxConversation" ADD CONSTRAINT "InboxConversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InboxConversation" ADD CONSTRAINT "InboxConversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InboxConversation" ADD CONSTRAINT "InboxConversation_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "InboxConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
