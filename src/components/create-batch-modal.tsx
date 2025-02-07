'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createBatch } from '@/actions/pod-leaders/batches';

async function addBatch(batch: { id: string; name: string }) {
  const response = await createBatch(batch);
  return response;
}

export function CreateBatchModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: addBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast({
        title: 'Success',
        description: `Batch ${batchId} added successfully`,
      });
      setBatchId('');
      setBatchName('');
      setOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add batch. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !batchName) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      id: batchId,
      name: batchName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>
            Add a new batch to organize pods and fellows.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='batchId' className='text-right'>
                Batch ID
              </label>
              <Input
                id='batchId'
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder='e.g. 25.SUM.A'
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <label htmlFor='batchName' className='text-right'>
                Batch Name
              </label>
              <Input
                id='batchName'
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Create Batch</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
