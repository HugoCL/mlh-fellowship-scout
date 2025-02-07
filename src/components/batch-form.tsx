'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createBatch } from '@/actions/pod-leaders/batches';

async function addBatch(batch: { id: string; name: string }) {
  const response = await createBatch(batch);
  return response;
}

export function BatchForm() {
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
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add batch. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Batch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='batchId' className='text-sm font-medium'>
              Batch ID
            </label>
            <Input
              id='batchId'
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder='e.g., 25.SUM'
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='batchName' className='text-sm font-medium'>
              Batch Name
            </label>
            <Input
              id='batchName'
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder='e.g., Summer 2025'
            />
          </div>
          <Button type='submit' className='w-full'>
            Add Batch
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
