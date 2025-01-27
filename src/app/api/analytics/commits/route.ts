import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: Request) {
    const { userId } = await auth()

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const sevenDaysAgo = new Date()
    if (!type || !id) {
        return NextResponse.json({ error: "Missing type parameter" }, { status: 400 })
    }

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    let data

    switch (type) {
        case "batch":
            data = await prisma.batch.findMany({
                where: {
                    id: id,
                },
                include: {
                    pods: {
                        include: {
                            users: {
                                include: {
                                    prs: {
                                        include: {
                                            commits: {
                                                where: {
                                                    author_date: {
                                                        gte: sevenDaysAgo,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }
            })
            data = data.map((batch) => ({
                name: batch.name,
                commits: batch.pods.flatMap((pod) => pod.users.flatMap((user) => user.prs.flatMap((pr) => pr.commits))).length,
            }))
            break
        case "pod":
            data = await prisma.pod.findMany({
                where: {
                    id: id,
                },
                include: {
                    users: {
                        include: {
                            prs: {
                                include: {
                                    commits: {
                                        where: {
                                            author_date: {
                                                gte: sevenDaysAgo,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            data = data.map((pod) => ({
                name: pod.name,
                commits: pod.users.flatMap((user) => user.prs.flatMap((pr) => pr.commits)).length,
            }))
            break
        case "fellow":
            data = await prisma.user.findMany({
                where: {
                    id: id,
                },
                include: {
                    prs: {
                        include: {
                            commits: {
                                where: {
                                    author_date: {
                                        gte: sevenDaysAgo,
                                    },
                                },
                            },
                        },
                    },
                },
            })
            data = data.map((user) => ({
                name: user.username,
                commits: user.prs.flatMap((pr) => pr.commits).length,
            }))
            break
        default:
            return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    return NextResponse.json(data)
}

