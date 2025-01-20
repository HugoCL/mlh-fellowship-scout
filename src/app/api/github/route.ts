import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { PullRequest, Commit, PullRequestAPIResponse } from '@/types/github'

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN })

async function fetchCommitsForPR(owner: string, repo: string, pull_number: number): Promise<Commit[]> {
  const { data } = await octokit.pulls.listCommits({
    owner,
    repo,
    pull_number,
  })

  return data.map(commit => ({
    sha: commit.sha,
    html_url: commit.html_url,
    commit: {
      message: commit.commit.message,
      author: {
        name: commit.commit.author?.name || '',
        date: commit.commit.author?.date || '',
      }
    },
    author: commit.author ? {
      login: commit.author.login,
      avatar_url: commit.author.avatar_url,
      html_url: commit.author.html_url,
      name: '',
      bio: '',
    } : {
      login: '',
      avatar_url: '',
      html_url: '',
      name: '',
      bio: '',
    },
  }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prUrl = searchParams.get('prUrl')
  let owner, repo, pull_number

  if (prUrl) {
    const match = prUrl.match(/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid PR URL' }, { status: 400 })
    }
    [, owner, repo, pull_number] = match
  } else {
    owner = searchParams.get('owner')
    repo = searchParams.get('repo')
    pull_number = searchParams.get('pull_number')
  }

  if (!owner || !repo || !pull_number) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: Number(pull_number),
    })

    const commits = await fetchCommitsForPR(owner, repo, Number(pull_number))

    const pullRequest: PullRequestAPIResponse = {
      number: pr.number,
      title: pr.title,
      html_url: pr.html_url,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      user: {
        login: pr.user?.login || '',
        avatar_url: pr.user?.avatar_url || '',
        html_url: pr.user?.html_url || '',
        name: pr.user?.name || '',
      },
      commits: commits,
    }

    return NextResponse.json({ pullRequest })
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}

