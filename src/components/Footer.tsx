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
        className="text-[11px] text-text-secondary hover:text-accent transition-colors duration-150 cursor-default flex items-center gap-1.5 group"
      >
        <kbd className="text-[10px] font-mono text-text-tertiary group-hover:text-accent/70 transition-colors">⌘N</kbd>
        <span>{t('footer.add')}</span>
      </button>
      <button
        onClick={onSettings}
        className="text-[11px] text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-default flex items-center gap-1.5 group"
      >
        <kbd className="text-[10px] font-mono text-text-tertiary group-hover:text-text-secondary transition-colors">⌘,</kbd>
        <span>{t('footer.settings')}</span>
      </button>
    </div>
  )
}
