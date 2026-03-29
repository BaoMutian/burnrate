'use client'

import { useI18n } from '@/lib/i18n'

const subs = [
  { name: 'ChatGPT Plus', amount: '$20', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/chatgpt.png', due: '3d', color: '#6FCF97' },
  { name: 'Claude Pro', amount: '$20', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/claude-color.png', due: '8d', color: '#6FCF97' },
  { name: 'Netflix', amount: '$22.99', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/netflix.png', due: '12d', color: '#6FCF97' },
  { name: 'Figma', amount: '$15', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/figma-color.png', due: '18d', color: '#E8A838' },
  { name: 'GitHub Pro', amount: '$4', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/github.png', due: '25d', color: '#E8A838' },
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
      <div className="relative w-[300px] sm:w-[320px] rounded-[16px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/icon.png" alt="" className="w-4 h-4 rounded" />
            <span className="text-[13px] font-semibold tracking-tight text-white/90">
              BurnRate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-[10px] text-white/25 px-1">
              {locale === 'en' ? 'Due date' : '到期日'} ↓
            </div>
            <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors cursor-pointer">
              <svg className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="px-3.5 pt-0.5 pb-1.5">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[24px] font-bold text-white tracking-tight leading-none tabular-nums">
              $127
            </span>
            <span className="text-[11px] text-white/30 font-medium">
              /{locale === 'en' ? 'mo' : '月'}
            </span>
          </div>
          <div className="flex items-baseline flex-wrap mt-1 text-[11px] leading-tight">
            <span className="text-white/55 tabular-nums">$4.17</span>
            <span className="text-white/25">
              /{locale === 'en' ? 'day' : '日'}
            </span>
            <span className="text-white/20 mx-1">·</span>
            <span className="text-white/55 tabular-nums">$1,524</span>
            <span className="text-white/25 ml-0.5">
              {locale === 'en' ? 'total' : '累计'}
            </span>
            <span className="text-white/20 mx-1">·</span>
            <span className="text-white/55 tabular-nums">12</span>
            <span className="text-white/25 ml-0.5">
              {locale === 'en' ? 'subs' : '订阅'}
            </span>
          </div>
        </div>

        {/* Category bar */}
        <div className="px-3.5 pt-0.5 pb-1.5">
          <div className="flex h-[4px] rounded-full overflow-hidden gap-[1.5px]">
            {categories.map((c) => (
              <div
                key={c.label}
                className="rounded-full"
                style={{
                  width: `${c.pct}%`,
                  backgroundColor: c.color,
                  opacity: 0.75,
                }}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            {categories.map((c) => (
              <div key={c.label} className="flex items-center gap-0.5">
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
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
              className="flex items-center justify-between px-3.5 py-[7px] border-b border-white/[0.04] last:border-b-0 group/row hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={sub.icon}
                  alt=""
                  className="w-[22px] h-[22px] rounded-md"
                />
                <div>
                  <div className="text-[13px] text-white/80 leading-tight">
                    {sub.name}
                  </div>
                  <div className="text-[10px] text-white/25 leading-tight mt-0.5">
                    {sub.due}
                  </div>
                </div>
              </div>
              <span className="text-[13px] text-white/55 tabular-nums font-medium">
                {sub.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
