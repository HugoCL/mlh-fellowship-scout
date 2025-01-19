"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitPullRequest } from "lucide-react";
import { useTrackedRepos } from "../contexts/tracked-repos-context";
import { useToast } from "@/hooks/use-toast";

export function RepoForm() {
  const [repo, setRepo] = useState("");
  const [prId, setPrId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addPR } = useTrackedRepos();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repo || !prId || !username) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/github?repo=${repo}&prId=${prId}&username=${username}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pull request data");
      }

      addPR({
        repository: repo,
        prId: parseInt(prId),
        username: username,
        pullRequest: data.pullRequest,
        lastChecked: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: `Now tracking PR #${prId} by ${username} in ${repo}`,
      });

      // Clear the form
      setRepo("");
      setPrId("");
      setUsername("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to track pull request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Pull Request</CardTitle>
        <CardDescription>
          Enter a GitHub repository, PR ID, and username to monitor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="repo" className="text-sm font-medium">
                Repository (owner/name)
              </label>
              <Input
                id="repo"
                placeholder="vercel/next.js"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="prId" className="text-sm font-medium">
                Pull Request ID
              </label>
              <Input
                id="prId"
                placeholder="1234"
                value={prId}
                onChange={(e) => setPrId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                GitHub Username
              </label>
              <Input
                id="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <GitPullRequest className="mr-2 h-4 w-4" />
            {isLoading ? "Tracking..." : "Track Pull Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
