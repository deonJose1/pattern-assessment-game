// Admin login — standalone, mock-authenticated screen. Enforces a corporate
// @cognizant.com email, then persists the auth flag + email to localStorage
// (stand-in for a real session/JWT) and routes into the app.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from './ui/Input'
import Button from './ui/Button'

const CORPORATE_DOMAIN = '@cognizant.com'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmed = email.trim()
    if (!trimmed.toLowerCase().endsWith(CORPORATE_DOMAIN)) {
      setError('Please use a valid @cognizant.com email address')
      return
    }

    // Mock auth — accept any password for now (backend pending).
    localStorage.setItem('isAdminAuth', 'true')
    localStorage.setItem('adminEmail', trimmed)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <img
          src="/cogni.png"
          alt="Cognizant"
          className="mx-auto mb-6 h-8 w-auto"
        />

        <h1 className="text-center text-2xl font-bold text-indigo-950">
          Admin Portal Access
        </h1>
        <p className="mb-8 mt-1 text-center text-sm text-slate-500">
          Sign in to manage hackathons.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Email or Username"
              name="email"
              type="text"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError('')
              }}
              placeholder="admin@cognizant.com"
              required
            />
            {error && (
              <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
            )}
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" variant="primary" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
