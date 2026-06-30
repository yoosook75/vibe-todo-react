function sanitizeEnvUrl(value) {
  if (!value || typeof value !== 'string') return ''
  let base = value.trim().replace(/\/$/, '')

  // 복붙 실수: http://host/todoshttp://host/todos
  const dupIdx = base.indexOf('http', 4)
  if (dupIdx > 0) base = base.slice(0, dupIdx).replace(/\/$/, '')

  return base
}

function resolveApiBase() {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location

    // Vercel 배포 — 항상 same-origin 프록시 (잘못된 build env 무시)
    if (hostname.endsWith('.vercel.app')) {
      return '/api/todos'
    }

    // https 페이지에서 http API 직접 호출 방지 (Mixed Content)
    if (protocol === 'https:') {
      const fromEnv = sanitizeEnvUrl(import.meta.env.VITE_API_BASE)
      if (fromEnv.startsWith('http://')) return '/api/todos'
    }
  }

  const fromEnv = sanitizeEnvUrl(import.meta.env.VITE_API_BASE)
  if (fromEnv) return fromEnv

  return import.meta.env.PROD ? '/api/todos' : 'http://localhost:5000/todos'
}

const API_BASE = resolveApiBase()

async function parseResponse(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message) ||
      `요청 실패 (${res.status})`
    throw new Error(message)
  }

  return data
}

export async function checkApiConnection() {
  try {
    const res = await fetch(API_BASE)
    return res.ok
  } catch {
    return false
  }
}

export function fetchTodos() {
  return fetch(API_BASE).then(parseResponse)
}

export function createTodo(payload) {
  return fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }).then(parseResponse)
}

export function updateTodo(id, payload) {
  return fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }).then(parseResponse)
}

export function deleteTodo(id) {
  return fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).then(parseResponse)
}

export { API_BASE }
