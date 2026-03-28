import { useMemo, useState, useEffect, useSyncExternalStore } from 'react'
import { LOCAL_ICONS } from '../lib/local-icons'

type IconSize = 'sm' | 'md' | 'lg'

const SIZE_CONFIG = {
  sm: { box: 'w-5 h-5', icon: 18, img: 'w-4 h-4', radius: 'rounded-[7px]', text: 'text-[10px]' },
  md: { box: 'w-7 h-7', icon: 24, img: 'w-6 h-6', radius: 'rounded-[9px]', text: 'text-[12px]' },
  lg: { box: 'w-9 h-9', icon: 30, img: 'w-7 h-7', radius: 'rounded-[11px]', text: 'text-[14px]' },
}

function resolveSize(size?: IconSize, large?: boolean): IconSize {
  if (size) return size
  return large ? 'md' : 'sm'
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function MonogramIcon({ name, s }: { name: string; s: IconSize }) {
  const letter = name.charAt(0).toUpperCase()
  const hue = hashString(name) % 360
  const bg = `hsl(${hue}, 20%, 22%)`
  const fg = `hsl(${hue}, 45%, 68%)`
  const c = SIZE_CONFIG[s]

  return (
    <div
      className={`${c.box} ${c.radius} ${c.text} flex items-center justify-center font-semibold shrink-0 border border-white/[0.04]`}
      style={{ background: bg, color: fg }}
    >
      {letter}
    </div>
  )
}

function LocalSvgIcon({ src, name, s }: { src: string; name: string; s: IconSize }) {
  const c = SIZE_CONFIG[s]
  return (
    <div className={`${c.box} flex items-center justify-center shrink-0`}>
      <img src={src} alt={name} className={`${c.img} object-contain`} draggable={false} />
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

export default function ServiceIcon({ iconKey, name, large, size }: { iconKey: string | null; name: string; large?: boolean; size?: IconSize }) {
  const s = resolveSize(size, large)
  const c = SIZE_CONFIG[s]
  const icons = useSyncExternalStore(subscribe, getSnapshot)

  const IconComponent = useMemo(() => {
    if (!iconKey || !icons) return null
    const icon = icons[iconKey]
    if (!icon) return null
    return icon.Color || icon
  }, [iconKey, icons])

  // Track transition from monogram → loaded icon
  const [showIcon, setShowIcon] = useState(false)
  useEffect(() => {
    if (IconComponent) {
      const id = requestAnimationFrame(() => setShowIcon(true))
      return () => cancelAnimationFrame(id)
    }
    setShowIcon(false)
  }, [IconComponent])

  // Priority 1: @lobehub/icons
  if (IconComponent) {
    return (
      <div
        className={`${c.box} flex items-center justify-center shrink-0 transition-opacity duration-200`}
        style={{ opacity: showIcon ? 1 : 0 }}
      >
        <IconComponent size={c.icon} />
      </div>
    )
  }

  // Priority 2: local SVG
  const localSvg = iconKey ? LOCAL_ICONS[iconKey] : null
  if (localSvg) {
    return <LocalSvgIcon src={localSvg} name={name} s={s} />
  }

  // Priority 3: monogram fallback
  return <MonogramIcon name={name} s={s} />
}
