'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

const services = [
  'ChatGPT', 'Claude', 'Netflix', 'Figma', 'GitHub', 'Spotify',
  'Notion', 'Vercel', 'AWS', 'Linear', 'Midjourney', 'Cursor',
  '1Password', 'iCloud+', 'Docker', 'Slack', 'Supabase', 'Raycast',
]

export default function AppShowcase() {
  const { t, locale } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const highlights = [
    {
      title: locale === 'en' ? 'Multi-currency' : '多币种',
      desc: locale === 'en'
        ? 'USD, CNY, EUR, JPY — automatic conversion at live exchange rates.'
        : 'USD、CNY、EUR、JPY —— 实时汇率自动换算。',
      icon: '💱',
    },
    {
      title: locale === 'en' ? 'Smart Categories' : '智能分类',
      desc: locale === 'en'
        ? 'AI, Dev, Design, Media — see exactly where your money goes.'
        : 'AI、开发、设计、影音 —— 清晰看到钱的去向。',
      icon: '📊',
    },
    {
      title: locale === 'en' ? 'Export Anytime' : '随时导出',
      desc: locale === 'en'
        ? 'Full JSON backup and restore. Your data, portable and safe.'
        : '完整 JSON 备份和恢复。数据随身携带，安全无忧。',
      icon: '💾',
    },
  ]

  return (
    <section ref={ref} className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              {t.showcase.title}
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/35 max-w-lg mx-auto">
            {t.showcase.subtitle}
          </p>
        </motion.div>

        {/* Scrolling service names */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <div className="overflow-hidden">
            <div
              className="flex gap-4"
              style={{ animation: 'scroll 30s linear infinite' }}
            >
              {[...services, ...services].map((name, i) => (
                <div
                  key={i}
                  className="shrink-0 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/40 whitespace-nowrap"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {highlights.map((item, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <span className="text-2xl">{item.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-white/85">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] text-white/30 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
