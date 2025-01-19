"use client";

import { useState } from "react";
import { useTrackedRepos } from "../contexts/tracked-repos-context";
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

export function PodForm() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [podId, setPodId] = useState("");
  const [podName, setPodName] = useState("");
  const { batches, addPod } = useTrackedRepos();
  const { toast } = useToast();

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

    addPod(selectedBatchId, {
      id: podId,
      name: podName,
      users: [],
    });

    toast({
      title: "Success",
      description: `Pod ${podId} added successfully to Batch ${selectedBatchId}`,
    });

    setSelectedBatchId("");
    setPodId("");
    setPodName("");
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
                {batches.map((batch) => (
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
