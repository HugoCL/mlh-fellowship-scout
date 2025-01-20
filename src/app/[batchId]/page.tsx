import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PodList } from "@/components/pod-list";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import { CreatePodModal } from "@/components/create-pod-modal";
import Link from "next/link";

export default async function BatchPage(props: { params: Promise<{ batchId: string }> }) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Batches
          </Link>
          <h1 className="text-4xl font-bold mt-2">Batch: {params.batchId}</h1>
        </div>
        <CreatePodModal batchId={params.batchId}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Pod
          </Button>
        </CreatePodModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pods</CardTitle>
          <CardDescription>Overview of pods in this batch</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading pods...</div>}>
            <PodList batchId={params.batchId} />
          </Suspense>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
