import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import { CreateBatchModal } from "@/components/create-batch-modal";
import { BatchList } from "@/components/batch-list";

export default async function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">GitHub Scout</h1>
        <CreateBatchModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </CreateBatchModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading batches...</div>}>
            <BatchList />
          </Suspense>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
