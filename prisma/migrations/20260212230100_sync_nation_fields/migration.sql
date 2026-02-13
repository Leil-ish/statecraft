-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "motto" TEXT NOT NULL DEFAULT 'Unity, Progress, Prosperity',
    "flag" TEXT NOT NULL DEFAULT '🏳️',
    "governmentType" TEXT NOT NULL DEFAULT 'Democratic Republic',
    "currency" TEXT NOT NULL DEFAULT 'Credit',
    "capital" TEXT NOT NULL DEFAULT 'City',
    "leader" TEXT NOT NULL DEFAULT 'The People',
    "era" TEXT NOT NULL DEFAULT 'Stone Age',
    "gameMode" TEXT NOT NULL DEFAULT 'Eternal',
    "stats" TEXT NOT NULL,
    "currentIssue" TEXT,
    "decisionHistory" TEXT NOT NULL,
    "historyLog" TEXT NOT NULL DEFAULT '[]',
    "issuesResolved" INTEGER NOT NULL DEFAULT 0,
    "founded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Nation" ("createdAt", "currentIssue", "decisionHistory", "era", "gameMode", "id", "name", "stats", "updatedAt", "userId") SELECT "createdAt", "currentIssue", "decisionHistory", "era", "gameMode", "id", "name", "stats", "updatedAt", "userId" FROM "Nation";
DROP TABLE "Nation";
ALTER TABLE "new_Nation" RENAME TO "Nation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
