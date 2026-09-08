import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { TaskForm } from '../components/TaskForm'
import { useTasks } from '../contexts/TaskContext'
import { dateKey, priorityLabels, statusLabels } from '../task-utils'
import type { Task, TaskInput } from '../types/task'

export function CalendarPage() {
  const { tasks, addTask, updateTask } = useTasks()
  const [params] = useSearchParams()
  const requested = params.get('date') || ''
  const initial = /^\d{4}-\d{2}-\d{2}$/.test(requested) && Number.isFinite(Date.parse(requested)) ? new Date(requested + 'T00:00:00') : new Date()
  const [month, setMonth] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [selected, setSelected] = useState(dateKey(initial))
  const [editing, setEditing] = useState<Task>()
  const [open, setOpen] = useState(false)
  const start = new Date(month); start.setDate(1 - (month.getDay() + 6) % 7)
  const days = Array.from({ length: 42 }, (_, i) => { const day = new Date(start); day.setDate(start.getDate() + i); return day })
  const dayTasks = tasks.filter(t => t.dueDate === selected)
  const monthTasks = tasks.filter(t => t.dueDate.startsWith(dateKey(month).slice(0, 7)))
  const submit = async (input: TaskInput) => { if (editing) await updateTask(editing.id, input); else await addTask(input); setOpen(false); setEditing(undefined) }
  return <div className="dashboard-stack"><div className="page-intro"><div><span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span><h2>让计划，有条不紊<span className="accent-dot">.</span></h2><p>按截止日期安排工作，为重要的事留出时间。</p></div><button className="button primary" onClick={() => setOpen(true)}><Plus size={18} />新建任务</button></div>
    <div className="calendar-layout"><section className="panel calendar-panel"><div className="panel-header"><div><h2>{month.getFullYear()} 年 {month.getMonth() + 1} 月</h2><p>本月 {monthTasks.length} 项任务 · {monthTasks.filter(t => t.status === 'done').length} 项已完成</p></div><div className="calendar-controls"><button className="icon-button" aria-label="上个月" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button className="button secondary" onClick={() => { setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelected(dateKey()) }}>今天</button><button className="icon-button" aria-label="下个月" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div></div>
    <div className="calendar-scroll"><div className="calendar-week">{['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{days.map(day => { const key = dateKey(day); const items = tasks.filter(t => t.dueDate === key); return <button key={key} aria-label={`${key}，${items.length} 项任务`} aria-pressed={selected === key} className={`calendar-day ${day.getMonth() !== month.getMonth() ? 'outside' : ''} ${key === selected ? 'selected' : ''} ${key === dateKey() ? 'today' : ''}`} onClick={() => setSelected(key)}><span className="day-number">{day.getDate()}</span>{items.slice(0, 2).map(t => <span className={`calendar-event ${t.status === 'done' ? 'done' : t.priority}`} key={t.id}>{t.title}</span>)}{items.length > 2 && <small>+{items.length - 2} 项任务</small>}</button> })}</div></div></section>
    <section className="panel day-agenda"><div className="panel-header"><div><span className="eyebrow">DAILY AGENDA</span><h2>{selected}</h2><p>{dayTasks.length} 项任务</p></div><CalendarDays size={20} /></div><div className="agenda-list">{dayTasks.length ? dayTasks.map(task => <button className="agenda-task" key={task.id} onClick={() => { setEditing(task); setOpen(true) }}><span className={`priority-label ${task.priority}`}>{priorityLabels[task.priority]}</span><strong>{task.title}</strong><small>{statusLabels[task.status]}</small></button>) : <div className="empty-inline">这一天还没有任务<br />为计划留一个位置吧。</div>}<button className="button secondary" onClick={() => setOpen(true)}><Plus size={16} />为这一天添加任务</button></div></section></div>
    {open && <TaskForm task={editing} initialDate={selected} onSubmit={submit} onClose={() => { setOpen(false); setEditing(undefined) }} />}
  </div>
}
