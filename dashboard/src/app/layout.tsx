import "./globals.css"
import { AppProvider } from "@/context/AppContext"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PromptArmor | LLM Security SaaS",
  description: "Enterprise LLM Security, prompt injection protection, PII scanning, and leakage defense.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
