// Hackathon service — thin wrapper over the live backend API. The axiosClient
// attaches the JWT bearer token and handles 401s globally. Exported signatures
// are unchanged from the previous mock so callers stay the same.
//
// Hackathon shape: { id, title, description, startDate, endDate, status }

import axiosClient from '../api/axiosClient'

/** GET /admin/events -> Array<Hackathon> */
export async function getHackathons() {
  const { data } = await axiosClient.get('/admin/events')
  return data
}

/** GET /admin/events/{id} -> Hackathon */
export async function getHackathonById(id) {
  const { data } = await axiosClient.get(`/admin/events/${id}`)
  return data
}

/** POST /admin/events -> created Hackathon */
export async function createHackathon(payload) {
  const { data } = await axiosClient.post('/admin/events', payload)
  return data
}

/** PUT /admin/events/{id} -> updated Hackathon */
export async function updateHackathon(id, payload) {
  const { data } = await axiosClient.put(`/admin/events/${id}`, payload)
  return data
}

/** DELETE /admin/events/{id} */
export async function deleteHackathon(id) {
  await axiosClient.delete(`/admin/events/${id}`)
}
