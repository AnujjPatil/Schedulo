import { NavigationSidebar } from "@/components/navigation/navigation-sidebar"
import { MobileToggle } from "@/components/mobile-toggel";

const MainLayout = async ({ children, params }: { children: React.ReactNode, params: { serverId: string } }) => {
  return (
    <div className='h-full'>
      {/* Mobile nav toggle - now on the right */}
      <div className='md:hidden fixed top-2 right-2 z-50'>
        <MobileToggle serverId={params?.serverId} />
      </div>
      {/* Desktop sidebar */}
      <div className='invisible md:visible md:flex h-full w-[72px] z-50 flex-col fixed right-0 inset-y-0'>
        <NavigationSidebar />
      </div>
      <main className='md:pr-[72px] h-full pt-12 md:pt-0'>{children}</main>
    </div>
  )
}

export default MainLayout