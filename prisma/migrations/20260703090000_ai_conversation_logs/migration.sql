-- CreateEnum
CREATE TYPE "AIConversationChannel" AS ENUM ('CHAT', 'VOICE');

-- CreateTable
CREATE TABLE "AIConversationLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" "AIConversationChannel" NOT NULL,
    "messages" JSONB NOT NULL,
    "summary" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CAPTURED',

    CONSTRAINT "AIConversationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIConversationLog_workspaceId_idx" ON "AIConversationLog"("workspaceId");

-- CreateIndex
CREATE INDEX "AIConversationLog_userId_idx" ON "AIConversationLog"("userId");

-- CreateIndex
CREATE INDEX "AIConversationLog_channel_idx" ON "AIConversationLog"("channel");

-- CreateIndex
CREATE INDEX "AIConversationLog_status_idx" ON "AIConversationLog"("status");

-- CreateIndex
CREATE INDEX "AIConversationLog_createdAt_idx" ON "AIConversationLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AIConversationLog" ADD CONSTRAINT "AIConversationLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversationLog" ADD CONSTRAINT "AIConversationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
