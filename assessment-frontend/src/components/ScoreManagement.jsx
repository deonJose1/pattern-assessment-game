// Score management — "Human-in-the-Loop" AI grading simulation. Approved
// submissions are evaluated via a modal: a 2s mock "analysis", then an editable
// rubric (criteria are data-driven per hackathon) auto-filled with AI
// suggestions and auto-summed to a total score. Confirming writes the total back
// to the shared localStorage store, using the same lazy-init + persist pattern.

import { useEffect, useRef, useState } from 'react'
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

// Default rubric used when a hackathon has no specific criteria mapping.
const DEFAULT_CRITERIA = [
  { name: 'Innovation', max: 25 },
  { name: 'Technical Complexity', max: 25 },
  { name: 'UI/UX', max: 25 },
  { name: 'Business Value', max: 25 },
]

// Per-hackathon evaluation criteria (each set sums to 100).
const HACKATHON_CRITERIA = {
  'AI Innovation Sprint': [
    { name: 'Model Accuracy', max: 30 },
    { name: 'Innovation', max: 30 },
    { name: 'Code Quality', max: 40 },
  ],
  'Cloud Native Challenge': [
    { name: 'Scalability', max: 40 },
    { name: 'Security', max: 30 },
    { name: 'Implementation', max: 30 },
  ],
  // Hackathons without an entry (e.g. "FinTech Build Weekend") use DEFAULT_CRITERIA.
}

const getCriteriaFor = (hackathon) =>
  HACKATHON_CRITERIA[hackathon] ?? DEFAULT_CRITERIA

const ANALYSIS_MS = 2000

// Mock "AI suggested" value scaled to the criterion's max (~60–92%).
const randomSuggestion = (max) =>
  Math.min(max, Math.round(max * (0.6 + Math.random() * 0.32)))

function ExternalLinkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ScoreManagement() {
  const [submissions, setSubmissions] = useState(loadSharedData)
  const { showToast } = useToast()

  const [activeSubmission, setActiveSubmission] = useState(null)
  const [phase, setPhase] = useState('loading') // 'loading' | 'scoring'
  // Criteria for the active submission's hackathon, and parallel score values.
  const [activeCriteria, setActiveCriteria] = useState([])
  const [scores, setScores] = useState([])
  const timerRef = useRef(null)

  // Persist + share state whenever it changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
  }, [submissions])

  // Clean up a pending analysis timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Only APPROVED submissions are eligible for scoring (case-insensitive).
  const displayedSubmissions = submissions.filter(
    (submission) => submission.status?.toUpperCase() === 'APPROVED',
  )

  const openEvaluation = (submission) => {
    const criteria = getCriteriaFor(submission.hackathon)
    setActiveSubmission(submission)
    setActiveCriteria(criteria)
    setScores([])
    setPhase('loading')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      // Reveal the rubric pre-filled with AI suggestions per criterion.
      setScores(criteria.map((criterion) => randomSuggestion(criterion.max)))
      setPhase('scoring')
    }, ANALYSIS_MS)
  }

  const closeModal = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveSubmission(null)
  }

  const handleScoreChange = (index, value) => {
    const max = activeCriteria[index]?.max ?? 0
    const clamped = Math.max(0, Math.min(max, Number(value) || 0))
    setScores((prev) => {
      const next = [...prev]
      next[index] = clamped
      return next
    })
  }

  const totalMax = activeCriteria.reduce((sum, c) => sum + c.max, 0)
  const totalScore = scores.reduce((sum, value) => sum + (value || 0), 0)

  const handleConfirm = () => {
    if (!activeSubmission) return
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === activeSubmission.id
          ? { ...submission, score: totalScore }
          : submission,
      ),
    )
    showToast('Score saved successfully!', 'success')
    closeModal()
  }

  // Close the modal on Escape (unless mid-analysis).
  useEffect(() => {
    if (!activeSubmission) return
    function handleKey(event) {
      if (event.key === 'Escape' && phase === 'scoring') closeModal()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubmission, phase])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">Score Management</h2>
        <p className="mt-1 text-sm text-slate-500">
          Run AI-assisted evaluations on approved submissions and assign final
          scores.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Repo</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No approved submissions available for scoring. Check the
                    Submissions tab.
                  </td>
                </tr>
              ) : (
                displayedSubmissions.map((submission) => {
                  const isScored = submission.score !== null

                  return (
                    <tr
                      key={submission.id}
                      className="border-b border-gray-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {submission.team}
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
                        {isScored ? (
                          <span className="text-base font-bold text-slate-900 tabular-nums">
                            {submission.score}
                            <span className="text-sm font-normal text-slate-400">
                              {' '}
                              / 100
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isScored ? (
                          <span className="inline-flex cursor-default rounded-full border border-green-500 bg-green-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700">
                            Scored
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEvaluation(submission)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            <span aria-hidden="true">✨</span>
                            AI Evaluate
                          </button>
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

      {/* ---------- AI evaluation modal ---------- */}
      {activeSubmission && (
        <div
          onClick={phase === 'scoring' ? closeModal : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span aria-hidden="true">✨</span>
                  AI-Assisted Evaluation
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeSubmission.team} · {activeSubmission.projectTitle}
                </p>
              </div>
            </div>

            {phase === 'loading' ? (
              /* Phase 1 — analyzing */
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="animate-pulse text-center text-sm font-medium text-slate-600">
                  Analyzing repository architecture and code quality…
                </p>
              </div>
            ) : (
              /* Phase 2 — interactive, data-driven rubric */
              <div>
                <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                  ✨ AI-suggested scores below — review and adjust before
                  assigning.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {activeCriteria.map((criterion, index) => (
                    <div key={criterion.name}>
                      <label
                        htmlFor={`rubric-${index}`}
                        className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700"
                      >
                        <span>{criterion.name}</span>
                        <span className="text-xs text-slate-400">
                          / {criterion.max}
                        </span>
                      </label>
                      <input
                        id={`rubric-${index}`}
                        type="number"
                        min="0"
                        max={criterion.max}
                        value={scores[index] ?? 0}
                        onChange={(event) =>
                          handleScoreChange(index, event.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  ))}
                </div>

                {/* Auto-summed total */}
                <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
                  <span className="text-sm font-medium text-slate-600">
                    Total Score
                  </span>
                  <span className="text-4xl font-extrabold text-slate-900 tabular-nums">
                    {totalScore}
                    <span className="text-lg font-normal text-slate-400">
                      {' '}
                      / {totalMax}
                    </span>
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Confirm &amp; Assign Score
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoreManagement
