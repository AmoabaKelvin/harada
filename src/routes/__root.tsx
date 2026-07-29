import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="isolate flex min-h-dvh flex-col bg-white text-neutral-950">
      <header className="border-b border-neutral-950/10">
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4 sm:px-6"
        >
          <Link to="/" className="text-sm font-semibold">
            Harada
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-neutral-600 hover:text-neutral-950"
              activeProps={{ className: 'font-medium text-neutral-950' }}
              activeOptions={{ exact: true }}
            >
              Chart
            </Link>
            <Link
              to="/progress"
              className="text-sm text-neutral-600 hover:text-neutral-950"
              activeProps={{ className: 'font-medium text-neutral-950' }}
            >
              Progress
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
