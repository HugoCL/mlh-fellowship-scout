import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

const services = [
  {
    title: 'GH Activity',
    description: 'Track and get analytics on your fellows PRs and commits',
    features: ['PR Tracking', 'Commit Tracking', 'Analytics'],
    href: '/pod-leaders/gh-activity',
  },
];

function getGreeting() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) return 'Good morning';
  if (hours < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function PodLeadersPage() {
  const user = await currentUser();
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-12'>
          <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className='mt-5 max-w-3xl text-xl text-gray-500'>
            Here are some of the tools that you can explore to support your
            fellows!
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service, index) => (
            <Link
              href={service.href}
              key={index}
              className='group'
              aria-label={`Learn more about ${service.title}`}
            >
              <Card className='h-full transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-lg'>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {service.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant='secondary'>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
