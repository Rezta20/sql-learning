import { Check, CloudOff, Download, ExternalLink, RefreshCw, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '../components/Toast'
import { connect, disconnect, exportJson, getLastSync, getSyncStatus, getToken, importJson, SYNC_EVENT, syncNow } from '../lib/sync'

const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=sql-learning-sync'

function fmt(iso: string) {
  if (!iso) return '還沒同步過'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function SyncPage() {
  const toast = useToast()
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [, bump] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const f = () => bump((n) => n + 1)
    window.addEventListener(SYNC_EVENT, f)
    return () => window.removeEventListener(SYNC_EVENT, f)
  }, [])

  const connected = Boolean(getToken())
  const { status, error } = getSyncStatus()

  const doConnect = async () => {
    if (!token.trim()) return
    setBusy(true)
    try {
      const r = await connect(token)
      toast(r === 'pulled' ? '已連線，從雲端拉回進度' : '已連線，進度已上傳')
      setToken('')
    } catch (e) {
      toast(`連不上：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  const doSync = async () => {
    setBusy(true)
    try {
      const r = await syncNow()
      toast(r === 'pulled' ? '雲端較新，已拉回' : r === 'pushed' ? '已上傳' : '兩邊一樣')
    } catch (e) {
      toast(`同步失敗：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sql-learning-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    try {
      importJson(await file.text())
      toast('已匯入備份')
    } catch (e) {
      toast(e instanceof Error ? e.message : '匯入失敗')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="crumbs m-0">
        <Link to="/">← 今天</Link>
      </p>
      <h1 className="m-0 text-2xl font-bold tracking-tight">雲端同步</h1>
      <p className="m-0 text-sm text-muted-foreground">
        進度會存成你 GitHub 帳號裡的一個<b>私人 Gist</b>。換電腦、清瀏覽資料，只要再貼同一個 token，進度就回來。
      </p>

      <section className="rounded-2xl border bg-card p-5" data-testid="sync-card" data-status={status}>
        {connected ? (
          <>
            <div className="flex items-center gap-2 font-semibold">
              {status === 'error' ? <CloudOff className="size-5 text-destructive" /> : <Check className="size-5 text-success" />}
              {status === 'error' ? `同步出錯：${error}` : status === 'syncing' ? '同步中…' : '已連線 GitHub'}
            </div>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">上次同步：{fmt(getLastSync())}。之後每次打勾都會自動上傳。</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="go" onClick={doSync} disabled={busy}>
                <RefreshCw className={busy ? 'animate-spin' : ''} /> 現在同步
              </Button>
              <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => disconnect()}>
                解除連線
              </Button>
            </div>
          </>
        ) : (
          <>
            <ol className="m-0 list-decimal space-y-2 pl-5 text-sm">
              <li>
                按這裡建立 token：
                <a href={TOKEN_URL} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 font-semibold">
                  GitHub → New token <ExternalLink className="size-3.5" />
                </a>
                <span className="block text-muted-foreground">頁面已幫你勾好 gist。Expiration 選 <b>No expiration</b>，按最下面綠色 Generate token。</span>
              </li>
              <li>
                複製出現的 <code>ghp_…</code>（只會顯示一次），貼到下面：
              </li>
            </ol>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                className="h-11 flex-1 rounded-xl border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="sync-token"
                autoComplete="off"
              />
              <Button type="button" variant="go" size="lg" className="h-11" onClick={doConnect} disabled={busy || !token.trim()} data-testid="sync-connect">
                {busy ? <RefreshCw className="animate-spin" /> : null} 連線
              </Button>
            </div>
            {error ? <p className="mt-2 mb-0 text-sm text-destructive">{error}</p> : null}
            <p className="mt-3 mb-0 text-xs text-muted-foreground">token 只存在這台瀏覽器，只能讀寫 gist，動不到你的 repo。</p>
          </>
        )}
      </section>

      <section className="rounded-2xl border bg-card/60 p-5">
        <h2 className="m-0 text-base font-semibold">備份檔（不用 GitHub 也行）</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">下載一個 JSON，換電腦時匯入。</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="soft" onClick={doExport} data-testid="export-json">
            <Download /> 下載備份
          </Button>
          <Button type="button" variant="soft" onClick={() => fileRef.current?.click()}>
            <Upload /> 匯入備份
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => doImport(e.target.files?.[0])} />
        </div>
      </section>
    </div>
  )
}
