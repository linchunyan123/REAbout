import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, Mail, Smartphone, UserRound } from 'lucide-react'

export function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, browser: true, weekly: false })

  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="settings-grid">
      <section className="panel settings-panel">
        <div className="section-heading"><span className="heading-icon"><UserRound size={19} /></span><div><h2>个人资料</h2><p>这些信息会展示在你的工作区中</p></div></div>
        <form className="settings-form" onSubmit={saveProfile}>
          <div className="profile-photo-row"><div className="avatar large">林</div><div><button type="button" className="button secondary small">更换头像</button><p>支持 JPG、PNG，最大 2MB</p></div></div>
          <div className="form-row"><label>姓名<input defaultValue="林小北" /></label><label>职位<input defaultValue="产品经理" /></label></div>
          <label>邮箱<input type="email" defaultValue="lin@example.com" /></label>
          <label>个人简介<textarea rows={4} defaultValue="关注产品体验和团队协作。" /></label>
          <div className="settings-actions"><button className="button primary" type="submit">保存资料</button>{saved && <span className="save-message"><Check size={16} />已保存</span>}</div>
        </form>
      </section>

      <section className="panel settings-panel">
        <div className="section-heading"><span className="heading-icon"><Mail size={19} /></span><div><h2>通知设置</h2><p>选择你希望接收消息的方式</p></div></div>
        <div className="toggle-list">
          <Toggle icon={<Mail size={18} />} title="邮件通知" description="任务到期和评论提醒" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
          <Toggle icon={<Smartphone size={18} />} title="浏览器通知" description="在工作期间及时收到更新" checked={notifications.browser} onChange={() => setNotifications({ ...notifications, browser: !notifications.browser })} />
          <Toggle icon={<Check size={18} />} title="每周摘要" description="每周一发送上周工作汇总" checked={notifications.weekly} onChange={() => setNotifications({ ...notifications, weekly: !notifications.weekly })} />
        </div>
      </section>
    </div>
  )
}

function Toggle({ icon, title, description, checked, onChange }: { icon: ReactNode; title: string; description: string; checked: boolean; onChange: () => void }) {
  return <label className="toggle-row"><span className="toggle-icon">{icon}</span><span className="toggle-copy"><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={onChange} /><span className="toggle-control" /></label>
}
