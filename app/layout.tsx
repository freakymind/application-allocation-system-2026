import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ApplicationProvider } from "@/contexts/application-context"
import { RuleProvider } from "@/contexts/rule-context"
import { QueueProvider } from "@/contexts/queue-context"
import { AnalystProvider } from "@/contexts/analyst-context"
import { AIAssistant } from "@/components/ai-assistant"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Application Allocation System",
  description: "Smart onboarding application allocation and management",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ApplicationProvider>
          <RuleProvider>
            <QueueProvider>
              <AnalystProvider>
                {children}
                <AIAssistant />
              </AnalystProvider>
            </QueueProvider>
          </RuleProvider>
        </ApplicationProvider>
        <Analytics />
      </body>
    </html>
  )
}
