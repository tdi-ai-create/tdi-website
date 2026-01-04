'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email service
    console.log('Footer email submitted:', email);
    setSubmitted(true);
    setEmail('');
  };

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
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/join" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Join the Movement
                  </Link>
                </li>
                <li>
                  <a href="https://tdi.thinkific.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Learning Hub
                  </a>
                </li>
                <li>
                  <Link href="/for-schools" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    For Schools
                  </Link>
                </li>
                <li>
                  <Link href="/funding" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Funding Options
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Podcast
                  </a>
                </li>
                <li>
                  <Link href="/calculator" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                    Impact Calculator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Email Signup */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Stay Connected</h4>
              {submitted ? (
                <p className="text-sm" style={{ color: 'var(--tdi-yellow)' }}>
                  Thanks for joining!
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm text-gray-900"
                  />
                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded text-sm font-semibold transition-all"
                    style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}
                  >
                    Join 87K+ Educators
                  </button>
                </form>
              )}
              <p className="text-xs mt-3" style={{ color: 'white', opacity: 0.5 }}>
                Questions? <a href="mailto:hello@teachersdeserveit.com" className="underline">Email us</a>
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
              © 2025 Teachers Deserve It. All rights reserved.
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
        </div>
      </div>
    </footer>
  );
}
