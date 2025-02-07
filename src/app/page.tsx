import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-center text-4xl font-bold'>
          Welcome to the Toolbox!
        </h1>
        <div className='mx-auto grid max-w-4xl gap-8 md:grid-cols-2'>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Pod Leaders</CardTitle>
              <CardDescription>
                Tools for all things Pod Leading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Access tools to track the progress of your fellows on their
                projects and more to come!
              </p>
            </CardContent>
            <CardFooter>
              <Link href='/pod-leaders' passHref>
                <Button>Go to Pod Leaders</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Admissions</CardTitle>
              <CardDescription>
                Tools to help with admissions code reviews and more!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Work in progress!</p>
            </CardContent>
            <CardFooter>
              {false ? (
                <Link href='/admissions' passHref>
                  <Button>Go to Admissions</Button>
                </Link>
              ) : (
                <Button disabled>Go to Admissions</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
