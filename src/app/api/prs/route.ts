import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { repository, prId, username, lastChecked, userId, title, htmlUrl, state, createdAt, updatedAt } = await request.json()
  const pr = await prisma.pR.create({
    data: { 
      repository, 
      prId, 
      username, 
      lastChecked: new Date(lastChecked), 
      userId,
      title,
      htmlUrl,
      state,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined
    }
  })
  return NextResponse.json(pr)
}

export async function PUT(request: Request) {
  const { id, ...data } = await request.json()
  const pr = await prisma.pR.update({
    where: { id },
    data: {
      ...data,
      lastChecked: new Date(data.lastChecked),
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
    }
  })
  return NextResponse.json(pr)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  await prisma.pR.delete({
    where: { id }
  })
  return NextResponse.json({ success: true })
}

