import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Pod } from '@prisma/client'

export async function POST(request: Request<Pod>) {
  const { id, name, batch_id } = await request.json<Pod>()
  const pod = await prisma.pod.create({
    data: { id, name, batch_id }
  })
  return NextResponse.json(pod)
}

