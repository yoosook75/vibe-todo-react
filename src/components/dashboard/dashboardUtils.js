import {
  formatDayTitle,
  formatTimelineTitle,
  formatWeekRangeTitle,
  getWeekDates,
  MONTH_NAMES,
  parseDateKey,
} from '../../lib/todoUtils'

export function getCalendarTitle(mode, anchorKey) {
  if (mode === 'week') return formatWeekRangeTitle(getWeekDates(anchorKey))
  if (mode === 'month') {
    const d = parseDateKey(anchorKey) || new Date()
    return `${d.getFullYear()}년 ${MONTH_NAMES[d.getMonth()]}`
  }
  if (mode === 'day') return formatDayTitle(anchorKey)
  return formatTimelineTitle(anchorKey)
}
