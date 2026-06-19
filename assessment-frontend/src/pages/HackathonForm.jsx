// Hackathon form — handles both create (/hackathons/new) and edit
// (/hackathons/edit/:id). In edit mode it loads the existing record first.

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createHackathon,
  updateHackathon,
  getHackathonById,
} from '../services/hackathonService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function HackathonForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  // In edit mode, fetch the existing hackathon and populate the form.
  useEffect(() => {
    if (!isEditing) return
    let active = true
    async function loadHackathon() {
      try {
        const data = await getHackathonById(id)
        if (!active) return
        if (data) {
          setForm({
            title: data.title ?? '',
            description: data.description ?? '',
            startDate: data.startDate ?? '',
            endDate: data.endDate ?? '',
          })
        } else {
          // Unknown id — fall back to the list.
          navigate('/hackathons')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadHackathon()
    return () => {
      active = false
    }
  }, [id, isEditing, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (isEditing) {
        await updateHackathon(id, form)
      } else {
        await createHackathon(form)
      }
      navigate('/hackathons')
    } catch {
      // Surface failure and let the user retry rather than stranding them.
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {isEditing ? 'Edit Hackathon' : 'Create New Hackathon'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? 'Update the details of this hackathon event.'
            : 'Fill in the details below to set up a new hackathon event.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <Input
          className="mb-5"
          label="Hackathon Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. AI Innovation Sprint"
        />

        <Input
          className="mb-5"
          label="Description"
          type="textarea"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the goals, theme, and rules of the hackathon."
        />

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/hackathons')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            {isEditing ? 'Update Hackathon' : 'Save Hackathon'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default HackathonForm
