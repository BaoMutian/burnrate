import { useTranslation } from 'react-i18next'

interface Props {
  onAdd: () => void
  onSettings: () => void
}

export default function Footer({ onAdd, onSettings }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-t border-border">
      <button
        onClick={onAdd}
        className="text-[11px] text-text-quaternary hover:text-accent transition-colors duration-150 cursor-default flex items-center gap-1.5 group"
      >
        <kbd className="text-[10px] font-mono opacity-50 group-hover:opacity-70 transition-opacity">⌘N</kbd>
        <span>{t('footer.add')}</span>
      </button>
      <button
        onClick={onSettings}
        className="text-[11px] text-text-quaternary hover:text-text-tertiary transition-colors duration-150 cursor-default flex items-center gap-1.5 group"
      >
        <kbd className="text-[10px] font-mono opacity-50 group-hover:opacity-70 transition-opacity">⌘,</kbd>
        <span>{t('footer.settings')}</span>
      </button>
    </div>
  )
}
