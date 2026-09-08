export function invalid(message) {
  return Object.assign(new Error(message), { status: 400 })
}

export function validateBatch(body) {
  if (!body || !Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 100 || body.ids.some(id => typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) throw invalid('请选择 1–100 个有效任务')
  if (!['todo', 'in-progress', 'done', 'delete'].includes(body.action)) throw invalid('批量操作无效')
  return { ids: [...new Set(body.ids)], action: body.action }
}

export function validateTask(body, statusOnly = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw invalid('请求内容必须是对象')
  if (!['todo', 'in-progress', 'done'].includes(body.status)) throw invalid('任务状态无效')
  if (statusOnly) return { status: body.status }
  const { title, description, priority, dueDate } = body
  if (typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 200) throw invalid('任务名称须为 2–200 个字符')
  if (typeof description !== 'string' || description.length > 5000) throw invalid('描述不能超过 5000 个字符')
  if (!['low', 'medium', 'high'].includes(priority)) throw invalid('优先级无效')
  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || dueDate < '0001-01-01' || !Number.isFinite(Date.parse(dueDate)) || new Date(dueDate).toISOString().slice(0, 10) !== dueDate) throw invalid('截止日期无效')
  return { title: title.trim(), description: description.trim(), status: body.status, priority, dueDate }
}

export function validateSettings(body) {
  if (!body || typeof body !== 'object') throw invalid('设置格式无效')
  for (const [key, max] of Object.entries({ name: 100, position: 100, email: 254, bio: 2000 })) {
    if (typeof body[key] !== 'string' || body[key].length > max) throw invalid('个人资料格式或长度无效')
  }
  if (!body.name.trim()) throw invalid('请填写姓名')
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw invalid('邮箱格式无效')
  if (!body.notifications || ['email', 'browser', 'weekly'].some(key => typeof body.notifications[key] !== 'boolean')) throw invalid('通知偏好格式无效')
  return { name: body.name.trim(), position: body.position.trim(), email: body.email.trim(), bio: body.bio.trim(), notifications: Object.fromEntries(['email', 'browser', 'weekly'].map(key => [key, body.notifications[key]])) }
}
