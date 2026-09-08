import type { Task } from '../types/task'

const today = new Date()
const dateAfter = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: '整理本周产品需求',
    description: '汇总反馈并确认下个版本的优先级。',
    status: 'in-progress',
    priority: 'high',
    dueDate: dateAfter(1),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: '更新项目说明文档',
    description: '补充本地开发、测试和发布流程。',
    status: 'todo',
    priority: 'medium',
    dueDate: dateAfter(3),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-3',
    title: '检查移动端适配',
    description: '验证导航、表单和列表在小屏设备上的表现。',
    status: 'done',
    priority: 'medium',
    dueDate: dateAfter(-1),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'task-4',
    title: '准备周会数据',
    description: '整理核心指标和项目进度。',
    status: 'todo',
    priority: 'low',
    dueDate: dateAfter(5),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
]
