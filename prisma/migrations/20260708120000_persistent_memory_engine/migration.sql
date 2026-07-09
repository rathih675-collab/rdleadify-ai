ALTER TABLE "VisitorMemory"
ADD COLUMN "business" TEXT,
ADD COLUMN "preferredLanguage" TEXT,
ADD COLUMN "previousRequirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "previousSummaries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "lastAiResponse" TEXT;

CREATE INDEX "VisitorMemory_business_idx" ON "VisitorMemory"("business");
CREATE INDEX "VisitorMemory_preferredLanguage_idx" ON "VisitorMemory"("preferredLanguage");
