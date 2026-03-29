'use client'

import { useI18n } from '@/lib/i18n'

const ICON_BASE = 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark'

const subs = [
  { name: 'ChatGPT Plus', amount: '$20', icon: `${ICON_BASE}/chatgpt.png`, due: '3d', dueColor: '#6FCF97' },
  { name: 'Claude Pro', amount: '$20', icon: `${ICON_BASE}/claude-color.png`, due: '8d', dueColor: '#6FCF97' },
  { name: 'Netflix', amount: '$22.99', icon: `${ICON_BASE}/netflix.png`, due: '12d', dueColor: '#E8A838' },
  { name: 'Figma', amount: '$15', icon: `${ICON_BASE}/figma-color.png`, due: '18d', dueColor: '#E8A838' },
  { name: 'GitHub Pro', amount: '$4', icon: `${ICON_BASE}/github.png`, due: '25d', dueColor: '' },
]

const categories = [
  { label: 'AI', color: '#E8A838', pct: 35 },
  { label: 'Dev', color: '#5B8DEF', pct: 22 },
  { label: 'Design', color: '#E88DB4', pct: 16 },
  { label: 'Media', color: '#6FCF97', pct: 15 },
  { label: 'Cloud', color: '#BB86FC', pct: 12 },
]

export default function AppMockup() {
  const { locale } = useI18n()

  return (
    <div className="relative group">
      {/* Glow */}
      <div className="absolute -inset-16 bg-accent/[0.07] rounded-full blur-[80px] transition-all duration-700 group-hover:bg-accent/[0.1]" />

      {/* Panel */}
      <div className="relative w-[288px] sm:w-[300px] rounded-[15px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/icon.png" alt="" className="w-3.5 h-3.5 rounded-sm" />
            <span className="text-[13px] font-semibold tracking-tight text-white/90">
              BurnRate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/20">
              {locale === 'en' ? 'Due date' : '到期日'} ↓
            </span>
            <div className="w-6 h-6 rounded-[8px] bg-white/[0.06] flex items-center justify-center">
              <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="px-3 pt-0.5 pb-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[24px] font-bold text-white tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
              $127
            </span>
            <span className="text-[11px] text-white/30 font-medium">
              /{locale === 'en' ? 'mo' : '月'}
            </span>
          </div>
          <div className="flex items-baseline flex-wrap mt-1 text-[11px] leading-tight">
            <span className="text-white/55" style={{ fontVariantNumeric: 'tabular-nums' }}>$4.17</span>
            <span className="text-white/25">/{locale === 'en' ? 'day' : '日'}</span>
            <span className="text-white/15 mx-1">·</span>
            <span className="text-white/55" style={{ fontVariantNumeric: 'tabular-nums' }}>$1,524</span>
            <span className="text-white/25 ml-0.5">{locale === 'en' ? 'total' : '累计'}</span>
            <span className="text-white/15 mx-1">·</span>
            <span className="text-white/55" style={{ fontVariantNumeric: 'tabular-nums' }}>12</span>
            <span className="text-white/25 ml-0.5">{locale === 'en' ? 'subs' : '订阅'}</span>
          </div>
        </div>

        {/* Category bar */}
        <div className="px-3 pt-0.5 pb-1.5">
          <div className="flex h-[4px] rounded-full overflow-hidden gap-[1.5px]">
            {categories.map((c) => (
              <div
                key={c.label}
                className="rounded-full"
                style={{ width: `${c.pct}%`, backgroundColor: c.color, opacity: 0.75 }}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            {categories.map((c) => (
              <div key={c.label} className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] text-white/25">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription list */}
        <div className="border-t border-white/[0.06] mt-0.5">
          {subs.map((sub) => (
            <div
              key={sub.name}
              className="flex items-center justify-between px-3 py-[7px] border-b border-white/[0.04] last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-[7px] bg-white/[0.04] flex items-center justify-center overflow-hidden">
                  <img src={sub.icon} alt="" className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] text-white/80 leading-tight">{sub.name}</div>
                  <div className="text-[10px] leading-tight mt-0.5" style={{ color: sub.dueColor || 'rgba(255,255,255,0.25)' }}>
                    {sub.due}
                  </div>
                </div>
              </div>
              <span className="text-[13px] text-white/55 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {sub.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
