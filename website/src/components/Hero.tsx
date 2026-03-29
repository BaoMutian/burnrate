'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import AppMockup from './AppMockup'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function Hero() {
  const { t } = useI18n()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[600px] bg-accent/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-3xl mx-auto px-6"
      >
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.08]"
        >
          <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
            {t.hero.title}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-3">
          <a
            href="#download"
            className="group inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-black px-8 py-3 rounded-full font-semibold text-base transition-all duration-200 shadow-[0_0_32px_rgba(232,168,56,0.25)] hover:shadow-[0_0_48px_rgba(232,168,56,0.35)]"
          >
            <AppleIcon />
            {t.hero.cta}
          </a>
          <span className="text-[13px] text-white/25">{t.hero.badge}</span>
        </motion.div>
      </motion.div>

      {/* Floating mockup */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="relative z-10 mt-12 sm:mt-16"
      >
        <AppMockup />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  )
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}
