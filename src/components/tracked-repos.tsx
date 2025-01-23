"use client";

import { useState } from "react";
import { useTrackedRepos } from "../contexts/tracked-repos-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  GitPullRequest,
  GitCommit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PullRequestAPIResponse, PRWithCommits } from "@/types/github";
import { PR } from "@prisma/client";

export function TrackedRepos({
  batchId,
  podId,
  userId,
}: {
  batchId: string;
  podId: string;
  userId: string;
}) {
  const { batches, updatePR, deletePR } = useTrackedRepos();
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const batch = batches.find((b) => b.id === batchId);
  const pod = batch?.pods.find((p) => p.id === podId);
  const user = pod?.users.find((u) => u.id === userId);

  const handleRefresh = async (pr: PRWithCommits) => {
    try {
      const [owner, repo] = pr.repository.split("/");
      const response = await fetch(
        `/api/github?owner=${owner}&repo=${repo}&pull_number=${pr.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to refresh pull request data");
      }
      const data: { pullRequest: PullRequestAPIResponse } =
        await response.json();
      updatePR(batchId, podId, userId, pr.id!, {
        ...pr,
        title: data.pullRequest.title,
        state: data.pullRequest.state,
        html_url: data.pullRequest.html_url,
        created_at: new Date(data.pullRequest.created_at),
        updated_at: new Date(),
        commits: data.pullRequest.commits.map((commit, index) => ({
          id: index,
          pr_id: pr.pr_id,
          sha: commit.sha,
          message: commit.commit.message,
          author_name: commit.commit.author.name,
          author_date: new Date(commit.commit.author.date),
          html_url: commit.html_url,
        })),
      });
      toast({
        title: "Success",
        description: "Pull request data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh pull request data",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (itemKey: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  if (!user || !user.prs || user.prs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No pull requests tracked for this user yet. Add a pull request to get
          started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {user.prs.map((pr: PRWithCommits) => (
        <Collapsible
          key={pr.id}
          open={expandedItems[`pr-${pr.id}`]}
          onOpenChange={() => toggleExpand(`pr-${pr.id}`)}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <GitPullRequest className="h-4 w-4 flex-shrink-0" />
                  <a
                    href={pr.html_url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline truncate"
                  >
                    {pr.title || `PR #${pr.id}`}
                  </a>
                </div>
                <div className="flex space-x-2">
                  <Badge
                    variant={pr.state === "open" ? "default" : "secondary"}
                  >
                    {pr.state || "Unknown"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRefresh(pr)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deletePR(batchId, podId, userId, pr.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="icon">
                      {expandedItems[`pr-${pr.id}`] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                {pr.commits && (
                  <ScrollArea className="h-[200px] w-full mt-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Created:{" "}
                        {pr.created_at
                          ? new Date(pr.created_at).toLocaleString()
                          : "Unknown"}
                      </p>
                      <div className="space-y-1">
                        <h6 className="text-sm font-medium">Commits:</h6>
                        {pr.commits.map((commit) => (
                          <div
                            key={commit.sha}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <GitCommit className="h-3 w-3 flex-shrink-0" />
                            <a
                              href={commit.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate"
                            >
                              {commit.message}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
