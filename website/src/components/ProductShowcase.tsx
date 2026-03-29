'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { ICONS } from '@/lib/icons'

const categories = [
  { label: 'AI', color: '#E8A838', pct: 35 },
  { label: 'Dev', color: '#5B8DEF', pct: 22 },
  { label: 'Design', color: '#E88DB4', pct: 16 },
  { label: 'Media', color: '#6FCF97', pct: 15 },
  { label: 'Cloud', color: '#BB86FC', pct: 12 },
]

interface SubItem {
  name: string
  tier?: string
  icon: string
  amount: string
  payment: string
  due: string
  dueDate: string
}

const subs: SubItem[] = [
  { name: 'Claude', tier: 'MAX 5X', icon: ICONS.claude, amount: '¥898', payment: '支付宝', due: '11天', dueDate: '4月9日' },
  { name: 'ChatGPT', tier: 'PLUS', icon: ICONS.openai, amount: '¥140', payment: '微信支付', due: '11天', dueDate: '4月9日' },
  { name: 'Vercel', icon: ICONS.vercel, amount: '¥140', payment: 'Visa ····6880', due: '3周', dueDate: '4月24日' },
  { name: 'Obsidian Sync', icon: ICONS.obsidian, amount: '¥70', payment: '微信支付', due: '4周', dueDate: '4月28日' },
  { name: 'Cursor', tier: 'PRO', icon: ICONS.cursor, amount: '$20', payment: 'Visa ····6880', due: '2月', dueDate: '5月15日' },
]

function SubRow({ sub, compact }: { sub: SubItem; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-[8px] border-b border-white/[0.04] last:border-b-0">
      <div className="flex items-center gap-2.5">
        <div className="w-[26px] h-[26px] rounded-[8px] bg-white/[0.04] flex items-center justify-center overflow-hidden shrink-0">
          <img src={sub.icon} alt="" className="w-[18px] h-[18px] object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-white/85 font-medium leading-tight">{sub.name}</span>
            {sub.tier && (
              <span className="text-[8px] font-semibold text-accent bg-accent/[0.12] px-1.5 py-[1px] rounded leading-tight">{sub.tier}</span>
            )}
          </div>
          {!compact && <div className="text-[10px] text-white/25 leading-tight mt-0.5">{sub.payment}</div>}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[12px] text-white/70 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{sub.amount}</div>
        {!compact && <div className="text-[10px] text-white/25 leading-tight mt-0.5">{sub.due} · {sub.dueDate}</div>}
      </div>
    </div>
  )
}

function OverviewMockup({ locale }: { locale: string }) {
  return (
    <div className="w-[260px] sm:w-[280px] rounded-[14px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src="/icon.png" alt="" className="w-3.5 h-3.5 rounded-sm" />
          <span className="text-[12px] font-semibold text-white/90">BurnRate</span>
        </div>
        <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white/40" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M6 2.5v7M2.5 6h7" /></svg>
        </div>
      </div>
      <div className="px-3 pt-0 pb-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-white tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>¥1,248</span>
          <span className="text-[10px] text-white/30 font-medium">/{locale === 'en' ? 'mo' : '月'}</span>
        </div>
        <div className="flex items-baseline flex-wrap mt-1 text-[10px] leading-tight">
          <span className="text-white/50" style={{ fontVariantNumeric: 'tabular-nums' }}>¥41.6</span>
          <span className="text-white/20">/{locale === 'en' ? 'day' : '日'}</span>
          <span className="text-white/10 mx-1">·</span>
          <span className="text-white/50" style={{ fontVariantNumeric: 'tabular-nums' }}>¥14,976</span>
          <span className="text-white/20 ml-0.5">{locale === 'en' ? 'total' : '累计'}</span>
        </div>
      </div>
      <div className="px-3 pt-0.5 pb-1.5">
        <div className="flex h-[3px] rounded-full overflow-hidden gap-[1px]">
          {categories.map(c => <div key={c.label} className="rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color, opacity: 0.7 }} />)}
        </div>
      </div>
      <div className="border-t border-white/[0.05]">
        {subs.slice(0, 4).map(sub => <SubRow key={sub.name} sub={sub} />)}
      </div>
    </div>
  )
}

function BurnMockup({ locale }: { locale: string }) {
  const pct = 98.19
  const r = 22
  const circumference = 2 * Math.PI * r
  return (
    <div className="w-[260px] sm:w-[280px] rounded-[14px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
      {/* Header — amber title */}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-accent">BurnRate</span>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white/30" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M6 2.5v7M2.5 6h7" /></svg>
          </div>
        </div>
      </div>
      {/* Burn area — matches real app */}
      <div className="px-3 pt-0 pb-2.5">
        <span className="text-[10px] text-white/30 block mb-1.5">{locale === 'en' ? 'burned today' : '今日消耗'}</span>
        <div className="flex items-center justify-between">
          <span className="text-[28px] font-bold text-white tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ¥43.5<span className="text-[20px] align-super text-white/60">8</span>
          </span>
          <div className="relative w-[48px] h-[48px] shrink-0">
            <svg className="w-[48px] h-[48px]" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
              <circle cx="24" cy="24" r={r} fill="none" stroke="#E8A838" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct / 100)} transform="rotate(-90 24 24)" opacity="0.85" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8px] text-accent/80 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            </div>
          </div>
        </div>
        <div className="mt-1.5 text-[10px] text-white/20">
          2026/03/29 23:33:57 · {locale === 'en' ? 'avg' : '日均'} ¥44.38
        </div>
      </div>
      <div className="border-t border-white/[0.05]">
        {subs.slice(0, 3).map(sub => <SubRow key={sub.name} sub={sub} />)}
      </div>
    </div>
  )
}

