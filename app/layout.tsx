import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Footer } from "@/components/footer"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "MedChain",
  description: "A secure medical supply chain traceability platform for regulators, manufacturers, pharmacies, and consumers.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased flex min-h-screen flex-col bg-background text-foreground`}>
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
