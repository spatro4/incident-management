// Lightweight client-side multi-user auth for Math Quest.
// There is no backend — accounts and progress all live in this browser's
// localStorage. Passwords are hashed (SHA-256 via Web Crypto) before
// storage so they aren't kept in plain text, but this is NOT a substitute
// for real server-side authentication.

const USERS_KEY = 'mathquest_users_v1'
const SESSION_KEY = 'mathquest_session_v1'

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase()
}

export function listUsers() {
  const users = loadUsers()
  return Object.entries(users)
    .map(([username, u]) => ({ username, displayName: u.displayName, createdAt: u.createdAt }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function getDisplayName(username) {
  const users = loadUsers()
  return users[username]?.displayName || username
}

export function getSessionUsername() {
  return localStorage.getItem(SESSION_KEY) || null
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export async function signUp(username, displayName, password) {
  const normalized = normalizeUsername(username)
  if (normalized.length < 3) throw new Error('Username must be at least 3 characters.')
  if (!/^[a-z0-9_]+$/.test(normalized)) throw new Error('Username can only contain letters, numbers, and underscores.')
  if (!password || password.length < 4) throw new Error('Password must be at least 4 characters.')

  const users = loadUsers()
  if (users[normalized]) throw new Error('That username is already taken.')

  const passwordHash = await hashPassword(password)
  users[normalized] = {
    displayName: displayName.trim() || normalized,
    passwordHash,
    createdAt: new Date().toISOString(),
  }
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, normalized)
  return normalized
}

export async function logIn(username, password) {
  const normalized = normalizeUsername(username)
  const users = loadUsers()
  const user = users[normalized]
  if (!user) throw new Error('No account found with that username.')

  const passwordHash = await hashPassword(password)
  if (passwordHash !== user.passwordHash) throw new Error('Incorrect password.')

  localStorage.setItem(SESSION_KEY, normalized)
  return normalized
}
