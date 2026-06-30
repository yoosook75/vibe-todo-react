import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  checkApiConnection,
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  API_BASE,
} from '../api/todos'
import { getMockTodos } from '../data/mockTodos'
import {
  buildApiPayload,
  computeStats,
  getFilteredTodos,
  normalizeTodo,
  shiftAnchorDays,
  shiftAnchorMonths,
  todayKey,
} from '../lib/todoUtils'

function loadInitialTodos() {
  return getMockTodos()
    .map(normalizeTodo)
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

function isMockTodo(todo) {
  return String(todo?.id || '').startsWith('mock-')
}

export default function useDashboard() {
  const [todos, setTodos] = useState([])
  const [apiReady, setApiReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list')
  const [calMode, setCalMode] = useState('week')
  const [calAnchorKey, setCalAnchorKey] = useState(todayKey())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadTodos = useCallback(async () => {
    try {
      const data = await fetchTodos()
      const normalized = (Array.isArray(data) ? data : [])
        .map(normalizeTodo)
        .filter(Boolean)
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      setTodos(normalized)
      setApiReady(true)
    } catch (err) {
      console.error('[Dashboard] 할일 목록 로드 실패:', err)
      setApiReady(false)
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const ok = await checkApiConnection()
      if (cancelled) return

      if (ok) {
        await loadTodos()
        return
      }

      setApiReady(false)
      setTodos(loadInitialTodos())
      setLoading(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [loadTodos])

  const stats = useMemo(() => computeStats(todos), [todos])

  const filtered = useMemo(
    () => getFilteredTodos(todos, { filter, category, search }),
    [todos, filter, category, search]
  )

  const calendarTodos = useMemo(
    () => getFilteredTodos(todos, { filter: 'all', category, search }).filter((t) => t.startDate),
    [todos, category, search]
  )

  const editingTodo = editingId ? todos.find((t) => t.id === editingId) : null

  function ensureApiReady() {
    if (apiReady) return true
    alert(`백엔드 서버에 연결되지 않았습니다.\n${API_BASE}\n서버 상태를 확인해주세요.`)
    return false
  }

  async function handleToggle(todo) {
    if (isMockTodo(todo)) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
      )
      return
    }
    if (!ensureApiReady()) return
    try {
      await updateTodo(todo.id, buildApiPayload(todo, { completed: !todo.completed }))
      await loadTodos()
    } catch (err) {
      alert(err.message || '저장에 실패했습니다.')
    }
  }

  async function handleDelete(todo) {
    if (!confirm(`"${todo.title}"\n삭제할까요?`)) return
    if (isMockTodo(todo)) {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id))
      if (editingId === todo.id) closeModal()
      return
    }
    if (!ensureApiReady()) return
    try {
      await deleteTodo(todo.id)
      if (editingId === todo.id) closeModal()
      await loadTodos()
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.')
    }
  }

  async function handleSave(data) {
    if (editingId && isMockTodo({ id: editingId })) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? normalizeTodo({
                ...t,
                ...buildApiPayload(data, { completed: t.completed }),
                id: editingId,
                createdAt: t.createdAt,
              })
            : t
        )
      )
      closeModal()
      return
    }
    if (!ensureApiReady()) return
    if (editingId) {
      const existing = todos.find((t) => t.id === editingId)
      if (!existing) {
        alert('수정할 할 일을 찾을 수 없습니다.')
        return
      }
      await updateTodo(editingId, buildApiPayload(data, { completed: existing.completed }))
    } else {
      await createTodo(buildApiPayload(data, { completed: false }))
    }
    await loadTodos()
  }

  function openModal(id = null) {
    setEditingId(id)
    setModalOpen(true)
  }

  function closeModal() {
    setEditingId(null)
    setModalOpen(false)
  }

  function setFilterValue(next) {
    setFilter(next)
    if (next !== 'all') setCategory(null)
  }

  function toggleCategory(next) {
    setCategory((prev) => (prev === next ? null : next))
  }

  function calPrev() {
    if (calMode === 'month') setCalAnchorKey((k) => shiftAnchorMonths(k, -1))
    else if (calMode === 'week') setCalAnchorKey((k) => shiftAnchorDays(k, -7))
    else setCalAnchorKey((k) => shiftAnchorDays(k, -1))
  }

  function calNext() {
    if (calMode === 'month') setCalAnchorKey((k) => shiftAnchorMonths(k, 1))
    else if (calMode === 'week') setCalAnchorKey((k) => shiftAnchorDays(k, 7))
    else setCalAnchorKey((k) => shiftAnchorDays(k, 1))
  }

  const listActive = filtered.filter((t) => !t.completed)
  const completedList = useMemo(() => {
    if (filter !== 'all') return []
    let completed = todos.filter((t) => t.completed)
    if (category) completed = completed.filter((t) => t.category === category)
    const q = search.trim().toLowerCase()
    if (q) {
      completed = completed.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.memo || '').toLowerCase().includes(q)
      )
    }
    return completed
  }, [todos, filter, category, search])

  return {
    todos,
    apiReady,
    loading,
    filter,
    category,
    search,
    setSearch,
    view,
    setView,
    calMode,
    setCalMode,
    calAnchorKey,
    modalOpen,
    editingTodo,
    sidebarOpen,
    setSidebarOpen,
    stats,
    filtered,
    listActive: filter === 'completed' ? filtered : listActive,
    completedList,
    calendarTodos,
    API_BASE,
    setFilter: setFilterValue,
    toggleCategory,
    openModal,
    closeModal,
    handleToggle,
    handleDelete,
    handleSave,
    calPrev,
    calNext,
  }
}
