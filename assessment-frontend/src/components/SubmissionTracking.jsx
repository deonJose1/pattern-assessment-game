// Submission tracking — premium, airy table of project submissions with
// approve/reject review actions. Status is held in React state so reviewing a
// submission re-renders its badge instantly. Mock data (backend pending).

import { useState } from 'react'

const INITIAL_SUBMISSIONS = [
  {
    id: 1,
    teamName: 'Neural Ninjas',
    hackathonName: 'AI Innovation Sprint',
    projectTitle: 'CostGuard — AI Cloud Spend Optimizer',
    repositoryUrl: 'https://github.com/example/costguard',
    status: 'Pending',
  },
  {
    id: 2,
    teamName: 'Pixel Pioneers',
    hackathonName: 'FinTech Build Weekend',
    projectTitle: 'PayFlow — Instant Settlement Dashboard',
    repositoryUrl: 'https://github.com/example/payflow',
    status: 'Pending',
  },
  {
    id: 3,
    teamName: 'Cloud Crusaders',
    hackathonName: 'Cloud Native Challenge',
    projectTitle: 'K8s Migrator — Legacy to Microservices',
    repositoryUrl: 'https://github.com/example/k8s-migrator',
    status: 'Approved',
  },
  {
    id: 4,
    teamName: 'Data Dynamos',
    hackathonName: 'AI Innovation Sprint',
    projectTitle: 'InsightLens — Realtime Anomaly Detection',
    repositoryUrl: 'https://github.com/example/insightlens',
    status: 'Rejected',
  },
  {
    id: 5,
    teamName: 'Quantum Quokkas',
    hackathonName: 'FinTech Build Weekend',
    projectTitle: 'LedgerLink — Cross-Bank Reconciliation',
    repositoryUrl: 'https://github.com/example/ledgerlink',
    status: 'Pending',
  },
]

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
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)

  const updateStatus = (id, status) => {
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === id ? { ...submission, status } : submission,
      ),
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">
          Submission Tracking
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Review project submissions and approve or reject them.
        </p>
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
              {submissions.map((submission) => {
                const isPending = submission.status === 'Pending'

                return (
                  <tr
                    key={submission.id}
                    className="border-b border-gray-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {submission.teamName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {submission.hackathonName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {submission.projectTitle}
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <SubmissionStatusBadge status={submission.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(submission.id, 'Approved')
                            }
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(submission.id, 'Rejected')
                            }
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SubmissionTracking
