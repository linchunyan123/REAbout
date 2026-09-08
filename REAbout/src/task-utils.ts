import type { Task, TaskPriority, TaskStatus } from './types/task'

export const statusLabels: Record<TaskStatus, string> = { todo: '待处理', 'in-progress': '进行中', done: '已完成' }
export const priorityLabels: Record<TaskPriority, string> = { low: '低优先级', medium: '中优先级', high: '高优先级' }
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function isOverdue(task: Task, today = dateKey()) { return task.status !== 'done' && task.dueDate < today }
export function filterTasks(tasks: Task[], params: URLSearchParams) {
  const q = (params.get('q') || '').trim().toLowerCase()
  const status = params.get('status') || 'all'
  const priority = params.get('priority') || 'all'
  const due = params.get('due') || 'all'
  const today = dateKey()
  const week = new Date(); week.setDate(week.getDate() + 6)
  const weights = { high: 0, medium: 1, low: 2 }
  return tasks.filter(task =>
    (!q || `${task.title} ${task.description}`.toLowerCase().includes(q)) &&
    (status === 'all' || task.status === status) &&
    (priority === 'all' || task.priority === priority) &&
    (due === 'all' || (due === 'overdue' ? isOverdue(task, today) : task.status !== 'done' && (due === 'today' ? task.dueDate === today : task.dueDate >= today && task.dueDate <= dateKey(week))))
  ).sort((a, b) => {
    switch (params.get('sort')) {
      case 'due': return a.dueDate.localeCompare(b.dueDate) || weights[a.priority] - weights[b.priority]
      case 'priority': return weights[a.priority] - weights[b.priority] || a.dueDate.localeCompare(b.dueDate)
      case 'title': return a.title.localeCompare(b.title, 'zh-CN')
      default: return b.createdAt.localeCompare(a.createdAt)
    }
  })
}
export function tasksCsv(tasks: Task[]) {
  const cell = (value: string) => `"${(/^[\s]*[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
  return '\uFEFF' + [['任务名称', '描述', '状态', '优先级', '截止日期'], ...tasks.map(t => [t.title, t.description, statusLabels[t.status], priorityLabels[t.priority], t.dueDate])].map(row => row.map(cell).join(',')).join('\r\n')
}
