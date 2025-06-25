import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "HomEstate Back Office",
  description: "Panel administrativo para gestión de edificios y departamentos",
  generator: 'v0.dev'
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
