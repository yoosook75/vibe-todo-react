export const VALID_PRIORITIES = ['high', 'medium', 'low']
export const VALID_CATEGORIES = ['study', 'work', 'personal', 'other']

export const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-indigo-100 text-indigo-600',
  low: 'bg-slate-100 text-slate-500',
}

export const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' }

export const CATEGORY_STYLES = {
  personal: 'bg-emerald-100 text-emerald-700',
  study: 'bg-amber-100 text-amber-700',
  work: 'bg-blue-100 text-blue-600',
  other: 'bg-slate-100 text-slate-500',
}

export const CATEGORY_LABELS = {
  study: 'Study',
  work: 'Work',
  personal: 'Personal',
  other: 'Other',
}

export const CATEGORY_LABELS_KO = {
  study: '공부',
  work: '업무',
  personal: '개인',
  other: '기타',
}

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
]

export const DAY_CARD_THEME = {
  high: { card: 'bg-red-50 border-red-200 border-l-red-400', cat: 'text-red-700', dot: 'bg-red-500' },
  medium: { card: 'bg-indigo-50 border-indigo-200 border-l-indigo-400', cat: 'text-indigo-700', dot: 'bg-indigo-500' },
  low: { card: 'bg-slate-50 border-slate-200 border-l-slate-400', cat: 'text-slate-600', dot: 'bg-slate-400' },
}

export const WEEK_CARD_THEME = {
  high: { card: 'bg-red-50 border-red-200', cat: 'text-red-700', dot: 'bg-red-500' },
  medium: { card: 'bg-indigo-50 border-indigo-200', cat: 'text-indigo-700', dot: 'bg-indigo-500' },
  low: { card: 'bg-slate-50 border-slate-200', cat: 'text-slate-600', dot: 'bg-slate-400' },
}

export function todayKey() {
  const d = new Date()
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

export function formatDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function parseDateKey(key) {
  if (!key) return null
  const d = new Date(`${key}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateCompact(key) {
  const d = parseDateKey(key)
  if (!d) return key || ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function formatDateMonthDay(key) {
  const d = parseDateKey(key)
  if (!d) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}.${day}`
}

export function getTodoEndDate(todo) {
  return todo.endDate || todo.startDate || ''
}

export function isMultiDayTodo(todo) {
  const endDate = getTodoEndDate(todo)
  return Boolean(todo?.startDate && endDate && todo.startDate !== endDate)
}

export function todoIncludesDate(todo, dateKey) {
  if (!todo?.startDate || !dateKey) return false
  const end = getTodoEndDate(todo)
  return dateKey >= todo.startDate && dateKey <= end
}

export function getTodosForDate(items, dateKey) {
  return items.filter((todo) => todoIncludesDate(todo, dateKey))
}

export function timestampToIso(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return new Date(value).toISOString()
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString()
    } catch {
      return new Date().toISOString()
    }
  }
  if (typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toISOString()
  }
  return new Date().toISOString()
}

export function normalizeTodo(raw) {
  if (!raw || typeof raw !== 'object') return null

  const title = String(raw.title ?? raw.text ?? '').trim()
  if (!title) return null

  const legacyDate = typeof raw.date === 'string' ? raw.date : ''
  const legacyTime = typeof raw.time === 'string' ? raw.time : ''

  let startDate = typeof raw.startDate === 'string' ? raw.startDate : legacyDate
  let endDate = typeof raw.endDate === 'string' ? raw.endDate : ''
  if (!endDate && startDate) endDate = startDate

  let startTime = typeof raw.startTime === 'string' ? raw.startTime : legacyTime
  let endTime = typeof raw.endTime === 'string' ? raw.endTime : ''

  const id =
    typeof raw.id === 'string' && raw.id
      ? raw.id
      : raw._id != null
        ? String(raw._id)
        : crypto.randomUUID()

  return {
    id,
    title,
    startDate,
    endDate,
    startTime,
    endTime,
    priority: VALID_PRIORITIES.includes(raw.priority) ? raw.priority : 'medium',
    category: VALID_CATEGORIES.includes(raw.category) ? raw.category : 'other',
    memo: String(raw.memo ?? ''),
    completed: Boolean(raw.completed ?? raw.done),
    createdAt: timestampToIso(raw.createdAt) || new Date().toISOString(),
  }
}

