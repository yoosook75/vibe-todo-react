import { useEffect, useRef } from 'react'
import Icon from './Icon'
import { WeekEventBar } from './TodoTaskCard'
import {
  assignEventLanes,
  buildCalendarWeeks,
  CAL_WEEK_DAY_HEADER,
  CAL_WEEK_LANE_STEP,
  DAY_CARD_THEME,
  DAY_NAMES,
  getNowMinutes,
  getTimelineBarEndLabel,
  getTimelineBarStartLabel,
  getTimelineGanttSegment,
  getTodosForDate,
  getWeekDates,
  getWeekEventSegment,
  isTimelineSegmentTimePassed,
  parseDateKey,
  TIMELINE_HOUR_WIDTH,
  TIMELINE_MIN_ROWS,
  TIMELINE_ROW_HEIGHT,
  todoHasTime,
  todayKey,
} from '../../lib/todoUtils'

function WeekDayHeaders({ week }) {
  const today = todayKey()
  return (
    <div id="week-day-headers" className="border-b border-slate-100 text-center shrink-0">
      {week.map((dayInfo, index) => {
        const isToday = dayInfo.dateKey === today
        let color = 'text-slate-500'
        if (index === 0) color = 'text-red-500'
        if (index === 6) color = 'text-indigo-500'
        return (
          <div key={dayInfo.dateKey} className={`py-2.5 text-xs font-bold ${color} ${isToday ? 'bg-indigo-50' : ''}`}>
            {DAY_NAMES[index]} {dayInfo.month}/{dayInfo.day}
          </div>
        )
      })}
    </div>
  )
}

