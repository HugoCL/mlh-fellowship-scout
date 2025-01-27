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