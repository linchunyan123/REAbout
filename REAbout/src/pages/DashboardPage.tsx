import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, CalendarDays, CheckCircle2, CircleDashed, Clock3, ListTodo, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTasks } from '../contexts/TaskContext'
import type { TaskPriority, TaskStatus } from '../types/task'

const statusLabels: Record<TaskStatus, string> = { todo: '待处理', 'in-progress': '进行中', done: '已完成' }
const priorityLabels: Record<TaskPriority, string> = { low: '低', medium: '中', high: '高' }

export function DashboardPage() {
  const { tasks, settings } = useTasks()
  const completed = tasks.filter((task) => task.status === 'done').length
  const inProgress = tasks.filter((task) => task.status === 'in-progress').length
  const upcoming = tasks.filter((task) => task.status !== 'done').slice(0, 4)
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div className="dashboard-stack">
      <section className="welcome-band">
        <div><span className="eyebrow">星期{getWeekday()} · {formatToday()}</span><h2>你好，{settings?.name || "我的工作区"}</h2><p>今天有 {tasks.filter((task) => task.status !== 'done').length} 项任务需要关注，先从最重要的开始。</p></div>
        <Link to="/tasks" className="button light"><Plus size={18} />新建任务</Link>
      </section>

      <section className="metric-grid" aria-label="任务数据概览">
        <Metric icon={<ListTodo />} label="全部任务" value={tasks.length} note="当前工作区" tone="blue" />
        <Metric icon={<CircleDashed />} label="进行中" value={inProgress} note="正在推进" tone="amber" />
        <Metric icon={<CheckCircle2 />} label="已完成" value={completed} note={`${completionRate}% 完成率`} tone="green" />
        <Metric icon={<Clock3 />} label="待处理" value={tasks.length - inProgress - completed} note="等待开始" tone="red" />
      </section>

      <div className="dashboard-grid">
        <section className="panel task-preview-panel">
          <div className="panel-header"><div><h2>近期任务</h2><p>接下来需要推进的工作</p></div><Link to="/tasks" className="text-link">查看全部<ArrowRight size={16} /></Link></div>
          <div className="preview-list">
            {upcoming.length === 0 ? <div className="empty-inline">当前没有待处理任务</div> : upcoming.map((task) => (
              <div className="preview-task" key={task.id}>
                <span className={`status-dot ${task.status}`} />
                <div className="preview-main"><strong>{task.title}</strong><span><CalendarDays size={14} />{formatDate(task.dueDate)}</span></div>
                <span className={`priority-tag ${task.priority}`}>{priorityLabels[task.priority]}</span>
                <span className={`status-tag ${task.status}`}>{statusLabels[task.status]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel progress-panel">
          <div className="panel-header"><div><h2>任务完成进度</h2><p>任务完成情况</p></div></div>
          <div className="progress-visual"><div className="progress-circle" style={{ '--progress': `${completionRate * 3.6}deg` } as CSSProperties}><span>{completionRate}%</span><small>完成</small></div></div>
          <div className="progress-legend"><div><span className="legend-dot green" /><span>已完成</span><strong>{completed}</strong></div><div><span className="legend-dot amber" /><span>进行中</span><strong>{inProgress}</strong></div><div><span className="legend-dot gray" /><span>待处理</span><strong>{tasks.length - completed - inProgress}</strong></div></div>
        </section>
      </div>

      <section className="panel activity-panel">
        <div className="panel-header"><div><h2>最近动态</h2><p>按创建时间显示最近任务</p></div></div>
        <div className="activity-list">
          {tasks.slice(0, 3).map(task => <Activity key={task.id} initials={settings?.name.slice(0, 1) || '我'} color="green" text={<>创建任务「{task.title}」</>} time={new Date(task.createdAt).toLocaleString('zh-CN')} />)}
          {!tasks.length && <p className="empty-inline">暂无任务记录</p>}
        </div>
      </section>
    </div>
  )
}

function Metric({ icon, label, value, note, tone }: { icon: ReactNode; label: string; value: number; note: string; tone: string }) {
  return <div className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>
}

function Activity({ initials, color, text, time }: { initials: string; color: string; text: ReactNode; time: string }) {
  return <div className="activity-item"><span className={`activity-avatar ${color}`}>{initials}</span><div><p>{text}</p><span>{time}</span></div></div>
}

function formatDate(date: string) { return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`)) }
function formatToday() { return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(new Date()) }
function getWeekday() { return ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()] }
