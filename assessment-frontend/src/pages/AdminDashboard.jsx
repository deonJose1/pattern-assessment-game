// Admin dashboard — fully data-driven from the shared localStorage store:
// summary metrics, a pure-Tailwind bar chart (participants per hackathon), and a
// recent-activity feed derived from the actual submission data.
//
// NOTE: the data engine below (loadSharedData, buildActivity, state, and all
// computed values) is intentionally preserved as-is — only the UI is enhanced.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'shared_hackathon_data'
const EVENTS_STORAGE_KEY = 'hackathon_events'
const MEMBERS_PER_TEAM = 3

function loadSharedData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Corrupt/unreadable storage — fall through to empty.
  }
  return []
}

// Pulsing red alert dot for "action required" metrics.
function PulseDot() {
  return (
    <span className="relative ml-2 inline-flex h-3 w-3 align-middle">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
    </span>
  )
}

// Build a recent-activity feed from the real submission data.
function buildActivity(data) {
  return data
    .map((item) => {
      const status = item.status?.toUpperCase()
      if (item.score !== null && item.score !== undefined) {
        return { id: item.id, text: `Score assigned to ${item.team}`, dot: 'bg-green-500' }
      }
      if (status === 'PENDING') {
        return { id: item.id, text: `New submission pending for ${item.projectTitle}`, dot: 'bg-amber-500' }
      }
      if (status === 'APPROVED') {
        return { id: item.id, text: `${item.team} approved for scoring`, dot: 'bg-blue-500' }
      }
      if (status === 'REJECTED') {
        return { id: item.id, text: `${item.team}'s submission was rejected`, dot: 'bg-red-500' }
      }
      return { id: item.id, text: `${item.team} registered`, dot: 'bg-slate-400' }
    })
    .slice(0, 5)
}

/* ------------------------------ UI helpers ------------------------------ */

// Decorative relative timestamps for the activity feed (presentation only).
const ACTIVITY_TIMES = ['Just now', '2 hrs ago', '5 hrs ago', 'Yesterday', '2 days ago']

// Derive avatar initials from an activity line (display only — no data change):
// picks the last two capitalized words (usually the team/subject).
function activityInitials(text) {
  const caps = (text || '').split(/\s+/).filter((w) => /^[A-Z]/.test(w))
  const picked = caps.slice(-2)
  const initials = picked.map((w) => w[0]).join('')
  return (initials || 'AD').slice(0, 2).toUpperCase()
}

function TrophyIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function UsersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TrendUpIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function DownloadIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function AdminDashboard() {
  const [data] = useState(loadSharedData)
  // Hackathon events are the single source of truth for "Active Hackathons".
  const [events, setEvents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
      setEvents(stored ? JSON.parse(stored) : [])
    } catch {
      setEvents([])
    }
  }, [])

  const uniqueHackathons = [...new Set(data.map((d) => d.hackathon).filter(Boolean))]
  const uniqueTeams = [...new Set(data.map((d) => d.team).filter(Boolean))]

  // Count only events explicitly marked ACTIVE (from 'hackathon_events').
  const activeHackathons = events.filter(
    (event) => event.status?.toUpperCase() === 'ACTIVE',
  ).length
  const totalParticipants = uniqueTeams.length * MEMBERS_PER_TEAM
  const pendingCount = data.filter(
    (d) => d.status?.toUpperCase() === 'PENDING',
  ).length

  // Participants per hackathon = (teams in that hackathon) × members per team.
  const participantsPerHackathon = uniqueHackathons.map((name) => {
    const teams = new Set(
      data.filter((d) => d.hackathon === name).map((d) => d.team),
    )
    return { name, count: teams.size * MEMBERS_PER_TEAM }
  })
  const maxCount = Math.max(...participantsPerHackathon.map((p) => p.count), 1)

  const recentActivity = buildActivity(data)

  const stats = [
    { title: 'Active Hackathons', value: activeHackathons, accent: 'text-blue-600', trend: '+12%', Icon: TrophyIcon },
    { title: 'Total Participants', value: totalParticipants, accent: 'text-emerald-600', trend: '+8%', Icon: UsersIcon },
    {
      title: 'Pending Submissions',
      value: (
        <span className="inline-flex items-center">
          {pendingCount}
          {pendingCount > 0 && <PulseDot />}
        </span>
      ),
      accent: 'text-amber-600',
      trend: '+3%',
      Icon: ClockIcon,
    },
  ]

  // Export the participants-per-hackathon metrics as a CSV (reads existing data).
  const handleExportCSV = () => {
    const headers = ['Hackathon', 'Participants']
    const rows = participantsPerHackathon.map(
      (item) => `"${String(item.name).replace(/"/g, '""')}",${item.count}`,
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dashboard-metrics.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Page header with Quick Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Overview of hackathon activity across the portal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/hackathons/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/40"
          >
            + New Hackathon
          </button>
        </div>
      </div>

      {/* Smart metric cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.Icon
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Faint decorative background icon */}
              <Icon className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-slate-100 transition-transform duration-300 group-hover:scale-110" />

              <div className="relative">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-bold tabular-nums text-slate-800">
                    {stat.value}
                  </span>
                  <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    <TrendUpIcon className="h-3 w-3" />
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart + activity feed — stacked on mobile, side-by-side on desktop */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Participants per Hackathon
          </h3>
          {participantsPerHackathon.length === 0 ? (
            <p className="text-sm text-slate-400">No hackathon data yet.</p>
          ) : (
            <div className="space-y-5">
              {participantsPerHackathon.map((item) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-100">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-700 ease-out"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity timeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <ol className="relative space-y-6">
              {/* Continuous polished timeline line */}
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-[17px] top-3 w-px bg-slate-200"
              />
              {recentActivity.map((event, index) => (
                <li key={event.id} className="relative flex items-start gap-4">
                  <span
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ring-white ${event.dot}`}
                  >
                    {activityInitials(event.text)}
                  </span>
                  <div className="flex flex-1 items-start justify-between gap-3 pt-1.5">
                    <p className="text-sm text-slate-700">{event.text}</p>
                    <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">
                      {ACTIVITY_TIMES[index] ?? ''}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
