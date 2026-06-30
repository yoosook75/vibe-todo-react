import Icon from './Icon'
import TodoTaskCard from './TodoTaskCard'
import CalendarPanel from './CalendarPanel'
import TodoModal from './TodoModal'
import StatsPanel from './StatsPanel'
import useDashboard from '../../hooks/useDashboard'
import { getCalendarTitle } from './dashboardUtils'
import { todayKey } from '../../lib/todoUtils'

export default function Dashboard() {
  const d = useDashboard()

  const scrollClass =
    d.calMode === 'week'
      ? 'cal-scroll-week'
      : d.calMode === 'month'
        ? 'cal-scroll-month'
        : d.calMode === 'day'
          ? 'cal-scroll-day'
          : 'cal-scroll-timeline'

  const innerClass =
    d.calMode === 'week'
      ? 'cal-min-week'
      : d.calMode === 'month'
        ? 'cal-min-month'
        : d.calMode === 'day'
          ? 'cal-min-day'
          : 'cal-min-timeline'

  return (
    <div className="dashboard-shell bg-slate-50 font-sans text-slate-900 h-full flex m-0 overflow-x-hidden">
      <div className="flex h-full w-full min-h-0 min-w-0 max-w-full overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-30 ${
            d.sidebarOpen ? 'fixed inset-y-0 left-0 flex' : 'hidden lg:flex'
          }`}
        >
          <a
            href="/"
            className="p-6 flex items-center space-x-3 hover:bg-slate-50 transition-colors no-underline"
            aria-label="대시보드로 이동"
          >
            <img
              src="/img/logo.png"
              alt="TaskMaster"
              className="w-8 h-8 shrink-0 object-contain"
              width="32"
              height="32"
            />
            <span className="font-bold text-lg tracking-tight text-slate-900">TaskMaster</span>
          </a>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {[
              { id: 'all', label: '전체', icon: 'dashboard' },
              { id: 'today', label: '오늘', icon: 'today' },
              { id: 'upcoming', label: '예정', icon: 'event_upcoming', color: 'text-orange-600' },
              { id: 'important', label: '중요', icon: 'priority_high', color: 'text-red-500' },
              { id: 'completed', label: '완료', icon: 'done_all', color: 'text-emerald-500' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  d.filter === f.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => {
                  d.setFilter(f.id)
                  d.setSidebarOpen(false)
                }}
              >
                <div className={`flex items-center ${f.color || ''}`}>
                  <Icon name={f.icon} className="w-5 h-5 mr-3 text-[20px]" />
                  {f.label}
                </div>
                {f.id === 'today' && (
                  <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                    {d.stats.todayCount}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-8 pb-2 px-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projects</span>
            </div>
            {[
              { id: 'work', label: '업무', dot: 'bg-blue-500' },
              { id: 'personal', label: '개인', dot: 'bg-emerald-500' },
              { id: 'study', label: '공부', dot: 'bg-amber-500' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                  d.category === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => d.toggleCategory(c.id)}
              >
                <span className={`w-2 h-2 rounded-full ${c.dot} mr-4`} /> {c.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 shrink-0">
            <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                ME
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">관리자</p>
                <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="dashboard-main flex-1 flex flex-col bg-white min-w-0 relative">
          <header className="dashboard-header h-16 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white z-10 lg:px-8">
            <div className="dashboard-header-left flex items-center gap-3 lg:gap-4 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                aria-label="메뉴"
                onClick={() => d.setSidebarOpen(true)}
              >
                <Icon name="menu" />
              </button>
              <h1 className="text-xl font-bold text-slate-800 hidden lg:block truncate">My Dashboard</h1>
            </div>

            <div className="dashboard-header-actions flex items-center gap-2 lg:gap-4 shrink-0">
              <span
                className={`hidden lg:flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${
                  d.apiReady
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
                title={d.apiReady ? `백엔드 API · ${d.API_BASE}` : `백엔드 서버에 연결할 수 없습니다 · ${d.API_BASE}`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1.5 ${d.apiReady ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                {d.loading ? '연결 중…' : d.apiReady ? '연결됨' : '연결 실패'}
              </span>
              <div className="relative hidden lg:block">
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={d.search}
                  onChange={(e) => d.setSearch(e.target.value)}
                  className="bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full py-1.5 pl-10 pr-4 text-sm w-48 lg:w-64 transition-all outline-none"
                />
                <Icon
                  name="search"
                  className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
                />
              </div>
              <button
                type="button"
                className="dashboard-header-add-btn bg-indigo-600 hover:bg-indigo-700 text-white px-3 lg:px-4 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1 transition-colors shadow-sm whitespace-nowrap shrink-0"
                onClick={() => d.openModal()}
              >
                <Icon name="add" className="icon-md leading-none shrink-0" />
                New Task
              </button>
            </div>
          </header>

          <div id="main-content-scroll">
            <div className="dashboard-grid">
              <section className="dashboard-primary" aria-label="할 일 목록 및 캘린더">
                <div className="dashboard-task-toolbar flex items-center justify-between shrink-0">
                  <h2 className="text-base font-bold text-slate-800">
                    {d.filter === 'completed' ? '완료된 할 일' : '진행중인 할 일'}
                  </h2>
                  <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                        d.view === 'list'
                          ? 'font-semibold bg-white shadow-sm text-indigo-600'
                          : 'font-medium text-slate-500 hover:bg-slate-50'
                      }`}
                      onClick={() => d.setView('list')}
                    >
                      리스트
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                        d.view === 'calendar'
                          ? 'font-semibold bg-white shadow-sm text-indigo-600'
                          : 'font-medium text-slate-500 hover:bg-slate-50'
                      }`}
                      onClick={() => d.setView('calendar')}
                    >
                      캘린더
                    </button>
                  </div>
                </div>

                <div className="dashboard-task-body">
                  {d.view === 'list' ? (
                    <div className="dashboard-list-scroll pr-1">
                      {d.listActive.length === 0 && !(d.completedList.length > 0 && d.filter === 'all') ? (
                        <div className="dashboard-empty-state">
                          <Icon name="inbox" className="text-4xl mb-2" />
                          <p className="text-sm font-medium">표시할 할 일이 없습니다</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {d.listActive.map((todo) => (
                            <TodoTaskCard
                              key={todo.id}
                              todo={todo}
                              onToggle={d.handleToggle}
                              onEdit={(t) => d.openModal(t.id)}
                              onDelete={d.handleDelete}
                            />
                          ))}
                        </div>
                      )}

                      {d.completedList.length > 0 && d.filter === 'all' && (
                        <div className="pt-6 mt-4 opacity-70">
                          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            완료된 할 일
                          </h2>
                          <div className="space-y-3">
                            {d.completedList.map((todo) => (
                              <TodoTaskCard
                                key={todo.id}
                                todo={todo}
                                onToggle={d.handleToggle}
                                onEdit={(t) => d.openModal(t.id)}
                                onDelete={d.handleDelete}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="dashboard-calendar-shell">
                      <div className="dashboard-calendar-card bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="p-3 lg:p-4 border-b border-slate-100 flex flex-col gap-2 shrink-0">
                          <div className="relative flex items-center justify-center w-full min-h-[2.25rem]">
                            <div className="absolute left-0 z-10 flex items-center gap-2">
                              <button
                                type="button"
                                className="p-1.5 bg-slate-50 rounded text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
                                onClick={d.calPrev}
                              >
                                <Icon name="chevron_left" className="text-[18px]" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 bg-slate-50 rounded text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
                                onClick={d.calNext}
                              >
                                <Icon name="chevron_right" className="text-[18px]" />
                              </button>
                            </div>
                            <h2 className="text-sm lg:text-base font-bold text-slate-800 text-center px-[4.75rem] min-w-0 max-w-full truncate">
                              {getCalendarTitle(d.calMode, d.calAnchorKey)}
                            </h2>
                          </div>
                          <div id="cal-mode-tabs-scroll" className="w-full">
                            <div className="flex bg-slate-100 p-1 rounded-lg w-max mx-auto">
                              {[
                                { id: 'month', label: '월간' },
                                { id: 'week', label: '주간' },
                                { id: 'day', label: '일간' },
                                { id: 'timeline', label: '타임라인' },
                              ].map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  className={`cal-mode-btn px-2 lg:px-2.5 py-1 text-xs rounded transition-all ${
                                    d.calMode === m.id ? 'active' : 'font-medium text-slate-500'
                                  }`}
                                  onClick={() => d.setCalMode(m.id)}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div id="calendar-scroll-wrap" className={scrollClass}>
                          <div id="calendar-scroll-inner" className={`flex flex-col ${innerClass}`}>
                            <CalendarPanel
                              mode={d.calMode}
                              anchorKey={d.calAnchorKey}
                              items={d.calendarTodos}
                              onEdit={(t) => d.openModal(t.id)}
                              onDelete={d.handleDelete}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <StatsPanel
                stats={d.stats}
                filter={d.filter}
                onViewCompleted={() => {
                  d.setView('list')
                  d.setFilter('completed')
                }}
                onFilter={(f) => {
                  d.setView('list')
                  d.setFilter(f)
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {d.sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden" onClick={() => d.setSidebarOpen(false)} />
      )}

      <TodoModal
        open={d.modalOpen}
        editingTodo={d.editingTodo}
        defaultDate={todayKey()}
        onClose={d.closeModal}
        onSave={d.handleSave}
      />
    </div>
  )
}
