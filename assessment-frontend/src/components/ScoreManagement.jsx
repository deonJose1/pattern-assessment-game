// Score management — a manual-first "Grading Center". Clicking "Grade Submission"
// opens the modal immediately with the hackathon's configured rubric rendered as
// empty inputs, so an admin can grade by hand right away. AI is fully optional and
// non-blocking: the in-modal "Get AI Suggestions" button calls SubmissionAiService
// and pre-fills the inputs, but a failure only toasts and leaves the modal open.
// "Confirm & Assign Score" always saves whatever is currently in the inputs.

import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import { useToast } from '../context/ToastContext'
import Button from './ui/Button'

// Default rubric used when a hackathon has no configured criteria.
const DEFAULT_CRITERIA = [
  { name: 'Innovation', max: 25 },
  { name: 'Technical Complexity', max: 25 },
  { name: 'UI/UX', max: 25 },
  { name: 'Business Value', max: 25 },
]

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
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  // ----- Grading modal state -----
  const [activeSubmission, setActiveSubmission] = useState(null)
  const [activeCriteria, setActiveCriteria] = useState([])
  const [criteriaLoading, setCriteriaLoading] = useState(false)
  const [scores, setScores] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiRan, setAiRan] = useState(false)
  const [activeAiFeedback, setActiveAiFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load all submissions once on mount.
  useEffect(() => {
    let active = true
    axiosClient
      .get('/admin/submissions')
      .then((res) => {
        if (active) setSubmissions(res.data)
      })
      .catch(() => {
        if (active) setError('Failed to load submissions. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Only APPROVED submissions are eligible for scoring (case-insensitive).
  const displayedSubmissions = submissions.filter(
    (submission) => submission.status?.toUpperCase() === 'APPROVED',
  )

  // Open the Grading Center for a submission. Renders the rubric as empty inputs
  // immediately (manual-first); no AI is triggered here. Fetches the hackathon's
  // configured criteria, falling back to the defaults if none are set.
  const openGrading = async (submission) => {
    setActiveSubmission(submission)
    setAiRan(false)
    setActiveAiFeedback('')
    setActiveCriteria([])
    setScores([])
    setCriteriaLoading(true)

    let criteria = DEFAULT_CRITERIA
    try {
      if (submission.hackathonId != null) {
        const { data } = await axiosClient.get(
          `/admin/hackathons/${submission.hackathonId}/criteria`,
        )
        if (Array.isArray(data) && data.length > 0) {
          criteria = data.map((c) => ({ name: c.name, max: c.max }))
        }
      }
    } catch {
      // Keep the default criteria if the fetch fails.
    } finally {
      setActiveCriteria(criteria)
      setScores(criteria.map(() => '')) // empty inputs — grade manually from scratch
      setCriteriaLoading(false)
    }
  }

  // Optional, non-blocking AI assist. Calls SubmissionAiService and maps the
  // overall 0–10 score proportionally onto each criterion's max as a starting
  // point the admin can edit. On failure we toast but keep the modal open.
  const handleGetAiSuggestions = async () => {
    if (!activeSubmission) return
    setAiLoading(true)
    try {
      const { data: ai } = await axiosClient.post(
        `/admin/submissions/${activeSubmission.id}/ai-evaluate`,
      )
      if (ai.aiScore != null) {
        setScores(
          activeCriteria.map((criterion) =>
            Math.round(criterion.max * (ai.aiScore / 10)),
          ),
        )
      }
      setActiveAiFeedback(ai.aiFeedback ?? '')
      setAiRan(true)
      // Reflect the audit on the table row's AI Insight column too.
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === activeSubmission.id
            ? { ...item, aiScore: ai.aiScore, aiFeedback: ai.aiFeedback }
            : item,
        ),
      )
      showToast('AI suggestions applied — review and adjust before assigning.', 'success')
    } catch {
      showToast('AI suggestion failed. You can still grade manually.', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const closeModal = () => {
    setActiveSubmission(null)
  }

  const handleScoreChange = (index, value) => {
    setScores((prev) => {
      const next = [...prev]
      if (value === '') {
        next[index] = '' // allow a blank field while typing
      } else {
        const max = activeCriteria[index]?.max ?? 0
        next[index] = Math.max(0, Math.min(max, Number(value) || 0))
      }
      return next
    })
  }

  const totalMax = activeCriteria.reduce((sum, c) => sum + c.max, 0)
  const totalScore = scores.reduce((sum, value) => sum + (Number(value) || 0), 0)

  // Persist whatever is currently in the inputs — AI run or not.
  const handleConfirm = async () => {
    if (!activeSubmission) return

    setSubmitting(true)
    try {
      const { data } = await axiosClient.post('/admin/scores', {
        submissionId: activeSubmission.id,
        score: totalScore,
      })
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === activeSubmission.id
            ? { ...submission, score: data.score }
            : submission,
        ),
      )
      showToast('Score saved successfully!', 'success')
      closeModal()
    } catch {
      showToast('Failed to save score. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Close the modal on Escape (unless a save is in flight).
  useEffect(() => {
    if (!activeSubmission) return
    function handleKey(event) {
      if (event.key === 'Escape' && !submitting) closeModal()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [activeSubmission, submitting])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-950">Score Management</h2>
        <p className="mt-1 text-sm text-slate-500">
          Grade an approved submission against its rubric. AI assistance is
          optional — you can score every criterion by hand.
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
                <th className="px-6 py-3">AI Insight</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading submissions…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-medium text-red-600">
                    {error}
                  </td>
                </tr>
              ) : displayedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No approved submissions available for scoring. Check the
                    Submissions tab.
                  </td>
                </tr>
              ) : (
                displayedSubmissions.map((submission) => {
                  const isScored = submission.score !== null && submission.score !== undefined
                  const hasAiAudit =
                    submission.aiScore !== null && submission.aiScore !== undefined

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
                            <span className="text-sm font-normal text-slate-400"> / 100</span>
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasAiAudit ? (
                          <div className="max-w-xs">
                            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 ring-1 ring-purple-200">
                              AI {submission.aiScore} / 10
                            </span>
                            {submission.aiFeedback && (
                              <p
                                className="mt-1 text-xs leading-snug text-slate-500"
                                title={submission.aiFeedback}
                              >
                                {submission.aiFeedback}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {/* Primary action — opens the Grading Center (no AI call). */}
                        <div className="flex items-center justify-end">
                          {isScored ? (
                            <span className="inline-flex h-8 cursor-default items-center rounded-lg border border-green-500 bg-green-50 px-3 text-xs font-bold uppercase tracking-wide text-green-700">
                              Scored
                            </span>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openGrading(submission)}
                              className="min-w-[10.5rem]"
                            >
                              Grade Submission
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Grading Center modal (manual-first, optional AI) ---------- */}
      {activeSubmission && (
        <div
          onClick={!submitting ? closeModal : undefined}
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
                <h3 className="text-lg font-bold text-slate-900">Grading Center</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {activeSubmission.team} · {activeSubmission.projectTitle}
                </p>
              </div>
            </div>

            {/* Optional, non-blocking AI assist */}
            <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-purple-100 bg-purple-50/70 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-800">
                  AI Assist <span className="font-normal text-purple-500">· optional</span>
                </p>
                {aiRan && activeAiFeedback ? (
                  <p className="mt-0.5 text-xs leading-snug text-purple-900/80">
                    {activeAiFeedback}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-purple-700/80">
                    Generate suggested scores you can edit — or grade entirely by hand.
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                isLoading={aiLoading}
                onClick={handleGetAiSuggestions}
                className="shrink-0"
              >
                {aiLoading ? (
                  'Thinking…'
                ) : aiRan ? (
                  'Regenerate'
                ) : (
                  <>
                    <span aria-hidden="true">✨</span>
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </div>

            {/* Interactive, data-driven rubric — empty inputs by default */}
            {criteriaLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">Loading criteria…</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {activeCriteria.map((criterion, index) => (
                  <div key={criterion.name}>
                    <label
                      htmlFor={`rubric-${index}`}
                      className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700"
                    >
                      <span>{criterion.name}</span>
                      <span className="text-xs text-slate-400">/ {criterion.max}</span>
                    </label>
                    <input
                      id={`rubric-${index}`}
                      type="number"
                      min="0"
                      max={criterion.max}
                      value={scores[index] ?? ''}
                      onChange={(event) => handleScoreChange(index, event.target.value)}
                      placeholder="0"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Auto-summed total */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
              <span className="text-sm font-medium text-slate-600">Total Score</span>
              <span className="text-4xl font-extrabold text-slate-900 tabular-nums">
                {totalScore}
                <span className="text-lg font-normal text-slate-400"> / {totalMax}</span>
              </span>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                isLoading={submitting}
                disabled={criteriaLoading}
              >
                {submitting ? 'Saving…' : 'Confirm & Assign Score'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoreManagement
