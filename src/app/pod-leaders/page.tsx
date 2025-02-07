import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { currentUser } from '@clerk/nextjs/server';

const services = [
  {
    title: 'GH Activity',
    description: 'Track and get analytics on your fellows PRs and commits',
    features: ['PR Tracking', 'Commit Tracking', 'Analytics'],
  },
];

export default async function PodLeadersPage() {
  const user = await currentUser();
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-12'>
          <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl'>
            Welcome, {user?.fullName}!
          </h1>
          <p className='mt-5 max-w-3xl text-xl text-gray-500'>
            Explore our suite of tools and resources designed to help you lead
            your pod effectively and create an engaging learning environment.
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service, index) => (
            <Card key={index} className='flex flex-col justify-between'>
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
          ))}
        </div>
      </div>
    </div>
  );
}
