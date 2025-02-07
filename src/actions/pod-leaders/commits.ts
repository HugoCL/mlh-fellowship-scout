'use server';

import prisma from '@/lib/prisma';
import { CommitCreatePayload } from '@/types/github';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

export async function addCommitsToPR(
  prNumber: number,
  commits: CommitCreatePayload
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const commmitsData = commits as Prisma.CommitCreateManyInput[];

  const pullRequest = await prisma.pR.findFirst({
    where: { pr_number: prNumber },
  });

  if (!pullRequest) {
    throw new Error(`Pull Request with ID ${prNumber} not found`);
  }

  try {
    await prisma.commit.createMany({
      data: commmitsData.map((commit) => ({
        ...commit,
        pr_id: pullRequest.id,
      })),
    });
  } catch (error) {
    console.error('Error creating commits:', error);
    throw new Error('Failed to create commits');
  }
}
