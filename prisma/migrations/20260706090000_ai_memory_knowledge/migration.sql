CREATE TABLE "BusinessMemory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "businessName" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "products" TEXT,
    "services" TEXT,
    "pricing" TEXT,
    "faqs" TEXT,
    "workingHours" TEXT,
    "address" TEXT,
    "contactDetails" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,

    CONSTRAINT "BusinessMemory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "extractedText" TEXT NOT NULL,
    "summary" TEXT,
    "metadata" JSONB,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VisitorMemory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "previousConversations" INTEGER NOT NULL DEFAULT 0,
    "previousAppointments" INTEGER NOT NULL DEFAULT 0,
    "buyingIntent" TEXT,
    "lastVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAiSummary" TEXT,
    "lastConversationId" TEXT,
    "leadId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "VisitorMemory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessMemory_workspaceId_key" ON "BusinessMemory"("workspaceId");
CREATE INDEX "BusinessMemory_workspaceId_idx" ON "BusinessMemory"("workspaceId");

CREATE INDEX "KnowledgeDocument_workspaceId_idx" ON "KnowledgeDocument"("workspaceId");
CREATE INDEX "KnowledgeDocument_type_idx" ON "KnowledgeDocument"("type");
CREATE INDEX "KnowledgeDocument_status_idx" ON "KnowledgeDocument"("status");
CREATE INDEX "KnowledgeDocument_createdAt_idx" ON "KnowledgeDocument"("createdAt");

CREATE UNIQUE INDEX "VisitorMemory_workspaceId_visitorKey_key" ON "VisitorMemory"("workspaceId", "visitorKey");
CREATE INDEX "VisitorMemory_workspaceId_idx" ON "VisitorMemory"("workspaceId");
CREATE INDEX "VisitorMemory_phone_idx" ON "VisitorMemory"("phone");
CREATE INDEX "VisitorMemory_email_idx" ON "VisitorMemory"("email");
CREATE INDEX "VisitorMemory_leadId_idx" ON "VisitorMemory"("leadId");
CREATE INDEX "VisitorMemory_lastVisit_idx" ON "VisitorMemory"("lastVisit");

ALTER TABLE "BusinessMemory" ADD CONSTRAINT "BusinessMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitorMemory" ADD CONSTRAINT "VisitorMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
