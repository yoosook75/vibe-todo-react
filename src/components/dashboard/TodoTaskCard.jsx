import Icon from './Icon'
import {
  CATEGORY_LABELS,
  CATEGORY_LABELS_KO,
  CATEGORY_STYLES,
  formatDateMonthDay,
  getBarRadiusClass,
  getCalendarEventTimeLabel,
  getTodoEndDate,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  WEEK_CARD_THEME,
} from '../../lib/todoUtils'

function ScheduleMeta({ todo }) {
  if (!todo.startDate) return null

  const end = getTodoEndDate(todo)
  const sameDay = end === todo.startDate
  const hasTime = !!(todo.startTime || todo.endTime)

  let inner = null

  if (!sameDay && hasTime) {
    const startPart = `${todo.startDate}${todo.startTime ? ` ${todo.startTime}` : ''}`
    const endPart = `${end}${todo.endTime ? ` ${todo.endTime}` : todo.startTime ? ` ${todo.startTime}` : ''}`
    inner = (
      <span className="text-xs flex items-center gap-1">
        <Icon name="calendar_today" className="icon-sm" />
        {startPart} ~ {endPart}
      </span>
    )
  } else if (sameDay && hasTime) {
    const timeLabel = todo.startTime
      ? `${todo.startTime}${todo.endTime ? ` ~ ${todo.endTime}` : ''}`
      : todo.endTime
    inner = (
      <>
        <span className="text-xs flex items-center gap-1">
          <Icon name="calendar_today" className="icon-sm" />
          {todo.startDate}
        </span>
        <span className="text-xs flex items-center gap-1">
          <Icon name="schedule" className="icon-sm" />
          {timeLabel}
        </span>
      </>
    )
  } else if (!sameDay) {
    inner = (
      <span className="text-xs flex items-center gap-1">
        <Icon name="calendar_today" className="icon-sm" />
        {todo.startDate} ~ {end}
      </span>
    )
  } else {
    inner = (
      <span className="text-xs flex items-center gap-1">
        <Icon name="calendar_today" className="icon-sm" />
        {todo.startDate}
      </span>
    )
  }

  return <div className="flex flex-wrap items-center gap-3 ml-1 text-slate-500 text-xs">{inner}</div>
}

export default function TodoTaskCard({ todo, onToggle, onEdit, onDelete }) {
  const toggleDone = todo.completed
    ? 'border-indigo-500 bg-indigo-50'
    : 'border-slate-300 group-hover:border-indigo-500'

  return (
    <div
      className={`group p-4 border rounded-xl flex items-start gap-3 transition-all ${
        todo.completed
          ? 'bg-slate-50 border-slate-100 opacity-70'
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <button
        type="button"
        className={`w-6 h-6 border-2 ${toggleDone} rounded-md flex-shrink-0 mt-0.5 transition-colors flex items-center justify-center`}
        onClick={() => onToggle(todo)}
        aria-label="완료"
        aria-pressed={todo.completed}
      >
        {todo.completed && <Icon name="check" className="icon-md text-indigo-600 leading-none" />}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`text-sm font-semibold text-slate-800 truncate ${
            todo.completed ? 'line-through text-slate-400' : ''
          }`}
        >
          {todo.title}
        </h3>
        <div className="flex flex-wrap items-center mt-2 gap-2">
          {todo.priority && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                PRIORITY_STYLES[todo.priority] || PRIORITY_STYLES.medium
              }`}
            >
              {PRIORITY_LABELS[todo.priority] || 'Med'}
            </span>
          )}
          {todo.category && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                CATEGORY_STYLES[todo.category] || CATEGORY_STYLES.other
              }`}
            >
              {CATEGORY_LABELS[todo.category] || 'Other'}
            </span>
          )}
          <ScheduleMeta todo={todo} />
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          onClick={() => onEdit(todo)}
          title="수정"
        >
          <Icon name="edit" className="icon-lg" />
        </button>
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          onClick={() => onDelete(todo)}
          title="삭제"
        >
          <Icon name="delete" className="icon-lg" />
        </button>
      </div>
    </div>
  )
}

export function WeekEventBar({ segment, onEdit, onDelete }) {
  const { todo, isSegmentStart, colStart, colEnd, lane } = segment
  const priority = todo.priority || 'medium'
  const showLabel = isSegmentStart || segment.colEnd - segment.colStart === 1
  const timeText = getCalendarEventTimeLabel(todo)
  const dateOnly =
    todo.startDate && !timeText
      ? todo.startDate === getTodoEndDate(todo)
        ? formatDateMonthDay(todo.startDate)
        : `${formatDateMonthDay(todo.startDate)} ~ ${formatDateMonthDay(getTodoEndDate(todo))}`
      : ''
  const footer = timeText || dateOnly

  return (
    <div
      className={`cal-event-bar week-event-card week-event-grid border cursor-pointer ${
        WEEK_CARD_THEME[priority]?.card || WEEK_CARD_THEME.medium.card
      } ${getBarRadiusClass(segment)} ${todo.completed ? 'done' : ''}`}
      style={{
        gridColumn: `${colStart} / ${colEnd}`,
        gridRow: lane + 1,
      }}
      title={[todo.title, footer, todo.memo].filter(Boolean).join(' · ')}
      onClick={() => onEdit(todo)}
    >
      {showLabel && (
        <>
          {todo.category && (
            <div className={`day-schedule-cat ${WEEK_CARD_THEME[priority]?.cat}`}>
              <span className={`day-schedule-cat-dot ${WEEK_CARD_THEME[priority]?.dot}`} />
              {CATEGORY_LABELS_KO[todo.category]}
            </div>
          )}
          <div className="day-schedule-title">{todo.title}</div>
          {footer && <p className="day-schedule-memo">{footer}</p>}
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
        </>
      )}
    </div>
  )
}
