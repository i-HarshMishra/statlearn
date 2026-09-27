-- CreateTable
CREATE TABLE "CompetencyCourseMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competencyId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "matchedVia" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetencyCourseMatch_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompetencyCourseMatch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NSSTATrainingProgramme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "topic" TEXT,
    "targetAudience" TEXT,
    "durationDays" INTEGER,
    "batchSize" INTEGER,
    "venue" TEXT,
    "weekOrDate" TEXT,
    "competencyTags" TEXT DEFAULT '',
    "sourceDocument" TEXT,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyCourseMatch_competencyId_courseId_key" ON "CompetencyCourseMatch"("competencyId", "courseId");
