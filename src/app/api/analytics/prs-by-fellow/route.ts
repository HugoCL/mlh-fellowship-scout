import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server";
import { RepoStats } from "@/types/analytics";

export async function GET() {
    const { userId } = await auth()

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const prs = await prisma.pR.findMany({
        include: {
            user: true,
        },
    })



    const data = prs.reduce<Record<string, RepoStats>>((acc, pr) => {
        const repo = pr.repository
        if (!acc[repo]) {
            acc[repo] = { repo, open: 0, closed: 0, fellows: {} }
        }

        if (pr.state === "open") acc[repo].open++
        else if (pr.state === "closed") acc[repo].closed++

        const username = pr.user?.username || 'unknown'
        const fullName = pr.user?.full_name || 'unknown'
        const fellowKey = `${fullName}`

        if (!acc[repo].fellows[fellowKey]) {
            acc[repo].fellows[fellowKey] = { open: 0, closed: 0 }
        }
        const state = pr.state as 'open' | 'closed'
        acc[repo].fellows[fellowKey][state]++

        return acc
    }, {})


    return NextResponse.json(Object.values(data))
}
