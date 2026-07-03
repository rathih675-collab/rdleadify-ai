-- Enterprise scaling indexes for workspace isolation, CRM search, timelines, and automation execution.

CREATE INDEX IF NOT EXISTS "Lead_workspaceId_status_updatedAt_idx" ON "Lead"("workspaceId", "status", "updatedAt");
CREATE INDEX IF NOT EXISTS "Lead_workspaceId_source_idx" ON "Lead"("workspaceId", "source");
CREATE INDEX IF NOT EXISTS "Lead_workspaceId_score_idx" ON "Lead"("workspaceId", "score");
CREATE INDEX IF NOT EXISTS "Lead_workspaceId_email_idx" ON "Lead"("workspaceId", "email");
CREATE INDEX IF NOT EXISTS "Lead_workspaceId_phone_idx" ON "Lead"("workspaceId", "phone");

CREATE INDEX IF NOT EXISTS "InboxConversation_workspaceId_status_lastMessageTime_idx" ON "InboxConversation"("workspaceId", "status", "lastMessageTime");
CREATE INDEX IF NOT EXISTS "InboxConversation_workspaceId_channel_lastMessageTime_idx" ON "InboxConversation"("workspaceId", "channel", "lastMessageTime");
CREATE INDEX IF NOT EXISTS "InboxConversation_workspaceId_leadScore_idx" ON "InboxConversation"("workspaceId", "leadScore");

CREATE INDEX IF NOT EXISTS "AIConversationLog_workspaceId_channel_createdAt_idx" ON "AIConversationLog"("workspaceId", "channel", "createdAt");
CREATE INDEX IF NOT EXISTS "AIConversationLog_workspaceId_status_createdAt_idx" ON "AIConversationLog"("workspaceId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "AutomationWorkflow_workspaceId_status_updatedAt_idx" ON "AutomationWorkflow"("workspaceId", "status", "updatedAt");
CREATE INDEX IF NOT EXISTS "AutomationWorkflow_workspaceId_triggerEvent_status_idx" ON "AutomationWorkflow"("workspaceId", "triggerEvent", "status");

CREATE INDEX IF NOT EXISTS "AutomationExecutionLog_workspaceId_status_createdAt_idx" ON "AutomationExecutionLog"("workspaceId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "AutomationExecutionLog_workspaceId_workflowId_createdAt_idx" ON "AutomationExecutionLog"("workspaceId", "workflowId", "createdAt");

CREATE INDEX IF NOT EXISTS "Appointment_workspaceId_status_startsAt_idx" ON "Appointment"("workspaceId", "status", "startsAt");
CREATE INDEX IF NOT EXISTS "Appointment_workspaceId_leadId_startsAt_idx" ON "Appointment"("workspaceId", "leadId", "startsAt");

CREATE INDEX IF NOT EXISTS "ActivityLog_workspaceId_createdAt_idx" ON "ActivityLog"("workspaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityLog_workspaceId_action_createdAt_idx" ON "ActivityLog"("workspaceId", "action", "createdAt");
