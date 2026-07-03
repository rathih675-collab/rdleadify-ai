CREATE TABLE "AutomationWorkflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "aiAgent" TEXT,
    "pipeline" TEXT,
    "leadSource" TEXT,
    "triggerEvent" TEXT,
    "workingHours" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "retryDelay" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "triggers" JSONB,
    "conditions" JSONB,
    "providerConfig" JSONB,
    "crmActions" JSONB,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "AutomationWorkflow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationExecutionLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workflowId" TEXT,
    "userId" TEXT,
    "campaign" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executionTime" INTEGER,
    "result" TEXT,
    "aiSummary" TEXT,
    "errors" JSONB,
    "metadata" JSONB,

    CONSTRAINT "AutomationExecutionLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "triggers" JSONB,
    "conditions" JSONB,
    "crmActions" JSONB,
    "providerConfig" JSONB,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AutomationTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AutomationWorkflow_workspaceId_idx" ON "AutomationWorkflow"("workspaceId");
CREATE INDEX "AutomationWorkflow_createdById_idx" ON "AutomationWorkflow"("createdById");
CREATE INDEX "AutomationWorkflow_status_idx" ON "AutomationWorkflow"("status");
CREATE INDEX "AutomationWorkflow_triggerEvent_idx" ON "AutomationWorkflow"("triggerEvent");

CREATE INDEX "AutomationExecutionLog_workspaceId_idx" ON "AutomationExecutionLog"("workspaceId");
CREATE INDEX "AutomationExecutionLog_workflowId_idx" ON "AutomationExecutionLog"("workflowId");
CREATE INDEX "AutomationExecutionLog_userId_idx" ON "AutomationExecutionLog"("userId");
CREATE INDEX "AutomationExecutionLog_status_idx" ON "AutomationExecutionLog"("status");
CREATE INDEX "AutomationExecutionLog_createdAt_idx" ON "AutomationExecutionLog"("createdAt");

CREATE UNIQUE INDEX "AutomationTemplate_workspaceId_name_key" ON "AutomationTemplate"("workspaceId", "name");
CREATE INDEX "AutomationTemplate_workspaceId_idx" ON "AutomationTemplate"("workspaceId");
CREATE INDEX "AutomationTemplate_createdById_idx" ON "AutomationTemplate"("createdById");
CREATE INDEX "AutomationTemplate_category_idx" ON "AutomationTemplate"("category");

ALTER TABLE "AutomationWorkflow" ADD CONSTRAINT "AutomationWorkflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationWorkflow" ADD CONSTRAINT "AutomationWorkflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AutomationExecutionLog" ADD CONSTRAINT "AutomationExecutionLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationExecutionLog" ADD CONSTRAINT "AutomationExecutionLog_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "AutomationWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AutomationExecutionLog" ADD CONSTRAINT "AutomationExecutionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AutomationTemplate" ADD CONSTRAINT "AutomationTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationTemplate" ADD CONSTRAINT "AutomationTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
