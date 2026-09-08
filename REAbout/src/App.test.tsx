import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { TaskProvider } from './contexts/TaskContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { initialTasks } from './data/initialTasks'

function renderApp(route = '/dashboard') {
  return render(<MemoryRouter initialEntries={[route]}><ThemeProvider><TaskProvider><App /></TaskProvider></ThemeProvider></MemoryRouter>)
}
const settings = { name: '测试用户', position: '开发', email: '', bio: '', notifications: { email: false, browser: false, weekly: false } }
describe('FocusBoard API integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/settings') return new Response(JSON.stringify(options?.method === 'PUT' ? JSON.parse(options.body as string) : settings))
      if (options?.method === 'POST') return new Response(JSON.stringify({ ...JSON.parse(options.body as string), id: 'new-task', createdAt: new Date().toISOString() }), { status: 201 })
      return new Response(JSON.stringify(initialTasks))
    }))
  })
  afterEach(() => vi.unstubAllGlobals())
  it('loads dashboard metrics and cloud profile', async () => {
    renderApp()
    expect(await screen.findByText('全部任务')).toBeInTheDocument()
    expect(screen.getByText('你好，测试用户')).toBeInTheDocument()
  })
  it('creates a task through the server', async () => {
    const user = userEvent.setup()
    renderApp('/tasks')
    await user.click(await screen.findByRole('button', { name: '新建任务' }))
    await user.type(screen.getByLabelText('任务名称'), '编写发布说明')
    await user.click(screen.getByRole('button', { name: '创建任务' }))
    expect(await screen.findByText('编写发布说明')).toBeInTheDocument()
    expect(localStorage.getItem('focusboard.tasks')).toBeNull()
  })
  it('keeps form input on server failure and supports retry', async () => {
    const user = userEvent.setup()
    renderApp('/tasks')
    await user.click(await screen.findByRole('button', { name: '新建任务' }))
    await user.type(screen.getByLabelText('任务名称'), '保留失败内容')
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ message: '暂时不可用' }), { status: 503 }))
    await user.click(screen.getByRole('button', { name: '创建任务' }))
    expect(await screen.findByText('暂时不可用')).toBeInTheDocument()
    expect(screen.getByLabelText(/任务名称/)).toHaveValue('保留失败内容')
    await user.click(screen.getByRole('button', { name: '创建任务' }))
    expect(await screen.findByText('保留失败内容')).toBeInTheDocument()
  })
  it('shows a retry action when initial loading fails', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'))
    const user = userEvent.setup()
    renderApp()
    await user.click(await screen.findByRole('button', { name: '重新加载' }))
    expect(await screen.findByText('全部任务')).toBeInTheDocument()
  })
  it('persists profile and notification preferences', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    const name = await screen.findByLabelText('姓名')
    await user.clear(name)
    await user.type(name, '新名字')
    await user.click(screen.getByRole('checkbox', { name: /邮件通知/ }))
    await user.click(screen.getByRole('button', { name: '保存资料和偏好' }))
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/settings', expect.objectContaining({ method: 'PUT', body: expect.stringContaining('新名字') })))
    expect(await screen.findByText('已保存到云端')).toBeInTheDocument()
  })
})

it('opens a creation dialog directly from the dashboard', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith('settings') ? settings : initialTasks))))
  renderApp()
  await userEvent.click(await screen.findByRole('link', { name: '新建任务' }))
  expect(await screen.findByRole('dialog', { name: '新建任务' })).toBeInTheDocument()
  vi.unstubAllGlobals()
})

it('supports board status changes, date planning, and combined filters', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith('settings') ? settings : initialTasks))))
  const user = userEvent.setup()
  renderApp('/tasks?view=board&priority=high')
  await screen.findByRole('button', { name: '看板' })
  expect(screen.getByLabelText('优先级筛选')).toHaveValue('high')
  await user.click(screen.getByRole('button', { name: '新建进行中任务' }))
  expect(await screen.findByLabelText('状态')).toHaveValue('in-progress')
  await user.click(screen.getByRole('button', { name: '取消' }))
  await user.click(screen.getByRole('link', { name: '日历计划' }))
  await user.click(await screen.findByRole('button', { name: '为这一天添加任务' }))
  expect(await screen.findByLabelText('截止日期')).toHaveValue(new Date().toLocaleDateString('en-CA'))
  vi.unstubAllGlobals()
})
