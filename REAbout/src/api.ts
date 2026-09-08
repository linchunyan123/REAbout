export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    })
  } catch { throw new Error('无法连接服务器，请检查网络后重试') }
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || `请求失败（${response.status}）`)
  }
  return response.status === 204 ? undefined as T : response.json()
}

export interface Settings {
  name: string
  position: string
  email: string
  bio: string
  notifications: { email: boolean; browser: boolean; weekly: boolean }
}
