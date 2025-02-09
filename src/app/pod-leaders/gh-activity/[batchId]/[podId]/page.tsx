import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserList } from '@/components/user-list';
import { Toaster } from '@/components/ui/toaster';
import { PlusCircle } from 'lucide-react';
import { CreateUserModal } from '@/components/create-user-modal';
import Link from 'next/link';
import { AnalyticsSection } from '@/components/analytics-section';
import { Separator } from '@/components/ui/separator';
/*
export default async function PodPage(props: {
  params: Promise<{ batchId: string; podId: string }>;
}) {*/
export default async function PodPage({
  params,
}: {
  params: Promise<{ batchId: string; podId: string }>;
}) {
  const { batchId, podId } = await params;
  return (
    <div className='container mx-auto py-10'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='mt-2 text-4xl font-bold'>Pod: {podId}</h1>
        </div>
        <CreateUserModal batchId={batchId} podId={podId}>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Fellow
          </Button>
        </CreateUserModal>
      </div>

      <AnalyticsSection type='pod' id={podId} />

      <Separator className='my-8' />

      <Card>
        <CardHeader>
          <CardTitle>Fellows</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading fellows...</div>}>
            <UserList batchId={batchId} podId={podId} />
          </Suspense>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
