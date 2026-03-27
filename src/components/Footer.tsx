import { useTranslation } from 'react-i18next'

interface Props {
  onAdd: () => void
  onSettings: () => void
}

export default function Footer({ onAdd, onSettings }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-t border-border">
      <button
        onClick={onAdd}
        className="mac-button mac-button-quiet px-1.5 text-[10px] text-text-secondary hover:text-accent cursor-default flex items-center gap-1.5 group"
      >
        <kbd className="text-[9px] font-mono text-text-tertiary group-hover:text-accent/70 transition-colors">⌘N</kbd>
        <span>{t('footer.add')}</span>
      </button>
      <button
        onClick={onSettings}
        className="mac-button mac-button-quiet px-1.5 text-[10px] text-text-secondary cursor-default flex items-center gap-1.5 group"
      >
        <kbd className="text-[9px] font-mono text-text-tertiary group-hover:text-text-secondary transition-colors">⌘,</kbd>
        <span>{t('footer.settings')}</span>
      </button>
    </div>
  )
}
