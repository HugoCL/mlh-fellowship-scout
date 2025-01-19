import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { id, fullName, username, podId } = await request.json()
  const user = await prisma.user.create({
    data: { id, fullName, username, podId }
  })
  return NextResponse.json(user)
}

