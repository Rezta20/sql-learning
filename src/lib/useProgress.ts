import { useEffect, useState } from 'react'
import { PROGRESS_EVENT, loadState } from './storage'
import type { StoredState } from '../types'

/** 訂閱進度：任何頁面存檔後，用這個 hook 的元件都會跟著更新。 */
export function useProgress(): StoredState {
  const [state, setState] = useState(() => loadState())
  useEffect(() => {
    const refresh = () => setState(loadState())
    window.addEventListener(PROGRESS_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return state
}
