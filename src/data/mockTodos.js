import { getTestTodoPayloads } from './testTodos'

/** API 미연결 시 UI 확인용 로컬 샘플 */
export function getMockTodos() {
  const createdAt = [
    '2026-06-30T09:00:00.000Z',
    '2026-06-30T10:30:00.000Z',
    '2026-06-29T18:00:00.000Z',
    '2026-06-28T08:00:00.000Z',
    '2026-06-27T20:00:00.000Z',
    '2026-06-27T12:00:00.000Z',
    '2026-06-27T07:00:00.000Z',
    '2026-06-26T15:00:00.000Z',
  ]

  return getTestTodoPayloads().map((todo, index) => ({
    ...todo,
    id: `mock-${index + 1}`,
    createdAt: createdAt[index] || new Date().toISOString(),
  }))
}
