"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useState } from "react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size={32} className="text-orange-600" />
          <span className="font-light text-xl text-orange-600 font-poppins">HomEstate</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/edificios-en-la-zona" className="text-gray-700 hover:text-orange-600 font-medium">
            Edificios y Departamentos
          </Link>
          <Link href="/contacto" className="text-gray-700 hover:text-orange-600 font-medium">
            ¡Únete a nosotros!
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              href="/edificios-en-la-zona" 
              className="block text-gray-700 hover:text-orange-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Edificios y Departamentos
            </Link>
            <Link 
              href="/contacto" 
              className="block text-gray-700 hover:text-orange-600 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ¡Únete a nosotros!
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
