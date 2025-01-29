import Providers from './providers'
import { Toolbar } from './components/toolbar/toolbar'
import { ControlBar } from './components/control-bar/control-bar'
import { Sidebar } from './components/sidebar/sidebar'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex min-h-screen w-full">
        <div className="z-20">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col pl-14">
          <ControlBar />
          <div className="h-16">
            <Toolbar />
            <main className="grid items-start gap-2 bg-muted/40 h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>
      </div>
    </Providers>
  )
}
