"use client";

import { useTrackedRepos } from "../contexts/tracked-repos-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserList({
  batchId,
  podId,
}: {
  batchId: string;
  podId: string;
}) {
  const { batches } = useTrackedRepos();
  const batch = batches.find((b) => b.id === batchId);
  const pod = batch?.pods.find((p) => p.id === podId);

  if (!pod || !pod.users || pod.users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No users added to this pod yet. Add a user to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pod.users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">{user.full_name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              GitHub: {user.username}
            </p>
            {/* <p className="text-sm text-muted-foreground mb-4">ID: {user.id}</p> */}
            <Link href={`/${batchId}/${podId}/${user.id}`} passHref>
              <Button className="w-full">View Pull Requests</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
