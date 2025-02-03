-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    CONSTRAINT "Pod_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pod_id" TEXT NOT NULL,
    CONSTRAINT "User_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "Pod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PR" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repository" TEXT NOT NULL,
    "pr_number" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "last_checked" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "html_url" TEXT,
    "state" TEXT,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    CONSTRAINT "PR_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_date" DATETIME NOT NULL,
    "html_url" TEXT NOT NULL,
    "pr_id" INTEGER NOT NULL,
    CONSTRAINT "Commit_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "PR" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
