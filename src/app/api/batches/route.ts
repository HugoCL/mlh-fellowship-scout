import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

export async function POST(request: Request) {
  const { id, name } = await request.json()
  const batch = await prisma.batch.create({
    data: { id, name }
  })
  return NextResponse.json(batch)
}

