'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Batch, Pod, TrackedUser, TrackedPR, PullRequest } from '@/types/github'

interface TrackedReposContextType {
  batches: Batch[]
  addBatch: (batch: Batch) => Promise<void>
  updateBatch: (batchId: string, updatedBatch: Partial<Batch>) => Promise<void>
  deleteBatch: (batchId: string) => Promise<void>
  addPod: (batchId: string, pod: Pod) => Promise<void>
  updatePod: (batchId: string, podId: string, updatedPod: Partial<Pod>) => Promise<void>
  deletePod: (batchId: string, podId: string) => Promise<void>
  addUser: (batchId: string, podId: string, user: TrackedUser) => Promise<void>
  updateUser: (batchId: string, podId: string, userId: string, updatedUser: Partial<TrackedUser>) => Promise<void>
  deleteUser: (batchId: string, podId: string, userId: string) => Promise<void>
  addPR: (batchId: string, podId: string, userId: string, pr: TrackedPR) => Promise<void>
  updatePR: (batchId: string, podId: string, userId: string, prId: number, updatedPR: Partial<TrackedPR>) => Promise<void>
  deletePR: (batchId: string, podId: string, userId: string, prId: number) => Promise<void>
}

const TrackedReposContext = createContext<TrackedReposContextType | undefined>(undefined)

export function TrackedReposProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>([])

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    const response = await fetch('/api/batches')
    const data = await response.json()
    setBatches(data)
  }

  const addBatch = async (batch: Batch) => {
    const response = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    })
    const newBatch = await response.json()
    setBatches(prev => [...prev, newBatch])
  }

  const updateBatch = async (batchId: string, updatedBatch: Partial<Batch>) => {
    const response = await fetch(`/api/batches/${batchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBatch)
    })
    const updated = await response.json()
    setBatches(prev => prev.map(batch => batch.id === batchId ? { ...batch, ...updated } : batch))
  }

  const deleteBatch = async (batchId: string) => {
    await fetch(`/api/batches/${batchId}`, { method: 'DELETE' })
    setBatches(prev => prev.filter(batch => batch.id !== batchId))
  }

  const addPod = async (batchId: string, pod: Pod) => {
    const response = await fetch('/api/pods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pod, batchId })
    })
    const newPod = await response.json()
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? { ...batch, pods: [...batch.pods, newPod] } : batch
    ))
  }

  const updatePod = async (batchId: string, podId: string, updatedPod: Partial<Pod>) => {
    const response = await fetch(`/api/pods/${podId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPod)
    })
    const updated = await response.json()
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => pod.id === podId ? { ...pod, ...updated } : pod)
      } : batch
    ))
  }

  const deletePod = async (batchId: string, podId: string) => {
    await fetch(`/api/pods/${podId}`, { method: 'DELETE' })
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.filter(pod => pod.id !== podId)
      } : batch
    ))
  }

  const addUser = async (batchId: string, podId: string, user: TrackedUser) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, podId })
    })
    const newUser = await response.json()
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => 
          pod.id === podId ? { ...pod, users: [...pod.users, newUser] } : pod
        )
      } : batch
    ))
  }

  const updateUser = async (batchId: string, podId: string, userId: string, updatedUser: Partial<TrackedUser>) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    })
    const updated = await response.json()
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => 
          pod.id === podId ? {
            ...pod,
            users: pod.users.map(user => user.id === userId ? { ...user, ...updated } : user)
          } : pod
        )
      } : batch
    ))
  }

  const deleteUser = async (batchId: string, podId: string, userId: string) => {
    await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => 
          pod.id === podId ? {
            ...pod,
            users: pod.users.filter(user => user.id !== userId)
          } : pod
        )
      } : batch
    ))
  }

  const addPR = async (batchId: string, podId: string, userId: string, pr: TrackedPR) => {
    const response = await fetch('/api/prs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pr, userId })
    })
    const newPR = await response.json()
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => 
          pod.id === podId ? {
            ...pod,
            users: pod.users.map(user => 
              user.id === userId ? {
                ...user,
                trackedPRs: [...user.trackedPRs, newPR]
              } : user
            )
          } : pod
        )
      } : batch
    ))
  }

  const updatePR = async (batchId: string, podId: string, userId: string, prId: number, updatedPR: Partial<TrackedPR>) => {
    const response = await fetch(`/api/prs/${prId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPR)
    })
    const updated = await response.json()
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => 
          pod.id === podId ? {
            ...pod,
            users: pod.users.map(user => 
              user.id === userId ? {
                ...user,
                trackedPRs: user.trackedPRs.map(pr => pr.prId === prId ? { ...pr, ...updated } : pr)
              } : user
            )
          } : pod
        )
      } : batch
    ))
  }

  const deletePR = async (batchId: string, podId: string, userId: string, prId: number) => {
    await fetch(`/api/prs/${prId}`, { method: 'DELETE' })
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? {
        ...batch,
        pods: batch.pods.map(pod => 
          pod.id === podId ? {
            ...pod,
            users: pod.users.map(user => 
              user.id === userId ? {
                ...user,
                trackedPRs: user.trackedPRs.filter(pr => pr.prId !== prId)
              } : user
            )
          } : pod
        )
      } : batch
    ))
  }

  return (
    <TrackedReposContext.Provider 
      value={{ 
        batches, 
        addBatch, 
        updateBatch, 
        deleteBatch, 
        addPod, 
        updatePod, 
        deletePod, 
        addUser, 
        updateUser, 
        deleteUser, 
        addPR, 
        updatePR, 
        deletePR 
      }}
    >
      {children}
    </TrackedReposContext.Provider>
  )
}

export function useTrackedRepos() {
  const context = useContext(TrackedReposContext)
  if (context === undefined) {
    throw new Error('useTrackedRepos must be used within a TrackedReposProvider')
  }
  return context
}