export function buildApiPayload(data, { completed = false } = {}) {
  return {
    title: data.title,
    completed: Boolean(completed),
    startDate: data.startDate || '',
    endDate: data.endDate || data.startDate || '',
    startTime: data.startTime || '',
    endTime: data.endTime || '',
    priority: data.priority || 'medium',
    category: data.category || 'other',
    memo: data.memo || '',
  }
}

export function getFilteredTodos(todos, { filter, category, search, dateKey }) {
  const q = (search || '').trim().toLowerCase()
  const today = todayKey()
  const viewDate = dateKey || today

  return todos.filter((todo) => {
    const matchSearch =
      !q ||
      todo.title.toLowerCase().includes(q) ||
      (todo.memo || '').toLowerCase().includes(q)
    if (!matchSearch) return false

    if (category && todo.category !== category) return false

    switch (filter) {
      case 'today':
        return todo.startDate <= viewDate && getTodoEndDate(todo) >= viewDate
      case 'upcoming':
        return todo.startDate > today
      case 'important':
        return todo.priority === 'high'
      case 'deadline': {
        if (todo.completed) return false
        const end = getTodoEndDate(todo)
        if (!end) return false
        const endD = parseDateKey(end)
        const todayD = parseDateKey(today)
        if (!endD || !todayD) return false
        const diff = Math.floor((endD - todayD) / 86400000)
        return diff >= 0 && diff <= 3
      }
      case 'completed':
        if (!todo.completed) return false
        if (dateKey) return todoIncludesDate(todo, dateKey)
        return true
      default:
        return !todo.completed
    }
  })
}

export function computeDateProgressStats(todos, dateKey) {
  const dayTodos = todos.filter((t) => todoIncludesDate(t, dateKey))
  const total = dayTodos.length
  const completed = dayTodos.filter((t) => t.completed).length
  const pct = total ? Math.round((completed / total) * 100) : 0
  return { total, completed, pct }
}

export function computeStats(todos) {
  const today = todayKey()
  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const todayCount = todos.filter(
    (t) => t.startDate <= today && getTodoEndDate(t) >= today
  ).length
  const important = todos.filter((t) => !t.completed && t.priority === 'high').length
  const deadline = todos.filter((t) => {
    if (t.completed) return false
    const end = getTodoEndDate(t)
    if (!end) return false
    const endD = parseDateKey(end)
    const todayD = parseDateKey(today)
    if (!endD || !todayD) return false
    const diff = Math.floor((endD - todayD) / 86400000)
    return diff >= 0 && diff <= 3
  }).length
  const pct = total ? Math.round((completed / total) * 100) : 0

  return { total, completed, todayCount, important, deadline, pct }
}

export function getCalendarEventTimeLabel(todo) {
  const startDate = todo.startDate
  const endDate = getTodoEndDate(todo)
  if (!startDate) return ''

  const sameDay = startDate === endDate
  const hasStartTime = Boolean(todo.startTime)
  const hasEndTime = Boolean(todo.endTime)

  if (sameDay) {
    if (!hasStartTime && !hasEndTime) return ''
    if (hasStartTime && hasEndTime) return `${todo.startTime} ~ ${todo.endTime}`
    return todo.startTime || todo.endTime
  }

  if (!hasStartTime && !hasEndTime) {
    return `${formatDateMonthDay(startDate)} ~ ${formatDateMonthDay(endDate)}`
  }

  const startPoint = `${formatDateMonthDay(startDate)}${hasStartTime ? ` ${todo.startTime}` : ''}`
  const endPoint = `${formatDateMonthDay(endDate)}${hasEndTime ? ` ${todo.endTime}` : ''}`
  return `${startPoint} ~ ${endPoint}`
}

