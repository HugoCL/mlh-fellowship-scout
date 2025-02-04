-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,

    CONSTRAINT "Pod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pod_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PR" (
    "id" SERIAL NOT NULL,
    "repository" TEXT NOT NULL,
    "pr_number" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "last_checked" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "html_url" TEXT,
    "state" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "PR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" SERIAL NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_date" TIMESTAMP(3) NOT NULL,
    "html_url" TEXT NOT NULL,
    "pr_id" INTEGER NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pod" ADD CONSTRAINT "Pod_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PR" ADD CONSTRAINT "PR_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "PR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
