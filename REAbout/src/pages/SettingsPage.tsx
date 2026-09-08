import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, Mail, Smartphone, UserRound } from 'lucide-react'
import { useTasks } from '../contexts/TaskContext'

export function SettingsPage() {
  const { settings, saveSettings } = useTasks()
  const [form, setForm] = useState(settings!)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const change = (key: 'name' | 'position' | 'email' | 'bio', value: string) => { setForm({ ...form, [key]: value }); setSaved(false) }
  const toggle = (key: 'email' | 'browser' | 'weekly') => { setForm({ ...form, notifications: { ...form.notifications, [key]: !form.notifications[key] } }); setSaved(false) }
  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    setSaving(true); setSaved(false); setError('')
    try { await saveSettings(form); setSaved(true) }
    catch (err) { setError((err as Error).message) }
    finally { setSaving(false) }
  }
  return (
    <form onSubmit={saveProfile}>
      <fieldset disabled={saving} className="form-fields settings-grid">
        <section className="panel settings-panel">
          <div className="section-heading"><span className="heading-icon"><UserRound size={19} /></span><div><h2>个人资料</h2><p>保存后同步到云端工作区</p></div></div>
          <div className="settings-form">
            <div className="profile-photo-row"><div className="avatar large">{form.name.slice(0, 1) || '我'}</div><p>头像根据姓名自动生成</p></div>
            <div className="form-row"><label>姓名<input required maxLength={100} value={form.name} onChange={e => change('name', e.target.value)} /></label><label>职位<input maxLength={100} value={form.position} onChange={e => change('position', e.target.value)} /></label></div>
            <label>邮箱<input type="email" maxLength={254} value={form.email} onChange={e => change('email', e.target.value)} /></label>
            <label>个人简介<textarea rows={4} maxLength={2000} value={form.bio} onChange={e => change('bio', e.target.value)} /></label>
            {error && <p role="alert" className="field-error">{error}</p>}
            <div className="settings-actions"><button className="button primary" type="submit">{saving ? '正在保存…' : '保存资料和偏好'}</button>{saved && <span role="status" className="save-message"><Check size={16} />已保存到云端</span>}</div>
          </div>
        </section>
        <section className="panel settings-panel">
          <div className="section-heading"><span className="heading-icon"><Mail size={19} /></span><div><h2>通知偏好</h2><p>偏好会随资料保存；通知发送服务尚未启用</p></div></div>
          <div className="toggle-list">
            <Toggle icon={<Mail size={18} />} title="邮件通知" description="任务到期提醒偏好" checked={form.notifications.email} onChange={() => toggle('email')} />
            <Toggle icon={<Smartphone size={18} />} title="浏览器通知" description="工作区更新提醒偏好" checked={form.notifications.browser} onChange={() => toggle('browser')} />
            <Toggle icon={<Check size={18} />} title="每周摘要" description="每周工作汇总偏好" checked={form.notifications.weekly} onChange={() => toggle('weekly')} />
          </div>
        </section>
      </fieldset>
    </form>
  )
}
function Toggle({ icon, title, description, checked, onChange }: { icon: ReactNode; title: string; description: string; checked: boolean; onChange: () => void }) {
  return <label className="toggle-row"><span className="toggle-icon">{icon}</span><span className="toggle-copy"><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={onChange} /><span className="toggle-control" /></label>
}