export function getWeekStartDate(dateKey) {
  const d = parseDateKey(dateKey) || new Date()
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function getWeekDates(dateKey) {
  const start = getWeekStartDate(dateKey)
  const week = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    week.push({
      dateKey: formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      month: d.getMonth() + 1,
    })
  }
  return week
}

export function formatWeekRangeTitle(week) {
  if (!week?.length) return ''
  return `${formatDateCompact(week[0].dateKey)} ~ ${formatDateCompact(week[6].dateKey)}`
}

export function shiftAnchorDays(anchorKey, delta) {
  const d = parseDateKey(anchorKey) || new Date()
  d.setDate(d.getDate() + delta)
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

export function shiftAnchorMonths(anchorKey, delta) {
  const d = parseDateKey(anchorKey) || new Date()
  d.setMonth(d.getMonth() + delta)
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

export function getWeekEventSegment(todo, week) {
  const todoStart = todo.startDate
  const todoEnd = getTodoEndDate(todo)
  const weekStart = week[0].dateKey
  const weekEnd = week[6].dateKey
  if (!todoStart || todoEnd < weekStart || todoStart > weekEnd) return null

  const segStart = todoStart > weekStart ? todoStart : weekStart
  const segEnd = todoEnd < weekEnd ? todoEnd : weekEnd
  const startIdx = week.findIndex((d) => d.dateKey === segStart)
  const endIdx = week.findIndex((d) => d.dateKey === segEnd)
  if (startIdx === -1 || endIdx === -1) return null

  return {
    todo,
    colStart: startIdx + 1,
    colEnd: endIdx + 2,
    isSegmentStart: segStart === todoStart,
    isSegmentEnd: segEnd === todoEnd,
  }
}

export function assignEventLanes(segments) {
  const sorted = [...segments].sort((a, b) => {
    const spanDiff = b.colEnd - b.colStart - (a.colEnd - a.colStart)
    if (spanDiff !== 0) return spanDiff
    return a.colStart - b.colStart
  })
  const laneEnds = []
  sorted.forEach((seg) => {
    let lane = 0
    while (lane < laneEnds.length && laneEnds[lane] > seg.colStart) lane += 1
    seg.lane = lane
    laneEnds[lane] = seg.colEnd
  })
  return sorted
}

export function buildCalendarWeeks(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const weeks = []
  let current = []

  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, -startPad + i + 1)
    current.push({
      dateKey: formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      month: d.getMonth() + 1,
      otherMonth: true,
    })
  }

  for (let day = 1; day <= last.getDate(); day++) {
    current.push({
      dateKey: formatDateKey(year, month, day),
      day,
      month: month + 1,
      otherMonth: false,
    })
    if (current.length === 7) {
      weeks.push(current)
      current = []
    }
  }

  if (current.length) {
    let nextDay = 1
    while (current.length < 7) {
      const d = new Date(year, month + 1, nextDay++)
      current.push({
        dateKey: formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()),
        day: d.getDate(),
        month: d.getMonth() + 1,
        otherMonth: true,
      })
    }
    weeks.push(current)
  }

  return weeks
}

export function formatDayTitle(dateKey) {
  const d = parseDateKey(dateKey)
  if (!d) return dateKey || ''
  return `${formatDateCompact(dateKey)} ${DAY_NAMES[d.getDay()]}요일`
}

export function formatTimelineTitle(dateKey) {
  const d = parseDateKey(dateKey)
  if (!d) return ''
  return `${formatDateCompact(dateKey)} (${DAY_NAMES[d.getDay()]})`
}

export function todoHasTime(todo) {
  return Boolean(todo?.startTime || todo?.endTime)
}

export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0
  const [h, m] = timeStr.split(':').map(Number)
  if (Number.isNaN(h)) return 0
  return h * 60 + (Number.isNaN(m) ? 0 : m)
}

export function getNowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
}

