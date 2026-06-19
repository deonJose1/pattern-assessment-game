// Admin dashboard — high-level overview with summary stat cards (Skillspring light theme).

import StatCard from '../components/ui/StatCard'

const STATS = [
  { label: 'Active Hackathons', value: 3, accent: 'text-blue-600' },
  { label: 'Total Participants', value: 142, accent: 'text-emerald-600' },
  { label: 'Pending Submissions', value: 12, accent: 'text-amber-600' },
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
    </div>
  )
}

export default AdminDashboard
