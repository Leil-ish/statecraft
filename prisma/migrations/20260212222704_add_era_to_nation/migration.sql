-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "era" TEXT NOT NULL DEFAULT 'Stone Age',
    "stats" TEXT NOT NULL,
    "currentIssue" TEXT,
    "decisionHistory" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Nation" ("createdAt", "currentIssue", "decisionHistory", "id", "name", "stats", "updatedAt", "userId") SELECT "createdAt", "currentIssue", "decisionHistory", "id", "name", "stats", "updatedAt", "userId" FROM "Nation";
DROP TABLE "Nation";
ALTER TABLE "new_Nation" RENAME TO "Nation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
