const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://twnas.kr:15000/todos'

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
