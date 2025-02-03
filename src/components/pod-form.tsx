"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getPods } from "@/actions/pod-leaders/pods";
import { getBatches } from "@/actions/pod-leaders/batches";

async function fetchBatches() {
  const response = await getBatches();
  return response;
}

async function addPod(pod: { id: string; name: string; batch_id: string }) {
  const response = await getPods(pod.batch_id);
  return response;
}

export function PodForm() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [podId, setPodId] = useState("");
  const [podName, setPodName] = useState("");
  const { data: batches } = useQuery({
    queryKey: ["batches"],
    queryFn: fetchBatches,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: addPod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
      toast({
        title: "Success",
        description: `Pod ${podId} added successfully to Batch ${selectedBatchId}`,
      });
      setSelectedBatchId("");
      setPodId("");
      setPodName("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add pod. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !podId || !podName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      id: podId,
      name: podName,
      batch_id: selectedBatchId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Pod</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="batchSelect" className="text-sm font-medium">
              Select Batch
            </label>
            <Select onValueChange={setSelectedBatchId} value={selectedBatchId}>
              <SelectTrigger id="batchSelect">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="podId" className="text-sm font-medium">
              Pod ID
            </label>
            <Input
              id="podId"
              value={podId}
              onChange={(e) => setPodId(e.target.value)}
              placeholder="e.g., A.1"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="podName" className="text-sm font-medium">
              Pod Name
            </label>
            <Input
              id="podName"
              value={podName}
              onChange={(e) => setPodName(e.target.value)}
              placeholder="e.g., Alpha Team"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Pod
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
