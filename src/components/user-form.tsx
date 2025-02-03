"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function fetchBatches() {
  const response = await fetch("/api/batches");
  if (!response.ok) {
    throw new Error("Failed to fetch batches");
  }
  return response.json();
}

async function addUser(user: { id: string; full_name: string; username: string; pod_id: string }) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Failed to add user");
  }
  return response.json();
}

export function UserForm() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedPodId, setSelectedPodId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: batches } = useQuery(["batches"], fetchBatches);

  const mutation = useMutation(addUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Success",
        description: `User ${username} added successfully to Pod ${selectedPodId} in Batch ${selectedBatchId}`,
      });
      setSelectedBatchId("");
      setSelectedPodId("");
      setFullName("");
      setUsername("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !selectedPodId || !username) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      id: `${fullName.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substr(2, 5)}`,
      full_name: fullName,
      username: username,
      pod_id: selectedPodId,
    });
  };

  const selectedBatch = batches?.find((batch) => batch.id === selectedBatchId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New User</CardTitle>
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
            <label htmlFor="podSelect" className="text-sm font-medium">
              Select Pod
            </label>
            <Select onValueChange={setSelectedPodId} value={selectedPodId}>
              <SelectTrigger id="podSelect">
                <SelectValue placeholder="Select a pod" />
              </SelectTrigger>
              <SelectContent>
                {selectedBatch?.pods.map((pod) => (
                  <SelectItem key={pod.id} value={pod.id}>
                    {pod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium">
              User ID
            </label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              GitHub Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., octocat"
            />
          </div>
          <Button type="submit" className="w-full">
            Add User
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
