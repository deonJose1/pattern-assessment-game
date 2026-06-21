// Admin module shell — premium enterprise layout:
//   • Light, sticky top navbar (logo, active search, "Ask AI" drawer, actions)
//   • Dark navy sidebar that is an off-canvas drawer on mobile (< lg) and a
//     collapsible w-64 ↔ w-20 icon rail on desktop (>= lg)
//   • Light content area with a corporate footer
//
// Icons are inline SVGs (no extra dependency). Child routes render via <Outlet/>.

import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'shared_hackathon_data'

// Read PENDING submissions from the shared store (for the notification badge
// and dropdown list).
function loadPendingItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return data.filter((d) => d.status?.toUpperCase() === 'PENDING')
    }
  } catch {
    // Corrupt/unreadable storage — treat as none.
  }
  return []
}

/* ------------------------------ Icons ------------------------------ */

const iconBase = 'h-5 w-5'

const MenuIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const SparkleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" />
  </svg>
)

const BellIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const HelpIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const DashboardIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
)

const TrophyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const UsersIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ParticipantsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
)

const SubmissionsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

const BarChartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

const AwardIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

const LogoutIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

/* ------------------------------ Nav config ------------------------------ */

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', end: true, Icon: DashboardIcon },
  { label: 'Leaderboard', to: '/leaderboard', end: false, Icon: BarChartIcon },
  { label: 'Manage Hackathons', to: '/hackathons', end: false, Icon: TrophyIcon },
  { label: 'Participants', to: '/participants', end: false, Icon: ParticipantsIcon },
  { label: 'Submissions', to: '/submissions', end: false, Icon: SubmissionsIcon },
  { label: 'Score Management', to: '/scores', end: false, Icon: AwardIcon },
  { label: 'Teams', to: '/teams', end: false, Icon: UsersIcon },
]

// Tailwind's `lg` breakpoint (1024px) divides drawer (mobile) from rail (desktop).
const DESKTOP_BREAKPOINT = 1024

