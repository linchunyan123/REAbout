import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="not-found-icon"><FileQuestion size={34} /></span>
      <span className="error-code">404</span>
      <h1>页面不存在</h1>
      <p>你访问的页面可能已被移动或删除。</p>
      <Link className="button primary" to="/dashboard"><ArrowLeft size={17} />返回概览</Link>
    </main>
  )
}
