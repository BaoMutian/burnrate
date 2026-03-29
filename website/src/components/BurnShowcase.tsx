'use client'

import { useEffect, useRef, Fragment } from 'react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

const DIGIT_HEIGHT = 80
const DIGITS = [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

export default function BurnShowcase() {
  const { t, locale } = useI18n()
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-15%' })

  const dailyRate = locale === 'en' ? 47.82 : 338.5
  const symbol = locale === 'en' ? '$' : '¥'
  const decimals = 2
  const intDigitCount = Math.max(
    1,
    Math.floor(Math.log10(Math.max(dailyRate, 1))) + 1
  )
  const totalDigits = intDigitCount + decimals

  const columnsRef = useRef<(HTMLDivElement | null)[]>([])
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true

    const entranceDuration = 1200
    const entranceStart = performance.now()
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentFraction = Math.min(1, (now.getTime() - midnight.getTime()) / 86400000)
    const targetValue = dailyRate * currentFraction

    let rafId: number

    function update(timestamp: number) {
      const elapsed = timestamp - entranceStart
      let value: number

      if (elapsed < entranceDuration) {
        const p = Math.min(1, elapsed / entranceDuration)
        const eased = 1 - Math.pow(1 - p, 3)
        value = targetValue * eased
      } else {
        const now = Date.now()
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        const frac = Math.min(1, (now - midnight.getTime()) / 86400000)
        value = dailyRate * frac
      }

      for (let i = 0; i < totalDigits; i++) {
        const digitIdx = totalDigits - 1 - i
        const power = digitIdx - decimals + 1
        const raw = value * Math.pow(10, -power)
        const digitValue = digitIdx === 0 ? raw % 10 : Math.floor(raw) % 10
        
        // Reverse calculation: 0 is at index 0, 9 is at index 1, 8 at index 2... 0 at index 10
        // To make it fall down, we map the digitValue (0-9) to the index in [0,9,8,7,6,5,4,3,2,1,0]
        const pos = digitValue === 0 ? 0 : 10 - digitValue + 1
        
        const el = columnsRef.current[i]
        if (el) {
          el.style.transform = `translateY(${-pos * DIGIT_HEIGHT}px)`
          if (i < intDigitCount) {
            const isLeading = Math.floor(value / Math.pow(10, intDigitCount - 1 - i)) === 0
            el.style.opacity = isLeading ? '0.2' : '1'
          }
        }
      }

      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [inView, dailyRate, totalDigits, decimals, intDigitCount])

  return (
    <section
      ref={sectionRef}
      className="relative py-28 sm:py-40 overflow-hidden"
    >
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-3xl sm:text-5xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
            {t.burn.title}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-4 text-base sm:text-lg text-white/35 max-w-lg mx-auto"
        >
          {t.burn.subtitle}
        </motion.p>

        {/* Rolling digit counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-14 sm:mt-20 flex flex-col items-center"
        >
          <div
            className="flex items-center tracking-tight"
            style={{
              fontSize: 72,
              lineHeight: 1,
              fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontWeight: 800,
              color: '#E8A838',
              fontVariantNumeric: 'tabular-nums lining-nums',
              textShadow: '0 0 60px rgba(232, 168, 56, 0.25), 0 0 120px rgba(232, 168, 56, 0.08)',
              letterSpacing: '-0.04em',
            }}
          >
            <span className="mr-2 text-white/20 font-medium" style={{ fontSize: 40 }}>{symbol}</span>
            {Array.from({ length: totalDigits }, (_, i) => (
              <Fragment key={`${locale}-${i}`}>
                {i === intDigitCount && (
                  <span className="mx-[2px] text-white/25">.</span>
                )}
                <div
                  className="overflow-hidden relative"
                  style={{ height: DIGIT_HEIGHT, width: '0.6em' }}
                >
                  <div
                    ref={(el) => {
                      columnsRef.current[i] = el
                    }}
                    className="digit-column absolute inset-x-0"
                  >
                    {DIGITS.map((d, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-center"
                        style={{ height: DIGIT_HEIGHT }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          <p className="mt-6 text-[15px] text-white/25 font-medium tracking-wide uppercase">
            {t.burn.label}
          </p>
          <p className="mt-1.5 text-[13px] text-white/15">{t.burn.ofDaily}</p>
        </motion.div>
      </div>
    </section>
  )
}
