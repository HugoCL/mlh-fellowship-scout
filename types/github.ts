export interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
  name: string
  bio: string
}

export interface PullRequest {
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  updated_at: string
  user: GitHubUser
  commits: Commit[]
}

export interface Commit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: GitHubUser
}

export interface TrackedPR {
  repository: string
  prId: number
  username: string
  lastChecked?: string
  pullRequest?: PullRequest
}

export interface TrackedUser {
  id: string
  username: string
  trackedPRs: TrackedPR[]
}

export interface Pod {
  id: string
  name: string
  users: TrackedUser[]
}

export interface Batch {
  id: string
  name: string
  pods: Pod[]
}

