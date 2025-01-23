import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import { PopulatedUser } from '@/types/github'

export async function POST(request: Request<User>) {
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

