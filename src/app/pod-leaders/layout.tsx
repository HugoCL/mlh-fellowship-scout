import { AppSidebar } from '@/components/app-sidebar';
import PathAwareBreadcrumb from '@/components/path-aware-breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TanstackQuery } from '@/providers/tanstack-query';
import { Separator } from '@radix-ui/react-separator';
import { QueryClient } from '@tanstack/react-query';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <PathAwareBreadcrumb />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-8 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
