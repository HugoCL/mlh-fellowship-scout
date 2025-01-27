import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PRWithCommits } from '@/types/github'
import { Commit } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

export interface PrsPostResponse {
  pr: PRWithCommits
  commits: Commit[]
}

export async function POST(request: Request): Promise<NextResponse<PrsPostResponse>> {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data: PRWithCommits = await request.json()
  const pr = await prisma.pR.create({
    data: {
      repository: data.repository,
      pr_id: data.pr_id,
      username: data.username,
      user_id: data.user_id || '',
      title: data.title,
      html_url: data.html_url,
      state: data.state,
      last_checked: data.last_checked ? new Date(data.last_checked) : new Date(),
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    }
  })
  await prisma.commit.createMany({
    data: data.commits.map(commit => ({
      pr_id: pr.id,
      sha: commit.sha,
      message: commit.message,
      author_name: commit.author_name,
      author_date: new Date(commit.author_date),
      html_url: commit.html_url
    }))
  })

  const commits = await prisma.commit.findMany({
    where: { pr_id: pr.id }
  })

  return NextResponse.json({
    pr: { ...pr, commits },
    commits
  })
}

export async function PUT(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data: PRWithCommits = await request.json()
  const {
    id,
    repository,
    pr_id,
    username,
    title,
    html_url,
    state,
    last_checked,
    created_at,
    updated_at,
    commits
  } = data;

  const updatePR = prisma.pR.update({
    where: { id },
    data: {
      repository,
      pr_id,
      username,
      title,
      html_url,
      state,
      last_checked: last_checked ? new Date(last_checked) : undefined,
      created_at: created_at ? new Date(created_at) : undefined,
      updated_at: updated_at ? new Date(updated_at) : undefined,
    }
  });

  const deleteCommits = prisma.commit.deleteMany({
    where: { pr_id: id }
  });

  const createCommits = prisma.commit.createMany({
    data: commits.map(commit => ({
      pr_id: id,
      sha: commit.sha,
      message: commit.message,
      author_name: commit.author_name,
      author_date: new Date(commit.author_date),
      html_url: commit.html_url
    }))
  });

  const [updatedPr] = await prisma.$transaction([
    updatePR,
    deleteCommits,
    createCommits
  ]);

  return NextResponse.json(updatedPr);
}

export async function DELETE(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id }: { id: number } = await request.json()

  await prisma.commit.deleteMany({
    where: { pr_id: id }
  })

  await prisma.pR.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}

