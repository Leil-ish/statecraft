-- Add long-term simulation fields for compounding gameplay systems
ALTER TABLE "Nation" ADD COLUMN "pendingConsequences" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Nation" ADD COLUMN "institutions" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Nation" ADD COLUMN "factions" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Nation" ADD COLUMN "activePolicies" TEXT NOT NULL DEFAULT '[]';
