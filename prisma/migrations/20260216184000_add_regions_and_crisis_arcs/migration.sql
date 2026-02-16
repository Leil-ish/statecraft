-- Add persistent region model and multi-turn crisis arcs
ALTER TABLE "Nation" ADD COLUMN "regions" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Nation" ADD COLUMN "crisisArcs" TEXT NOT NULL DEFAULT '[]';
