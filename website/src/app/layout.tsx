import { Providers } from '@/components/Providers'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <title>BurnRate — Subscription Tracker for macOS</title>
        <meta
          name="description"
          content="Track every subscription. See every dollar burn. A beautiful menu bar app for macOS."
        />
        <link rel="icon" href="/icon.png" />
        <meta property="og:title" content="BurnRate — Know Your Burn Rate" />
        <meta
          property="og:description"
          content="A beautiful macOS menu bar app that tracks your subscription spending in real-time."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BurnRate" />
        <meta
          name="twitter:description"
          content="Subscription tracker that lives in your macOS menu bar."
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
