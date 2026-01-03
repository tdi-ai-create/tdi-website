'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/what-we-offer', label: 'What We Offer' },
  { href: 'https://raehughart.substack.com', label: 'Blog', external: true },
  { href: 'https://open.spotify.com/show/1ZDo7psMhu9TTomUBKxVvO', label: 'Podcast', external: true },
  { href: '/for-schools', label: 'For Schools' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const utilityLinks = [
  { href: 'https://tdi.thinkific.com/collections/downloads', label: 'Free Tools', external: true },
  { href: 'https://tdi.thinkific.com', label: 'Learning Hub', external: true },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container-wide mx-auto px-6 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span 
              className="text-xl font-bold"
              style={{ color: 'var(--tdi-charcoal)' }}
            >
              Teachers Deserve It
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium hover:text-[var(--tdi-teal)] transition-colors"
                  style={{ color: 'var(--tdi-charcoal)', textDecoration: 'none' }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium hover:text-[var(--tdi-teal)] transition-colors"
                  style={{ color: 'var(--tdi-charcoal)', textDecoration: 'none' }}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Utility Links */}
          <div className="hidden lg:flex items-center gap-4">
            {utilityLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2 px-4 text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: 'var(--tdi-charcoal)' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: 'var(--tdi-charcoal)' }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium py-2"
                    style={{ color: 'var(--tdi-charcoal)', textDecoration: 'none' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium py-2"
                    style={{ color: 'var(--tdi-charcoal)', textDecoration: 'none' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                {utilityLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
