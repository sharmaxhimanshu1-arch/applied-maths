import { Menu, Monitor, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useLocation,
  useMatches,
  useNavigation,
} from 'react-router'
import { useProgress, type ThemeSetting } from '@/progress/store'
import { IconButton } from '@/ui/Button'
import { Kbd } from '@/ui/Card'
import { Dialog } from '@/ui/Dialog'
import { cn } from '@/ui/cn'
import { CommandPalette } from './CommandPalette'
import { ErrorBoundary } from './ErrorBoundary'
import { useApplySettings } from './theme'

const NAV = [
  { to: '/map', label: 'Map' },
  { to: '/tools', label: 'Tools' },
  { to: '/progress', label: 'Progress' },
]

export interface RouteHandle {
  /** Page fills the viewport below the header (no footer), e.g. the map. */
  fullBleed?: boolean
}

export function AppShell() {
  useApplySettings()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigation = useNavigation()
  const location = useLocation()
  const matches = useMatches()
  const fullBleed = matches.some((m) => (m.handle as RouteHandle | undefined)?.fullBleed)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const typing = target.closest('input, textarea, select, [contenteditable="true"]')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only z-50 rounded-lg bg-accent px-3 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </button>

      <div
        aria-hidden
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent transition-transform duration-500',
          navigation.state === 'loading' ? 'scale-x-75' : 'scale-x-0 duration-0',
        )}
      />

      <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 sm:px-6">
          <Link
            to="/"
            className="mr-2 flex items-center gap-2.5 rounded-lg font-semibold tracking-tight"
          >
            <Logo />
            <span className="text-[0.9375rem]">
              Applied Maths <span className="text-accent">Lab</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-ink-3 shadow-sm transition-colors hover:text-ink-2 md:flex"
            >
              <Search className="size-4" aria-hidden />
              <span className="pr-6">Search concepts…</span>
              <Kbd>⌘K</Kbd>
            </button>
            <IconButton label="Search" className="md:hidden" onClick={() => setSearchOpen(true)}>
              <Search className="size-5" />
            </IconButton>
            <ThemeToggle />
            <IconButton label="Menu" className="sm:hidden" onClick={() => setMenuOpen(true)}>
              <Menu className="size-5" />
            </IconButton>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <ErrorBoundary key={location.pathname} label="page">
          <Outlet />
        </ErrorBoundary>
      </main>

      {!fullBleed && <Footer />}

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" variant="side">
        <nav aria-label="Mobile" className="grid gap-1">
          {[{ to: '/', label: 'Home' }, ...NAV, { to: '/about', label: 'About' }].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3 py-3 text-base font-medium',
                  isActive ? 'bg-surface-2 text-ink' : 'text-ink-2',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Dialog>

      <ScrollRestoration />
    </div>
  )
}

const THEME_ORDER: ThemeSetting[] = ['system', 'light', 'dark']
const THEME_ICON = { system: Monitor, light: Sun, dark: Moon }

function ThemeToggle() {
  const theme = useProgress((s) => s.settings.theme)
  const setTheme = useProgress((s) => s.setTheme)
  const Icon = THEME_ICON[theme]
  const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]
  return (
    <IconButton label={`Theme: ${theme} (switch to ${next})`} onClick={() => setTheme(next)}>
      <Icon className="size-5" />
    </IconButton>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7 shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M5 22 C 10 22, 11 9, 16 9 S 22 22, 27 22"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="9" r="2.8" fill="var(--c-yellow)" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Applied Maths Lab · learn math by touching it.</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link to="/about" className="hover:text-ink-2">
            About
          </Link>
          <Link to="/progress" className="hover:text-ink-2">
            Your progress
          </Link>
        </nav>
      </div>
    </footer>
  )
}
