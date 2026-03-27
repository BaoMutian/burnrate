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
        className="flex items-center gap-0.5 text-[9px] text-text-quaternary hover:text-text-tertiary transition-colors cursor-default"
      >
        <kbd className="font-mono">⌘</kbd>
        <kbd className="font-mono">N</kbd>
      </button>
      <button
        onClick={onSettings}
        className="text-[10px] text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
      >
        {t('footer.dashboard')} →
      </button>
    </div>
  )
}
