'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setContentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide on creator-portal/dashboard (has its own studio header)
  // Hide on admin pages (has its own header)
  // Hide on partner setup and login pages (focused onboarding experience)
  // Hide on hub pages (Hub has its own navigation)
  // Hide on /login page (clean focused login experience)
  // Hide on all legacy dashboard routes (partner-only pages)
  const hiddenRoutes = [
    '/creator-portal/dashboard',
    '/admin',
    '/partner-setup',
    '/partners',
    '/hub',
    '/asd4-dashboard',
    '/stpchanel-dashboard',
    '/wego-dashboard',
    '/saunemin-dashboard',
    '/Allenwood-Dashboard',
    '/D41-dashboard',
  ];

  const shouldHideHeader = pathname === '/login' || hiddenRoutes.some(route => pathname?.startsWith(route));

  if (shouldHideHeader) {
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
    { href: '/Example-Dashboard', label: 'Your Dashboard', newTab: true },
  ];

  const contentLinks = [
    { href: 'https://raehughart.substack.com', label: 'Blog', external: true },
    { href: 'https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274', label: 'Podcast', external: true },
    { href: 'https://www.teachersdeserveit.com/hub', label: 'Learning Hub', external: true },
    { href: '/create-with-us', label: 'Apply to Create', featured: true },
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
              link.newTab ? (
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

            {/* Content Dropdown -- before About & Contact */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                  contentDropdownOpen
                    ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                    : 'text-[#1e2749] hover:text-[#35A7FF]'
                }`}
              >
                Content
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${contentDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {contentDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {contentLinks.map((link) => (
                    link.featured ? (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block mx-3 mt-2 px-3 py-2.5 text-sm font-bold text-center rounded-lg transition-all hover:scale-[1.02]"
                        style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                        onClick={() => setContentDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ) : link.external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-sm font-medium text-[#1e2749] hover:bg-gray-50 hover:text-[#35A7FF] transition-colors"
                        onClick={() => setContentDropdownOpen(false)}
                      >
                        <span className="flex items-center justify-between">
                          {link.label}
                          <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? 'text-[#35A7FF] bg-[#35A7FF]/5'
                            : 'text-[#1e2749] hover:bg-gray-50 hover:text-[#35A7FF]'
                        }`}
                        onClick={() => setContentDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                isActive('/about')
                  ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                  : 'text-[#1e2749] hover:text-[#35A7FF]'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                isActive('/contact')
                  ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                  : 'text-[#1e2749] hover:text-[#35A7FF]'
              }`}
            >
              Contact
            </Link>
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
                link.newTab ? (
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

              {/* Content section in mobile */}
              <div className="border-t border-gray-100 pt-4 mt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-3 mb-3">Content</p>
                {contentLinks.map((link) => (
                  link.featured ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-block mt-2 px-4 py-2 text-sm font-bold rounded-lg"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium px-3 py-1.5"
                      style={{ color: 'var(--tdi-charcoal)' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block text-sm font-medium px-3 py-1.5 rounded-full w-fit ${
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

              {/* About & Contact after Content */}
              <Link
                href="/about"
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all w-fit ${
                  isActive('/about')
                    ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                    : 'text-[#1e2749] hover:text-[#35A7FF]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all w-fit ${
                  isActive('/contact')
                    ? 'bg-[#35A7FF]/15 text-[#35A7FF]'
                    : 'text-[#1e2749] hover:text-[#35A7FF]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
