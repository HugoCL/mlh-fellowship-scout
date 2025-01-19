-- Migration number: 0001 	 2025-01-19T17:50:47.706Z
-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    CONSTRAINT "Pod_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "podId" TEXT NOT NULL,
    CONSTRAINT "User_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PR" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repository" TEXT NOT NULL,
    "prId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "lastChecked" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "htmlUrl" TEXT,
    "state" TEXT,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    CONSTRAINT "PR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorDate" DATETIME NOT NULL,
    "prId" INTEGER NOT NULL,
    CONSTRAINT "Commit_prId_fkey" FOREIGN KEY ("prId") REFERENCES "PR" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);