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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function PRForm() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedPodId, setSelectedPodId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [prId, setPrId] = useState("");
  const [inputMethod, setInputMethod] = useState<"url" | "manual">("url");
  const { batches, addPR } = useTrackedRepos();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedBatchId ||
      !selectedPodId ||
      !selectedUserId ||
      (inputMethod === "url" ? !prUrl : !owner || !repo || !prId)
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/github?${
          inputMethod === "url"
            ? `prUrl=${encodeURIComponent(prUrl)}`
            : `owner=${owner}&repo=${repo}&pull_number=${prId}`
        }`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pull request data");
      }
      const data = await response.json();

      addPR(selectedBatchId, selectedPodId, selectedUserId, {
        repository: `${data.pullRequest.user.login}/${repo}`,
        prId: data.pullRequest.number,
        username: data.pullRequest.user.login,
        lastChecked: new Date().toISOString(),
        pullRequest: data.pullRequest,
      });

      toast({
        title: "Success",
        description: `PR #${data.pullRequest.number} added successfully`,
      });

      setPrUrl("");
      setOwner("");
      setRepo("");
      setPrId("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add pull request",
        variant: "destructive",
      });
    }
  };

  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId);
  const selectedPod = selectedBatch?.pods.find(
    (pod) => pod.id === selectedPodId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Pull Request</CardTitle>
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
            <label htmlFor="userSelect" className="text-sm font-medium">
              Select User
            </label>
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger id="userSelect">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {selectedPod?.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs
            value={inputMethod}
            onValueChange={(value) => setInputMethod(value as "url" | "manual")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">PR URL</TabsTrigger>
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <div className="space-y-2">
                <label htmlFor="prUrl" className="text-sm font-medium">
                  Pull Request URL
                </label>
                <Input
                  id="prUrl"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo/pull/123"
                />
              </div>
            </TabsContent>
            <TabsContent value="manual">
              <div className="space-y-2">
                <label htmlFor="owner" className="text-sm font-medium">
                  Repository Owner
                </label>
                <Input
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g., octocat"
                />
              </div>
              <div className="space-y-2 mt-2">
                <label htmlFor="repo" className="text-sm font-medium">
                  Repository Name
                </label>
                <Input
                  id="repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g., Hello-World"
                />
              </div>
              <div className="space-y-2 mt-2">
                <label htmlFor="prId" className="text-sm font-medium">
                  Pull Request Number
                </label>
                <Input
                  id="prId"
                  value={prId}
                  onChange={(e) => setPrId(e.target.value)}
                  placeholder="e.g., 1347"
                />
              </div>
            </TabsContent>
          </Tabs>
          <Button type="submit" className="w-full">
            Add Pull Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
