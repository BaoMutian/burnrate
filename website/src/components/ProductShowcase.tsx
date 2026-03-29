'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

const LOBE = 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark'

const categories = [
  { label: 'AI', color: '#E8A838', pct: 35 },
  { label: 'Dev', color: '#5B8DEF', pct: 22 },
  { label: 'Design', color: '#E88DB4', pct: 16 },
  { label: 'Media', color: '#6FCF97', pct: 15 },
  { label: 'Cloud', color: '#BB86FC', pct: 12 },
]

const subs = [
  { name: 'ChatGPT Plus', amount: '$20', icon: `${LOBE}/openai.png`, due: '3d', dueColor: '#6FCF97' },
  { name: 'Claude Pro', amount: '$20', icon: `${LOBE}/claude-color.png`, due: '8d', dueColor: '#6FCF97' },
  { name: 'Netflix', icon: '/icons/netflix-icon.svg', amount: '$22.99', due: '12d', dueColor: '#E8A838' },
  { name: 'Figma', icon: `${LOBE}/figma-color.png`, amount: '$15', due: '18d', dueColor: '#E8A838' },
  { name: 'GitHub Pro', icon: `${LOBE}/github.png`, amount: '$4', due: '25d', dueColor: '' },
]

function OverviewMockup({ locale }: { locale: string }) {
  return (
    <div className="w-[260px] sm:w-[280px] rounded-[14px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src="/icon.png" alt="" className="w-3.5 h-3.5 rounded-sm" />
          <span className="text-[12px] font-semibold text-white/90">BurnRate</span>
        </div>
        <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white/40" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M6 2.5v7M2.5 6h7" /></svg>
        </div>
      </div>
      {/* Overview stats */}
      <div className="px-3 pt-0 pb-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-white tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>$127</span>
          <span className="text-[10px] text-white/30 font-medium">/{locale === 'en' ? 'mo' : '月'}</span>
        </div>
        <div className="flex items-baseline flex-wrap mt-1 text-[10px] leading-tight">
          <span className="text-white/50" style={{ fontVariantNumeric: 'tabular-nums' }}>$4.17</span>
          <span className="text-white/20">/{locale === 'en' ? 'day' : '日'}</span>
          <span className="text-white/10 mx-1">·</span>
          <span className="text-white/50" style={{ fontVariantNumeric: 'tabular-nums' }}>$1,524</span>
          <span className="text-white/20 ml-0.5">{locale === 'en' ? 'total' : '累计'}</span>
        </div>
      </div>
      {/* Category bar */}
      <div className="px-3 pt-0.5 pb-1.5">
        <div className="flex h-[3px] rounded-full overflow-hidden gap-[1px]">
          {categories.map(c => <div key={c.label} className="rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color, opacity: 0.7 }} />)}
        </div>
      </div>
      {/* Rows */}
      <div className="border-t border-white/[0.05]">
        {subs.slice(0, 4).map(sub => (
          <div key={sub.name} className="flex items-center justify-between px-3 py-[6px] border-b border-white/[0.03] last:border-b-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center overflow-hidden">
                <img src={sub.icon} alt="" className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] text-white/75 leading-tight">{sub.name}</div>
                <div className="text-[9px] leading-tight mt-0.5" style={{ color: sub.dueColor || 'rgba(255,255,255,0.2)' }}>{sub.due}</div>
              </div>
            </div>
            <span className="text-[11px] text-white/50 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{sub.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BurnMockup({ locale }: { locale: string }) {
  return (
    <div className="w-[260px] sm:w-[280px] rounded-[14px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src="/icon.png" alt="" className="w-3.5 h-3.5 rounded-sm" />
          <span className="text-[12px] font-semibold text-accent">BurnRate</span>
        </div>
        <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white/40" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M6 2.5v7M2.5 6h7" /></svg>
        </div>
      </div>
      {/* Burn counter area */}
      <div className="px-3 pt-2 pb-3 flex flex-col items-center">
        <span className="text-[10px] text-white/30 mb-1">{locale === 'en' ? 'burned today' : '今日消耗'}</span>
        <div className="flex items-center gap-1">
          <span className="text-[28px] font-bold text-accent tracking-tight" style={{ fontFamily: '"SF Mono", "JetBrains Mono", monospace', fontVariantNumeric: 'tabular-nums' }}>
            $32.61
          </span>
        </div>
        {/* Ring mockup */}
        <div className="mt-3 relative w-14 h-14">
          <svg className="w-14 h-14" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="24"
              fill="none" stroke="#E8A838" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * 0.32}`}
              transform="rotate(-90 28 28)"
              opacity="0.8"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-accent/70 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>68%</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-white/20">2025/03/29 · 16:21:05</div>
        {/* Progress bar */}
        <div className="w-full mt-2 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-accent/60" style={{ width: '68%' }} />
        </div>
      </div>
      {/* Rows below */}
      <div className="border-t border-white/[0.05]">
        {subs.slice(0, 3).map(sub => (
          <div key={sub.name} className="flex items-center justify-between px-3 py-[6px] border-b border-white/[0.03] last:border-b-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center overflow-hidden">
                <img src={sub.icon} alt="" className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] text-white/75 leading-tight">{sub.name}</div>
            </div>
            <span className="text-[11px] text-white/50 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{sub.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddServiceMockup({ locale }: { locale: string }) {
  const presets = [
    { name: 'Cursor', icon: `${LOBE}/cursor.png`, price: '$20' },
    { name: 'Midjourney', icon: `${LOBE}/midjourney.png`, price: '$30' },
    { name: 'Perplexity', icon: `${LOBE}/perplexity-color.png`, price: '$20' },
    { name: 'Vercel', icon: `${LOBE}/vercel.png`, price: '$20' },
    { name: 'Gemini', icon: `${LOBE}/gemini-color.png`, price: '$20' },
  ]
  return (
    <div className="w-[260px] sm:w-[280px] rounded-[14px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M9 4L4.5 8.5 3 7" /></svg>
        <span className="text-[12px] font-semibold text-white/90">{locale === 'en' ? 'Add Service' : '添加服务'}</span>
      </div>
      {/* Search */}
      <div className="px-3 pb-2">
        <div className="h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
          <svg className="w-3 h-3 text-white/20 mr-1.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="5" r="3.5" /><path d="M8 8l2.5 2.5" /></svg>
          <span className="text-[11px] text-white/20">{locale === 'en' ? 'Search services...' : '搜索服务…'}</span>
        </div>
      </div>
      {/* Presets */}
      <div className="border-t border-white/[0.05]">
        {presets.map(p => (
          <div key={p.name} className="flex items-center justify-between px-3 py-[7px] border-b border-white/[0.03] last:border-b-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center overflow-hidden">
                <img src={p.icon} alt="" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-white/75">{p.name}</span>
            </div>
            <span className="text-[10px] text-white/30" style={{ fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProductShowcase() {
  const { locale } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const cards = [
    {
      label: locale === 'en' ? 'Overview' : '总览',
      desc: locale === 'en' ? 'Monthly cost, daily average, category breakdown' : '月度费用、日均消耗、分类统计',
      mockup: <OverviewMockup locale={locale} />,
    },
    {
      label: locale === 'en' ? 'Burn Counter' : '消耗计数',
      desc: locale === 'en' ? 'Real-time daily spending with progress ring' : '实时每日消耗，进度环可视化',
      mockup: <BurnMockup locale={locale} />,
    },
    {
      label: locale === 'en' ? 'Quick Add' : '快速添加',
      desc: locale === 'en' ? '80+ presets with fuzzy search' : '80+ 预设服务，模糊搜索',
      mockup: <AddServiceMockup locale={locale} />,
    },
  ]

  return (
    <section ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="absolute -inset-8 bg-accent/[0.03] rounded-full blur-[40px] pointer-events-none" />
                <div className="relative">{card.mockup}</div>
              </div>
              <h3 className="mt-6 text-[15px] font-semibold text-white/80">{card.label}</h3>
              <p className="mt-1 text-[13px] text-white/30 text-center">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
