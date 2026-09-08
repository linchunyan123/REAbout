import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api, type Settings } from '../api'
import type { Task, TaskInput, TaskStatus } from '../types/task'

interface TaskContextValue {
  tasks: Task[]
  settings: Settings | null
  loading: boolean
  error: string
  reload: () => Promise<void>
  addTask: (input: TaskInput) => Promise<void>
  updateTask: (id: string, input: TaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  saveSettings: (input: Settings) => Promise<void>
}
const TaskContext = createContext<TaskContextValue | null>(null)
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)
  const reload = useCallback(async () => {
    const current = ++request.current
    setLoading(true)
    setError('')
    try {
      const [nextTasks, nextSettings] = await Promise.all([api<Task[]>('/tasks'), api<Settings>('/settings')])
      if (current !== request.current) return
      setTasks(nextTasks)
      setSettings(nextSettings)
    } catch (err) {
      if (current === request.current) setError((err as Error).message)
    } finally {
      if (current === request.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    void reload()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- this is a generation counter, not a DOM ref; invalidate the latest request on cleanup.
    return () => { request.current++ }
  }, [reload])
  const replace = (updated: Task) => setTasks(current => current.map(task => task.id === updated.id ? updated : task))
  const value: TaskContextValue = {
    tasks, settings, loading, error, reload,
    addTask: async input => {
      const created = await api<Task>('/tasks', 'POST', input)
      setTasks(current => [created, ...current])
    },
    updateTask: async (id, input) => replace(await api<Task>(`/tasks/${id}`, 'PUT', input)),
    deleteTask: async id => {
      await api(`/tasks/${id}`, 'DELETE', {})
      setTasks(current => current.filter(task => task.id !== id))
    },
    setTaskStatus: async (id, status) => replace(await api<Task>(`/tasks/${id}/status`, 'PATCH', { status })),
    saveSettings: async input => setSettings(await api<Settings>('/settings', 'PUT', input)),
  }
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
// oxlint-disable-next-line react/only-export-components -- colocated provider hook is the context's public API.
export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTasks must be used within TaskProvider')
  return context
}
