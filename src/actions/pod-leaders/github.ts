'use server'

import { Octokit } from '@octokit/rest'
import { GitHubCommit, PullRequestAPIResponse } from '@/types/github'
import { auth } from '@clerk/nextjs/server'

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN })

async function fetchCommitsForPR(owner: string, repo: string, pull_number: number): Promise<GitHubCommit[]> {
    const { data } = await octokit.pulls.listCommits({
        owner,
        repo,
        pull_number,
    })

    return data.map(gh_data => ({
        sha: gh_data.sha,
        html_url: gh_data.html_url,
        commit: {
            message: gh_data.commit.message,
            author: {
                name: gh_data.commit.author?.name || '',
                date: gh_data.commit.author?.date || '',
            }
        },
        author: gh_data.author ? {
            login: gh_data.author.login,
            avatar_url: gh_data.author.avatar_url,
            html_url: gh_data.author.html_url,
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

export async function getPullRequestData(params: {
    prUrl?: string;
    owner?: string;
    repo?: string;
    pull_number?: number;
}): Promise<{ pullRequest: PullRequestAPIResponse }> {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Unauthorized')
    }

    let owner, repo, pull_number

    if (params.prUrl) {
        const match = params.prUrl.match(/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/)
        if (!match) {
            throw new Error('Invalid PR URL')
        }
        [, owner, repo, pull_number] = match
    } else {
        owner = params.owner
        repo = params.repo
        pull_number = params.pull_number
    }

    if (!owner || !repo || !pull_number) {
        throw new Error('Missing required parameters')
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

        return { pullRequest }
    } catch (error) {
        console.error('Failed to fetch GitHub data:', error)
        throw new Error('Failed to fetch GitHub data')
    }
}