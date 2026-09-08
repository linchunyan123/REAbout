import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { TaskProvider } from './contexts/TaskContext'
import { ThemeProvider } from './contexts/ThemeContext'

function renderApp(route = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <TaskProvider><App /></TaskProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('FocusBoard', () => {
  beforeEach(() => localStorage.clear())

  it('renders the dashboard metrics', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: '工作概览' })).toBeInTheDocument()
    expect(screen.getByText('全部任务')).toBeInTheDocument()
  })

  it('creates a task from the tasks page', async () => {
    const user = userEvent.setup()
    renderApp('/tasks')
    await user.click(screen.getByRole('button', { name: '新建任务' }))
    await user.type(screen.getByLabelText('任务名称'), '编写发布说明')
    await user.click(screen.getByRole('button', { name: '创建任务' }))
    expect(screen.getByText('编写发布说明')).toBeInTheDocument()
  })
})
