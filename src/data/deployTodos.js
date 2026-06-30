/** 인프라·배포 작업 기록 */
export function getDeployTodoPayloads() {
  return [
    {
      title: 'NAS Docker — todo-backend 컨테이너 구축',
      startDate: today(),
      endDate: today(),
      priority: 'high',
      category: 'work',
      memo: [
        '• NAS Docker 설치',
        '• node:lts-alpine 이미지',
        '• todo-backend 컨테이너 (Express API)',
        '• 포트 15000 → 5000 매핑',
        '• MONGODB_URI 환경변수',
        '• twnas.kr:15000/todos',
      ].join('\n'),
      completed: true,
    },
    {
      title: 'todo-frontend Vercel 배포',
      startDate: today(),
      endDate: today(),
      priority: 'high',
      category: 'work',
      memo: [
        '• GitHub yoosook75/vibe-todo-react 연동',
        '• Vite React → Vercel 자동 빌드·배포',
        '• VITE_API_BASE=/api/todos (Environment Variables)',
        '• vercel.json /api/* → NAS 백엔드 프록시',
        '• https://vibe-todo-react-dun.vercel.app',
      ].join('\n'),
      completed: true,
    },
  ]
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
