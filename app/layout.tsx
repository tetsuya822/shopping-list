import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from './components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: '買い物リスト',
  description: 'スマートフォン向け買い物リストアプリ',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '買い物リスト',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6366f1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
