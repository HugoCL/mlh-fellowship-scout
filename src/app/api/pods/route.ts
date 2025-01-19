import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { id, name, batchId } = await request.json()
  const pod = await prisma.pod.create({
    data: { id, name, batchId }
  })
  return NextResponse.json(pod)
}

