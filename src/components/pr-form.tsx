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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PR } from "@prisma/client";
import { PullRequestAPIResponse } from "@/types/github";
import { getPullRequestData } from "@/actions/pod-leaders/github";

async function addPR(pr: {
  user_id: string;
  repository: string;
  pr_id: number;
  username: string;
  last_checked: Date;
  html_url: string;
  state: string;
  created_at: Date;
  updated_at: Date;
  title: string;
  commits: {
    pr_id: number;
    sha: string;
    message: string;
    author_name: string;
    author_date: Date;
    html_url: string;
  }[];
}) {
  const response = await fetch("/api/prs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pr),
  });
  if (!response.ok) {
    throw new Error("Failed to add pull request");
  }
  return response.json();
}

async function fetchBatches() {
  const response = await fetch("/api/batches");
  if (!response.ok) {
    throw new Error("Failed to fetch batches");
  }
  return response.json();
}

export function PRForm() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedPodId, setSelectedPodId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [prId, setPrId] = useState("");
  const [inputMethod, setInputMethod] = useState<"url" | "manual">("url");
  const { data: batches } = useQuery(["batches"], fetchBatches);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation(addPR, {
    onSuccess: () => {
      queryClient.invalidateQueries(["prs"]);
      toast({
        title: "Success",
        description: `PR added successfully`,
      });
      setPrUrl("");
      setOwner("");
      setRepo("");
      setPrId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add pull request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalOwner = owner;
    let finalRepo = repo;

    if (inputMethod === "url") {
      const match = prUrl.match(/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/);
      if (!match) {
        toast({
          title: "Error",
          description: "Invalid PR URL",
          variant: "destructive",
        });
        return;
      }
      [, finalOwner, finalRepo] = match;
    } else if (!finalOwner || !finalRepo || !prId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { pullRequest } = await getPullRequestData(
        inputMethod === "url"
          ? { prUrl }
          : { owner: finalOwner, repo: finalRepo, pull_number: prId }
      );

      mutation.mutate({
        user_id: selectedUserId,
        repository: `${finalOwner}/${finalRepo}`,
        pr_id: pullRequest.number,
        username: pullRequest.user.login,
        last_checked: new Date(),
        html_url: pullRequest.html_url,
        state: pullRequest.state,
        created_at: new Date(pullRequest.created_at),
        updated_at: new Date(),
        title: pullRequest.title,
        commits: pullRequest.commits.map((commit, index) => ({
          pr_id: pullRequest.number,
          sha: commit.sha,
          message: commit.commit.message,
          author_name: commit.commit.author.name,
          author_date: new Date(commit.commit.author.date),
          html_url: commit.html_url,
        })),
      });
    } catch (error) {
      console.error("Error fetching PR data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add pull request",
        variant: "destructive",
      });
    }
  };

  const selectedBatch = batches?.find((batch) => batch.id === selectedBatchId);
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
