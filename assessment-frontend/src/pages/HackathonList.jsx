// Manage Hackathons — the single source of truth for hackathon EVENTS, persisted
// to localStorage under 'hackathon_events'. Lazy-init from storage (seed on first
// run), save on every change. Skillspring light table with status pills, an
// expandable detail row, and a custom delete-confirmation modal.

import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const STORAGE_KEY = 'hackathon_events'

const SEED_EVENTS = [
  { id: 1, title: 'AI Innovation Sprint', startDate: '2026-07-01', endDate: '2026-07-03', status: 'ACTIVE' },
  { id: 2, title: 'FinTech Build Weekend', startDate: '2026-08-15', endDate: '2026-08-17', status: 'UPCOMING' },
  { id: 3, title: 'Cloud Native Challenge', startDate: '2026-05-09', endDate: '2026-05-11', status: 'ACTIVE' },
  { id: 4, title: 'Technoverse hackathon', startDate: '2026-06-26', endDate: '2026-07-10', status: 'UPCOMING' },
]

// Read events from localStorage, falling back to the seed if absent/corrupt.
function loadEvents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Corrupt/unreadable storage — fall through to the seed.
  }
  return SEED_EVENTS
}

// Skillspring status pill — case-insensitive with three distinct tones:
// green for Active, blue for Upcoming, gray for Completed.
function StatusBadge({ status }) {
  const normalizedStatus = status?.toUpperCase() || ''

  let tone = 'border-gray-300 bg-gray-50 text-gray-500'
  if (normalizedStatus === 'ACTIVE') {
    tone = 'border-green-500 bg-green-50 text-green-700'
  } else if (normalizedStatus === 'UPCOMING') {
    tone = 'border-blue-500 bg-blue-50 text-blue-700'
  } else if (normalizedStatus === 'COMPLETED') {
    tone = 'border-gray-400 bg-gray-100 text-gray-600'
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${tone}`}
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

function WarningTriangleIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function HackathonList() {
  const navigate = useNavigate()
  const [hackathons, setHackathons] = useState(loadEvents)
  const [expandedRowId, setExpandedRowId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [hackathonToDelete, setHackathonToDelete] = useState(null)

  // Persist events on every change (single source of truth).
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hackathons))
  }, [hackathons])

  const toggleRow = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id))
  }

  const openDeleteModal = (hackathon) => {
    setHackathonToDelete(hackathon)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setHackathonToDelete(null)
  }

  const confirmDelete = () => {
    if (!hackathonToDelete) return
    setHackathons((prev) =>
      prev.filter((hackathon) => hackathon.id !== hackathonToDelete.id),
    )
    closeDeleteModal()
  }

  // Close the modal on Escape.
  useEffect(() => {
    if (!isDeleteModalOpen) return
    function handleKey(event) {
      if (event.key === 'Escape') closeDeleteModal()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isDeleteModalOpen])

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

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
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
              {hackathons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                    No hackathon events yet.
                  </td>
                </tr>
              ) : (
                hackathons.map((hackathon) => {
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
                              onClick={() => openDeleteModal(hackathon)}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Delete confirmation modal ---------- */}
      {isDeleteModalOpen && (
        <div
          onClick={closeDeleteModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="animate-in fade-in zoom-in mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-200"
          >
            {/* Brand header */}
            <div className="mb-4 flex items-center gap-2">
              <img
                src="/cogni.png"
                alt="Cognizant Logo"
                className="h-8 w-auto object-contain"
              />
            </div>

            {/* Title row */}
            <div className="flex items-center gap-2">
              <WarningTriangleIcon className="h-6 w-6 shrink-0 text-amber-500" />
              <h3
                id="delete-modal-title"
                className="text-xl font-bold text-slate-900"
              >
                Confirm Deletion
              </h3>
            </div>

            {/* Body */}
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-slate-600">
                Are you sure you want to permanently delete the{' '}
                <span className="font-semibold text-slate-900">
                  {hackathonToDelete?.title}
                </span>{' '}
                hackathon? All associated participant data, team rosters, and
                project submissions will be erased.
              </p>
              <p className="mt-3 font-medium text-slate-900">
                This action is irreversible.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white shadow-sm shadow-red-600/30 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HackathonList
