import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Batch } from '@prisma/client'

export async function GET() {
  const batches = await prisma.batch.findMany({
    include: {
      pods: {
        include: {
          users: {
            include: {
              prs: true
            }
          }
        }
      }
    }
  })
  return NextResponse.json(batches)
}

export async function POST(request: Request<Batch>) {
  const { id, name } = await request.json<Batch>()
  const batch = await prisma.batch.create({
    data: { id, name }
  })
  return NextResponse.json(batch)
}

