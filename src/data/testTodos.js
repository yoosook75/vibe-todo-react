function formatDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDateKey(key) {
  if (!key || typeof key !== 'string') return null
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function todayKey() {
  const d = new Date()
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

function shiftAnchorDays(anchorKey, delta) {
  const d = parseDateKey(anchorKey) || new Date()
  d.setDate(d.getDate() + delta)
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

/** API 시드 / 오프라인 mock 공용 테스트 할 일 목록 */
export function getTestTodoPayloads() {
  const today = todayKey()
  const tomorrow = shiftAnchorDays(today, 1)
  const dayAfter = shiftAnchorDays(today, 2)
  const yesterday = shiftAnchorDays(today, -1)
  const nextWeek = shiftAnchorDays(today, 5)

  return [
    {
      title: '프로젝트 기획서 작성',
      startDate: today,
      endDate: today,
      startTime: '09:00',
      endTime: '11:30',
      priority: 'high',
      category: 'work',
      memo: '팀 미팅 전까지 초안 완료',
      completed: false,
    },
    {
      title: 'React 대시보드 UI 점검',
      startDate: today,
      endDate: dayAfter,
      startTime: '14:00',
      endTime: '16:00',
      priority: 'medium',
      category: 'study',
      memo: '리스트·캘린더·통계 패널 확인',
      completed: false,
    },
    {
      title: '장보기',
      startDate: tomorrow,
      endDate: tomorrow,
      startTime: '',
      endTime: '',
      priority: 'low',
      category: 'personal',
      memo: '우유, 계란, 채소',
      completed: false,
    },
    {
      title: '주간 회의',
      startDate: tomorrow,
      endDate: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      priority: 'high',
      category: 'work',
      memo: '스프린트 리뷰',
      completed: false,
    },
    {
      title: 'TypeScript 학습',
      startDate: dayAfter,
      endDate: dayAfter,
      startTime: '19:00',
      endTime: '21:00',
      priority: 'medium',
      category: 'study',
      memo: '제네릭·유틸 타입',
      completed: false,
    },
    {
      title: '병원 예약 확인',
      startDate: nextWeek,
      endDate: nextWeek,
      startTime: '15:30',
      endTime: '',
      priority: 'high',
      category: 'personal',
      memo: '',
      completed: false,
    },
    {
      title: '운동하기',
      startDate: today,
      endDate: today,
      startTime: '18:30',
      endTime: '19:30',
      priority: 'medium',
      category: 'personal',
      memo: '헬스장 PT',
      completed: true,
    },
    {
      title: '이메일 정리',
      startDate: yesterday,
      endDate: yesterday,
      startTime: '',
      endTime: '',
      priority: 'low',
      category: 'work',
      memo: '',
      completed: true,
    },
  ]
}
