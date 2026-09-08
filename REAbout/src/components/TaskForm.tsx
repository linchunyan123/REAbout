import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../types/task'

interface TaskFormProps {
  task?: Task
  onSubmit: (input: TaskInput) => Promise<void>
  onClose: () => void
}

const emptyForm: TaskInput = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: new Date().toISOString().slice(0, 10),
}

export function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const [form, setForm] = useState<TaskInput>(task ?? emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => event.key === 'Escape' && !saving && onClose()
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, saving])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (form.title.trim().length < 2) {
      setError('任务名称至少需要 2 个字符')
      return
    }
    setSaving(true)
    setError('')
    try { await onSubmit({ ...form, title: form.title.trim(), description: form.description.trim() }) }
    catch (err) { setError((err as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <div className="modal-header">
          <div><h2 id="task-form-title">{task ? '编辑任务' : '新建任务'}</h2><p>填写任务信息并设置优先级</p></div>
          <button className="icon-button" disabled={saving} onClick={onClose} aria-label="关闭"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="task-form">
          <fieldset disabled={saving} className="form-fields">
          <label>任务名称<input autoFocus value={form.title} onChange={(event) => { setForm({ ...form, title: event.target.value }); setError('') }} placeholder="例如：完成项目周报" />{error && <span className="field-error">{error}</span>}</label>
          <label>任务描述<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="补充任务目标或注意事项" /></label>
          <div className="form-row">
            <label>状态<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}><option value="todo">待处理</option><option value="in-progress">进行中</option><option value="done">已完成</option></select></label>
            <label>优先级<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></label>
          </div>
          <label>截止日期<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required /></label>
          <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>取消</button><button type="submit" className="button primary">{task ? '保存修改' : '创建任务'}</button></div>
          </fieldset>
        </form>
      </section>
    </div>
  )
}
