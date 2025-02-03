"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { getBatches } from "@/actions/pod-leaders/batches";

async function fetchBatches() {
  const response = getBatches();
  return response;
}

export function BatchList() {
  const {
    data: batches,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["batches"],
    queryFn: fetchBatches,
  });
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading batches...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load batches. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No batches added yet. Create a batch to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {batches.map((batch) => (
        <Card key={batch.id}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">{batch.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Batch ID: {batch.id}
            </p>
            <Button
              className="w-full"
              onClick={() => router.push(`${pathname}/${batch.id}`)}
            >
              View Pods
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
