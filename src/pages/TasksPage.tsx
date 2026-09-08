import { useMemo, useState } from 'react'
import { CalendarDays, Check, Circle, ClipboardList, Edit3, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import { TaskForm } from '../components/TaskForm'
import { useTasks } from '../contexts/TaskContext'
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../types/task'

const statusLabels: Record<TaskStatus, string> = { todo: '待处理', 'in-progress': '进行中', done: '已完成' }
const priorityLabels: Record<TaskPriority, string> = { low: '低优先级', medium: '中优先级', high: '高优先级' }
type Filter = 'all' | TaskStatus

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, setTaskStatus } = useTasks()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [menuId, setMenuId] = useState<string | null>(null)

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = filter === 'all' || task.status === filter
    const normalized = query.trim().toLowerCase()
    const matchesQuery = !normalized || task.title.toLowerCase().includes(normalized) || task.description.toLowerCase().includes(normalized)
    return matchesStatus && matchesQuery
  }), [filter, query, tasks])

  const openEdit = (task: Task) => { setEditingTask(task); setFormOpen(true); setMenuId(null) }
  const closeForm = () => { setFormOpen(false); setEditingTask(undefined) }
  const submitForm = (input: TaskInput) => {
    if (editingTask) updateTask(editingTask.id, input)
    else addTask(input)
    closeForm()
  }

  return (
    <div className="tasks-page">
      <div className="task-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="任务状态筛选">
          {([['all', '全部'], ['todo', '待处理'], ['in-progress', '进行中'], ['done', '已完成']] as const).map(([value, label]) => (
            <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}<span>{value === 'all' ? tasks.length : tasks.filter((task) => task.status === value).length}</span></button>
          ))}
        </div>
        <button className="button primary" onClick={() => setFormOpen(true)}><Plus size={18} />新建任务</button>
      </div>

      <section className="panel task-list-panel">
        <div className="list-toolbar"><label className="list-search"><Search size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务..." aria-label="搜索任务" /></label><span>显示 {filteredTasks.length} 项任务</span></div>
        {filteredTasks.length ? <div className="task-list">{filteredTasks.map((task) => (
          <article className={`task-row ${task.status === 'done' ? 'completed' : ''}`} key={task.id}>
            <button className={`complete-button ${task.status === 'done' ? 'checked' : ''}`} onClick={() => setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')} aria-label={task.status === 'done' ? '标记为待处理' : '标记为已完成'}>{task.status === 'done' ? <Check size={16} /> : <Circle size={16} />}</button>
            <div className="task-copy"><strong>{task.title}</strong><p>{task.description || '暂无任务描述'}</p><div className="task-meta"><span className={`priority-label ${task.priority}`}>{priorityLabels[task.priority]}</span><span><CalendarDays size={14} />{formatDate(task.dueDate)}</span><span className={`status-label ${task.status}`}>{statusLabels[task.status]}</span></div></div>
            <div className="row-menu-wrap"><button className="icon-button row-menu-button" onClick={() => setMenuId(menuId === task.id ? null : task.id)} aria-label="任务操作"><MoreHorizontal size={19} /></button>{menuId === task.id && <div className="context-menu"><button onClick={() => openEdit(task)}><Edit3 size={16} />编辑任务</button><button className="danger" onClick={() => { deleteTask(task.id); setMenuId(null) }}><Trash2 size={16} />删除任务</button></div>}</div>
          </article>
        ))}</div> : <div className="empty-state"><span><ClipboardList size={29} /></span><h3>没有找到任务</h3><p>{query ? '尝试调整搜索关键词或筛选条件。' : '创建第一项任务，开始安排工作。'}</p><button className="button primary" onClick={() => setFormOpen(true)}><Plus size={17} />新建任务</button></div>}
      </section>
      {formOpen && <TaskForm task={editingTask} onSubmit={submitForm} onClose={closeForm} />}
    </div>
  )
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (parsed.getTime() === today.getTime()) return '今天截止'
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(parsed)
}
