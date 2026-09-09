import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type ToastCtx = (message: string) => void

const Ctx = createContext<ToastCtx>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [key, setKey] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    setKey((k) => k + 1)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2600)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const isXp = message?.includes('XP')

  return (
    <Ctx.Provider value={show}>
      {children}
      {message ? (
        <div
          key={key}
          role="status"
          data-testid="toast"
          className={
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-bold shadow-xl animate-pop ' +
            (isXp ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background')
          }
        >
          {message}
        </div>
      ) : null}
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  return useContext(Ctx)
}
