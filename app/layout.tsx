import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "HomEstate",
  description: "Busca tu departamento ideal",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: 'https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/icono-logos%2Ffavicon.ico?alt=media&token=70b8327f-6cb4-4965-82ef-8a3afacd1d71', sizes: 'any' },
      { url: 'https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/icono-logos%2Ffavicon-16x16.png?alt=media&token=2b767f00-a615-4201-80a6-992ebf1cec94', sizes: '16x16', type: 'image/png' },
      { url: 'https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/icono-logos%2Ffavicon-32x32.png?alt=media&token=f9f9499f-d5af-48eb-8c3a-1ff080756f1e', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: 'https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/icono-logos%2Ffavicon-32x32.png?alt=media&token=f9f9499f-d5af-48eb-8c3a-1ff080756f1e', sizes: '32x32', type: 'image/png' }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ea580c' // Orange color matching the app theme
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'text-sm',
              style: {
                fontSize: '14px'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
