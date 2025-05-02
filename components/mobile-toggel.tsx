import { Menu } from 'lucide-react'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { NavigationSidebar } from '@/components/navigation/navigation-sidebar'
import { ServerSidebarWrapper } from '@/components/server/server-sidebar-wrapper'

export const MobileToggle = ({ serverId }: { serverId: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='p-0 flex flex-col gap-0 w-full max-w-xs sm:max-w-sm h-full'>
        <div className='flex-1 flex flex-col overflow-y-auto'>
          {/* Server list (NavigationSidebar) */}
          <div className='border-b border-border'>
            <NavigationSidebar />
          </div>
          {/* Server content menu bar (ServerSidebarWrapper) */}
          <div className='flex-1 overflow-y-auto'>
            <ServerSidebarWrapper serverId={serverId} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