function AddServiceMockup({ locale }: { locale: string }) {
  const presets = [
    { name: 'Spotify', icon: ICONS.spotify, price: '$9.99' },
    { name: 'Midjourney', icon: ICONS.midjourney, price: '$30' },
    { name: 'Perplexity', icon: ICONS.perplexity, price: '$20' },
    { name: 'GitHub Copilot', icon: ICONS.github, price: '$10' },
    { name: 'Gemini', icon: ICONS.gemini, price: '$20' },
  ]
  return (
    <div className="w-[260px] sm:w-[280px] rounded-[14px] bg-[rgba(18,18,20,0.92)] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2">
        <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M1 6h10M6 1v10" /></svg>
        <span className="text-[12px] font-semibold text-white/90">{locale === 'en' ? 'Add Service' : '添加服务'}</span>
      </div>
      <div className="px-3 pb-2">
        <div className="h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
          <svg className="w-3 h-3 text-white/20 mr-1.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="5" r="3.5" /><path d="M8 8l2.5 2.5" /></svg>
          <span className="text-[11px] text-white/20">{locale === 'en' ? 'Search services...' : '搜索服务…'}</span>
        </div>
      </div>
      <div className="border-t border-white/[0.05]">
        {presets.map(p => (
          <div key={p.name} className="flex items-center justify-between px-3 py-[8px] border-b border-white/[0.03] last:border-b-0">
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-[8px] bg-white/[0.04] flex items-center justify-center overflow-hidden">
                <img src={p.icon} alt="" className="w-[18px] h-[18px] object-contain" />
              </div>
              <span className="text-[12px] text-white/75">{p.name}</span>
            </div>
            <span className="text-[11px] text-white/30" style={{ fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
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
    { label: locale === 'en' ? 'Overview' : '总览', desc: locale === 'en' ? 'Monthly cost, daily average, category breakdown' : '月度费用、日均消耗、分类统计', mockup: <OverviewMockup locale={locale} /> },
    { label: locale === 'en' ? 'Burn Counter' : '消耗计数', desc: locale === 'en' ? 'Real-time daily spending with progress ring' : '实时每日消耗，进度环可视化', mockup: <BurnMockup locale={locale} /> },
    { label: locale === 'en' ? 'Quick Add' : '快速添加', desc: locale === 'en' ? '80+ presets with fuzzy search' : '80+ 预设服务，模糊搜索', mockup: <AddServiceMockup locale={locale} /> },
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
              className="flex flex-col items-center group"
            >
              <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <div className="absolute -inset-8 bg-accent/[0.02] rounded-full blur-[40px] pointer-events-none transition-all duration-500 group-hover:bg-accent/[0.06]" />
                <div className="relative transition-shadow duration-500 rounded-[14px] group-hover:shadow-[0_8px_40px_rgba(232,168,56,0.08)]">
                  {card.mockup}
                </div>
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
