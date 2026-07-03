CREATE TABLE "GoogleSheetSyncLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "leadId" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB,

    CONSTRAINT "GoogleSheetSyncLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CalendarBookingLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "attendeeEmail" TEXT,
    "attendeePhone" TEXT,
    "status" TEXT NOT NULL,
    "response" JSONB,

    CONSTRAINT "CalendarBookingLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GoogleSheetSyncLog_workspaceId_idx" ON "GoogleSheetSyncLog"("workspaceId");
CREATE INDEX "GoogleSheetSyncLog_leadId_idx" ON "GoogleSheetSyncLog"("leadId");
CREATE INDEX "GoogleSheetSyncLog_status_idx" ON "GoogleSheetSyncLog"("status");
CREATE INDEX "GoogleSheetSyncLog_createdAt_idx" ON "GoogleSheetSyncLog"("createdAt");

CREATE INDEX "CalendarBookingLog_workspaceId_idx" ON "CalendarBookingLog"("workspaceId");
CREATE INDEX "CalendarBookingLog_leadId_idx" ON "CalendarBookingLog"("leadId");
CREATE INDEX "CalendarBookingLog_status_idx" ON "CalendarBookingLog"("status");
CREATE INDEX "CalendarBookingLog_startTime_idx" ON "CalendarBookingLog"("startTime");
CREATE INDEX "CalendarBookingLog_createdAt_idx" ON "CalendarBookingLog"("createdAt");

ALTER TABLE "GoogleSheetSyncLog" ADD CONSTRAINT "GoogleSheetSyncLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleSheetSyncLog" ADD CONSTRAINT "GoogleSheetSyncLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CalendarBookingLog" ADD CONSTRAINT "CalendarBookingLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarBookingLog" ADD CONSTRAINT "CalendarBookingLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
