'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Locale = 'en' | 'zh'

const dict = {
  en: {
    nav: { download: 'Download' },
    hero: {
      title: 'Know your burn rate.',
      subtitle: 'BurnRate lives in your macOS menu bar — a beautiful, real-time window into your subscription spending. Always one click away.',
      cta: 'Download for macOS',
      badge: 'Free · No account required',
    },
    features: {
      heading: 'Everything you need.',
      subheading: 'Nothing you don\'t.',
      menubar: {
        title: 'Always there. Never in the way.',
        desc: 'Lives quietly in your menu bar. Click to see your subscriptions, click to dismiss. No windows cluttering your workspace.',
      },
      instant: {
        title: 'Set up in seconds.',
        desc: '80+ pre-configured services — Netflix, ChatGPT, Figma, AWS. Pick from the list, prices auto-filled.',
      },
      realtime: {
        title: 'Real-time burn counter.',
        desc: 'An odometer for your wallet. Watch your daily spending tick up in real-time, penny by penny.',
      },
      private: {
        title: 'Private by design.',
        desc: 'Everything stored locally in SQLite. No accounts, no cloud, no tracking. Your data never leaves your Mac.',
      },
    },
    burn: {
      title: 'Watch every cent leave.',
      subtitle: 'The burn counter shows exactly how much you\'ve spent today. It ticks every second. It never stops.',
      label: 'burned today',
      ofDaily: 'of $47.82/day',
    },
    showcase: {
      title: 'Designed for clarity.',
      subtitle: 'Every detail crafted to give you instant insight — category breakdowns, billing cycles, multi-currency support.',
      cat: { ai: 'AI', dev: 'Dev', design: 'Design', media: 'Media', cloud: 'Cloud' },
    },
    download: {
      title: 'Start tracking.',
      subtitle: 'Free forever. No account. No data collected. Just download and go.',
      cta: 'Download for macOS',
      dmg: 'Download .dmg',
      requirements: 'macOS 12 Monterey or later · Apple Silicon & Intel',
    },
    footer: {
      rights: '© 2025 BurnRate',
      github: 'GitHub',
    },
  },
  zh: {
    nav: { download: '下载' },
    hero: {
      title: '掌握你的消耗速率。',
      subtitle: 'BurnRate 驻留在 macOS 菜单栏，一个精美的实时订阅支出追踪窗口。一键即达。',
      cta: '下载 macOS 版',
      badge: '免费 · 无需注册',
    },
    features: {
      heading: '你需要的，都在这里。',
      subheading: '多余的，一概没有。',
      menubar: {
        title: '常驻菜单栏，从不打扰。',
        desc: '安静地驻留在菜单栏。点击查看订阅，再点收起。不会干扰你的工作空间。',
      },
      instant: {
        title: '秒级添加。',
        desc: '80+ 预设服务 —— Netflix、ChatGPT、Figma、AWS。从列表选择，价格自动填入。',
      },
      realtime: {
        title: '实时消耗计数。',
        desc: '钱包的里程表。实时跳动的数字，精确到分，每秒更新。',
      },
      private: {
        title: '隐私优先。',
        desc: '所有数据本地存储于 SQLite。无需账号，不上传云端，不追踪数据。数据永不离开你的 Mac。',
      },
    },
    burn: {
      title: '每一分钱的流逝，尽收眼底。',
      subtitle: '消耗计数器精确显示今天已花费多少。每秒跳动，永不停歇。',
      label: '今日消耗',
      ofDaily: '日均 ¥338.50',
    },
    showcase: {
      title: '为清晰而设计。',
      subtitle: '每一个细节都为即时洞察而打造 —— 分类统计、账单周期、多币种支持。',
      cat: { ai: 'AI', dev: '开发', design: '设计', media: '影音', cloud: '云服务' },
    },
    download: {
      title: '开始追踪。',
      subtitle: '永久免费。无需账号。不收集数据。下载即用。',
      cta: '下载 macOS 版',
      dmg: '下载 .dmg',
      requirements: 'macOS 12 Monterey 或更高版本 · 支持 Apple Silicon 与 Intel',
    },
    footer: {
      rights: '© 2025 BurnRate',
      github: 'GitHub',
    },
  },
}

type Dict = typeof dict.en

interface I18nContextType {
  locale: Locale
  t: Dict
  toggle: () => void
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: dict.en,
  toggle: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const toggle = useCallback(() => setLocale(l => (l === 'en' ? 'zh' : 'en')), [])

  return (
    <I18nContext.Provider value={{ locale, t: dict[locale], toggle }}>
      {children}
    </I18nContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  return useContext(I18nContext)
}
