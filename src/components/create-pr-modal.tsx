"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPullRequestData } from "@/actions/pod-leaders/github";
import { createPR } from "@/actions/pod-leaders/prs";
import { CommitCreatePayload, PRCreatePayload } from "@/types/github";
import { addCommitsToPR } from "@/actions/pod-leaders/commits";

async function addPR(data: { pr: PRCreatePayload }) {
  const response = await createPR(data.pr);
  return response;
}
async function addCommitsToPRHandler(data: {
  pr_number: number;
  commits: CommitCreatePayload;
}) {
  const response = await addCommitsToPR(data.pr_number, data.commits);
  return response;
}

export function CreatePRModal({
  children,
  batchId,
  podId,
  userId,
}: {
  children: React.ReactNode;
  batchId: string;
  podId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [prId, setPrId] = useState("");
  const [inputMethod, setInputMethod] = useState<"url" | "manual">("url");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: addPR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      toast({
        title: "Success",
        description: `PR added successfully`,
      });
      setPrUrl("");
      setOwner("");
      setRepo("");
      setPrId("");
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add pull request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const commitsMutation = useMutation({
    mutationFn: addCommitsToPRHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commits"] });
      toast({
        title: "Success",
        description: `Commits added successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add commits. Please try again.",
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
          : { owner: finalOwner, repo: finalRepo, pull_number: Number(prId) }
      );
      mutation.mutate({
        pr: {
          pr_number: pullRequest.number,
          html_url: pullRequest.html_url,
          title: pullRequest.title,
          user_id: userId,
          repository: `${finalOwner}/${finalRepo}`,
          username: pullRequest.user.login,
          state: pullRequest.state,
          created_at: new Date(pullRequest.created_at),
          updated_at: new Date(),
          last_checked: new Date(),
        },
      });

      commitsMutation.mutate({
        pr_number: pullRequest.number,
        commits: pullRequest.commits.map((commitData) => ({
          sha: commitData.sha,
          message: commitData.commit.message,
          author_name: commitData.commit.author.name,
          author_date: commitData.commit.author.date,
          html_url: commitData.html_url,
          pr_id: 0,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pull Request</DialogTitle>
          <DialogDescription>
            Add a new pull request to track for this user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
          <DialogFooter className="mt-4">
            <Button type="submit">Add Pull Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
