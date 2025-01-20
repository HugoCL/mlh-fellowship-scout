export interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
  name: string
}

export interface PullRequestAPIResponse {

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
  // Database ID
  id?: string
  // GitHub Repo. Ex: "mlh/mlh-pod-4.1.0"
  repository: string
  // GitHub PR ID, found in URL
  prId: number
  // GitHub username of the user who added the PR
  username: string
  // User DB ID
  userId?: string
  lastChecked?: Date | string
  // PR Number
  number: number
  // PR Title
  title: string
  // Link to PR
  html_url: string
  // PR State
  state: string
  created_at: string
  updated_at: string
  user: GitHubUser
  commits: Commit[]
}

export interface TrackedUser {
  id: string
  username: string
  fullName: string
  prs: TrackedPR[]
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

