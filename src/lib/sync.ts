import { PROGRESS_EVENT, loadState, replaceState } from './storage'
import type { StoredState } from '../types'

/**
 * 雲端同步：把進度存成 GitHub 私人 Gist 裡的一個 JSON 檔。
 * - 只需要一個 scope=gist 的 token（貼一次，存在這台瀏覽器）
 * - 換電腦／清瀏覽資料：再貼同一個 token，會自動找回同一個 gist
 * - 新舊比對只看 savedAt，誰新誰贏
 */
export const GIST_FILE = 'sql-learning-progress.json'
const GIST_DESC = 'Sasha 的 SQL 冒險：學習進度（App 自動同步）'
const TOKEN_KEY = 'sql-learning:gh-token'
const GIST_KEY = 'sql-learning:gist-id'
const LAST_KEY = 'sql-learning:last-sync'
export const SYNC_EVENT = 'sql-sync-changed'

export type SyncStatus = 'off' | 'idle' | 'syncing' | 'error'

let status: SyncStatus = 'off'
let lastError = ''
let timer: ReturnType<typeof setTimeout> | undefined
let started = false

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}
export function getGistId(): string {
  return localStorage.getItem(GIST_KEY) ?? ''
}
export function getLastSync(): string {
  return localStorage.getItem(LAST_KEY) ?? ''
}
export function getSyncStatus(): { status: SyncStatus; error: string } {
  return { status: getToken() ? status : 'off', error: lastError }
}

function emit(next: SyncStatus, err = '') {
  status = next
  lastError = err
  window.dispatchEvent(new Event(SYNC_EVENT))
}

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${getToken()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const msg = res.status === 401 ? 'token 無效或過期' : res.status === 404 ? '找不到 gist' : `GitHub 回 ${res.status}`
    throw new Error(msg)
  }
  return res
}

type Gist = { id: string; updated_at: string; files: Record<string, { raw_url: string; content?: string; truncated?: boolean }> }

/** 找回或建立 gist。回傳 gist id。 */
async function ensureGist(): Promise<string> {
  const known = getGistId()
  if (known) return known
  const list = (await (await gh('/gists?per_page=100')).json()) as Gist[]
  const found = list.find((g) => g.files[GIST_FILE])
  if (found) {
    localStorage.setItem(GIST_KEY, found.id)
    return found.id
  }
  const created = (await (
    await gh('/gists', {
      method: 'POST',
      body: JSON.stringify({ description: GIST_DESC, public: false, files: { [GIST_FILE]: { content: JSON.stringify(loadState(), null, 2) } } }),
    })
  ).json()) as Gist
  localStorage.setItem(GIST_KEY, created.id)
  return created.id
}

async function readRemote(id: string): Promise<StoredState | null> {
  const g = (await (await gh(`/gists/${id}`)).json()) as Gist
  const f = g.files[GIST_FILE]
  if (!f) return null
  const text = f.truncated || f.content === undefined ? await (await fetch(f.raw_url)).text() : f.content
  try {
    return JSON.parse(text) as StoredState
  } catch {
    return null
  }
}

async function writeRemote(id: string, state: StoredState) {
  await gh(`/gists/${id}`, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(state, null, 2) } } }) })
  localStorage.setItem(LAST_KEY, new Date().toISOString())
}

/** 拉雲端：雲端較新就覆蓋本地；本地較新就推上去。 */
export async function syncNow(): Promise<'pulled' | 'pushed' | 'same'> {
  if (!getToken()) return 'same'
  emit('syncing')
  try {
    const id = await ensureGist()
    const remote = await readRemote(id)
    const local = loadState()
    const r = remote?.savedAt ?? ''
    const l = local.savedAt ?? ''
    let result: 'pulled' | 'pushed' | 'same' = 'same'
    if (remote && r > l) {
      replaceState(remote)
      result = 'pulled'
    } else if (l > r) {
      await writeRemote(id, local)
      result = 'pushed'
    }
    localStorage.setItem(LAST_KEY, new Date().toISOString())
    emit('idle')
    return result
  } catch (e) {
    emit('error', e instanceof Error ? e.message : String(e))
    throw e
  }
}

/** 貼 token → 驗證 → 立刻同步一次 */
export async function connect(token: string): Promise<'pulled' | 'pushed' | 'same'> {
  localStorage.setItem(TOKEN_KEY, token.trim())
  localStorage.removeItem(GIST_KEY)
  try {
    await gh('/user')
  } catch (e) {
    localStorage.removeItem(TOKEN_KEY)
    emit('off', e instanceof Error ? e.message : String(e))
    throw e
  }
  return syncNow()
}

export function disconnect() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(GIST_KEY)
  localStorage.removeItem(LAST_KEY)
  emit('off')
}

/** App 啟動呼叫一次：先拉一次，之後每次進度變動 2 秒後推。 */
export function startAutoSync() {
  if (started || typeof window === 'undefined') return
  started = true
  if (getToken()) syncNow().catch(() => {})
  window.addEventListener(PROGRESS_EVENT, () => {
    if (!getToken()) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      syncNow().catch(() => {})
    }, 2000)
  })
}

/** 備份檔（不用 GitHub 也能帶著走） */
export function exportJson(): string {
  return JSON.stringify(loadState(), null, 2)
}
export function importJson(text: string): void {
  const parsed = JSON.parse(text) as StoredState
  if (typeof parsed !== 'object' || !parsed || !('cards' in parsed)) throw new Error('這不是進度備份檔')
  parsed.savedAt = new Date().toISOString()
  replaceState(parsed)
}
