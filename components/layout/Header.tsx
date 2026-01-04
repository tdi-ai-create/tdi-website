'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container-wide px-6 md:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Teachers Deserve It" 
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/what-we-offer" 
              className="text-base font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              What We Offer
            </Link>
            <Link 
              href="/for-schools" 
              className="text-base font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              For Schools
            </Link>
            <Link 
              href="/for-schools/pricing" 
              className="text-base font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              Pricing
            </Link>
            <a 
              href="https://raehughart.substack.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-base font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              Blog
            </a>
            <a 
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-base font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              Podcast
            </a>
            <Link 
              href="/about" 
              className="text-base font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              About
            </Link>
            <a 
              href="https://tdi.thinkific.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary text-sm py-3 px-6"
            >
              Learning Hub
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/what-we-offer" 
                className="text-base font-medium py-2"
                style={{ color: 'var(--tdi-charcoal)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                What We Offer
              </Link>
              <Link 
                href="/for-schools" 
                className="text-base font-medium py-2"
                style={{ color: 'var(--tdi-charcoal)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                For Schools
              </Link>
              <Link 
                href="/for-schools/pricing" 
                className="text-base font-medium py-2"
                style={{ color: 'var(--tdi-charcoal)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <a 
                href="https://raehughart.substack.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-base font-medium py-2"
                style={{ color: 'var(--tdi-charcoal)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>
              <a 
                href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-base font-medium py-2"
                style={{ color: 'var(--tdi-charcoal)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Podcast
              </a>
              <Link 
                href="/about" 
                className="text-base font-medium py-2"
                style={{ color: 'var(--tdi-charcoal)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <a 
                href="https://tdi.thinkific.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Learning Hub
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

