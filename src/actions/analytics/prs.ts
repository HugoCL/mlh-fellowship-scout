'use server';

import prisma from '@/lib/prisma';
import { PRAnalytics } from '@/types/analytics';
import { auth } from '@clerk/nextjs/server';
import { PR } from '@prisma/client';

function processGroupedPRs(prs: PR[]): PRAnalytics {
  if (prs.length === 0) return { repos: [], prs: [] };

  const prsByDate = new Map();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();

  for (const pr of prs) {
    const dateStr = new Date(pr.created_at!).toLocaleDateString('en-US');
    if (!prsByDate.has(dateStr)) {
      prsByDate.set(dateStr, {});
    }
    const dateData = prsByDate.get(dateStr);
    dateData[pr.repository] = (dateData[pr.repository] || 0) + 1;
  }

  const fullData: {
    repos: string[];
    prs: { date: string; [key: string]: string | number }[];
  } = {
    repos: Array.from(new Set(prs.map((pr) => pr.repository))),
    prs: [],
  };

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toLocaleDateString('en-US');
    const dateData = prsByDate.get(dateStr) || {};
    fullData.prs.push({
      date: dateStr,
      ...dateData,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return fullData;
}

export async function getPRAnalytics(params: {
  type: string;
  id: string;
  days: number;
}): Promise<PRAnalytics> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('No autorizado');
  }

  const { type, id } = params;
  const days = params.days || 7;

  if (!type || !id) {
    throw new Error('Faltan parámetros requeridos');
  }

  const dateRange = new Date();
  dateRange.setDate(dateRange.getDate() - Number(days));

  let data;

  switch (type) {
    case 'batch':
      data = await prisma.batch.findFirst({
        where: { id },
        include: {
          pods: {
            include: {
              users: {
                include: {
                  prs: {
                    where: {
                      created_at: {
                        gte: dateRange,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!data) return { repos: [], prs: [] };
      data = processGroupedPRs(
        data.pods.flatMap((pod) => pod.users.flatMap((user) => user.prs))
      );
      break;

    case 'pod':
      data = await prisma.pod.findFirst({
        where: { id },
        include: {
          users: {
            include: {
              prs: {
                where: {
                  created_at: {
                    gte: dateRange,
                  },
                },
              },
            },
          },
        },
      });
      if (!data) return { repos: [], prs: [] };
      data = processGroupedPRs(data.users.flatMap((user) => user.prs));
      break;

    case 'fellow':
      data = await prisma.user.findFirst({
        where: { id },
        include: {
          prs: {
            where: {
              created_at: {
                gte: dateRange,
              },
            },
          },
        },
      });
      data = processGroupedPRs(data?.prs || []);
      break;

    default:
      throw new Error('Tipo inválido');
  }

  return data;
}
