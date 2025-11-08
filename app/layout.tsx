import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AppProvider } from "@/providers/app-provider"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "SYNFLOX",
  description: "Professional SYNFLOX with multi-language support",
  keywords: ["SYNFLOX", "next template", "administration", "system"],
  authors: [{ name: "SYNFLOX Team" }],
  creator: "SYNFLOX",
  publisher: "SYNFLOX",
  icons: {
    icon: [
      { url: "/app-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/app-logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/app-logo.png",
    apple: "/app-logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "SYNFLOX",
    description: "Professional SYNFLOX with multi-language support",
    url: "https://synflox-frontend.vercel.app/",
    siteName: "SYNFLOX",
    images: [
      {
        url: "/app-logo.png",
        width: 512,
        height: 512,
        alt: "SYNFLOX Logo",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SYNFLOX",
    description: "Professional SYNFLOX with multi-language support",
    images: ["/app-logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
