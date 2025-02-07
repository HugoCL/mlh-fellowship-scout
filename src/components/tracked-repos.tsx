'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  GitPullRequest,
  GitCommit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PullRequestAPIResponse, PRWithCommits } from '@/types/github';
import { PR } from '@prisma/client';
import { getSinglePRData } from '@/actions/pod-leaders/github';
import { deletePR, getUserPRs, updatePR } from '@/actions/pod-leaders/prs';

async function fetchUserPRs(batchId: string, podId: string, userId: string) {
  const response = await getUserPRs(userId);
  return response;
}

async function updatePRHandler(pr: PRWithCommits) {
  const response = await updatePR(pr);
  return response;
}

async function deletePRHandler(prId: number) {
  const response = await deletePR(prId);
  return response;
}

export function TrackedRepos({
  batchId,
  podId,
  userId,
}: {
  batchId: string;
  podId: string;
  userId: string;
}) {
  const {
    data: prs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['prs', batchId, podId, userId],
    queryFn: () => fetchUserPRs(batchId, podId, userId),
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const updatePRMutation = useMutation({
    mutationFn: updatePRHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prs', batchId, podId, userId],
      });
      toast({
        title: 'Success',
        description: 'Pull request data refreshed successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to refresh pull request data',
        variant: 'destructive',
      });
    },
  });

  const deletePRMutation = useMutation({
    mutationFn: deletePRHandler,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prs', batchId, podId, userId],
      });
      toast({
        title: 'Success',
        description: 'Pull request deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete pull request',
        variant: 'destructive',
      });
    },
  });

  const handleRefresh = async (pr: PRWithCommits) => {
    try {
      const [owner, repo] = pr.repository.split('/');
      const { pullRequest } = await getSinglePRData({
        owner,
        repo,
        pull_number: pr.pr_number,
      });

      updatePRMutation.mutate({
        ...pr,
        title: pullRequest.title,
        state: pullRequest.state,
        html_url: pullRequest.html_url,
        created_at: new Date(pullRequest.created_at),
        updated_at: new Date(),
        commits: pullRequest.commits.map((commit, index) => ({
          id: index,
          pr_id: pr.id,
          sha: commit.sha,
          message: commit.commit.message,
          author_name: commit.commit.author.name,
          author_date: new Date(commit.commit.author.date),
          html_url: commit.html_url,
        })),
      });
    } catch (error) {
      console.error('Error fetching PR data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch PR data',
        variant: 'destructive',
      });
    }
  };

  const toggleExpand = (itemKey: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Loading pull requests...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Failed to load pull requests. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          No pull requests tracked for this fellow yet. Add a pull request to
          get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {prs.map((pr: PRWithCommits) => (
        <Collapsible
          key={pr.id}
          open={expandedItems[`pr-${pr.id}`]}
          onOpenChange={() => toggleExpand(`pr-${pr.id}`)}
        >
          <Card>
            <CardContent className='p-4'>
              <div className='mb-2 grid grid-cols-1 gap-4 sm:flex sm:items-center sm:justify-between'>
                <div className='flex items-center justify-end space-x-2 sm:order-2'>
                  <Badge
                    className={
                      pr.state === 'open'
                        ? 'bg-yellow-700'
                        : pr.state === 'closed' && pr.merged_at !== null
                          ? 'bg-green-700'
                          : pr.state === 'closed' && pr.merged_at === null
                            ? 'bg-red-700'
                            : 'bg-gray-700'
                    }
                  >
                    {pr.state === 'open'
                      ? 'Open'
                      : pr.state === 'closed'
                        ? `Closed - ${pr.merged_at ? 'Merged' : 'Canceled'}`
                        : 'Unknown'}
                  </Badge>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleRefresh(pr)}
                  >
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => deletePRMutation.mutate(pr.id!)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant='outline' size='icon'>
                      {expandedItems[`pr-${pr.id}`] ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className='flex min-w-0 items-center space-x-2 sm:order-1'>
                  <GitPullRequest className='h-4 w-4 flex-shrink-0' />
                  <a
                    href={pr.html_url || undefined}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='truncate font-medium hover:underline'
                  >
                    {pr.title || `PR #${pr.id}`}
                  </a>
                </div>
              </div>
              <CollapsibleContent>
                {pr.commits && (
                  <ScrollArea className='mt-2 h-[200px] w-full'>
                    <div className='space-y-2'>
                      <p className='text-sm text-muted-foreground'>
                        Created:{' '}
                        {pr.created_at
                          ? new Date(pr.created_at).toLocaleString()
                          : 'Unknown'}
                      </p>
                      <div className='space-y-1'>
                        <h6 className='text-sm font-medium'>Commits:</h6>
                        {pr.commits.map((commit) => (
                          <div
                            key={commit.sha}
                            className='flex items-center space-x-2 text-sm'
                          >
                            <GitCommit className='h-3 w-3 flex-shrink-0' />
                            <a
                              href={commit.html_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='truncate hover:underline'
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
