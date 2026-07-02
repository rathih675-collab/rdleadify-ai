ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginUserAgent" TEXT;

ALTER TABLE "EmailVerificationToken"
  ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "PasswordResetToken"
  ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "AuthSession" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "refreshTokenHash" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "device" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");
CREATE INDEX IF NOT EXISTS "AuthSession_userId_idx" ON "AuthSession"("userId");
CREATE INDEX IF NOT EXISTS "AuthSession_workspaceId_idx" ON "AuthSession"("workspaceId");
CREATE INDEX IF NOT EXISTS "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_workspaceId_idx" ON "RefreshToken"("workspaceId");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