function WeekCalendar({ items, anchorKey, onEdit, onDelete }) {
  const weekRef = useRef(null)
  const week = getWeekDates(anchorKey)
  const today = todayKey()
  const segments = []
  items.forEach((todo) => {
    const seg = getWeekEventSegment(todo, week)
    if (seg) segments.push(seg)
  })
  assignEventLanes(segments)
  const laneCount = Math.max(segments.reduce((max, s) => Math.max(max, s.lane), -1) + 1, 1)

  useEffect(() => {
    const weekEl = weekRef.current
    if (!weekEl) return

    const sync = () => {
      const compact = window.matchMedia('(max-width: 1023px)').matches
      if (compact) {
        weekEl.style.minHeight = ''
        weekEl.style.height = ''
        weekEl.style.gridTemplateRows = ''
        return
      }

      const wrap = document.getElementById('calendar-scroll-wrap')
      const headers = document.getElementById('week-day-headers')
      const headersH = headers?.offsetHeight ?? 0
      const available = wrap ? Math.max(0, wrap.clientHeight - headersH) : 0

      const lanes = laneCount
      const laneStep = CAL_WEEK_LANE_STEP
      const contentMin = Math.max(220, CAL_WEEK_DAY_HEADER + lanes * laneStep + 12)
      const h = Math.max(contentMin, available > 0 ? available : contentMin)

      weekEl.style.minHeight = `${h}px`
      weekEl.style.height = `${h}px`

      if (lanes === 1) {
        weekEl.style.gridTemplateRows = `${h}px`
      } else {
        const laneTotal = lanes * laneStep
        const extra = Math.max(0, h - laneTotal)
        weekEl.style.gridTemplateRows =
          extra > 0
            ? `repeat(${lanes - 1}, ${laneStep}px) ${laneStep + extra}px`
            : `repeat(${lanes}, ${laneStep}px)`
      }
    }

    sync()
    const raf = requestAnimationFrame(() => {
      sync()
      requestAnimationFrame(sync)
    })

    window.addEventListener('resize', sync)
    const mq = window.matchMedia('(max-width: 1023px)')
    mq.addEventListener('change', sync)

    const wrap = document.getElementById('calendar-scroll-wrap')
    let ro
    if (wrap && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(sync)
      ro.observe(wrap)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', sync)
      mq.removeEventListener('change', sync)
      ro?.disconnect()
    }
  }, [laneCount, anchorKey, items.length])

  return (
    <div className="cal-week-track">
      <WeekDayHeaders week={week} />
      <div id="calendar-grid" className="relative cal-grid-week">
        <div
          ref={weekRef}
          className="cal-week cal-week-fill cal-week-grid"
          data-lanes={laneCount}
          style={{ gridTemplateRows: `repeat(${laneCount}, ${CAL_WEEK_LANE_STEP}px)` }}
        >
          {week.map((dayInfo, index) => (
            <div
              key={dayInfo.dateKey}
              className={`cal-day-cell ${dayInfo.dateKey === today ? 'bg-indigo-50/40' : 'bg-white'}`}
              style={{ gridColumn: index + 1, gridRow: `1 / ${laneCount + 1}` }}
            />
          ))}
          {segments.map((seg) => (
            <WeekEventBar
              key={`${seg.todo.id}-${seg.colStart}-${seg.lane}`}
              segment={seg}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthCalendar({ items, anchorKey, onEdit, onDelete }) {
  const anchor = parseDateKey(anchorKey) || new Date()
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const today = todayKey()
  const weeks = buildCalendarWeeks(year, month)

  return (
    <>
      <div id="week-day-headers" className="border-b border-slate-100 text-center shrink-0">
        {DAY_NAMES.map((name, i) => {
          const color = i === 0 ? 'text-red-500' : i === 6 ? 'text-indigo-500' : 'text-slate-500'
          return (
            <div key={name} className={`py-2 text-xs font-bold ${color}`}>
              {name}
            </div>
          )
        })}
      </div>
      <div id="calendar-grid" className="relative flex-1 min-h-0 cal-grid-month">
        <div className="cal-month-weeks">
          {weeks.map((week, wi) => (
            <div key={wi} className="cal-month-week">
              {week.map((dayInfo) => {
                const dayTodos = getTodosForDate(items, dayInfo.dateKey).sort((a, b) => {
                  const timeCmp = (a.startTime || '').localeCompare(b.startTime || '')
                  return timeCmp !== 0 ? timeCmp : (a.title || '').localeCompare(b.title || '')
                })
                const isToday = dayInfo.dateKey === today
                return (
                  <div
                    key={dayInfo.dateKey}
                    className={`cal-month-day${dayInfo.otherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}`}
                  >
                    <div className="cal-month-day-head">{dayInfo.day}</div>
                    <div className="cal-month-day-body">
                      {dayTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`cal-month-chip priority-${todo.priority || 'medium'}${todo.completed ? ' done' : ''}`}
                          title={todo.title}
                          onClick={() => onEdit(todo)}
                        >
                          <span className="cal-month-chip-text">{todo.title}</span>
                          <button
                            type="button"
                            className="cal-month-chip-delete"
                            title="삭제"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(todo)
                            }}
                          >
                            <Icon name="close" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function DayCalendar({ items, anchorKey, onEdit, onDelete }) {
  const dayTodos = getTodosForDate(items, anchorKey)
  const withTime = dayTodos.filter((t) => todoHasTime(t))
  const withoutTime = dayTodos.filter((t) => !todoHasTime(t))
  withTime.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  withoutTime.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  const sorted = [...withTime, ...withoutTime]

  return (
    <div id="calendar-grid" className="relative flex-1 min-h-0 cal-grid-inset">
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium text-center py-12">이 날짜에 표시할 할 일이 없습니다.</p>
      ) : (
        <div className="day-schedule-list">
          {sorted.map((todo, index) => {
            const priority = todo.priority || 'medium'
            const theme = DAY_CARD_THEME[priority] || DAY_CARD_THEME.medium
            const cat = { study: '공부', work: '업무', personal: '개인', other: '기타' }[todo.category] || ''
            return (
              <div key={todo.id} className="day-schedule-row">
                <div className="day-schedule-time">
                  {!todo.startTime && !todo.endTime ? (
                    <span className="day-schedule-time-line">종일</span>
                  ) : (
                    <span className="day-schedule-time-line">
                      {todo.startTime}
                      {todo.endTime ? ` ~ ${todo.endTime}` : ''}
                    </span>
                  )}
                </div>
                <div className="day-schedule-rail">
                  <span
                    className={`day-schedule-dot ${theme.dot}`}
                    style={{
                      color: priority === 'high' ? '#f87171' : priority === 'low' ? '#94a3b8' : '#818cf8',
                    }}
                  />
                  {index < sorted.length - 1 && <span className="day-schedule-line" aria-hidden="true" />}
                </div>
                <div
                  className={`day-schedule-card border ${theme.card} ${todo.completed ? 'done' : ''}`}
                  onClick={() => onEdit(todo)}
                >
                  {cat && (
                    <div className={`day-schedule-cat ${theme.cat}`}>
                      <span className={`day-schedule-cat-dot ${theme.dot}`} />
                      {cat}
                    </div>
                  )}
                  <div className="day-schedule-title">{todo.title}</div>
                  {todo.memo && <p className="day-schedule-memo">{todo.memo}</p>}
                  <button
                    type="button"
                    className="day-schedule-delete"
                    title="삭제"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(todo)
                    }}
                  >
                    <Icon name="close" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TimelineBar({ segment, dateKey, onEdit, onDelete }) {
  const { todo, leftMin, widthMin } = segment
  const priority = todo.priority || 'medium'
  const completed = Boolean(todo.completed)
  const timePassed = isTimelineSegmentTimePassed(segment, dateKey)
  const startLabel = getTimelineBarStartLabel(todo, dateKey)
  const endLabel = getTimelineBarEndLabel(todo, dateKey)
  const ended = completed || timePassed

  let body = null
  if (completed) {
    body = <span className="timeline-gantt-bar-time timeline-gantt-bar-status">완료</span>
  } else if (timePassed) {
    body = <span className="timeline-gantt-bar-time timeline-gantt-bar-status">종료</span>
  } else if (startLabel || endLabel) {
    body = (
      <>
        {startLabel ? <span className="timeline-gantt-bar-time">{startLabel}</span> : <span />}
        {endLabel && <span className="timeline-gantt-bar-time timeline-gantt-bar-time-end">{endLabel}</span>}
      </>
    )
  }

  return (
    <div
      className={`timeline-gantt-bar priority-${priority}${completed ? ' done' : ''}${ended ? ' timeline-gantt-bar-ended' : ''}`}
      style={{
        left: `${(leftMin / 60) * TIMELINE_HOUR_WIDTH}px`,
        width: `${Math.max((widthMin / 60) * TIMELINE_HOUR_WIDTH, 28)}px`,
      }}
      onClick={() => onEdit(todo)}
    >
      {body && (
        <div className="timeline-gantt-bar-body">
          <div className="timeline-gantt-bar-inner">{body}</div>
        </div>
      )}
      <button
        type="button"
        className="timeline-gantt-bar-delete"
        title="삭제"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(todo)
        }}
      >
        <Icon name="close" />
      </button>
    </div>
  )
}

function TimelineCalendar({ items, anchorKey, onEdit, onDelete }) {
  const tracksScrollRef = useRef(null)
  const hoursScrollRef = useRef(null)
  const tasksScrollRef = useRef(null)
  const dateKey = anchorKey
  const trackWidth = 24 * TIMELINE_HOUR_WIDTH

  const segments = getTodosForDate(items, dateKey)
    .map((todo) => getTimelineGanttSegment(todo, dateKey))
    .filter(Boolean)
    .sort((a, b) => a.leftMin - b.leftMin || a.todo.title.localeCompare(b.todo.title))

  const rowCount = Math.max(segments.length, TIMELINE_MIN_ROWS)

  useEffect(() => {
    const tracksScroll = tracksScrollRef.current
    const hoursScroll = hoursScrollRef.current
    const tasksScroll = tasksScrollRef.current
    if (!tracksScroll) return

    let syncing = false
    const syncX = (source, target) => {
      if (syncing || !source || !target) return
      syncing = true
      target.scrollLeft = source.scrollLeft
      syncing = false
    }
    const syncY = (source, target) => {
      if (syncing || !source || !target) return
      syncing = true
      target.scrollTop = source.scrollTop
      syncing = false
    }

    const onScroll = () => {
      syncX(tracksScroll, hoursScroll)
      syncY(tracksScroll, tasksScroll)
    }
    const onTasksScroll = () => syncY(tasksScroll, tracksScroll)

    tracksScroll.addEventListener('scroll', onScroll)
    tasksScroll?.addEventListener('scroll', onTasksScroll)

    if (dateKey === todayKey()) {
      const nowLeft = (getNowMinutes() / 60) * TIMELINE_HOUR_WIDTH
      const targetScroll = Math.max(0, nowLeft - tracksScroll.clientWidth / 2)
      tracksScroll.scrollLeft = targetScroll
      if (hoursScroll) hoursScroll.scrollLeft = targetScroll
    }

    return () => {
      tracksScroll.removeEventListener('scroll', onScroll)
      tasksScroll?.removeEventListener('scroll', onTasksScroll)
    }
  }, [dateKey, segments.length])

  return (
    <div id="calendar-grid" className="relative flex-1 min-h-0 cal-grid-timeline">
      <div className="timeline-gantt">
        <div className="timeline-gantt-sidebar">
          <div className="timeline-gantt-corner">할일</div>
          <div className="timeline-gantt-tasks-scroll" ref={tasksScrollRef}>
            <div className="timeline-gantt-tasks-inner">
              {Array.from({ length: rowCount }, (_, i) => {
                const seg = segments[i]
                if (!seg) {
                  return (
                    <div key={i} className="timeline-gantt-task-row timeline-gantt-task-row-empty" aria-hidden="true" />
                  )
                }
                const cat = { study: '공부', work: '업무', personal: '개인', other: '기타' }[seg.todo.category] || ''
                return (
                  <div key={seg.todo.id} className="timeline-gantt-task-row">
                    <div className="timeline-gantt-task-title">{seg.todo.title}</div>
                    {cat && <div className="timeline-gantt-task-cat">{cat}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="timeline-gantt-main">
          <div className="timeline-gantt-hours-scroll" ref={hoursScrollRef}>
            <div className="timeline-gantt-hours" style={{ width: trackWidth }}>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="timeline-gantt-hour">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
          <div className="timeline-gantt-tracks-scroll" ref={tracksScrollRef}>
            <div
              className="timeline-gantt-tracks-inner"
              style={{ width: trackWidth, minHeight: rowCount * TIMELINE_ROW_HEIGHT }}
            >
              {dateKey === todayKey() && (
                <div
                  className="timeline-gantt-now"
                  style={{ left: `${(getNowMinutes() / 60) * TIMELINE_HOUR_WIDTH}px` }}
                />
              )}
              {Array.from({ length: rowCount }, (_, i) => {
                const seg = segments[i]
                return (
                  <div key={i} className="timeline-gantt-track-row" style={{ width: trackWidth }}>
                    {Array.from({ length: 25 }, (_, h) => (
                      <div key={h} className="timeline-gantt-hour-vline" style={{ left: h * TIMELINE_HOUR_WIDTH }} />
                    ))}
                    {seg && <TimelineBar segment={seg} dateKey={dateKey} onEdit={onEdit} onDelete={onDelete} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPanel({ mode, anchorKey, items, onEdit, onDelete }) {
  if (mode === 'week') {
    return <WeekCalendar items={items} anchorKey={anchorKey} onEdit={onEdit} onDelete={onDelete} />
  }
  if (mode === 'month') {
    return <MonthCalendar items={items} anchorKey={anchorKey} onEdit={onEdit} onDelete={onDelete} />
  }
  if (mode === 'day') {
    return <DayCalendar items={items} anchorKey={anchorKey} onEdit={onEdit} onDelete={onDelete} />
  }
  return <TimelineCalendar items={items} anchorKey={anchorKey} onEdit={onEdit} onDelete={onDelete} />
}
