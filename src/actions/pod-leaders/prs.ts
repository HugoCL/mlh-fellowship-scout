'use server'

import prisma from '@/lib/prisma'
import { CommitCreatePayload, PRCreatePayload, PRWithCommits } from '@/types/github'
import { Commit, PR, Prisma } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

export async function createPR(prs: PRCreatePayload): Promise<{ pr: PR }> {
    const { userId } = await auth()
    if (!userId) {
        throw new Error('Unauthorized')
    }
    const pr = await prisma.pR.create({
        data: {
            repository: prs.repository,
            pr_number: prs.pr_number,
            username: prs.username,
            user_id: prs.user_id || '',
            title: prs.title,
            html_url: prs.html_url,
            state: prs.state,
            last_checked: prs.last_checked ? new Date(prs.last_checked) : new Date(),
            created_at: prs.created_at ? new Date(prs.created_at) : undefined,
            updated_at: prs.updated_at ? new Date(prs.updated_at) : undefined,
        }
    })

    return {
        pr: pr
    }
}

export async function updatePR(data: PRWithCommits) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error('Unauthorized')
    }

    const {
        id,
        repository,
        pr_number,
        username,
        title,
        html_url,
        state,
        last_checked,
        created_at,
        updated_at,
        commits
    } = data;

    const updatePR = prisma.pR.update({
        where: { id },
        data: {
            repository,
            pr_number,
            username,
            title,
            html_url,
            state,
            last_checked: last_checked ? new Date(last_checked) : undefined,
            created_at: created_at ? new Date(created_at) : undefined,
            updated_at: updated_at ? new Date(updated_at) : undefined,
        }
    });

    const deleteCommits = prisma.commit.deleteMany({
        where: { pr_id: id }
    });

    const createCommits = prisma.commit.createMany({
        data: commits.map(commit => ({
            pr_id: id,
            sha: commit.sha,
            message: commit.message,
            author_name: commit.author_name,
            author_date: new Date(commit.author_date),
            html_url: commit.html_url
        }))
    });

    const [updatedPr] = await prisma.$transaction([
        updatePR,
        deleteCommits,
        createCommits
    ]);

    return updatedPr;
}

export async function deletePR(id: number) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error('Unauthorized')
    }

    await prisma.commit.deleteMany({
        where: { pr_id: id }
    })

    await prisma.pR.delete({
        where: { id }
    })

    return { success: true }
}

export async function getUserPRs(userId: string) {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
        throw new Error('No autorizado')
    }

    const prs = await prisma.pR.findMany({
        where: { user_id: userId },
        include: {
            commits: true
        }
    })

    return prs
}