'use client';

import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Code,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  UserRoundSearch,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Pod Leaders',
      logo: Code,
      plan: 'MLH Fellowship',
    },
    {
      name: 'Admission Specialists',
      logo: UserRoundSearch,
      plan: 'MLH Fellowship',
    },
  ],
  navMain: [
    {
      title: 'Fellow Activities',
      icon: SquareTerminal,
      url: '/fellows',
      isActive: true,
      items: [
        {
          title: 'GitHub Activity',
          url: '/pod-leaders/gh-activity',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='flex items-center justify-center rounded-full bg-blue-600 p-2'>
          <Image
            src='/logo-light.svg'
            width={193}
            height={44}
            alt='MLH Fellowship'
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className='flex items-start'>
        <UserButton
          showName
          appearance={{
            elements: {
              userButtonOuterIdentifier: 'text-black',
            },
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
