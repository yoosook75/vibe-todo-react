import { useEffect, useState } from 'react'
import Icon from './Icon'

const EMPTY_FORM = {
  title: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  priority: 'medium',
  category: 'personal',
  memo: '',
}

export default function TodoModal({ open, editingTodo, defaultDate, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editingTodo) {
      setForm({
        title: editingTodo.title || '',
        startDate: editingTodo.startDate || defaultDate,
        endDate: editingTodo.endDate || '',
        startTime: editingTodo.startTime || '',
        endTime: editingTodo.endTime || '',
        priority: editingTodo.priority || 'medium',
        category: editingTodo.category || 'personal',
        memo: editingTodo.memo || '',
      })
    } else {
      setForm({ ...EMPTY_FORM, startDate: defaultDate })
    }
  }, [open, editingTodo, defaultDate])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = {
      ...form,
      title: form.title.trim(),
      endDate: form.endDate || form.startDate,
      memo: form.memo.trim(),
    }
    if (!data.title) return
    if (data.startDate && data.endDate < data.startDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.')
      return
    }
    setSaving(true)
    try {
      await onSave(data)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">{editingTodo ? '할 일 수정' : '새로운 할 일'}</h2>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
            onClick={onClose}
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-title">
                제목
              </label>
              <input
                id="input-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="무엇을 해야 하나요?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-start-date">
                  시작일
                </label>
                <input
                  id="input-start-date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-end-date">
                  종료일
                </label>
                <input
                  id="input-end-date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-start-time">
                  시작 시간
                </label>
                <input
                  id="input-start-time"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-end-time">
                  종료 시간
                </label>
                <input
                  id="input-end-time"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-priority">
                  우선순위
                </label>
                <select
                  id="input-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm bg-white"
                >
                  <option value="low">낮음 (Low)</option>
                  <option value="medium">보통 (Medium)</option>
                  <option value="high">높음 (High)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-category">
                  프로젝트
                </label>
                <select
                  id="input-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm bg-white"
                >
                  <option value="personal">개인</option>
                  <option value="work">업무</option>
                  <option value="study">공부</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="input-memo">
                상세 내용
              </label>
              <textarea
                id="input-memo"
                name="memo"
                value={form.memo}
                onChange={handleChange}
                placeholder="추가적인 메모나 상세 내용을 입력하세요..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 text-sm resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              className="px-5 py-2 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <Icon name="check" className="text-[16px]" />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
