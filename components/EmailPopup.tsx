'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface EmailPopupProps {
  delay?: number; // milliseconds for time trigger
}

export function EmailPopup({ delay = 30000 }: EmailPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  // Don't show on dashboard pages, internal team pages, creator portal, admin pages, partner pages, hub, or paragametools
  const isDashboardPage = pathname?.includes('-dashboard') ||
    pathname?.includes('dashboard-creation') ||
    pathname?.startsWith('/creator-portal') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/partner-setup') ||
    pathname?.startsWith('/partners') ||
    pathname?.startsWith('/hub') ||
    pathname?.startsWith('/paragametools');

  useEffect(() => {
    // Skip on dashboard pages
    if (isDashboardPage) return;

    // Check if already dismissed this session
    const wasDismissed = sessionStorage.getItem('tdi-popup-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    let triggered = false;

    const showPopup = () => {
      if (!triggered) {
        triggered = true;
        setIsOpen(true);
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
      }
    };

    // Time trigger - 30 seconds
    const timer = setTimeout(showPopup, delay);

    // Scroll trigger - 50% scroll
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        showPopup();
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [delay, isDashboardPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email service (Substack, ConvertKit, etc.)
    console.log('Email submitted:', email);
    setSubmitted(true);

    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submission', {
        form_name: 'email_popup',
        form_location: window.location.pathname
      });
    }

    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem('tdi-popup-dismissed', 'true');
    }, 2000);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
    sessionStorage.setItem('tdi-popup-dismissed', 'true');
  };

  if (isDashboardPage || dismissed || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--tdi-navy)' }}>
              You're in!
            </h3>
            <p style={{ opacity: 0.7 }}>
              Welcome to the movement.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4 text-center">
              Join the movement of educators no longer accepting the status quo
            </h3>
            
            <p className="text-center mb-6" style={{ opacity: 0.7 }}>
              Get practical strategies delivered to your inbox 3x/week. Join 87,000+ educators.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
              />
              <button 
                type="submit" 
                className="w-full py-3 rounded-lg font-bold transition-all"
                style={{ backgroundColor: 'var(--tdi-navy)', color: 'white' }}
              >
                Join 87,000+ Educators
              </button>
            </form>

            <p className="text-xs text-center mt-4" style={{ opacity: 0.5 }}>
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// Export a trigger function for calculator engagement
export function triggerEmailPopup() {
  // This can be called from calculator when user engages with results
  const event = new CustomEvent('trigger-email-popup');
  window.dispatchEvent(event);
}
