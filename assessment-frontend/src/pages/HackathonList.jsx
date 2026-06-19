// Hackathon list — Skillspring light table with status pills and expandable
// (accordion) detail rows. Data is read from the hackathon service.

import { Fragment, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHackathons, deleteHackathon } from '../services/hackathonService'
import Button from '../components/ui/Button'

// Skillspring status pill — green outline for Active/Completed, blue for
// Upcoming, gray for everything else (Pending, Draft, etc.).
function StatusBadge({ status }) {
  let tone = 'border-gray-300 text-gray-500'
  if (status === 'Active' || status === 'Completed') {
    tone = 'border-green-500 text-green-600'
  } else if (status === 'Upcoming') {
    tone = 'border-blue-500 text-blue-600'
  }

  return (
    <span
      className={`inline-flex rounded-full border bg-white px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${tone}`}
    >
      {status || '—'}
    </span>
  )
}

function Chevron({ expanded }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
        expanded ? 'rotate-180' : ''
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function HackathonList() {
  const navigate = useNavigate()
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [expandedRowId, setExpandedRowId] = useState(null)

  const loadHackathons = useCallback(async () => {
    const data = await getHackathons()
    setHackathons(data)
  }, [])

  useEffect(() => {
    let active = true
    async function init() {
      try {
        const data = await getHackathons()
        if (active) setHackathons(data)
      } finally {
        if (active) setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  const toggleRow = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    setDeletingId(id)
    try {
      await deleteHackathon(id)
      // Re-fetch so the table reflects the updated store.
      await loadHackathons()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950">
            Manage Hackathons
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all hackathon events.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/hackathons/new')}>
          + Create New Hackathon
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
          Loading hackathons…
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">End Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hackathons.map((hackathon) => {
                const isDeleting = deletingId === hackathon.id
                const isExpanded = expandedRowId === hackathon.id

                return (
                  <Fragment key={hackathon.id}>
                    <tr
                      className={`transition-colors hover:bg-slate-50 ${
                        isExpanded ? '' : 'border-b border-gray-100'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <button
                          type="button"
                          onClick={() => toggleRow(hackathon.id)}
                          aria-expanded={isExpanded}
                          className="flex items-center gap-2 text-left transition-colors hover:text-blue-600"
                        >
                          <Chevron expanded={isExpanded} />
                          {hackathon.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-600 tabular-nums">
                        {hackathon.startDate}
                      </td>
                      <td className="px-6 py-4 text-slate-600 tabular-nums">
                        {hackathon.endDate}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={hackathon.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              navigate(`/hackathons/edit/${hackathon.id}`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={isDeleting}
                            onClick={() => handleDelete(hackathon.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={5} className="px-6 pb-4">
                          <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Description
                            </p>
                            <p className="text-sm text-slate-600">
                              {hackathon.description ? (
                                hackathon.description
                              ) : (
                                <span className="italic text-gray-400">
                                  No description provided.
                                </span>
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HackathonList
