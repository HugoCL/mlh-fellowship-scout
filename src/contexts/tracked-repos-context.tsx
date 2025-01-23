"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type {
  Batch,
  Pod,
  User,
  PRWithCommits,
  PR,
  PopulatedBatch,
  PopulatedUser,
  Commit,
} from "@/types/github";
import { PrsPostResponse } from "@/app/api/prs/route";

interface TrackedReposContextType {
  batches: PopulatedBatch[];
  addBatch: (batch: Batch) => Promise<void>;
  updateBatch: (
    batchId: string,
    updatedBatch: Partial<PopulatedBatch>
  ) => Promise<void>;
  deleteBatch: (batchId: string) => Promise<void>;
  addPod: (pod: Pod) => Promise<void>;
  updatePod: (
    batchId: string,
    podId: string,
    updatedPod: Partial<Pod>
  ) => Promise<void>;
  deletePod: (batchId: string, podId: string) => Promise<void>;
  addUser: (
    batchId: string,
    podId: string,
    user: Partial<User>
  ) => Promise<void>;
  updateUser: (
    batchId: string,
    podId: string,
    userId: string,
    updatedUser: Partial<User>
  ) => Promise<void>;
  deleteUser: (batchId: string, podId: string, userId: string) => Promise<void>;
  addPR: (
    batchId: string,
    podId: string,
    userId: string,
    pr: Partial<PR> & { commits?: Partial<Commit>[] }
  ) => Promise<void>;
  updatePR: (
    batchId: string,
    podId: string,
    userId: string,
    prId: number,
    updatedPR: Partial<PRWithCommits>
  ) => Promise<void>;
  deletePR: (
    batchId: string,
    podId: string,
    userId: string,
    prId: number
  ) => Promise<void>;
}

const TrackedReposContext = createContext<TrackedReposContextType | undefined>(
  undefined
);

export function TrackedReposProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [batches, setBatches] = useState<PopulatedBatch[]>([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    const response = await fetch("/api/batches");
    const data: PopulatedBatch[] = await response.json();
    setBatches(data);
  };

  const addBatch = async (batch: Batch) => {
    const response = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    const newBatch: PopulatedBatch = await response.json();
    setBatches((prev) => [...prev, newBatch]);
  };

  const updateBatch = async (
    batchId: string,
    updatedBatch: Partial<PopulatedBatch>
  ) => {
    const response = await fetch(`/api/batches/${batchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBatch),
    });
    const updated: Partial<User> = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId ? { ...batch, ...updated } : batch
      )
    );
  };

  const deleteBatch = async (batchId: string) => {
    await fetch(`/api/batches/${batchId}`, { method: "DELETE" });
    setBatches((prev) => prev.filter((batch) => batch.id !== batchId));
  };

  const addPod = async (pod: Pod) => {
    const response = await fetch("/api/pods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pod }),
    });
    const newPod: Pod = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === pod.batch_id
          ? {
              ...batch,
              pods: [...(batch.pods || []), { ...newPod, users: [] }],
            }
          : batch
      )
    );
  };

  const updatePod = async (
    batchId: string,
    podId: string,
    updatedPod: Partial<Pod>
  ) => {
    const response = await fetch(`/api/pods/${podId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPod),
    });
    const updated = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId ? { ...pod, ...(updated || {}) } : pod
              ),
            }
          : batch
      )
    );
  };

  const deletePod = async (batchId: string, podId: string) => {
    await fetch(`/api/pods/${podId}`, { method: "DELETE" });
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.filter((pod) => pod.id !== podId),
            }
          : batch
      )
    );
  };

  const addUser = async (
    batchId: string,
    podId: string,
    user: Partial<User>
  ) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, podId }),
    });
    const newUser: PopulatedUser = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId
                  ? { ...pod, users: [...pod.users, newUser] }
                  : pod
              ),
            }
          : batch
      )
    );
  };

  const updateUser = async (
    batchId: string,
    podId: string,
    userId: string,
    updatedUser: Partial<User>
  ) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });
    const updated = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId
                  ? {
                      ...pod,
                      users: pod.users.map((user) =>
                        user.id === userId
                          ? { ...user, ...(updated || {}) }
                          : user
                      ),
                    }
                  : pod
              ),
            }
          : batch
      )
    );
  };

  const deleteUser = async (batchId: string, podId: string, userId: string) => {
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId
                  ? {
                      ...pod,
                      users: pod.users.filter((user) => user.id !== userId),
                    }
                  : pod
              ),
            }
          : batch
      )
    );
  };

  const addPR = async (
    batchId: string,
    podId: string,
    userId: string,
    pr: Partial<PR> & { commits?: Partial<Commit>[] }
  ) => {
    const response = await fetch("/api/prs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...pr,
        userId,
        commits: pr.commits,
      }),
    });
    const newPR: PrsPostResponse = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId
                  ? {
                      ...pod,
                      users: pod.users.map((user) =>
                        user.id === userId
                          ? {
                              ...user,
                              prs: [...(user.prs || []), newPR.pr],
                            }
                          : user
                      ),
                    }
                  : pod
              ),
            }
          : batch
      )
    );
  };

  const updatePR = async (
    batchId: string,
    podId: string,
    userId: string,
    prDbId: number,
    updatedPR: Partial<PRWithCommits>
  ) => {
    const response = await fetch(`/api/prs`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: prDbId,
        ...updatedPR,
        commits: updatedPR.commits,
      }),
    });
    const updated = await response.json();
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId
                  ? {
                      ...pod,
                      users: pod.users.map((user) =>
                        user.id === userId
                          ? {
                              ...user,
                              prs: user.prs.map((pr) =>
                                pr.id === prDbId
                                  ? { ...pr, ...(updated || {}) }
                                  : pr
                              ),
                            }
                          : user
                      ),
                    }
                  : pod
              ),
            }
          : batch
      )
    );
  };

  const deletePR = async (
    batchId: string,
    podId: string,
    userId: string,
    prDbId: number
  ) => {
    await fetch(`/api/prs`, {
      method: "DELETE",
      body: JSON.stringify({ id: prDbId }),
      headers: { "Content-Type": "application/json" },
    });
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              pods: batch.pods.map((pod) =>
                pod.id === podId
                  ? {
                      ...pod,
                      users: pod.users.map((user) =>
                        user.id === userId
                          ? {
                              ...user,
                              prs: user.prs.filter((pr) => pr.id !== prDbId),
                            }
                          : user
                      ),
                    }
                  : pod
              ),
            }
          : batch
      )
    );
  };

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
        deletePR,
      }}
    >
      {children}
    </TrackedReposContext.Provider>
  );
}

export function useTrackedRepos() {
  const context = useContext(TrackedReposContext);
  if (context === undefined) {
    throw new Error(
      "useTrackedRepos must be used within a TrackedReposProvider"
    );
  }
  return context;
}
