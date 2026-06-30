// Router setup for the Hackathon Management Portal — Admin Module.
// The admin area is gated behind ProtectedRoute (mock localStorage auth);
// unauthenticated users are redirected to /login.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './components/AdminLogin'
import SubmissionForm from './components/SubmissionForm'
import AdminDashboard from './pages/AdminDashboard'
import HackathonList from './pages/HackathonList'
import HackathonForm from './pages/HackathonForm'
import ParticipantManagement from './components/ParticipantManagement'
import SubmissionTracking from './components/SubmissionTracking'
import ScoreManagement from './components/ScoreManagement'
import Leaderboard from './components/Leaderboard'
import TeamsList from './pages/TeamsList'

// Gate for the admin area. Renders children when authenticated, otherwise
// redirects to the login screen.
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAdminAuth') === 'true'
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
        {/* Public */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/submit" element={<SubmissionForm />} />

        {/* Protected admin area */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/hackathons" element={<HackathonList />} />
          <Route path="/hackathons/new" element={<HackathonForm />} />
          <Route path="/hackathons/edit/:id" element={<HackathonForm />} />
          <Route path="/participants" element={<ParticipantManagement />} />
          <Route path="/submissions" element={<SubmissionTracking />} />
          <Route path="/scores" element={<ScoreManagement />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/teams" element={<TeamsList />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
