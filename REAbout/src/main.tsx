import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TaskProvider } from './contexts/TaskContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
