// Router setup for the Hackathon Management Portal — Admin Module.
// All admin pages render inside AdminLayout via <Outlet/>.

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import HackathonList from './pages/HackathonList'
import HackathonForm from './pages/HackathonForm'
import TeamsList from './pages/TeamsList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/hackathons" element={<HackathonList />} />
          <Route path="/hackathons/new" element={<HackathonForm />} />
          <Route path="/hackathons/edit/:id" element={<HackathonForm />} />
          <Route path="/teams" element={<TeamsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
