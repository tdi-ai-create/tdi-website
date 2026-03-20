'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Users, School, Building2 } from 'lucide-react';

type Role = 'Teacher' | 'Para' | 'Building Leader' | 'District Leader';

const roles: { role: Role; icon: typeof GraduationCap; description: string }[] = [
  { role: 'Teacher', icon: GraduationCap, description: 'I teach in a classroom' },
  { role: 'Para', icon: Users, description: 'I support students and staff' },
  { role: 'Building Leader', icon: School, description: 'I lead a school or campus' },
  { role: 'District Leader', icon: Building2, description: 'I oversee multiple schools' },
];

export default function GetStartedPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GA4: Page view on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'get_started_page_view');
    }
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    // GA4: Role selected
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'get_started_role_selected', { role });
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || isSubmitting) return;

    setIsSubmitting(true);

    // GA4: CTA click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'get_started_cta_click', { role: selectedRole });
    }

    // Fire GHL webhook (non-blocking, silent fail)
    fetch('https://services.leadconnectorhq.com/hooks/3V0PYKAGmdo86GbTC1GC/webhook-trigger/bb1a8bb9-586b-4245-aab4-9c7662641fb9', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'get-started page',
        role: selectedRole,
        tags: ['get-started', selectedRole.toLowerCase().replace(' ', '-')],
      }),
    }).catch(() => {});

    // Route based on role
    if (selectedRole === 'Teacher' || selectedRole === 'Para') {
      router.push('/nominate?track=non-partner');
    } else {
      router.push('/free-pd-plan');
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Where do you want to start?
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#ffffff', opacity: 0.9 }}>
            Tell us who you are and we'll point you in the right direction.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
              87,000+ educators served
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
              21 states
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
              Takes 10 seconds
            </span>
          </div>
        </div>
      </section>

      {/* Role Selector Section */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Main Content - Role Selector */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                  {/* Label */}
                  <p className="text-sm font-semibold mb-6" style={{ color: '#1e2749' }}>
                    I am a...
                  </p>

                  {/* Role Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {roles.map(({ role, icon: Icon, description }) => {
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role)}
                          className="p-6 rounded-xl text-center transition-all cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? 'rgba(255,186,6,0.08)' : '#ffffff',
                            border: isSelected ? '2px solid #ffba06' : '1.5px solid #1e2749',
                            boxShadow: isSelected ? '0 4px 12px rgba(255,186,6,0.15)' : 'none',
                          }}
                        >
                          <Icon
                            className="w-10 h-10 mx-auto mb-3"
                            style={{ color: '#1e2749' }}
                          />
                          <h3 className="text-lg font-bold mb-1" style={{ color: '#1e2749' }}>
                            {role}
                          </h3>
                          <p className="text-sm" style={{ color: '#666' }}>
                            {description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedRole || isSubmitting}
                    className="w-full py-4 rounded-lg font-bold text-lg transition-all"
                    style={{
                      backgroundColor: selectedRole ? '#ffba06' : '#d1d5db',
                      color: selectedRole ? '#1e2749' : '#9ca3af',
                      cursor: selectedRole ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isSubmitting ? 'Redirecting...' : 'Show Me Where to Start →'}
                  </button>
                </div>

                {/* Mobile: What Happens Next (shown below CTA on mobile) */}
                <div className="lg:hidden mt-6 bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-bold mb-4" style={{ color: '#1e2749' }}>
                    What happens next
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                        1
                      </div>
                      <p className="text-sm" style={{ color: '#1e2749' }}>Pick your role (10 seconds)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                        2
                      </div>
                      <p className="text-sm" style={{ color: '#1e2749' }}>We point you to the right starting place</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                        3
                      </div>
                      <p className="text-sm" style={{ color: '#1e2749' }}>TDI does the rest</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Desktop only */}
              <div className="hidden lg:block space-y-4">
                {/* What Happens Next Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                  <h3 className="font-bold mb-4" style={{ color: '#1e2749' }}>
                    What happens next
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                        1
                      </div>
                      <p className="text-sm" style={{ color: '#1e2749' }}>Pick your role (10 seconds)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                        2
                      </div>
                      <p className="text-sm" style={{ color: '#1e2749' }}>We point you to the right starting place</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                        3
                      </div>
                      <p className="text-sm" style={{ color: '#1e2749' }}>TDI does the rest</p>
                    </div>
                  </div>
                </div>

                {/* Social Proof Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <blockquote className="text-sm italic mb-3" style={{ color: '#1e2749' }}>
                    "I didn't know where to start. TDI made it easy."
                  </blockquote>
                  <p className="text-sm font-medium" style={{ color: '#666' }}>
                    — K-8 Principal, IL
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs" style={{ color: '#666' }}>
                      500+ schools have started here
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