export function getTimelineGanttSegment(todo, dateKey) {
  if (!todoIncludesDate(todo, dateKey)) return null

  const startDate = todo.startDate
  const endDate = getTodoEndDate(todo)
  const dayEnd = 24 * 60
  const TIMELINE_HOURS = 24

  const hasStartTime = Boolean(todo.startTime)
  const hasEndTime = Boolean(todo.endTime)
  const startMin = hasStartTime ? parseTimeToMinutes(todo.startTime) : 0
  const endMin = hasEndTime ? parseTimeToMinutes(todo.endTime) : dayEnd

  if (!isMultiDayTodo(todo)) {
    if (!hasStartTime && !hasEndTime) {
      return { leftMin: 0, widthMin: dayEnd, todo, allDay: true }
    }

    const left = hasStartTime ? startMin : 0
    let right
    if (hasStartTime && hasEndTime) {
      right = endMin > startMin ? endMin : dayEnd
    } else if (hasEndTime) {
      right = endMin
    } else {
      right = Math.min(startMin + 60, dayEnd)
    }
    if (right <= left) right = Math.min(left + 60, dayEnd)
    return { leftMin: left, widthMin: right - left, todo }
  }

  if (dateKey === startDate) {
    const left = hasStartTime ? startMin : 0
    return { leftMin: left, widthMin: dayEnd - left, todo }
  }
  if (dateKey === endDate) {
    const right = hasEndTime ? endMin : dayEnd
    return { leftMin: 0, widthMin: right, todo }
  }
  return { leftMin: 0, widthMin: dayEnd, todo }
}

export function getTimelineBarStartLabel(todo, dateKey) {
  if (dateKey === todo.startDate && todo.startTime) return todo.startTime
  if (isMultiDayTodo(todo) && dateKey !== todo.startDate) return '00:00'
  if (todo.startTime) return todo.startTime
  return ''
}

export function getTimelineBarEndLabel(todo, dateKey) {
  const endDate = getTodoEndDate(todo)
  if (dateKey !== endDate || !todo.endTime) return ''
  return todo.endTime
}

export function isTimelineSegmentTimePassed(segment, dateKey) {
  const today = todayKey()
  if (dateKey < today) return true
  if (dateKey > today) return false
  const segmentEnd = segment.leftMin + segment.widthMin
  return getNowMinutes() >= segmentEnd
}

export const CAL_WEEK_DAY_HEADER = 12
export const CAL_WEEK_BAR_HEIGHT = 84
export const CAL_WEEK_LANE_GAP = 16
export const CAL_WEEK_LANE_STEP = CAL_WEEK_BAR_HEIGHT + CAL_WEEK_LANE_GAP
export const CAL_EVENT_H_MARGIN = 6
export const TIMELINE_HOUR_WIDTH = 64
export const TIMELINE_ROW_HEIGHT = 56
export const TIMELINE_MIN_ROWS = 15

export function getSegmentStyle(segment, laneStep = CAL_WEEK_LANE_STEP, barHeight = CAL_WEEK_BAR_HEIGHT) {
  const { colStart, colEnd, lane } = segment
  const colSpan = colEnd - colStart
  const leftPct = ((colStart - 1) / 7) * 100
  const widthPct = (colSpan / 7) * 100
  const margin = CAL_EVENT_H_MARGIN
  return {
    left: `calc(${leftPct}% + ${margin}px)`,
    width: `calc(${widthPct}% - ${margin * 2}px)`,
    top: `${CAL_WEEK_DAY_HEADER + lane * laneStep}px`,
    height: `${barHeight}px`,
  }
}

export function getBarRadiusClass(segment) {
  const { colStart, colEnd, isSegmentStart, isSegmentEnd } = segment
  const isSingleDay = colEnd - colStart === 1
  if (isSingleDay || (isSegmentStart && isSegmentEnd)) return 'bar-single'
  if (isSegmentStart) return 'bar-start'
  if (isSegmentEnd) return 'bar-end'
  return 'bar-middle'
}
