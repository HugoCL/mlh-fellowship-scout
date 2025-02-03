'use server'

import prisma from '@/lib/prisma'
import { Pod } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

export async function createPod({ id, name, batch_id }: Pod): Promise<Pod> {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Unauthorized')
    }

    const pod = await prisma.pod.create({
        data: {
            id: `${batch_id}.${id}`, name, batch_id
        }
    })

    return pod
}

export async function getPods(batchId: string): Promise<Pod[]> {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Unauthorized')
    }

    const pods = await prisma.pod.findMany({
        where: { batch_id: batchId }
    })

    return pods
}