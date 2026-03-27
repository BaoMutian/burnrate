import { useTranslation } from 'react-i18next'

interface Props {
  onAdd: () => void
  onSettings: () => void
}

export default function Footer({ onAdd, onSettings }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border">
      <button
        onClick={onAdd}
        className="text-xs text-text-quaternary hover:text-text-tertiary transition-colors cursor-default flex items-center gap-1"
      >
        <kbd className="text-[10px] font-mono opacity-60">⌘N</kbd>
        <span>{t('footer.add')}</span>
      </button>
      <button
        onClick={onSettings}
        className="text-xs text-text-quaternary hover:text-text-tertiary transition-colors cursor-default flex items-center gap-1"
      >
        <kbd className="text-[10px] font-mono opacity-60">⌘,</kbd>
        <span>{t('footer.settings')}</span>
      </button>
    </div>
  )
}
