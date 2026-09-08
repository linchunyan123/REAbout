import { ArrowUpRight, CheckCircle2, Flame, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTasks } from '../contexts/TaskContext'
import { dateKey, isOverdue, priorityLabels } from '../task-utils'

export function InsightsPage() {
  const { tasks } = useTasks()
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => isOverdue(t)).length
  const active = tasks.filter(t => t.status !== 'done')
  const days = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() + i); return dateKey(date) })
  const counts = days.map(day => active.filter(t => t.dueDate === day).length)
  const max = Math.max(1, ...counts)
  const recentDays = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - 6 + i); return dateKey(date) })
  const created = recentDays.map(day => tasks.filter(t => dateKey(new Date(t.createdAt)) === day).length)
  const createdMax = Math.max(1, ...created)
  return <div className="dashboard-stack"><div className="page-intro"><div><span className="eyebrow">A CLEARER PICTURE</span><h2>看见进展，找到节奏<span className="accent-dot">.</span></h2><p>基于当前工作区的真实任务，了解工作分布与近期负载。</p></div><Link className="button secondary" to="/tasks">管理任务<ArrowUpRight size={16} /></Link></div>
    <div className="insight-stats"><section className="panel insight-stat"><Target /><span>整体完成率</span><strong>{tasks.length ? Math.round(done / tasks.length * 100) : 0}<small>%</small></strong><p>{done} / {tasks.length} 项任务已完成</p></section><section className="panel insight-stat"><CheckCircle2 /><span>未来 7 天待办</span><strong>{counts.reduce((a, b) => a + b, 0)}</strong><p>今天起 7 个自然日内到期</p></section><Link to="/tasks?due=overdue" className="panel insight-stat warning-stat"><Flame /><span>需要重新安排</span><strong>{overdue}</strong><p>已逾期的未完成任务 →</p></Link></div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-header"><div><h2>未来 7 天 · 任务负载</h2><p>按截止日期统计未完成任务，点击柱形查看当天安排</p></div></div><div className="bar-chart">{days.map((day, i) => <Link to={`/calendar?date=${day}`} key={day} className="chart-column" aria-label={`${day}：${counts[i]} 项未完成任务`}><strong>{counts[i]}</strong><div className="bar-track"><span style={{ height: `${counts[i] / max * 100}%` }} /></div><small>{i === 0 ? '今天' : day.slice(5)}</small></Link>)}</div></section><section className="panel"><div className="panel-header"><div><h2>优先级分布</h2><p>当前未完成任务</p></div></div><div className="priority-distribution">{(['high', 'medium', 'low'] as const).map(priority => { const count = active.filter(t => t.priority === priority).length; return <Link to={`/tasks?priority=${priority}`} key={priority}><div><span className={`priority-label ${priority}`}>{priorityLabels[priority]}</span><strong>{count}</strong></div><div className="distribution-track"><span className={priority} style={{ width: `${active.length ? count / active.length * 100 : 0}%` }} /></div></Link> })}{!active.length && <p className="muted">暂无待办任务。</p>}</div></section></div>
    <section className="panel"><div className="panel-header"><div><h2>最近 7 天 · 任务创建</h2><p>按创建时间统计当前保留的任务，不代表历史完成数量</p></div><span className="data-pill">共 {created.reduce((a, b) => a + b, 0)} 项</span></div><div className="bar-chart creation-chart">{recentDays.map((day, i) => <div className="chart-column" key={day}><strong>{created[i]}</strong><div className="bar-track"><span style={{ height: `${created[i] / createdMax * 100}%` }} /></div><small>{day.slice(5)}</small></div>)}</div></section>
  </div>
}
