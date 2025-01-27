import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Batch } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const batches = await prisma.batch.findMany({
    include: {
      pods: {
        include: {
          users: {
            include: {
              prs: {
                include: {
                  commits: true
                }
              }
            }
          }
        }
      }
    }
  })
  return NextResponse.json(batches)
}

export async function POST(request: Request<Batch>) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id, name } = await request.json<Batch>()
  const batch = await prisma.batch.create({
    data: { id, name }
  })
  return NextResponse.json(batch)
}

