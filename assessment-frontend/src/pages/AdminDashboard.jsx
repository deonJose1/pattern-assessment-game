// Admin dashboard — overview with summary stat cards, a pure-Tailwind bar
// chart (participants per hackathon), and a recent-activity timeline.

import StatCard from '../components/ui/StatCard'

const STATS = [
  { label: 'Active Hackathons', value: 3, accent: 'text-blue-600' },
  { label: 'Total Participants', value: 142, accent: 'text-emerald-600' },
  { label: 'Pending Submissions', value: 12, accent: 'text-amber-600' },
]

const PARTICIPANTS_PER_HACKATHON = [
  { name: 'AI Sprint', count: 120, max: 150 },
  { name: 'FinTech Build', count: 85, max: 150 },
  { name: 'Cloud Native', count: 40, max: 150 },
]

const RECENT_ACTIVITY = [
  {
    id: 1,
    text: 'Team Alpha submitted their project',
    time: '2 hours ago',
    dot: 'bg-green-500',
  },
  {
    id: 2,
    text: 'Admin approved FinTech Build scores',
    time: '5 hours ago',
    dot: 'bg-blue-500',
  },
  {
    id: 3,
    text: 'New participant registered for Cloud Native',
    time: 'Yesterday',
    dot: 'bg-purple-500',
  },
]

function AdminDashboard() {
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
        {STATS.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
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
          <div className="space-y-5">
            {PARTICIPANTS_PER_HACKATHON.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="tabular-nums text-slate-500">
                    {item.count}
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-slate-100">
                  <div
                    className="h-4 rounded-full bg-blue-600 transition-all duration-700 ease-out"
                    style={{ width: `${(item.count / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity timeline */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          <ol className="relative ml-2 border-l-2 border-slate-200">
            {RECENT_ACTIVITY.map((event) => (
              <li key={event.id} className="relative mb-6 pl-6 last:mb-0">
                <span
                  className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-2 ring-white ${event.dot}`}
                />
                <p className="text-sm text-slate-700">{event.text}</p>
                <p className="mt-0.5 text-xs text-slate-400">{event.time}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
