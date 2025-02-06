"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrackedRepos } from "@/components/tracked-repos";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import { CreatePRModal } from "@/components/create-pr-modal";
import { getUserById } from "@/actions/pod-leaders/users";
import { use } from "react";

export default function UserPage({
  params,
}: {
  params: Promise<{ batchId: string; podId: string; userId: string }>;
}) {
  const { batchId, podId, userId } = use(params);
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
  });

  if (isLoading) {
    return <div>Loading user details...</div>;
  }

  if (isError) {
    return <div>Error loading user details</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mt-2">{user?.full_name}</h1>
          <p className="text-xl text-muted-foreground">
            GitHub Username: {user?.username}
          </p>
        </div>
        <CreatePRModal batchId={batchId} podId={podId} userId={userId}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create PR
          </Button>
        </CreatePRModal>
      </div>
      <TrackedRepos batchId={batchId} podId={podId} userId={userId} />
      <Toaster />
    </div>
  );
}
