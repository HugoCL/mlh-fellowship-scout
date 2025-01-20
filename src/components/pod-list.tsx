"use client";

import { useTrackedRepos } from "../contexts/tracked-repos-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PodList({ batchId }: { batchId: string }) {
  const { batches } = useTrackedRepos();
  const batch = batches.find((b) => b.id === batchId);

  if (!batch || !batch.pods || batch.pods.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No pods added to this batch yet. Create a pod to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {batch.pods.map((pod) => (
        <Card key={pod.id}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">{pod.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">ID: {pod.id}</p>
            <Link href={`/${batchId}/${pod.id}`} passHref>
              <Button className="w-full">View Users</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
