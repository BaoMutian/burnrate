'use client'

import { useI18n } from '@/lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/[0.05] py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/25">
        <span>{t.footer.rights}</span>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="hover:text-white/50 transition-colors"
          >
            {t.footer.github}
          </a>
        </div>
      </div>
    </footer>
  )
}
