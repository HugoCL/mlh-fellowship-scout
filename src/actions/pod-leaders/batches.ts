'use server';

import prisma from '@/lib/prisma';
import { Batch } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

export async function getBatches() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const batches = await prisma.batch.findMany({
    include: {
      pods: {
        include: {
          users: {
            include: {
              prs: {
                include: {
                  commits: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return batches;
}

export async function createBatch({ id, name }: Batch): Promise<Batch> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const batch = await prisma.batch.create({
    data: { id, name },
  });

  return batch;
}
