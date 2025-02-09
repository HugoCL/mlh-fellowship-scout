'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { getUsersByPodId } from '@/actions/pod-leaders/users';

async function fetchUsers(batchId: string, podId: string) {
  /*
  const response = await fetch(`/api/batches/${batchId}/pods/${podId}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();*/

  const response = await getUsersByPodId(podId);
  return response;
}

export function UserList({
  batchId,
  podId,
}: {
  batchId: string;
  podId: string;
}) {
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['users', batchId, podId],
    queryFn: () => fetchUsers(batchId, podId),
  });
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Loading users...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Failed to load users. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          No users added to this pod yet. Add a user to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className='p-6'>
            <h3 className='mb-2 text-lg font-semibold'>{user.full_name}</h3>
            <p className='mb-2 text-sm text-muted-foreground'>
              GitHub: {user.username}
            </p>
            <Button
              className='w-full'
              onClick={() => router.push(`${pathname}/${user.id}`)}
            >
              View Pull Requests
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
