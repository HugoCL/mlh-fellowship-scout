import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserList } from "@/components/user-list";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import { CreateUserModal } from "@/components/create-user-modal";
import Link from "next/link";

export default async function PodPage(props: {
  params: Promise<{ batchId: string; podId: string }>;
}) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href={`/${params.batchId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Batch
          </Link>
          <h1 className="text-4xl font-bold mt-2">
            Pod: {params.batchId}.{params.podId}
          </h1>
        </div>
        <CreateUserModal batchId={params.batchId} podId={params.podId}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CreateUserModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Overview of users in this pod</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading users...</div>}>
            <UserList batchId={params.batchId} podId={params.podId} />
          </Suspense>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
