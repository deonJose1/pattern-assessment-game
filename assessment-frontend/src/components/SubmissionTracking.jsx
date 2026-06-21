// Submission tracking — premium, airy table of project submissions with
// approve/reject review actions. State is persisted to localStorage under a
// shared key so it survives refresh and stays in sync with Score Management.

import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'

const STORAGE_KEY = 'shared_hackathon_data'

const SEED_DATA = [
  { id: 1, team: 'Neural Ninjas', hackathon: 'AI Innovation Sprint', projectTitle: 'CostGuard — AI Cloud Spend Optimizer', repositoryUrl: 'https://github.com/cognizant-hackathon-demo/repo', status: 'Pending', score: null },
  { id: 2, team: 'Pixel Pioneers', hackathon: 'FinTech Build Weekend', projectTitle: 'PayFlow — Instant Settlement Dashboard', repositoryUrl: 'https://github.com/cognizant-hackathon-demo/repo', status: 'Pending', score: null },
  { id: 3, team: 'Cloud Crusaders', hackathon: 'Cloud Native Challenge', projectTitle: 'K8s Migrator — Legacy to Microservices', repositoryUrl: 'https://github.com/cognizant-hackathon-demo/repo', status: 'Approved', score: null },
  { id: 4, team: 'Data Dynamos', hackathon: 'AI Innovation Sprint', projectTitle: 'InsightLens — Realtime Anomaly Detection', repositoryUrl: 'https://github.com/cognizant-hackathon-demo/repo', status: 'Rejected', score: null },
  { id: 5, team: 'Quantum Quokkas', hackathon: 'FinTech Build Weekend', projectTitle: 'LedgerLink — Cross-Bank Reconciliation', repositoryUrl: 'https://github.com/cognizant-hackathon-demo/repo', status: 'Pending', score: null },
]

// Read shared data from localStorage, falling back to the seed if absent/corrupt.
function loadSharedData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Corrupt/unreadable storage — fall through to the seed.
  }
  return SEED_DATA
}

// Yellow/Amber for Pending, green for Approved, red for Rejected.
function SubmissionStatusBadge({ status }) {
  const normalized = status?.toUpperCase() || ''

  let tone = 'border-gray-300 bg-gray-50 text-gray-500'
  if (normalized === 'PENDING') {
    tone = 'border-amber-400 bg-amber-50 text-amber-700'
  } else if (normalized === 'APPROVED') {
    tone = 'border-green-500 bg-green-50 text-green-700'
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

function ExternalLinkIcon({ className }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function SubmissionTracking() {
  const [submissions, setSubmissions] = useState(loadSharedData)
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const { showToast } = useToast()

  // Persist + share state whenever it changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
  }, [submissions])

  const updateStatus = (id, status) => {
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === id ? { ...submission, status } : submission,
      ),
    )
  }

  const handleApprove = (id) => {
    updateStatus(id, 'Approved')
    showToast('Submission approved successfully!', 'success')
  }

  const handleReject = (id) => {
    updateStatus(id, 'Rejected')
    showToast('Submission rejected.', 'error')
  }

  // When the toggle is on, show only pending (un-reviewed) submissions.
  // Compared case-insensitively so it's resilient to status casing.
  const displayedSubmissions = showPendingOnly
    ? submissions.filter(
        (submission) => submission.status?.toUpperCase() === 'PENDING',
      )
    : submissions

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950">
            Submission Tracking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review project submissions and approve or reject them.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPendingOnly((prev) => !prev)}
          aria-pressed={showPendingOnly}
          className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            showPendingOnly
              ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {showPendingOnly ? 'Showing Pending Only' : 'Hide Reviewed Submissions'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Hackathon</th>
                <th className="px-6 py-3">Project Title</th>
                <th className="px-6 py-3">Link</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No pending submissions to review. You&apos;re all caught up!
                  </td>
                </tr>
              ) : (
                displayedSubmissions.map((submission) => {
                  const isPending = submission.status === 'Pending'

                  return (
                    <tr
                      key={submission.id}
                      className="border-b border-gray-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {submission.team}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.hackathon}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.projectTitle}
                      </td>
                      <td className="px-6 py-4">
                        {submission.repositoryUrl ? (
                          <a
                            href={submission.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open repository"
                            className="inline-flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-700"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                            <span className="text-xs font-medium">Repo</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <SubmissionStatusBadge status={submission.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(submission.id)}
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(submission.id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SubmissionTracking
