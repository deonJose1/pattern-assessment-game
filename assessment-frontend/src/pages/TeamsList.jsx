// Teams — data-driven table of teams from the backend (GET /api/teams), showing
// each team's hackathon and current review status.

import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

// Case-insensitive status pill: green Approved, amber Pending, red Rejected.
function StatusBadge({ status }) {
  const normalized = status?.toUpperCase() || ''

  let tone = 'border-gray-300 bg-gray-50 text-gray-500'
  if (normalized === 'APPROVED') {
    tone = 'border-green-500 bg-green-50 text-green-700'
  } else if (normalized === 'PENDING') {
    tone = 'border-amber-400 bg-amber-50 text-amber-700'
  } else if (normalized === 'REJECTED') {
    tone = 'border-red-500 bg-red-50 text-red-700'
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${tone}`}
    >
      {status || '—'}
    </span>
  )
}

function TeamsList() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    axiosClient
      .get('/api/teams')
      .then((res) => {
        if (active) setTeams(res.data)
      })
      .catch(() => {
        if (active) setError('Failed to load teams. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">Manage Teams</h2>
        <p className="mt-1 text-sm text-slate-500">
          All registered teams and their current submission status.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Hackathon</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading teams…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm font-medium text-red-600">
                    {error}
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No teams registered yet.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b border-gray-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {team.team}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {team.hackathon}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={team.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeamsList
