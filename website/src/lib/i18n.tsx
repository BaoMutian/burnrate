'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Locale = 'en' | 'zh'

const dict = {
  en: {
    nav: { download: 'Download' },
    hero: {
      title: 'All your subscriptions. One menu bar.',
      subtitle: 'Netflix, ChatGPT, Figma, iCloud, AWS — you subscribe to dozens of services. BurnRate sits in your macOS menu bar and tracks every single one, so you always know exactly how much you\'re paying.',
      cta: 'Download for macOS',
      badge: 'Free · No account required',
    },
    features: {
      heading: 'Stop guessing what you pay.',
      subheading: 'Start knowing.',
      menubar: {
        title: 'Lives in your menu bar.',
        desc: 'No app windows to manage. Click the icon to see all your subscriptions and total monthly cost. Click again to dismiss.',
      },
      instant: {
        title: '80+ services built in.',
        desc: 'ChatGPT, Netflix, Figma, Spotify, AWS, GitHub — pick from the list, prices auto-filled. Or add any custom service.',
      },
      realtime: {
        title: 'Real-time burn counter.',
        desc: 'Switch to burn view and watch your daily spending tick up in real-time — an odometer for your wallet.',
      },
      private: {
        title: 'Your data stays on your Mac.',
        desc: 'Everything stored locally in SQLite. No accounts, no cloud sync, no analytics. Export your data anytime as JSON.',
      },
    },
    burn: {
      title: 'See your money burn. Literally.',
      subtitle: 'The burn counter translates your monthly subscriptions into a per-second cost — and shows it ticking away in real-time.',
      label: 'burned today',
      ofDaily: 'of $47.82/day',
    },
    showcase: {
      title: 'Know where every dollar goes.',
      subtitle: 'Category breakdowns, billing cycle tracking, multi-currency conversion — everything you need to understand your subscription spending.',
      cat: { ai: 'AI', dev: 'Dev', design: 'Design', media: 'Media', cloud: 'Cloud' },
    },
    download: {
      title: 'Take control of your subscriptions.',
      subtitle: 'Free forever. No account needed. No data collected. Just download and start tracking.',
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
      title: '你的所有订阅，尽在菜单栏。',
      subtitle: 'Netflix、ChatGPT、Figma、iCloud、AWS —— 你订阅了几十个付费服务。BurnRate 驻留在 macOS 菜单栏，帮你集中追踪每一笔订阅，随时掌握总支出。',
      cta: '下载 macOS 版',
      badge: '免费 · 无需注册',
    },
    features: {
      heading: '别再猜你花了多少。',
      subheading: '一目了然。',
      menubar: {
        title: '驻留在菜单栏。',
        desc: '无需打开任何窗口。点击图标查看所有订阅和月度总费用，再点收起。',
      },
      instant: {
        title: '内置 80+ 服务。',
        desc: 'ChatGPT、Netflix、Figma、Spotify、AWS、GitHub —— 从列表中选择，价格自动填入。也可添加任意自定义服务。',
      },
      realtime: {
        title: '实时消耗计数。',
        desc: '切换到 Burn 视图，实时看着每日支出逐秒跳动 —— 钱包的里程表。',
      },
      private: {
        title: '数据只存在你的 Mac。',
        desc: '所有数据本地存储于 SQLite。无需账号，不上传云端，不追踪数据。随时导出 JSON 备份。',
      },
    },
    burn: {
      title: '看着你的钱在燃烧。',
      subtitle: '消耗计数器将你的月度订阅换算成每秒费用 —— 然后实时展示它的流逝。',
      label: '今日消耗',
      ofDaily: '日均 ¥338.50',
    },
    showcase: {
      title: '每一分钱花在哪，一清二楚。',
      subtitle: '分类统计、账单周期追踪、多币种自动换算 —— 全方位洞察你的订阅支出。',
      cat: { ai: 'AI', dev: '开发', design: '设计', media: '影音', cloud: '云服务' },
    },
    download: {
      title: '掌控你的订阅支出。',
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
