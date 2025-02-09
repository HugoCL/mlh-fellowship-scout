'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { getPods } from '@/actions/pod-leaders/pods';

async function fetchPods(batchId: string) {
  const response = await getPods(batchId);
  return response;
}

export function PodList({ batchId }: { batchId: string }) {
  const {
    data: pods,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pods', batchId],
    queryFn: () => fetchPods(batchId),
  });
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Loading pods...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Failed to load pods. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!pods || pods.length === 0) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          No pods added to this batch yet. Create a pod to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {pods.map((pod) => (
        <Card key={pod.id}>
          <CardContent className='p-6'>
            <h3 className='mb-2 text-lg font-semibold'>{pod.name}</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Pod ID: {pod.id}
            </p>
            <Button
              className='w-full'
              onClick={() => router.push(`${pathname}/${pod.id}`)}
            >
              View Fellows
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
