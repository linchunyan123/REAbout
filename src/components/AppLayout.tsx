import { useState } from 'react'
import {
  Bell,
  CheckSquare2,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const navigation = [
  { to: '/dashboard', label: '概览', icon: LayoutDashboard },
  { to: '/tasks', label: '任务', icon: CheckSquare2 },
  { to: '/settings', label: '设置', icon: Settings },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '工作概览', subtitle: '掌握进度，安排今天的重点' },
  '/tasks': { title: '任务管理', subtitle: '集中管理和跟进所有任务' },
  '/settings': { title: '个人设置', subtitle: '管理你的偏好和通知方式' },
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const heading = titles[pathname] ?? titles['/dashboard']

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><CheckSquare2 size={21} /></span>
          <span>FocusBoard</span>
          <button className="icon-button sidebar-close" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">
            <X size={20} />
          </button>
        </div>

        <nav className="main-nav" aria-label="主导航">
          <span className="nav-label">工作区</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-summary">
          <div className="summary-ring" aria-hidden="true">68%</div>
          <div>
            <strong>本周进度</strong>
            <span>继续保持节奏</span>
          </div>
        </div>
        <div className="user-panel">
          <div className="avatar">林</div>
          <div><strong>林小北</strong><span>产品团队</span></div>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="关闭菜单" />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
            <Menu size={21} />
          </button>
          <div className="page-heading">
            <h1>{heading.title}</h1>
            <p>{heading.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <label className="quick-search">
              <Search size={17} />
              <input type="search" placeholder="快速搜索" aria-label="快速搜索" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'} title="切换主题">
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <button className="icon-button notification-button" aria-label="查看通知" title="通知">
              <Bell size={19} /><span />
            </button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}
