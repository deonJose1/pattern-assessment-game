// Mock hackathon service with localStorage persistence (demo stopgap).
//
// Data is seeded once, then mirrored to localStorage on every mutation so that
// created/edited/deleted hackathons survive a browser refresh during demos.
// Swap these bodies for real HTTP calls when the backend is available; the
// exported signatures stay the same.

const NETWORK_DELAY_MS = 300
const HACKATHON_STORAGE_KEY = 'skillspring.hackathons'

// Default data used the first time the app runs (or if storage is empty/corrupt).
const SEED_HACKATHONS = [
  {
    id: 1,
    title: 'AI Innovation Sprint',
    description:
      'Internal engineering hackathon focused on leveraging AI/ML models to optimize cloud infrastructure costs and automate operational tooling.',
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    status: 'Active',
  },
  {
    id: 2,
    title: 'FinTech Build Weekend',
    description:
      'A cross-functional sprint to prototype next-generation payment and fraud-detection features for the consumer banking platform.',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    status: 'Upcoming',
  },
  {
    id: 3,
    title: 'Cloud Native Challenge',
    description:
      'Teams re-architected legacy services into containerized, Kubernetes-native microservices to improve scalability and deployment velocity.',
    startDate: '2026-05-09',
    endDate: '2026-05-11',
    status: 'Completed',
  },
]

// Resolves after `ms` to mimic network round-trip latency.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Persist the current store to localStorage.
function persist() {
  localStorage.setItem(HACKATHON_STORAGE_KEY, JSON.stringify(hackathons))
}

// Initialize from localStorage if present; otherwise seed and save immediately.
function initStore() {
  try {
    const stored = localStorage.getItem(HACKATHON_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Corrupt/unreadable storage — fall through to re-seed.
  }
  localStorage.setItem(HACKATHON_STORAGE_KEY, JSON.stringify(SEED_HACKATHONS))
  return [...SEED_HACKATHONS]
}

let hackathons = initStore()

/**
 * Fetches all hackathons.
 * @returns {Promise<Array>} a copy of the list (guards against external mutation)
 */
export async function getHackathons() {
  await delay(NETWORK_DELAY_MS)
  return [...hackathons]
}

/**
 * Fetches a single hackathon by id. Ids are compared loosely so a string id
 * from a route param (`useParams`) matches the numeric stored id.
 * @returns {Promise<object | undefined>}
 */
export async function getHackathonById(id) {
  await delay(NETWORK_DELAY_MS)
  const match = hackathons.find((hackathon) => String(hackathon.id) === String(id))
  return match ? { ...match } : undefined
}

/**
 * Creates a hackathon, assigning it a random id, and appends it to the store.
 * @returns {Promise<{ success: boolean }>}
 */
export async function createHackathon(data) {
  await delay(NETWORK_DELAY_MS)
  const newHackathon = {
    ...data,
    id: Math.floor(Math.random() * 1_000_000),
  }
  hackathons.push(newHackathon)
  persist()
  return { success: true }
}

/**
 * Updates the fields of an existing hackathon, preserving its id.
 * @returns {Promise<{ success: boolean }>}
 */
export async function updateHackathon(id, updatedData) {
  await delay(NETWORK_DELAY_MS)
  hackathons = hackathons.map((hackathon) =>
    String(hackathon.id) === String(id)
      ? { ...hackathon, ...updatedData, id: hackathon.id }
      : hackathon,
  )
  persist()
  return { success: true }
}

/**
 * Removes the hackathon with the given id from the store.
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteHackathon(id) {
  await delay(NETWORK_DELAY_MS)
  hackathons = hackathons.filter((hackathon) => hackathon.id !== id)
  persist()
  return { success: true }
}