// Derive avatar initials from an email: john.doe@… → JD, admin@… → AD.
function getInitials(email) {
  if (!email) return 'AD'
  const local = email.split('@')[0]
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

/* ------------------------------ Layout ------------------------------ */

function AdminLayout() {
  // Open by default on desktop, collapsed/closed on smaller screens.
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT,
  )

  // On mobile, tapping a nav link should dismiss the drawer.
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < DESKTOP_BREAKPOINT) {
      setIsSidebarOpen(false)
    }
  }

  const navigate = useNavigate()
  const location = useLocation()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [pendingItems, setPendingItems] = useState([])
  const notifRef = useRef(null)

  // AI assistant chat state (UI-only demo).
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello Admin! I am your Cognizant AI Assistant. I can help you evaluate project submissions, generate real-time leaderboards, or customize your hackathon evaluation criteria. What can I do for you today?',
    },
  ])
  const messageIdRef = useRef(2)

  // Read the logged-in email once on mount (set at login).
  const [adminEmail] = useState(
    () =>
      (typeof window !== 'undefined' && localStorage.getItem('adminEmail')) ||
      '',
  )

  // Recompute the pending badge on every route change (the layout itself does
  // not remount between routes, so a one-time read would go stale).
  useEffect(() => {
    setPendingItems(loadPendingItems())
  }, [location.pathname])

  const handleLogout = () => {
    // Clear only the auth session — preserve mock DB data (hackathons, etc.).
    localStorage.removeItem('isAdminAuth')
    localStorage.removeItem('adminEmail')
    navigate('/login')
  }

  const handleSendMessage = () => {
    const text = chatInput.trim()
    if (!text) return

    // Render the user's message, clear the input.
    setMessages((prev) => [
      ...prev,
      { id: messageIdRef.current++, sender: 'user', text },
    ])
    setChatInput('')

    // Simulate network latency, then append a canned AI reply.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: messageIdRef.current++,
          sender: 'ai',
          text: 'I am currently operating in UI-only demo mode. To unlock my full analytical capabilities, please connect me to the Spring Boot backend!',
        },
      ])
    }, 1500)
  }

  // Close the user menu on outside click or Escape.
  useEffect(() => {
    if (!isUserMenuOpen) return
    function handlePointer(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    function handleKey(event) {
      if (event.key === 'Escape') setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isUserMenuOpen])

  // Close the AI assistant drawer on Escape.
  useEffect(() => {
    if (!isAssistantOpen) return
    function handleKey(event) {
      if (event.key === 'Escape') setIsAssistantOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isAssistantOpen])

  // Close the notifications dropdown on outside click or Escape.
  useEffect(() => {
    if (!isNotifOpen) return
    function handlePointer(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
    }
    function handleKey(event) {
      if (event.key === 'Escape') setIsNotifOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isNotifOpen])

  // Close the help modal on Escape.
  useEffect(() => {
    if (!isHelpOpen) return
    function handleKey(event) {
      if (event.key === 'Escape') setIsHelpOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isHelpOpen])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ---------- Top navbar ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label="Toggle sidebar"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <MenuIcon className={iconBase} />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex items-baseline text-xl lowercase tracking-tight text-indigo-950">
              <span className="font-normal">cognizant</span>
              <span className="ml-2 font-bold">hackathon&trade;</span>
            </span>
            <span className="translate-y-[1px] rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800">
              Admin
            </span>
          </div>
        </div>

        {/* Center: active global search + Ask AI */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 transition-colors focus-within:bg-slate-200/70">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search hackathons, teams…"
                className="w-56 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {searchQuery.trim() && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <svg
                    className="h-4 w-4 shrink-0 animate-spin text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm text-slate-500">
                    Searching global database for{' '}
                    <span className="font-medium text-slate-700">
                      &apos;{searchQuery}&apos;
                    </span>
                    …
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            <SparkleIcon className="h-3.5 w-3.5" />
            Ask AI / Navigator
          </button>
        </div>

        {/* Right: notifications, help, avatar */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((open) => !open)}
              aria-label={`Notifications (${pendingItems.length} pending)`}
              className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <BellIcon className={iconBase} />
              {pendingItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {pendingItems.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Notifications
                  </p>
                </div>
                {pendingItems.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    You&apos;re all caught up!
                  </p>
                ) : (
                  <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                    {pendingItems.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <span className="font-semibold text-amber-600">
                          Action Required:
                        </span>{' '}
                        <span className="font-medium text-slate-900">
                          {item.team}
                        </span>{' '}
                        submitted{' '}
                        <span className="text-slate-700">
                          {item.projectTitle}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            aria-label="Help"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <HelpIcon className={iconBase} />
          </button>
          <div className="relative ml-1" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition-shadow hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {getInitials(adminEmail)}
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              >
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {adminEmail || 'admin@cognizant.com'}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Mobile overlay backdrop (only < lg, when open) ---------- */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* ---------- Sidebar ----------
          Mobile (< lg): off-canvas drawer — full w-64, slides in/out via translate.
          Desktop (>= lg): always visible, collapses between w-64 and w-20. */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col bg-slate-900 transition-all duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        <nav className="flex flex-1 flex-col gap-1 py-4">
          {NAV_ITEMS.map(({ label, to, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `mx-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isSidebarOpen ? '' : 'lg:justify-center'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {/* Label hides only on the desktop icon-rail (collapsed >= lg). */}
              <span
                className={`whitespace-nowrap ${isSidebarOpen ? '' : 'lg:hidden'}`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
        <div
          className={`border-t border-slate-800 p-4 text-xs text-slate-500 ${
            isSidebarOpen ? '' : 'lg:hidden'
          }`}
        >
          Admin Module · v0.1
        </div>
      </aside>

      {/* ---------- Content column ----------
          No left padding on mobile (drawer floats over); on desktop the padding
          tracks the sidebar width. */}
      <div
        className={`flex min-h-screen flex-col pt-16 transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <main className="flex-1 bg-slate-50 p-8">
          <Outlet />
        </main>

        {/* ---------- Footer ---------- */}
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 bg-white px-8 py-4 text-xs text-slate-500 sm:flex-row">
          <span>© 2026 Cognizant, All rights reserved.</span>
          <div className="flex items-center gap-3">
            <a href="#contact" className="transition-colors hover:text-slate-900">
              Contact us
            </a>
            <span className="text-slate-300">|</span>
            <a href="#terms" className="transition-colors hover:text-slate-900">
              Terms
            </a>
            <span className="text-slate-300">|</span>
            <a href="#privacy" className="transition-colors hover:text-slate-900">
              Privacy
            </a>
          </div>
        </footer>
      </div>

      {/* ---------- AI Admin Assistant drawer ---------- */}
      <div
        onClick={() => setIsAssistantOpen(false)}
        aria-hidden={!isAssistantOpen}
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAssistantOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AI Admin Assistant"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isAssistantOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <img
              src="/cogniIcon.png"
              alt="Cognizant Logo"
              className="h-6 w-auto object-contain"
            />
            <h3 className="text-base font-bold text-slate-900">
              Cognizant AI Navigator
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAssistantOpen(false)}
            aria-label="Close assistant"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  message.sender === 'user'
                    ? 'rounded-tr-sm bg-blue-600 text-white'
                    : 'rounded-tl-sm border border-gray-200 bg-white text-slate-700'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask Cognizant AI…"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Help & resources modal ---------- */}
      {isHelpOpen && (
        <div
          onClick={() => setIsHelpOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Portal Help & Resources"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <img src="/cogni.png" alt="Cognizant" className="mb-4 h-8 w-auto" />
            <h3 className="text-xl font-bold text-slate-900">
              Portal Help &amp; Resources
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Welcome to the Cognizant Hackathon Admin Portal. Use this dashboard
              to manage events, review project submissions, and utilize our AI
              Navigator for automated scoring. For technical support, contact
              internal IT.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout
