import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Fuse from 'fuse.js'
import { SERVICE_PRESETS } from '../lib/presets'
import type { ServicePreset } from '../types'
import ServiceIcon from './ServiceIcon'

interface Props {
  onSelect: (preset: ServicePreset | null) => void
  onCustom: (name: string) => void
}

export default function FuzzySearch({ onSelect, onCustom }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const fuse = useMemo(
    () => new Fuse(SERVICE_PRESETS, { keys: ['name', 'category'], threshold: 0.4 }),
    []
  )

  const results = useMemo(() => {
    if (!query.trim()) return SERVICE_PRESETS
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 pb-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('form.searchPlaceholder')}
          className="w-full bg-bg-secondary text-text-primary text-sm px-3 py-2 rounded-lg border border-border focus:border-border-focus outline-none placeholder:text-text-tertiary"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-bg-secondary transition-colors text-left cursor-default"
          >
            <ServiceIcon iconKey={preset.iconKey} name={preset.name} />
            <span className="text-sm text-text-primary truncate">{preset.name}</span>
            <span className="text-xs text-text-tertiary ml-auto font-mono">
              {preset.defaultCurrency === 'CNY' ? '¥' : '$'}{preset.defaultAmount}
            </span>
          </button>
        ))}

        {query.trim() && (
          <button
            onClick={() => onCustom(query.trim())}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-bg-secondary transition-colors text-left cursor-default border-t border-border"
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs text-text-tertiary border border-border shrink-0">
              +
            </div>
            <span className="text-sm text-text-secondary">
              {t('form.customService')} "{query.trim()}"
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
