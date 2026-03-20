'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Users, School, Building2 } from 'lucide-react';

type Role = 'Teacher' | 'Para' | 'Building Leader' | 'District Leader';

interface RoleConfig {
  role: Role;
  icon: typeof GraduationCap;
  description: string;
  tagline: string;
  group: 'classroom' | 'leader';
}

const roles: RoleConfig[] = [
  { role: 'Teacher', icon: GraduationCap, description: 'I teach in a classroom', tagline: 'TDI was built for you', group: 'classroom' },
  { role: 'Para', icon: Users, description: 'I support students and staff', tagline: 'You deserve this too', group: 'classroom' },
  { role: 'Building Leader', icon: School, description: 'I lead a school or campus', tagline: "Let's find your starting point", group: 'leader' },
  { role: 'District Leader', icon: Building2, description: 'I oversee multiple schools', tagline: "Let's think bigger", group: 'leader' },
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

  const handleContinue = async () => {
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

  const classroomRoles = roles.filter((r) => r.group === 'classroom');
  const leaderRoles = roles.filter((r) => r.group === 'leader');

  const RoleCard = ({ role, icon: Icon, description, tagline }: RoleConfig) => {
    const isSelected = selectedRole === role;
    return (
      <div
        onClick={() => handleRoleSelect(role)}
        className="relative rounded-2xl p-8 cursor-pointer transition-all duration-200 flex flex-col items-center text-center"
        style={{
          backgroundColor: isSelected ? 'rgba(255,186,6,0.06)' : '#ffffff',
          border: isSelected ? '2px solid #ffba06' : '2px solid #e5e5e5',
          boxShadow: isSelected ? '0 4px 20px rgba(255,186,6,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Radio circle - top right */}
        <div
          className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            border: isSelected ? '2px solid #ffba06' : '2px solid #d1d5db',
            backgroundColor: isSelected ? '#ffba06' : 'white',
          }}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        {/* Icon container */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: isSelected ? 'rgba(255,186,6,0.12)' : '#f5f5f5' }}
        >
          <Icon className="w-8 h-8" style={{ color: '#1e2749' }} />
        </div>

        {/* Role title */}
        <p className="text-xl font-bold mb-1" style={{ color: '#1e2749' }}>
          {role}
        </p>

        {/* Description */}
        <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
          {description}
        </p>

        {/* Warm tagline */}
        <p className="text-xs font-medium" style={{ color: isSelected ? '#2B8C96' : '#9ca3af' }}>
          {tagline}
        </p>
      </div>
    );
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Select Your Role to Get Started
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Choose the option that best describes you — we'll send you exactly where you need to go.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['87,000+ educators served', '21 states', 'Takes 10 seconds'].map((item) => (
              <span
                key={item}
                className="px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selector Section */}
      <section className="py-12 px-4" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-3xl mx-auto">
          {/* Label + instruction */}
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#2B8C96' }}>
              Step 1 of 1
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1e2749' }}>
              Who are you?
            </h2>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Select the option that best describes your role. We'll send you exactly where you need to go.
            </p>
          </div>

          {/* Group 1 — Classroom */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 ml-1" style={{ color: '#6b7280' }}>
            I work in a classroom
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classroomRoles.map((roleConfig) => (
              <RoleCard key={roleConfig.role} {...roleConfig} />
            ))}
          </div>

          {/* Group 2 — Leaders */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 ml-1 mt-6" style={{ color: '#6b7280' }}>
            I lead a school or district
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leaderRoles.map((roleConfig) => (
              <RoleCard key={roleConfig.role} {...roleConfig} />
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button
              onClick={handleContinue}
              disabled={!selectedRole || isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                backgroundColor: selectedRole ? '#ffba06' : '#e5e5e5',
                color: selectedRole ? '#1e2749' : '#9ca3af',
                cursor: selectedRole ? 'pointer' : 'not-allowed',
                transform: selectedRole ? 'scale(1.01)' : 'scale(1)',
                boxShadow: selectedRole ? '0 4px 16px rgba(255,186,6,0.3)' : 'none',
              }}
            >
              {isSubmitting
                ? 'Redirecting...'
                : selectedRole
                ? `I'm a ${selectedRole} — Continue →`
                : 'Select your role above to continue'}
            </button>

            {/* Reassurance line below button */}
            <p className="text-center text-xs mt-3" style={{ color: '#9ca3af' }}>
              No account needed. Takes 10 seconds.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-teal-200 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white" />
            </div>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Join 87,000+ educators who started right here
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
