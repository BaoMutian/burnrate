import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Fuse from 'fuse.js'
import { SERVICE_PRESETS } from '../lib/presets'
import { formatAmount } from '../lib/format'
import type { ServicePreset } from '../types'
import ServiceIcon from './ServiceIcon'

interface Props {
  onSelect: (preset: ServicePreset | null) => void
  onCustom: (name: string) => void
}

export default function FuzzySearch({ onSelect, onCustom }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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

  const hasCustom = query.trim().length > 0
  const totalItems = results.length + (hasCustom ? 1 : 0)

  useEffect(() => {
    setHighlightIndex(-1)
  }, [results])

  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[data-item]')
    items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        onSelect(results[highlightIndex])
      } else if (highlightIndex === results.length && hasCustom) {
        onCustom(query.trim())
      } else if (results.length > 0) {
        onSelect(results[0])
      } else if (hasCustom) {
        onCustom(query.trim())
      }
    }
  }, [totalItems, highlightIndex, results, hasCustom, query, onSelect, onCustom])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3.5 pb-1.5">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('form.searchPlaceholder')}
          className="w-full bg-bg-secondary text-text-primary text-xs px-2.5 py-1.5 rounded-[6px] border border-border focus:border-border-focus outline-none placeholder:text-text-tertiary transition-colors"
        />
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto">
        {results.map((preset, idx) => (
          <button
            key={preset.name}
            data-item
            onClick={() => onSelect(preset)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-1.5 transition-all duration-100 text-left cursor-default ${
              idx === highlightIndex ? 'bg-bg-secondary/80' : 'hover:bg-bg-secondary/50'
            }`}
          >
            <ServiceIcon iconKey={preset.iconKey} name={preset.name} />
            <span className="text-xs text-text-primary truncate">{preset.name}</span>
            <span className="text-[10px] text-text-tertiary ml-auto font-mono">
              {formatAmount(preset.defaultAmount, preset.defaultCurrency)}
            </span>
          </button>
        ))}

        {hasCustom && (
          <button
            data-item
            onClick={() => onCustom(query.trim())}
            className={`w-full flex items-center gap-2.5 px-3.5 py-1.5 transition-all duration-100 text-left cursor-default border-t border-border ${
              highlightIndex === results.length ? 'bg-bg-secondary/80' : 'hover:bg-bg-secondary/50'
            }`}
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-text-tertiary border border-border shrink-0">
              +
            </div>
            <span className="text-xs text-text-secondary">
              {t('form.customService')} "{query.trim()}"
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
