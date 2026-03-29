/* eslint-disable react-refresh/only-export-components */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BurnRate - Subscription Tracker for macOS'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,168,56,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            BurnRate
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              maxWidth: 600,
            }}
          >
            Track every subscription. See every dollar burn.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              padding: '10px 24px',
              borderRadius: 999,
              backgroundColor: '#E8A838',
              color: '#000',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Download for macOS
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
            Free & Open Source
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
