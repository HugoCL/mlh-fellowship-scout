'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

type CommitStats = {
    name: string
    commits: number
}

export async function getCommitStats(params: {
    type: "batch" | "pod" | "fellow",
    id: string
}): Promise<CommitStats[]> {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Unauthorized')
    }

    const { type, id } = params
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    switch (type) {
        case "batch": {
            const data = await prisma.batch.findMany({
                where: { id },
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
            return data.map((batch) => ({
                name: batch.name,
                commits: batch.pods.flatMap((pod) =>
                    pod.users.flatMap((user) =>
                        user.prs.flatMap((pr) => pr.commits)
                    )).length,
            }))
        }

        case "pod": {
            const data = await prisma.pod.findMany({
                where: { id },
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
            return data.map((pod) => ({
                name: pod.name,
                commits: pod.users.flatMap((user) =>
                    user.prs.flatMap((pr) => pr.commits)
                ).length,
            }))
        }

        case "fellow": {
            const data = await prisma.user.findMany({
                where: { id },
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
            return data.map((user) => ({
                name: user.username,
                commits: user.prs.flatMap((pr) => pr.commits).length,
            }))
        }

        default:
            throw new Error("Invalid type parameter")
    }
}