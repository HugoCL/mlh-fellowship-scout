'use server';

import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

export async function createUser({ id, full_name, username, pod_id }: User) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('No autorizado');
  }

  await prisma.user.create({
    data: { id, full_name, username, pod_id },
  });

  const populatedUser = await prisma.user.findUnique({
    where: { id },
    include: {
      prs: {
        include: {
          commits: true,
        },
      },
    },
  });

  return populatedUser;
}

export async function getUsersByPodId(podId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('No autorizado');
  }

  const users = await prisma.user.findMany({
    where: { pod_id: podId },
  });

  return users;
}

export async function getUserById(userId: string) {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new Error('No autorizado');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      prs: {
        include: {
          commits: true,
        },
      },
    },
  });

  return user;
}
