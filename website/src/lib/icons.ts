const CDN = 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark'

// Only use CDN for verified-working icons; rest use local SVGs
export const ICONS = {
  // CDN (verified 200)
  openai: `${CDN}/openai.png`,
  claude: `${CDN}/claude-color.png`,
  cursor: `${CDN}/cursor.png`,
  midjourney: `${CDN}/midjourney.png`,
  perplexity: `${CDN}/perplexity-color.png`,
  gemini: `${CDN}/gemini-color.png`,
  vercel: `${CDN}/vercel.png`,
  github: `${CDN}/github.png`,
  notion: `${CDN}/notion.png`,
  aws: `${CDN}/aws-color.png`,

  // Local SVGs
  spotify: '/icons/spotify-icon.svg',
  netflix: '/icons/netflix-icon.svg',
  youtube: '/icons/youtube-icon.svg',
  slack: '/icons/slack-icon.svg',
  docker: '/icons/docker-icon.svg',
  linear: '/icons/linear-icon.svg',
  discord: '/icons/discord-icon.svg',
  supabase: '/icons/supabase-icon.svg',
  onePassword: '/icons/1Password-icon.svg',
  telegram: '/icons/telegram.svg',
  obsidian: '/icons/obsidian-icon.svg',
  framer: '/icons/framer.svg',
  zoom: '/icons/zoom-icon.svg',
  sentry: '/icons/sentry-logo.svg',
} as const
