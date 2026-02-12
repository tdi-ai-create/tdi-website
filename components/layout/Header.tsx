'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide on creator-portal/dashboard (has its own studio header)
  // Hide on admin pages (has its own header)
  // Hide on partner setup and login pages (focused onboarding experience)
  // Hide on hub pages (Hub has its own navigation)
  // Hide on /login page (clean focused login experience)
  if (
    pathname?.startsWith('/creator-portal/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/partner-setup') ||
    pathname?.startsWith('/partners') ||
    pathname?.startsWith('/hub') ||
    pathname === '/login'
  ) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/for-schools', label: 'For Schools' },
    { href: '/join', label: 'For Teachers' },
    { href: '/how-we-partner', label: 'How We Partner' },
    { href: 'https://raehughart.substack.com', label: 'Blog', external: true },
    { href: 'https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274', label: 'Podcast', external: true },
    { href: '/about', label: 'About' },
    { href: '/create-with-us', label: 'Creators' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Login Button */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.webp"
                alt="Teachers Deserve It"
                width={160}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <Link
              href="/login"
              className="hidden md:inline-flex px-4 py-1.5 text-[13px] font-medium text-white bg-[#1B2A4A] rounded-md hover:bg-[#2c3e5f] transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover-color-shift"
                  style={{ color: 'var(--tdi-charcoal)' }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                    isActive(link.href)
                      ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                      : 'text-[#1e2749] hover:text-[#35A7FF]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {/* Login button - first in mobile menu */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#1B2A4A] rounded-md hover:bg-[#2c3e5f] transition-colors w-fit"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium"
                    style={{ color: 'var(--tdi-charcoal)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all w-fit ${
                      isActive(link.href)
                        ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                        : 'text-[#1e2749] hover:text-[#35A7FF]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
