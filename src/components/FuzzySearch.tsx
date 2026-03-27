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

function isLatinLetter(ch: string): boolean {
  return /^[A-Za-z]$/.test(ch)
}

// Sort: A-Z English first, then non-English (Chinese etc.) under '#'
const SORTED_PRESETS = [...SERVICE_PRESETS].sort((a, b) => {
  const aLatin = isLatinLetter(a.name[0])
  const bLatin = isLatinLetter(b.name[0])
  if (aLatin && !bLatin) return -1
  if (!aLatin && bLatin) return 1
  return a.name.localeCompare(b.name)
})

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

  const isSearching = query.trim().length > 0

  const results = useMemo(() => {
    if (!isSearching) return SORTED_PRESETS
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse, isSearching])

  // Group by first letter; non-Latin goes under '#'
  const { groups, letters } = useMemo(() => {
    if (isSearching) return { groups: null, letters: [] }
    const map = new Map<string, ServicePreset[]>()
    for (const preset of results) {
      const ch = preset.name[0].toUpperCase()
      const key = isLatinLetter(ch) ? ch : '#'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(preset)
    }
    return { groups: map, letters: [...map.keys()] }
  }, [results, isSearching])

  // Flat index for keyboard navigation
  const flatItems = useMemo(() => {
    if (isSearching) return results
    const items: ServicePreset[] = []
    if (groups) {
      for (const presets of groups.values()) {
        items.push(...presets)
      }
    }
    return items
  }, [results, groups, isSearching])

  const hasCustom = isSearching
  const totalItems = flatItems.length + (hasCustom ? 1 : 0)

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
      if (highlightIndex >= 0 && highlightIndex < flatItems.length) {
        onSelect(flatItems[highlightIndex])
      } else if (highlightIndex === flatItems.length && hasCustom) {
        onCustom(query.trim())
      } else if (flatItems.length > 0) {
        onSelect(flatItems[0])
      } else if (hasCustom) {
        onCustom(query.trim())
      }
    }
  }, [totalItems, highlightIndex, flatItems, hasCustom, query, onSelect, onCustom])

  function scrollToLetter(letter: string) {
    const el = listRef.current?.querySelector(`[data-section="${letter}"]`)
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  // Track flat index across grouped rendering
  let flatIdx = 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3 pb-1.5">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('form.searchPlaceholder')}
          className="mac-field w-full text-text-primary text-[12px] px-3 py-[7px] outline-none placeholder:text-text-tertiary"
        />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Letter index sidebar — left side */}
        {!isSearching && letters.length > 0 && (
          <div className="flex flex-col items-center justify-center py-0.5 shrink-0 w-5 ml-0.5">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="w-5 h-[18px] flex items-center justify-center text-[9px] font-bold text-text-tertiary hover:text-accent active:text-accent transition-colors cursor-default rounded-sm hover:bg-white/[0.05]"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Main list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-0.5">
          {isSearching ? (
            <>
              {results.map((preset, idx) => (
                <button
                  key={preset.name}
                  data-item
                  onClick={() => onSelect(preset)}
                  className={`mac-list-row w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left cursor-default ${
                    idx === highlightIndex ? 'is-active' : ''
                  }`}
                >
                  <ServiceIcon iconKey={preset.iconKey} name={preset.name} />
                  <span className="text-[12px] text-text-primary truncate">{preset.name}</span>
                  <span className="text-[10px] text-text-tertiary ml-auto font-numeric">
                    {formatAmount(preset.defaultAmount, preset.defaultCurrency)}
                  </span>
                </button>
              ))}
              <button
                data-item
                onClick={() => onCustom(query.trim())}
                className={`mac-list-row w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left cursor-default border-t border-border rounded-[var(--radius-item)] mt-1 ${
                  highlightIndex === results.length ? 'is-active' : ''
                }`}
              >
                <div className="w-5 h-5 rounded-[7px] flex items-center justify-center text-[10px] text-text-tertiary border border-border shrink-0">
                  +
                </div>
                <span className="text-[12px] text-text-secondary">
                  {t('form.customService')} "{query.trim()}"
                </span>
              </button>
            </>
          ) : (
            groups && letters.map((letter) => {
              const presets = groups.get(letter)!
              return (
                <div key={letter} data-section={letter}>
                  <div className="px-2.5 pt-2 pb-1 sticky top-0 bg-bg-primary/92 backdrop-blur-sm z-[1]">
                    <span className="text-[10px] font-semibold text-text-tertiary tracking-wider uppercase">{letter}</span>
                  </div>
                  {presets.map((preset) => {
                    const idx = flatIdx++
                    return (
                      <button
                        key={preset.name}
                        data-item
                        onClick={() => onSelect(preset)}
                        className={`mac-list-row w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left cursor-default ${
                          idx === highlightIndex ? 'is-active' : ''
                        }`}
                      >
                        <ServiceIcon iconKey={preset.iconKey} name={preset.name} />
                        <span className="text-[12px] text-text-primary truncate">{preset.name}</span>
                        <span className="text-[10px] text-text-tertiary ml-auto font-numeric">
                          {formatAmount(preset.defaultAmount, preset.defaultCurrency)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
