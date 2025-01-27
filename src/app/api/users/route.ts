import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request<User>) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id, full_name, username, pod_id } = await request.json<User>()
  await prisma.user.create({
    data: { id, full_name, username, pod_id }
  })
  const populatedUser = await prisma.user.findUnique({
    where: { id },
    include: {
      prs: {
        include: {
          commits: true
        }
      }
    }
  })
  return NextResponse.json(populatedUser)
}

