import { Button } from '@/components/ui/button'
import { copyText } from '../lib/clipboard'
import { messages } from '../lib/messages'
import { useToast } from './Toast'

/** 角落兩顆：太多了／卡住。其他動作都在流程裡的主按鈕。 */
export function MiniCommands() {
  const toast = useToast()
  const send = async (text: string, label: string) => {
    const ok = await copyText(text)
    toast(ok ? `「${label}」已複製 → 聊天框 Cmd+V` : '複製失敗')
  }
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-2" data-testid="mini-cmds">
      <Button
        type="button"
        variant="soft"
        size="sm"
        className="rounded-full bg-red-50 text-red-700 ring-red-200 hover:bg-red-100"
        onClick={() => send(messages.tooMuch, '太多了')}
        title="太多了：請老師濃縮成 3 行"
      >
        🛑 太多了
      </Button>
      <Button
        type="button"
        variant="soft"
        size="sm"
        className="rounded-full bg-sky-50 text-sky-800 ring-sky-200 hover:bg-sky-100"
        onClick={() => send(messages.stuck, '卡住')}
        title="卡住：複製後貼截圖給老師"
      >
        🆘 卡住
      </Button>
    </div>
  )
}

/** 一顆主按鈕：複製訊息 + 一行說明「貼完會發生什麼」 */
export function CopyButton({
  text,
  label,
  after,
  testId,
  onCopied,
  tone = 'go',
}: {
  text: string
  label: string
  after: string
  testId?: string
  onCopied?: () => void
  tone?: 'go' | 'end' | 'plain'
}) {
  const toast = useToast()
  const click = async () => {
    const ok = await copyText(text)
    toast(ok ? '已複製 → 到聊天框 Cmd+V、Enter' : '複製失敗')
    onCopied?.()
  }
  const variant = tone === 'go' ? 'go' : tone === 'end' ? 'boss' : 'soft'
  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" variant={variant} size="xl" className="w-full max-w-sm" data-testid={testId} onClick={click}>
        {label}
      </Button>
      <p className="m-0 text-center text-sm text-muted-foreground">{after}</p>
    </div>
  )
}
