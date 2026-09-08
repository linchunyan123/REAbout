import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { initialTasks } from '../data/initialTasks'
import type { Task, TaskInput, TaskStatus } from '../types/task'

interface TaskContextValue {
  tasks: Task[]
  addTask: (input: TaskInput) => void
  updateTask: (id: string, input: TaskInput) => void
  deleteTask: (id: string) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
}

const STORAGE_KEY = 'focusboard.tasks'
const TaskContext = createContext<TaskContextValue | null>(null)

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Task[]) : initialTasks
  } catch {
    return initialTasks
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)

  const persist = (nextTasks: Task[]) => {
    setTasks(nextTasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks))
  }

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      addTask: (input) =>
        persist([
          {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
          ...tasks,
        ]),
      updateTask: (id, input) =>
        persist(tasks.map((task) => (task.id === id ? { ...task, ...input } : task))),
      deleteTask: (id) => persist(tasks.filter((task) => task.id !== id)),
      setTaskStatus: (id, status) =>
        persist(tasks.map((task) => (task.id === id ? { ...task, status } : task))),
    }),
    [tasks],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- colocated provider hook is the context's public API.
export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTasks must be used within TaskProvider')
  return context
}
