"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, ShieldCheck, X } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: "/", label: "Home" },
    { href: "/verify", label: "Verify" },
    { href: "/auth/login", label: "Login" },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">MedChain</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 px-6 py-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/verify" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Public Verification</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">MedChain</span>
            </Link>

            <div className="flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${pathname === link.href ? "text-primary" : "text-foreground/80 hover:text-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/verify">
                <Button size="sm" className="text-sm">
                  Public Verification
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
