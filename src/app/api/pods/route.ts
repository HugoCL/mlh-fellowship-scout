import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Pod } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request<Pod>) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id, name, batch_id } = await request.json<Pod>()
  const pod = await prisma.pod.create({
    data: { id, name, batch_id }
  })
  return NextResponse.json(pod)
}

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')

  const pods = await prisma.pod.findFirst({
    where: { batch_id: batchId as string }
  })
  return NextResponse.json(pods)
}


