import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

export interface PullRequestAPIResponse {
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  user: GitHubUser;
  commits: GitHubCommit[];
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: GitHubUser;
}

export type PRWithCommits = Prisma.PRGetPayload<{
  include: {
    commits: true;
  };
}>;

export type PRCreatePayload = Prisma.Args<typeof prisma.pR, 'create'>['data'];

export type CommitCreatePayload = Prisma.Args<
  typeof prisma.commit,
  'createMany'
>['data'];

export type PopulatedBatch = Prisma.BatchGetPayload<{
  include: {
    pods: {
      include: {
        users: {
          include: {
            prs: {
              include: {
                commits: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type PopulatedUser = Prisma.UserGetPayload<{
  include: {
    prs: {
      include: {
        commits: true;
      };
    };
  };
}>;

export type { Batch, Pod, User, PR, Commit } from '@prisma/client';
