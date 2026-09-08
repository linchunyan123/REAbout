import { describe, expect, it } from 'vitest'
import { dateKey, filterTasks, isOverdue, tasksCsv } from './task-utils'
import type { Task } from './types/task'

const today = dateKey()
const task: Task = { id: 'one', title: '设计发布页面', description: '检查手机布局', status: 'todo', priority: 'high', dueDate: today, createdAt: new Date().toISOString() }
describe('task views', () => {
  it('combines search, status, priority, and dates without mutating the source', () => {
    const tasks: Task[] = [task, { ...task, id: 'two', priority: 'low' }, { ...task, id: 'three', status: 'done' }]
    expect(filterTasks(tasks, new URLSearchParams('q=手机&status=todo&priority=high&due=today'))).toEqual([task])
    expect(filterTasks(tasks, new URLSearchParams('priority=low'))).toHaveLength(1)
    expect(filterTasks(tasks, new URLSearchParams('q=不存在'))).toHaveLength(0)
    expect(tasks.map(t => t.id)).toEqual(['one', 'two', 'three'])
  })
  it('excludes completed tasks from overdue and includes exactly seven calendar dates', () => {
    expect(isOverdue({ ...task, dueDate: '2020-01-01' })).toBe(true)
    expect(isOverdue({ ...task, dueDate: '2020-01-01', status: 'done' })).toBe(false)
    const last = new Date(); last.setDate(last.getDate() + 6)
    const outside = new Date(); outside.setDate(outside.getDate() + 7)
    expect(filterTasks([task, { ...task, id: 'last', dueDate: dateKey(last) }, { ...task, id: 'outside', dueDate: dateKey(outside) }], new URLSearchParams('due=week')).map(t => t.id)).toEqual(['one', 'last'])
  })
  it('sorts by priority and due date, and quotes spreadsheet exports safely', () => {
    expect(filterTasks([{ ...task, id: 'low', priority: 'low' }, task], new URLSearchParams('sort=priority'))[0].id).toBe('one')
    const csv = tasksCsv([{ ...task, title: '=HYPERLINK("x")', description: '第一行,\n第二行' }])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"\'=HYPERLINK(""x"")"')
    expect(csv).toContain('"第一行,\n第二行"')
  })
})
