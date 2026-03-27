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

// Pre-sorted alphabetically
const SORTED_PRESETS = [...SERVICE_PRESETS].sort((a, b) => a.name.localeCompare(b.name))

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

  // Group by first letter (only when not searching)
  const { groups, letters } = useMemo(() => {
    if (isSearching) return { groups: null, letters: [] }
    const map = new Map<string, ServicePreset[]>()
    for (const preset of results) {
      const letter = preset.name[0].toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(preset)
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

      <div className="flex flex-1 min-h-0">
        {/* Main list */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {isSearching ? (
            <>
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
            </>
          ) : (
            groups && letters.map((letter) => {
              const presets = groups.get(letter)!
              return (
                <div key={letter} data-section={letter}>
                  {/* Section header */}
                  <div className="px-3.5 pt-2 pb-0.5 sticky top-0 bg-bg-primary/90 backdrop-blur-sm z-[1]">
                    <span className="text-[9px] font-semibold text-text-tertiary tracking-wider uppercase">{letter}</span>
                  </div>
                  {presets.map((preset) => {
                    const idx = flatIdx++
                    return (
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
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Letter index sidebar — only when browsing (not searching) */}
        {!isSearching && letters.length > 0 && (
          <div className="flex flex-col items-center justify-center py-1 pr-0.5 shrink-0 w-4">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="text-[7px] leading-[11px] font-semibold text-text-quaternary hover:text-accent transition-colors cursor-default"
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
