import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TrackedPR } from '@/types/github'
import { PR } from '@prisma/client'


export async function POST(request: Request) {
  const data: TrackedPR = await request.json()
  const pr = await prisma.pR.create({
    data: {
      repository: data.repository,
      prId: data.prId,
      username: data.username,
      userId: data.userId || '',
      title: data.title,
      htmlUrl: data.html_url,
      state: data.state,
      lastChecked: data.lastChecked ? new Date(data.lastChecked) : new Date(),
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    }
  })
  const commits = await prisma.commit.createMany({
    data: data.commits.map(commit => ({
      prId: pr.id,
      sha: commit.sha,
      htmlUrl: commit.html_url,
      message: commit.commit.message,
    }))
  })
  return NextResponse.json(pr)
}

export async function PUT(request: Request) {
  const data: PR = await request.json()

  const {
    id,
    repository,
    prId,
    username,
    title,
    htmlUrl,
    state,
    lastChecked,
    createdAt,
    updatedAt
  } = data;

  const pr = await prisma.pR.update({
    where: { id },
    data: {
      repository,
      prId,
      username,
      title,
      htmlUrl,
      state,
      lastChecked: lastChecked ? new Date(lastChecked) : undefined,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined
    }
  })

  return NextResponse.json(pr)
}

export async function DELETE(request: Request) {
  const { id }: { id: number } = await request.json()
  const result = await prisma.pR.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}

