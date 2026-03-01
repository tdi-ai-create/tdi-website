'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FooterSymbol from '@/components/FooterSymbol';

export function Footer() {
  const pathname = usePathname();

  // Hide on creator-portal/dashboard (focused studio experience)
  // Hide on admin pages (has its own footer)
  // Hide on partner setup and login pages (focused onboarding experience)
  // Hide on hub pages (Hub has its own layout)
  if (
    pathname?.startsWith('/creator-portal/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/partner-setup') ||
    pathname?.startsWith('/partners') ||
    pathname?.startsWith('/hub')
  ) {
    return null;
  }

  return (
    <footer style={{ backgroundColor: '#1e2749' }}>
      {/* Main Footer */}
      <div className="px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand - Full width on mobile */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-bold mb-4 whitespace-nowrap" style={{ color: '#ffffff' }}>
                Teachers Deserve It
              </h3>
              <p className="text-sm mb-4" style={{ color: 'white', opacity: 0.7 }}>
                PD that respects your time, strategies that actually work, and a community that gets it.
              </p>
              {/* Animated symbol below tagline */}
              <Link
                href="/about#our-symbol"
                className="inline-block mt-2"
                aria-label="The story behind the TDI symbol"
              >
                <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px]">
                  <FooterSymbol />
                </div>
              </Link>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/join" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Join the Movement
                  </Link>
                </li>
                <li>
                  <Link href="/for-schools" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    For Schools
                  </Link>
                </li>
                <li>
                  <Link href="/how-we-partner" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    How We Partner
                  </Link>
                </li>
                <li>
                  <a href="https://tdi.thinkific.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Learning Hub
                  </a>
                </li>
                <li>
                  <Link href="/about" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Podcast
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/funding" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Funding Options
                  </Link>
                </li>
                <li>
                  <Link href="/pd-diagnostic" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    PD Diagnostic
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Impact Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/free-pd-plan" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Free PD Plan
                  </Link>
                </li>
                <li>
                  <a href="https://www.facebook.com/groups/tdimovement" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Free FB Community
                  </a>
                </li>
                <li>
                  <Link href="/create-with-us" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Become a Creator
                  </Link>
                </li>
                <li>
                  <a href="https://us.shaklee.com/en_US/raehughart/storefront" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline hover-color-shift" style={{ color: 'white', opacity: 0.7 }}>
                    Health Check
                  </a>
                </li>
              </ul>
            </div>

            {/* Stay Connected */}
            <div>
              <h4 className="font-bold text-lg mb-2" style={{ color: '#ffffff' }}>Stay Connected</h4>
              <p className="text-sm mb-4" style={{ color: '#ffba06' }}>
                Join 87,000+ educators who decided<br />they deserved better.
              </p>
              <form
                action="https://formsubmit.co/Olivia@teachersdeserveit.com"
                method="POST"
                className="space-y-3"
              >
                {/* FormSubmit.co configuration */}
                <input type="hidden" name="_subject" value="New Email Signup from TDI Website" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_next" value="https://teachersdeserveit.vercel.app/?signup=success" />

                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  required
                  className="w-full px-4 py-3 rounded-lg text-gray-900"
                  style={{ backgroundColor: '#ffffff' }}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg font-bold transition-all hover-glow"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  Join the Movement
                </button>
              </form>
              <p className="text-sm mt-4" style={{ color: '#ffffff', opacity: 0.6 }}>
                Questions? <a href="mailto:hello@teachersdeserveit.com" className="underline hover:opacity-80">Email us</a>
              </p>
              <p className="text-xs mt-2 flex items-center gap-2" style={{ color: '#ffffff', opacity: 0.5 }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
                Your data is secure. We never sell your information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="px-4 md:px-8 lg:px-16 py-4 md:py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-sm" style={{ color: 'white', opacity: 0.5 }}>
              © 2026 Teachers Deserve It. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
              <Link href="/privacy" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.5 }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.5 }}>
                Terms of Service
              </Link>
              <Link href="/security" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.5 }}>
                Security
              </Link>
            </div>
          </div>
          <p className="text-sm mt-4 text-center" style={{ color: '#ffffff', opacity: 0.7 }}>
            TDI is committed to accessibility. We strive to ensure our website is usable by all educators, including those using assistive technologies.
          </p>
        </div>
      </div>
    </footer>
  );
}
