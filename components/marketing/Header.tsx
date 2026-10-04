"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#147D7A] tracking-tight">
              NutriMed Ethiopia
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex space-x-6 items-center">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              Home
            </Link>
            <Link href="/#programs" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              Programs
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              Pricing
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              How It Works
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              Blogs
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-[#147D7A] transition">
              Contact
            </Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden lg:flex space-x-4 items-center">
            <Link href="/signin" className="text-sm font-medium text-[#147D7A] hover:text-[#0f625f] transition">
              Sign In
            </Link>
            <Link href="/create-account" className="bg-[#F58A24] text-white text-sm px-4 py-2 rounded-md font-medium shadow-sm hover:bg-[#df7d1e] transition-colors">
              Create Account
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-[#147D7A] p-2 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-3">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            Home
          </Link>
          <Link href="/#programs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            Programs
          </Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            Pricing
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            How It Works
          </Link>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            Blogs
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            About
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 font-medium hover:text-[#147D7A]">
            Contact
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
            <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-[#147D7A] font-medium border border-[#147D7A] rounded-lg">
              Sign In
            </Link>
            <Link href="/create-account" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 bg-[#F58A24] text-white font-medium rounded-lg">
              Create Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}