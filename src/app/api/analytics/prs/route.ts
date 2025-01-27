import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { PR } from "@prisma/client"

export async function GET(request: Request) {
    const { userId } = await auth()

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const days = searchParams.get("days") || 7

    if (!type || !id) {
        return NextResponse.json({ error: "Missing type parameter" }, { status: 400 })
    }

    const dateRange = new Date()
    dateRange.setDate(dateRange.getDate() - Number(days))

    let data

    function processGroupedPRs(prs: PR[]) {
        if (prs.length === 0) return []

        const prsByDate = new Map();
        const startDate = new Date(dateRange);
        const endDate = new Date();

        for (const pr of prs) {
            const dateStr = new Date(pr.created_at!).toLocaleDateString("en-US");
            if (!prsByDate.has(dateStr)) {
                prsByDate.set(dateStr, {});
            }
            const dateData = prsByDate.get(dateStr);
            dateData[pr.repository] = (dateData[pr.repository] || 0) + 1;
        }

        const fullData: { repos: string[], prs: ({ date: string } & Record<string, number>)[] } = {
            repos: Array.from(new Set(prs.map(pr => pr.repository))),
            prs: [],
        }
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toLocaleDateString("en-US");
            const dateData = prsByDate.get(dateStr) || {};
            fullData.prs.push({
                date: dateStr,
                ...dateData
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return fullData;
    }

    switch (type) {
        case "batch":
            data = await prisma.batch.findFirst({
                where: {
                    id: id,
                },
                include: {
                    pods: {
                        include: {
                            users: {
                                include: {
                                    prs: {
                                        where: {
                                            created_at: {
                                                gte: dateRange,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            if (!data) return []
            data = processGroupedPRs(data.pods.flatMap((pod) => pod.users.flatMap((user) => user.prs)))
            break
        case "pod":
            data = await prisma.pod.findFirst({
                where: {
                    id: id,
                },
                include: {
                    users: {
                        include: {
                            prs: {
                                where: {
                                    created_at: {
                                        gte: dateRange,
                                    },
                                },
                            },
                        },
                    },
                },
            })
            if (!data) return []
            data = processGroupedPRs(data.users.flatMap((user) => user.prs))
            break
        case "fellow":
            data = await prisma.user.findFirst({
                where: {
                    id: id,
                },
                include: {
                    prs: {
                        where: {
                            created_at: {
                                gte: dateRange,
                            },
                        },
                    },
                },
            })
            data = processGroupedPRs(data?.prs || [])
            break
        default:
            return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    return NextResponse.json(data)
}
