export interface CommitData {
  name: string;
  commits: number;
}

export interface PRData {
  name: string;
  prs: number;
}

export interface RepoStats {
  repo: string;
  open: number;
  closed: number;
  fellows: Record<string, { open: number; closed: number }>;
}

export type PRByRepo = {
  date: string;
  [repository: string]: string | number;
};

export type PRAnalytics = {
  repos: string[];
  prs: PRByRepo[];
};
