import { useMemo, useState, useEffect, useSyncExternalStore } from 'react'

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function MonogramIcon({ name }: { name: string }) {
  const letter = name.charAt(0).toUpperCase()
  const hue = hashString(name) % 360
  const bg = `hsl(${hue}, 20%, 22%)`
  const fg = `hsl(${hue}, 45%, 68%)`

  return (
    <div
      className="w-6 h-6 rounded-[--radius-button] flex items-center justify-center text-[10px] font-semibold shrink-0 border border-white/[0.04]"
      style={{ background: bg, color: fg }}
    >
      {letter}
    </div>
  )
}

// Icon store — loads @lobehub/icons once, notifies all subscribers when ready
type IconComponent = React.ComponentType<{ size?: number }> & { Color?: React.ComponentType<{ size?: number }> }
let lobeIcons: Record<string, IconComponent> | null = null
let listeners: Array<() => void> = []

function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => { listeners = listeners.filter((l) => l !== listener) }
}

function getSnapshot() {
  return lobeIcons
}

// Load icons on module init
import('@lobehub/icons').then((mod) => {
  lobeIcons = mod as unknown as Record<string, IconComponent>
  listeners.forEach((l) => l())
}).catch(() => {})

export default function ServiceIcon({ iconKey, name }: { iconKey: string | null; name: string }) {
  const icons = useSyncExternalStore(subscribe, getSnapshot)

  const IconComponent = useMemo(() => {
    if (!iconKey || !icons) return null
    const icon = icons[iconKey]
    if (!icon) return null
    // Prefer .Color variant for branded icons, fall back to mono
    return icon.Color || icon
  }, [iconKey, icons])

  // Track transition from monogram → loaded icon
  const [showIcon, setShowIcon] = useState(false)
  useEffect(() => {
    if (IconComponent) {
      // Small delay to trigger CSS transition
      const id = requestAnimationFrame(() => setShowIcon(true))
      return () => cancelAnimationFrame(id)
    }
    setShowIcon(false)
  }, [IconComponent])

  if (IconComponent) {
    return (
      <div
        className="w-6 h-6 flex items-center justify-center shrink-0 transition-opacity duration-200"
        style={{ opacity: showIcon ? 1 : 0 }}
      >
        <IconComponent size={22} />
      </div>
    )
  }

  return <MonogramIcon name={name} />
}
