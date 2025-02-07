'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PR } from '@prisma/client';
import {
  CommitCreatePayload,
  PRCreatePayload,
  PullRequestAPIResponse,
} from '@/types/github';
import { getSinglePRData } from '@/actions/pod-leaders/github';
import { createPR } from '@/actions/pod-leaders/prs';
import { getBatches } from '@/actions/pod-leaders/batches';
import { addCommitsToPR } from '@/actions/pod-leaders/commits';

async function addPR(data: { pr: PRCreatePayload }) {
  const response = await createPR(data.pr);
  return response;
}

async function fetchBatches() {
  const response = getBatches();
  return response;
}

async function addCommitsToPRHandler(data: {
  pr_number: number;
  commits: CommitCreatePayload;
}) {
  const response = await addCommitsToPR(data.pr_number, data.commits);
  return response;
}

export function PRForm() {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedPodId, setSelectedPodId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [prId, setPrId] = useState('');
  const [inputMethod, setInputMethod] = useState<'url' | 'manual'>('url');
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: addPR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      toast({
        title: 'Success',
        description: `PR added successfully`,
      });
      setPrUrl('');
      setOwner('');
      setRepo('');
      setPrId('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add pull request. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const commitsMutation = useMutation({
    mutationFn: addCommitsToPRHandler,
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add commits to PR. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalOwner = owner;
    let finalRepo = repo;

    if (inputMethod === 'url') {
      const match = prUrl.match(/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/);
      if (!match) {
        toast({
          title: 'Error',
          description: 'Invalid PR URL',
          variant: 'destructive',
        });
        return;
      }
      [, finalOwner, finalRepo] = match;
    } else if (!finalOwner || !finalRepo || !prId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { pullRequest } = await getSinglePRData(
        inputMethod === 'url'
          ? { prUrl }
          : { owner: finalOwner, repo: finalRepo, pull_number: Number(prId) }
      );

      mutation.mutate({
        pr: {
          user_id: selectedUserId,
          repository: `${finalOwner}/${finalRepo}`,
          pr_number: pullRequest.number,
          username: pullRequest.user.login,
          last_checked: new Date(),
          html_url: pullRequest.html_url,
          state: pullRequest.state,
          created_at: new Date(pullRequest.created_at),
          updated_at: new Date(),
          title: pullRequest.title,
        },
      });

      commitsMutation.mutate({
        pr_number: pullRequest.number,
        commits: pullRequest.commits.map((commitData) => ({
          pr_id: 0,
          sha: commitData.sha,
          message: commitData.commit.message,
          author_name: commitData.commit.author.name,
          author_date: new Date(commitData.commit.author.date),
          html_url: commitData.html_url,
        })),
      });
    } catch (error) {
      console.error('Error fetching PR data:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add pull request',
        variant: 'destructive',
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
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='batchSelect' className='text-sm font-medium'>
              Select Batch
            </label>
            <Select onValueChange={setSelectedBatchId} value={selectedBatchId}>
              <SelectTrigger id='batchSelect'>
                <SelectValue placeholder='Select a batch' />
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
          <div className='space-y-2'>
            <label htmlFor='podSelect' className='text-sm font-medium'>
              Select Pod
            </label>
            <Select onValueChange={setSelectedPodId} value={selectedPodId}>
              <SelectTrigger id='podSelect'>
                <SelectValue placeholder='Select a pod' />
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
          <div className='space-y-2'>
            <label htmlFor='userSelect' className='text-sm font-medium'>
              Select User
            </label>
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger id='userSelect'>
                <SelectValue placeholder='Select a user' />
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
            onValueChange={(value) => setInputMethod(value as 'url' | 'manual')}
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='url'>PR URL</TabsTrigger>
              <TabsTrigger value='manual'>Manual Input</TabsTrigger>
            </TabsList>
            <TabsContent value='url'>
              <div className='space-y-2'>
                <label htmlFor='prUrl' className='text-sm font-medium'>
                  Pull Request URL
                </label>
                <Input
                  id='prUrl'
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder='https://github.com/owner/repo/pull/123'
                />
              </div>
            </TabsContent>
            <TabsContent value='manual'>
              <div className='space-y-2'>
                <label htmlFor='owner' className='text-sm font-medium'>
                  Repository Owner
                </label>
                <Input
                  id='owner'
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder='e.g., octocat'
                />
              </div>
              <div className='mt-2 space-y-2'>
                <label htmlFor='repo' className='text-sm font-medium'>
                  Repository Name
                </label>
                <Input
                  id='repo'
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder='e.g., Hello-World'
                />
              </div>
              <div className='mt-2 space-y-2'>
                <label htmlFor='prId' className='text-sm font-medium'>
                  Pull Request Number
                </label>
                <Input
                  id='prId'
                  value={prId}
                  onChange={(e) => setPrId(e.target.value)}
                  placeholder='e.g., 1347'
                />
              </div>
            </TabsContent>
          </Tabs>
          <Button type='submit' className='w-full'>
            Add Pull Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
