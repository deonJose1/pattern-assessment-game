// Participant management — live roster from the backend (GET /api/participants).
// Client-side search across name/email/team/hackathon/role, with role badges.

import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

// Subtle role pill — purple for AI, blue for Frontend, gray for Backend/other.
function RoleBadge({ role }) {
  const normalized = role?.toUpperCase() || ''

  let tone = 'border-gray-300 bg-gray-50 text-gray-600'
  if (normalized.includes('AI')) {
    tone = 'border-purple-300 bg-purple-50 text-purple-700'
  } else if (normalized.includes('FRONTEND')) {
    tone = 'border-blue-300 bg-blue-50 text-blue-700'
  } else if (normalized.includes('BACKEND')) {
    tone = 'border-gray-300 bg-gray-100 text-gray-600'
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold ${tone}`}
    >
      {role || '—'}
    </span>
  )
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ParticipantManagement() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    axiosClient
      .get('/admin/participants')
      .then((res) => {
        if (active) setParticipants(res.data)
      })
      .catch(() => {
        if (active) setError('Failed to load participants. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = participants.filter((participant) =>
    [
      participant.name,
      participant.email,
      participant.teamName,
      participant.hackathon,
      participant.role,
    ].some((field) => (field || '').toLowerCase().includes(normalizedQuery)),
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950">
            Manage Participants
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and search all registered hackathon participants.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 sm:w-72">
          <SearchIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search participants…"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Hackathon</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading participants…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No participants found.
                  </td>
                </tr>
              ) : (
                filtered.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-gray-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {participant.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {participant.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {participant.teamName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {participant.hackathon}
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={participant.role} />
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

export default ParticipantManagement
