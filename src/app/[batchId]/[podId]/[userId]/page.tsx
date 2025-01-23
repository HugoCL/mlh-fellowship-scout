"use client";

import { Suspense, use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrackedRepos } from "@/components/tracked-repos";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import { CreatePRModal } from "@/components/create-pr-modal";
import Link from "next/link";
import { useTrackedRepos } from "../../../../contexts/tracked-repos-context";

export default function UserPage(props: {
  params: Promise<{ batchId: string; podId: string; userId: string }>;
}) {
  const params = use(props.params);
  const { batches } = useTrackedRepos();
  const batch = batches.find((b) => b.id === params.batchId);
  const pod = batch?.pods.find((p) => p.id === params.podId);
  const user = pod?.users.find((u) => u.id === params.userId);
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href={`/${params.batchId}/${params.podId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Pod
          </Link>
          <h1 className="text-4xl font-bold mt-2">User: {user?.full_name}</h1>
          <p className="text-xl text-muted-foreground">
            GitHub: {user?.username}
          </p>
        </div>
        <CreatePRModal
          batchId={params.batchId}
          podId={params.podId}
          userId={params.userId}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pull Request
          </Button>
        </CreatePRModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracked Repositories</CardTitle>
          <CardDescription>
            Overview of tracked pull requests for this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading tracked repositories...</div>}>
            <TrackedRepos
              batchId={params.batchId}
              podId={params.podId}
              userId={params.userId}
            />
          </Suspense>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
