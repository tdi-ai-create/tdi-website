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
    <footer style={{ backgroundColor: 'var(--tdi-charcoal)' }}>
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'white' }}>
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
                  Newsletter
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
              <li>
                <Link href="/for-schools/pricing" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Email Signup */}
          <div>
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

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'white', opacity: 0.5 }}>
              © {new Date().getFullYear()} Teachers Deserve It. All rights reserved.
            </p>
            <div className="flex gap-6">
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
