// Admin dashboard — fully data-driven from the shared localStorage store:
// summary metrics, a pure-Tailwind bar chart (participants per hackathon), and a
// recent-activity feed derived from the actual submission data.

import { useEffect, useState } from 'react'
import StatCard from '../components/ui/StatCard'

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

function AdminDashboard() {
  const [data] = useState(loadSharedData)
  // Hackathon events are the single source of truth for "Active Hackathons".
  const [events, setEvents] = useState([])

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
    { title: 'Active Hackathons', value: activeHackathons, accent: 'text-blue-600' },
    { title: 'Total Participants', value: totalParticipants, accent: 'text-emerald-600' },
    {
      title: 'Pending Submissions',
      value: (
        <span className="inline-flex items-center">
          {pendingCount}
          {pendingCount > 0 && <PulseDot />}
        </span>
      ),
      accent: 'text-amber-600',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Overview of hackathon activity across the portal.
        </p>
      </div>

      {/* Top-level metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            accent={stat.accent}
          />
        ))}
      </div>

      {/* Chart + activity feed — stacked on mobile, side-by-side on desktop */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
                      className="h-4 rounded-full bg-blue-600 transition-all duration-700 ease-out"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity timeline */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <ol className="relative ml-2 border-l-2 border-slate-200">
              {recentActivity.map((event) => (
                <li key={event.id} className="relative mb-6 pl-6 last:mb-0">
                  <span
                    className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-2 ring-white ${event.dot}`}
                  />
                  <p className="text-sm text-slate-700">{event.text}</p>
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
