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

  const handleRefresh = async (pr: TrackedPR) => {
    try {
      const [owner, repo] = pr.repository.split("/");
      const response = await fetch(
        `/api/github?owner=${owner}&repo=${repo}&pull_number=${pr.prId}`
      );
      if (!response.ok) {
        throw new Error("Failed to refresh pull request data");
      }
      const data = await response.json();
      updatePR(batchId, podId, userId, pr.prId, {
        ...pr,
        pullRequest: data.pullRequest,
        lastChecked: new Date().toISOString(),
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

  if (!user || user.trackedPRs.length === 0) {
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
      {user.trackedPRs.map((pr) => (
        <Collapsible
          key={pr.prId}
          open={expandedItems[`pr-${pr.prId}`]}
          onOpenChange={() => toggleExpand(`pr-${pr.prId}`)}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <GitPullRequest className="h-4 w-4 flex-shrink-0" />
                  <a
                    href={pr.pullRequest?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline truncate"
                  >
                    {pr.pullRequest?.title || `PR #${pr.prId}`}
                  </a>
                </div>
                <div className="flex space-x-2">
                  <Badge
                    variant={
                      pr.pullRequest?.state === "open" ? "default" : "secondary"
                    }
                  >
                    {pr.pullRequest?.state || "Unknown"}
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
                    onClick={() => deletePR(batchId, podId, userId, pr.prId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="icon">
                      {expandedItems[`pr-${pr.prId}`] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                {pr.pullRequest && (
                  <ScrollArea className="h-[200px] w-full mt-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Created:{" "}
                        {new Date(pr.pullRequest.created_at).toLocaleString()}
                      </p>
                      <div className="space-y-1">
                        <h6 className="text-sm font-medium">Commits:</h6>
                        {pr.pullRequest.commits.map((commit) => (
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
                              {commit.commit.message}
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
