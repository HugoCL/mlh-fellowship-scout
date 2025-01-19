"use client";

import { useTrackedRepos } from "../contexts/tracked-repos-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BatchList() {
  const { batches } = useTrackedRepos();

  if (batches.length === 0) {
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
            <p className="text-sm text-muted-foreground mb-4">ID: {batch.id}</p>
            <Link href={`/${batch.id}`} passHref>
              <Button className="w-full">View Pods</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
