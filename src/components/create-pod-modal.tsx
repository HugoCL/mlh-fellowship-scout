'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createPod } from '@/actions/pod-leaders/pods';

async function addPod(pod: { id: string; name: string; batch_id: string }) {
  const response = await createPod(pod);
  return response;
}

export function CreatePodModal({
  children,
  batchId,
}: {
  children: React.ReactNode;
  batchId: string;
}) {
  const [open, setOpen] = useState(false);
  const [podId, setPodId] = useState('');
  const [podName, setPodName] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: addPod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pods'] });
      toast({
        title: 'Success',
        description: `Pod ${podId} added successfully to Batch ${batchId}`,
      });
      setPodId('');
      setPodName('');
      setOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add pod. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podId || !podName) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      id: podId,
      name: podName,
      batch_id: batchId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Pod</DialogTitle>
          <DialogDescription>
            Add a new pod to the selected batch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='podId' className='text-right'>
                Pod Number
              </label>
              <Input
                id='podId'
                value={podId}
                type='number'
                onChange={(e) => setPodId(e.target.value)}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='podName' className='text-right'>
                Pod Name
              </label>
              <Input
                id='podName'
                value={podName}
                onChange={(e) => setPodName(e.target.value)}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Create Pod</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
