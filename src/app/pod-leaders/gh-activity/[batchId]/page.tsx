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

import React from "react";
import { AnalyticsSection } from "@/components/analytics-section";
import { Separator } from "@/components/ui/separator";

/*
export default async function BatchPage(props: {
  params: Promise<{ batchId: string }>;
}) {
  */
export default async function BatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mt-2">Batch: {batchId}</h1>
        </div>
        <div className="flex space-x-4">
          <CreatePodModal batchId={batchId}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Pod
            </Button>
          </CreatePodModal>
        </div>
      </div>

      <AnalyticsSection type="batch" id={batchId} />

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Pods</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading pods...</div>}>
            <PodList batchId={batchId} />
          </Suspense>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
