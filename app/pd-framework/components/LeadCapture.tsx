'use client';

import { useState } from 'react';
import { ClipboardCheck, Sparkles, Puzzle, Target, Check } from 'lucide-react';

interface LeadCaptureProps {
  onSubmit?: (email: string, quadrant: string) => void;
}

const quadrantOptions = [
  {
    id: 'compliance',
    label: 'Compliance-Focused',
    icon: ClipboardCheck,
    bg: 'bg-slate-100',
    selectedBg: 'bg-slate-200',
    borderColor: 'border-slate-300',
    iconColor: 'text-slate-600',
  },
  {
    id: 'inspiration',
    label: 'Inspiration-Driven',
    icon: Sparkles,
    bg: 'bg-blue-50',
    selectedBg: 'bg-blue-100',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
  },
  {
    id: 'fragmented',
    label: 'Fragmented Growth',
    icon: Puzzle,
    bg: 'bg-amber-50',
    selectedBg: 'bg-amber-100',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-600',
  },
  {
    id: 'embedded',
    label: 'Embedded Practice',
    icon: Target,
    bg: 'bg-emerald-50',
    selectedBg: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-600',
  },
];

export default function LeadCapture({ onSubmit }: LeadCaptureProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuadrant || !email) return;

    setIsSubmitting(true);

    // Simulate submission (replace with actual form handling)
    await new Promise(resolve => setTimeout(resolve, 500));

    onSubmit?.(email, selectedQuadrant);
    setSubmitted(true);
    setIsSubmitting(false);

    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submission', {
        form_name: 'pd_framework_lead_capture',
        form_location: window.location.pathname
      });
    }
  };

  if (submitted) {
    return (
      <section className="py-16 md:py-24" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
              <Check className="text-white" size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
              Check your inbox!
            </h2>
            <p className="text-lg" style={{ color: '#1e2749', opacity: 0.7 }}>
              We're sending resources tailored to your school's current state. Look for an email from us in the next few minutes.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: '#1e2749' }}>
            Which type is your school?
          </h2>
          <p className="text-center text-lg mb-8" style={{ color: '#1e2749', opacity: 0.7 }}>
            Select your current state and we'll send you relevant resources.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Quadrant Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {quadrantOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedQuadrant === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedQuadrant(option.id)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected ? `${option.selectedBg} ${option.borderColor}` : `${option.bg} border-transparent`}
                      hover:shadow-md
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <Check className="text-emerald-500" size={14} />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg ${option.bg} flex items-center justify-center mb-2`}>
                      <Icon className={option.iconColor} size={18} />
                    </div>
                    <p className="font-medium text-sm" style={{ color: '#1e2749' }}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedQuadrant || !email || isSubmitting}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg transition-all
                ${selectedQuadrant && email
                  ? 'hover:shadow-lg cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              style={{
                backgroundColor: selectedQuadrant && email ? '#ffba06' : '#e5e7eb',
                color: '#1e2749',
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send My Resources'}
            </button>

            {/* Privacy Note */}
            <p className="text-center text-sm mt-4" style={{ color: '#1e2749', opacity: 0.5 }}>
              We'll send you resources specific to your situation. No spam, unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
