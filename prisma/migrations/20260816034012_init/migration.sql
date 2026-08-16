-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarEmoji" TEXT NOT NULL DEFAULT '🦊',
    "yearGroup" TEXT NOT NULL DEFAULT 'Y5',
    "dateOfBirth" DATETIME,
    "parentId" TEXT NOT NULL,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "levelNumber" INTEGER NOT NULL DEFAULT 1,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME,
    "accessibilityPrefs" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProfile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "frameworks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "strandSlug" TEXT NOT NULL,
    "strandName" TEXT NOT NULL,
    "yearGroup" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "objectiveCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "passageId" TEXT,
    "subSkill" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SEED',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentQuestion_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingPassage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "yearGroup" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "author" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SEED',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "QuestionAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "assignmentId" TEXT,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuestionAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ContentQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopicMastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "lastPracticedAt" DATETIME,
    CONSTRAINT "TopicMastery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TopicMastery_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpellingList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekLabel" TEXT NOT NULL,
    "yearGroup" TEXT NOT NULL,
    "strandSlug" TEXT NOT NULL,
    "words" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SEED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SpellingRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "spellingListId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpellingRun_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpellingRun_spellingListId_fkey" FOREIGN KEY ("spellingListId") REFERENCES "SpellingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "createdByParentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topicIds" TEXT NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Worksheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdByStudentId" TEXT,
    "subjectId" TEXT NOT NULL,
    "topicIds" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "questionIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Worksheet_createdByStudentId_fkey" FOREIGN KEY ("createdByStudentId") REFERENCES "StudentProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Worksheet_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StudentBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentBadge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "meta" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XpEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiGeneratedContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "targetTopicId" TEXT,
    "payload" TEXT NOT NULL,
    "promptContext" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedByParentId" TEXT,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_parentId_idx" ON "StudentProfile"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE INDEX "Topic_yearGroup_idx" ON "Topic"("yearGroup");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_strandSlug_yearGroup_key" ON "Topic"("subjectId", "strandSlug", "yearGroup");

-- CreateIndex
CREATE INDEX "ContentQuestion_topicId_difficulty_idx" ON "ContentQuestion"("topicId", "difficulty");

-- CreateIndex
CREATE INDEX "ContentQuestion_status_idx" ON "ContentQuestion"("status");

-- CreateIndex
CREATE INDEX "QuestionAttempt_studentId_questionId_idx" ON "QuestionAttempt"("studentId", "questionId");

-- CreateIndex
CREATE INDEX "QuestionAttempt_assignmentId_idx" ON "QuestionAttempt"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicMastery_studentId_topicId_key" ON "TopicMastery"("studentId", "topicId");

-- CreateIndex
CREATE INDEX "SpellingRun_studentId_spellingListId_idx" ON "SpellingRun"("studentId", "spellingListId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StudentBadge_studentId_badgeId_key" ON "StudentBadge"("studentId", "badgeId");

-- CreateIndex
CREATE INDEX "XpEvent_studentId_idx" ON "XpEvent"("studentId");
