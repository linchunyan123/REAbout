import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { CalendarDays, Check, Circle, ClipboardList, Edit3, Plus, Search, Trash2, LayoutList, Columns3, Download, Copy, SlidersHorizontal, X } from 'lucide-react'
import { TaskForm } from '../components/TaskForm'
import { useTasks } from '../contexts/TaskContext'
import { filterTasks, isOverdue, priorityLabels, statusLabels, tasksCsv } from '../task-utils'
import type { Task, TaskInput, TaskStatus } from '../types/task'

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, setTaskStatus, batchTasks } = useTasks()
  const [params, setParams] = useSearchParams()
  const [editingTask, setEditingTask] = useState<Task>()
  const [selected, setSelected] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)
  const view = params.get('view') === 'board' ? 'board' : 'list'
  const filtered = filterTasks(tasks, params)
  const visibleSelected = selected.filter(id => filtered.some(t => t.id === id))
  const setParam = (key: string, value: string) => {
    setParams(current => { const next = new URLSearchParams(current); if (!value || value === 'all') next.delete(key); else next.set(key, value); return next }, { replace: true })
  }
  const run = async (action: () => Promise<void>, message = '修改已保存到云端') => {
    if (pending) return
    setPending(true); setError(''); setNotice('')
    try { await action(); setNotice(message) } catch (err) { setError((err as Error).message) } finally { setPending(false) }
  }
  const closeForm = () => { setParam('new', ''); setEditingTask(undefined) }
  const submit = async (input: TaskInput) => {
    if (editingTask) await updateTask(editingTask.id, input)
    else await addTask(input)
    closeForm(); setNotice(editingTask ? '任务已更新' : '任务已创建')
  }
  const batch = (action: TaskStatus | 'delete') => {
    if (action === 'delete' && !window.confirm(`确定永久删除选中的 ${visibleSelected.length} 项任务？此操作无法撤销。`)) return
    void run(async () => { await batchTasks(visibleSelected, action); setSelected([]) }, action === 'delete' ? '所选任务已删除' : '所选任务状态已更新')
  }
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([tasksCsv(filtered)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = 'FocusBoard-任务.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`已导出当前筛选的 ${filtered.length} 项任务`)
  }
  const renderTask = (task: Task) => <article key={task.id} draggable={view === 'board' && !pending} onDragStart={event => { event.dataTransfer.setData('text/plain', task.id); setDragging(task.id) }} onDragEnd={() => setDragging(null)} className={`task-row ${task.status === 'done' ? 'completed' : ''} ${dragging === task.id ? 'dragging' : ''}`}>
    {view === 'list' && <input className="task-select" type="checkbox" aria-label={`选择 ${task.title}`} checked={visibleSelected.includes(task.id)} disabled={pending} onChange={event => setSelected(event.target.checked ? [...selected, task.id] : selected.filter(id => id !== task.id))} />}
    <button className={`complete-button ${task.status === 'done' ? 'checked' : ''}`} disabled={pending} onClick={() => void run(() => setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done'))} aria-label={task.status === 'done' ? '标记为待处理' : '标记为已完成'}>{task.status === 'done' ? <Check size={17} /> : <Circle size={17} />}</button>
    <div className="task-copy"><button className="task-title" onClick={() => setEditingTask(task)}>{task.title}</button><p>{task.description || '添加描述，让下一步更清晰'}</p><div className="task-meta"><span className={`priority-label ${task.priority}`}>{priorityLabels[task.priority]}</span><span className={isOverdue(task) ? 'overdue' : ''}><CalendarDays size={14} />{task.dueDate}{isOverdue(task) && ' · 已逾期'}</span></div><select className="inline-status" aria-label={`${task.title} 的状态`} value={task.status} disabled={pending} onChange={event => void run(() => setTaskStatus(task.id, event.target.value as TaskStatus))}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <div className="task-actions"><button className="icon-button" title="编辑任务" aria-label={`编辑 ${task.title}`} onClick={() => setEditingTask(task)}><Edit3 size={15} /></button><button className="icon-button" title="复制任务" aria-label={`复制 ${task.title}`} disabled={pending} onClick={() => void run(() => addTask({ title: `${task.title.slice(0, 195)}（副本）`, description: task.description, priority: task.priority, dueDate: task.dueDate, status: 'todo' }), '任务副本已创建')}><Copy size={15} /></button><button className="icon-button danger" aria-label={`删除 ${task.title}`} disabled={pending} onClick={() => { if (window.confirm(`确定永久删除「${task.title}」？`)) void run(() => deleteTask(task.id), '任务已删除') }}><Trash2 size={15} /></button></div>
  </article>

  return <div className="tasks-page">
    <div className="page-intro"><div><span className="eyebrow">YOUR WORK, IN FOCUS</span><h2>把想法，变成进展<span className="accent-dot">.</span></h2><p>每一个小小的完成，都在让目标更近一步。</p></div><button className="button primary" onClick={() => setParam('new', '1')}><Plus size={18} />新建任务</button></div>
    {error && <p role="alert" className="feedback error">{error}</p>}{notice && <p role="status" className="feedback success"><Check size={16} />{notice}<button aria-label="关闭提示" onClick={() => setNotice('')}><X size={15} /></button></p>}
    <div className="task-toolbar"><div className="filter-tabs" aria-label="任务状态筛选">{[['all', '全部'], ...Object.entries(statusLabels)].map(([value, label]) => <button key={value} aria-pressed={(params.get('status') || 'all') === value} className={(params.get('status') || 'all') === value ? 'active' : ''} onClick={() => setParam('status', value)}>{label}<span>{value === 'all' ? tasks.length : tasks.filter(t => t.status === value).length}</span></button>)}</div><div className="view-switch"><button className={view === 'list' ? 'active' : ''} aria-pressed={view === 'list'} onClick={() => setParam('view', 'list')}><LayoutList size={16} />列表</button><button className={view === 'board' ? 'active' : ''} aria-pressed={view === 'board'} onClick={() => setParam('view', 'board')}><Columns3 size={16} />看板</button></div></div>
    <div className="panel filter-bar"><label className="list-search"><Search size={17} /><input type="search" value={params.get('q') || ''} onChange={event => setParam('q', event.target.value)} placeholder="搜索任务名称、描述…" aria-label="搜索任务" /></label><SlidersHorizontal size={16} /><select aria-label="优先级筛选" value={params.get('priority') || 'all'} onChange={event => setParam('priority', event.target.value)}><option value="all">全部优先级</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="截止日期筛选" value={params.get('due') || 'all'} onChange={event => setParam('due', event.target.value)}><option value="all">全部日期</option><option value="today">今天到期</option><option value="week">未来 7 天</option><option value="overdue">已逾期</option></select><select aria-label="任务排序" value={params.get('sort') || 'created'} onChange={event => setParam('sort', event.target.value)}><option value="created">最新创建</option><option value="due">截止日期</option><option value="priority">优先级</option><option value="title">任务名称</option></select><button className="button secondary" onClick={exportCsv} disabled={!filtered.length}><Download size={16} />导出</button>{['q', 'status', 'priority', 'due'].some(key => params.has(key)) && <button className="text-button" onClick={() => setParams({ view })}>清除筛选</button>}</div>
    {view === 'list' && filtered.length > 0 && <div className="selection-bar"><label><input type="checkbox" aria-label="选择当前任务" checked={visibleSelected.length === Math.min(filtered.length, 100)} disabled={pending} onChange={event => setSelected(event.target.checked ? filtered.slice(0, 100).map(t => t.id) : [])} />{visibleSelected.length ? `已选择 ${visibleSelected.length} 项` : `共 ${filtered.length} 项 · 最多批量选择 100 项`}</label>{visibleSelected.length > 0 && <><button disabled={pending || visibleSelected.length > 100} onClick={() => batch('in-progress')}>开始处理</button><button disabled={pending || visibleSelected.length > 100} onClick={() => batch('done')}>标记完成</button><button className="danger" disabled={pending || visibleSelected.length > 100} onClick={() => batch('delete')}>删除</button></>}</div>}
    {view === 'board' ? <div className="board-grid">{(Object.keys(statusLabels) as TaskStatus[]).map(status => <section className={`board-column ${status}`} key={status} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (tasks.some(task => task.id === id && task.status !== status)) void run(() => setTaskStatus(id, status)); setDragging(null) }}><header><span className={`status-dot ${status}`} /><h3>{statusLabels[status]}</h3><span>{filtered.filter(t => t.status === status).length}</span><button className="icon-button" aria-label={`新建${statusLabels[status]}任务`} onClick={() => { setParams(current => { const next = new URLSearchParams(current); next.set('newStatus', status); next.set('new', '1'); return next }, { replace: true }) }}><Plus size={16} /></button></header>{filtered.filter(t => t.status === status).map(renderTask)}<p className="column-hint">{filtered.some(t => t.status === status) ? '拖动卡片或使用状态菜单移动任务' : '暂无任务 · 将任务拖到这里'}</p></section>)}</div> : <section className="panel task-list-panel">{filtered.length ? <div className="task-list">{filtered.map(renderTask)}</div> : <div className="empty-state"><span><ClipboardList size={30} /></span><h3>{tasks.length ? '没有符合条件的任务' : '从第一项任务开始'}</h3><p>{tasks.length ? '调整筛选条件，找到你需要关注的工作。' : '点击右上角「新建任务」，把计划变成行动。'}</p></div>}</section>}
    {(params.get('new') === '1' || editingTask) && <TaskForm task={editingTask} initialStatus={(['todo', 'in-progress', 'done'].includes(params.get('newStatus') || '') ? params.get('newStatus') : 'todo') as TaskStatus} onSubmit={submit} onClose={closeForm} />}
  </div>
}
