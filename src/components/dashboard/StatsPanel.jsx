import Icon from './Icon'

export default function StatsPanel({ stats, filter, onViewCompleted, onFilter }) {
  const { total, completed, pct } = stats.progress

  return (
    <aside className="dashboard-stats space-y-4 lg:space-y-6" aria-label="통계">
      <div className="dashboard-stats-progress bg-indigo-600 rounded-2xl p-4 lg:p-6 text-white shadow-lg shadow-indigo-200/50">
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">진행률</p>
        <div className="flex items-end justify-between mb-3 lg:mb-4">
          <h3 className="text-3xl font-bold">{pct}%</h3>
          <p className="text-sm opacity-90 text-right">
            {total}개 중 {completed}개 완료
          </p>
        </div>
        <div className="h-2 bg-indigo-500/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          className="stats-progress-btn mt-4 lg:mt-6 w-full py-2.5 bg-indigo-500/40 hover:bg-indigo-500/60 border border-indigo-400/30 rounded-xl text-sm font-semibold transition-all"
          onClick={onViewCompleted}
        >
          완료 목록 보기
        </button>
      </div>

      <div className="dashboard-stats-cards grid grid-cols-2 gap-3 lg:gap-4">
        {[
          { filter: 'today', label: '오늘 할 일', value: stats.todayCount },
          { filter: 'important', label: '중요', value: stats.important },
        ].map((card) => (
          <button
            key={card.filter}
            type="button"
            className={`stat-card-btn bg-slate-50 border rounded-2xl p-3 lg:p-4 flex flex-col justify-center text-left transition-all hover:border-indigo-200 ${
              filter === card.filter ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200'
            }`}
            onClick={() => onFilter(card.filter)}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
          </button>
        ))}
        <button
          type="button"
          className={`stat-card-btn bg-slate-50 border rounded-2xl p-3 lg:p-4 flex flex-col justify-center text-left col-span-2 transition-all hover:border-red-200 group ${
            filter === 'deadline' ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200'
          }`}
          onClick={() => onFilter('deadline')}
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-red-400 transition-colors">
            마감 임박
          </p>
          <p className="text-2xl font-bold text-red-500">{stats.deadline}</p>
        </button>
      </div>

      <div className="dashboard-stats-tip bg-amber-50 border border-amber-100 rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex items-start">
          <div className="p-2.5 bg-amber-100/70 rounded-xl mr-4 shrink-0">
            <Icon name="lightbulb" className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">생산성 팁</p>
            <p className="text-xs text-amber-800/80 leading-relaxed mt-1.5 font-medium">
              집중이 필요한 할 일에는 뽀모도로 기법을 써 보세요. 25분 집중하고 5분 쉬기를 반복하면 효율이 올라갑니다.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
