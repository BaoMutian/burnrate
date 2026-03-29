'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

const LOBE = 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark'

const row1 = [
  { name: 'ChatGPT', icon: `${LOBE}/openai.png` },
  { name: 'Claude', icon: `${LOBE}/claude-color.png` },
  { name: 'Figma', icon: `${LOBE}/figma-color.png` },
  { name: 'GitHub', icon: `${LOBE}/github.png` },
  { name: 'Notion', icon: `${LOBE}/notion-color.png` },
  { name: 'Vercel', icon: `${LOBE}/vercel.png` },
  { name: 'Gemini', icon: `${LOBE}/gemini-color.png` },
  { name: 'Cursor', icon: `${LOBE}/cursor.png` },
  { name: 'Midjourney', icon: `${LOBE}/midjourney.png` },
  { name: 'Perplexity', icon: `${LOBE}/perplexity-color.png` },
]

const row2 = [
  { name: 'Spotify', icon: '/icons/spotify-icon.svg' },
  { name: 'Netflix', icon: '/icons/netflix-icon.svg' },
  { name: 'YouTube', icon: '/icons/youtube-icon.svg' },
  { name: 'Slack', icon: '/icons/slack-icon.svg' },
  { name: 'Docker', icon: '/icons/docker-icon.svg' },
  { name: 'Linear', icon: '/icons/linear-icon.svg' },
  { name: 'Discord', icon: '/icons/discord-icon.svg' },
  { name: 'Supabase', icon: '/icons/supabase-icon.svg' },
  { name: '1Password', icon: '/icons/1Password-icon.svg' },
  { name: 'Telegram', icon: '/icons/telegram.svg' },
]

function LogoRow({ items, reverse }: { items: typeof row1; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden">
      <div
        className="flex items-center gap-12 sm:gap-16"
        style={{
          animation: `${reverse ? 'scrollReverse' : 'scroll'} ${reverse ? '40s' : '35s'} linear infinite`,
        }}
      >
        {doubled.map((s, i) => (
          <div key={i} className="shrink-0 flex items-center gap-3 opacity-40 hover:opacity-70 transition-opacity duration-300">
            <img
              src={s.icon}
              alt={s.name}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              loading="lazy"
            />
            <span className="text-[15px] sm:text-base text-white/70 font-medium whitespace-nowrap">
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AppShowcase() {
  const { t, locale } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const highlights = [
    {
      title: locale === 'en' ? 'Multi-currency' : '多币种',
      desc: locale === 'en'
        ? 'USD, CNY, EUR, JPY with automatic live exchange rate conversion.'
        : 'USD、CNY、EUR、JPY，实时汇率自动换算。',
      icon: (
        <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M8 15h5M12 6v2M12 16v2M9 8c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2" />
        </svg>
      ),
    },
    {
      title: locale === 'en' ? 'Smart Categories' : '智能分类',
      desc: locale === 'en'
        ? 'AI, Dev, Design, Media. See exactly where your money goes.'
        : 'AI、开发、设计、影音。清晰看到钱的去向。',
      icon: (
        <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      title: locale === 'en' ? 'Export Anytime' : '随时导出',
      desc: locale === 'en'
        ? 'Full JSON backup and restore. Your data, portable and safe.'
        : '完整 JSON 备份和恢复。数据随身携带，安全无忧。',
      icon: (
        <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ]

  return (
    <section ref={ref} className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
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

        {/* Logo marquee — two rows, opposite directions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative space-y-6"
        >
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <LogoRow items={row1} />
          <LogoRow items={row2} reverse />
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {highlights.map((item, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/[0.08] border border-accent/[0.12] flex items-center justify-center mx-auto">
                {item.icon}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-white/85">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] text-white/30 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
