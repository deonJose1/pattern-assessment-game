// Score management — premium, airy table for assigning scores to approved
// submissions. Each unscored row has a number input; submitting locks the score
// and flips the status to 'Scored'. Mock data (backend pending).

import { useState } from 'react'
import { useToast } from '../context/ToastContext'

const INITIAL_SUBMISSIONS = [
  {
    id: 1,
    teamName: 'Neural Ninjas',
    hackathonName: 'AI Innovation Sprint',
    projectTitle: 'CostGuard — AI Cloud Spend Optimizer',
    score: null,
    status: 'Pending Score',
  },
  {
    id: 2,
    teamName: 'Cloud Crusaders',
    hackathonName: 'Cloud Native Challenge',
    projectTitle: 'K8s Migrator — Legacy to Microservices',
    score: null,
    status: 'Pending Score',
  },
  {
    id: 3,
    teamName: 'Pixel Pioneers',
    hackathonName: 'FinTech Build Weekend',
    projectTitle: 'PayFlow — Instant Settlement Dashboard',
    score: null,
    status: 'Pending Score',
  },
  {
    id: 4,
    teamName: 'Quantum Quokkas',
    hackathonName: 'FinTech Build Weekend',
    projectTitle: 'LedgerLink — Cross-Bank Reconciliation',
    score: null,
    status: 'Pending Score',
  },
]

function ScoreManagement() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)
  // Draft input values keyed by submission id (before submit).
  const [scoreInputs, setScoreInputs] = useState({})
  const { showToast } = useToast()

  const handleInputChange = (id, value) => {
    setScoreInputs((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmitScore = (id) => {
    const raw = scoreInputs[id]
    if (raw === undefined || raw === '') return

    // Clamp into the valid 0–100 range.
    const parsed = Math.max(0, Math.min(100, Number(raw)))
    if (Number.isNaN(parsed)) return

    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === id
          ? { ...submission, score: parsed, status: 'Scored' }
          : submission,
      ),
    )
    showToast('Score saved successfully!', 'success')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">Score Management</h2>
        <p className="mt-1 text-sm text-slate-500">
          Assign final scores to approved submissions.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Hackathon</th>
                <th className="px-6 py-3">Project Title</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const isScored = submission.score !== null
                const draft = scoreInputs[submission.id] ?? ''
                const canSubmit = draft !== '' && !Number.isNaN(Number(draft))

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

                    {/* Score: input while pending, bold number once scored */}
                    <td className="px-6 py-4">
                      {isScored ? (
                        <span className="text-base font-bold text-slate-900 tabular-nums">
                          {submission.score}
                          <span className="text-sm font-normal text-slate-400">
                            {' '}
                            / 100
                          </span>
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={draft}
                          onChange={(event) =>
                            handleInputChange(submission.id, event.target.value)
                          }
                          placeholder="0–100"
                          className="w-24 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      )}
                    </td>

                    {/* Actions: submit while pending, green Scored badge once done */}
                    <td className="px-6 py-4 text-right">
                      {isScored ? (
                        <span className="inline-flex rounded-full border border-green-500 bg-green-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700">
                          Scored
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubmitScore(submission.id)}
                          disabled={!canSubmit}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Submit Score
                        </button>
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

export default ScoreManagement
