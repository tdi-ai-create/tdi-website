'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Users, School, Building2, Check } from 'lucide-react';

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

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function GetStartedPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // GA4: Page view on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'get_started_page_view');
    }
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'get_started_role_selected', { role });
    }
  };

  const handleContinue = async () => {
    if (!selectedRole || isSubmitting) return;
    setIsSubmitting(true);

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

    setStep(2);
    setIsSubmitting(false);
    setTimeout(() => {
      document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter your name';
    if (!formData.email.trim()) errors.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.schoolName.trim()) errors.schoolName = 'Please enter a school name';
    if (!formData.schoolCity.trim()) errors.schoolCity = 'Please enter a city';
    if (!formData.schoolState) errors.schoolState = 'Please select a state';
    return errors;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);

    const isTeacherPath = selectedRole === 'Teacher' || selectedRole === 'Para';

    const submitData = {
      access_key: '6533e850-3216-4ba6-bdd3-3d1273ce353b',
      subject: isTeacherPath
        ? `New Nomination via Get Started — ${formData.schoolName}`
        : `New PD Plan Request via Get Started — ${formData.schoolName}`,
      from_name: 'TDI Get Started Page',
      replyto: formData.email,
      'Role': selectedRole,
      'Name': formData.name,
      'Email': formData.email,
      'School Name': formData.schoolName,
      'City': formData.schoolCity,
      'State': formData.schoolState,
      'Path': isTeacherPath ? 'Teacher/Para - Nomination' : 'Leader - PD Plan Request',
    };

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      fetch('https://services.leadconnectorhq.com/hooks/3V0PYKAGmdo86GbTC1GC/webhook-trigger/bb1a8bb9-586b-4245-aab4-9c7662641fb9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: selectedRole,
          school_name: formData.schoolName,
          school_city: formData.schoolCity,
          school_state: formData.schoolState,
          path: isTeacherPath ? 'nomination' : 'pd-plan',
          source: 'get-started page',
          tags: ['get-started', selectedRole?.toLowerCase().replace(' ', '-')],
        }),
      }).catch(() => {});

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'get_started_form_submit', { role: selectedRole, path: isTeacherPath ? 'nomination' : 'pd-plan' });
      }

      setStep(3);
      setTimeout(() => {
        document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setStep(3);
    } finally {
      setIsSubmitting(false);
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
        <div
          className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            border: isSelected ? '2px solid #ffba06' : '2px solid #d1d5db',
            backgroundColor: isSelected ? '#ffba06' : 'white',
          }}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: isSelected ? 'rgba(255,186,6,0.12)' : '#f5f5f5' }}
        >
          <Icon className="w-8 h-8" style={{ color: '#1e2749' }} />
        </div>

        <p className="text-xl font-bold mb-1" style={{ color: '#1e2749' }}>{role}</p>
        <p className="text-sm mb-2" style={{ color: '#6b7280' }}>{description}</p>
        <p className="text-xs font-medium" style={{ color: isSelected ? '#2B8C96' : '#9ca3af' }}>{tagline}</p>
      </div>
    );
  };

  // STEP 3: Confirmation
  if (step === 3) {
    const isTeacherPath = selectedRole === 'Teacher' || selectedRole === 'Para';
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
          <div className="container-default text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Select Your Role to Get Started
            </h1>
          </div>
        </section>

        <div id="step-3" className="max-w-2xl mx-auto py-12 px-4 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#22c55e' }}
          >
            <Check className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
            {isTeacherPath ? "Your nomination is in." : "You're all set."}
          </h2>

          <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: '#4b5563' }}>
            {isTeacherPath
              ? `Thanks for nominating ${formData.schoolName}. We'll reach out to their admin within 48 hours to start the conversation.`
              : `Thanks, ${formData.name}. Check your inbox within 24 hours for your custom PD plan for ${formData.schoolName}.`}
          </p>

          <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md mx-auto mb-8 text-left">
            <p className="font-semibold mb-4 text-center" style={{ color: '#1e2749' }}>What happens next</p>
            {(isTeacherPath ? [
              'We review your nomination',
              'We reach out to the school admin within 48 hours',
              "If it's a fit, we start the conversation",
            ] : [
              'We review your answers',
              'Your custom PD plan lands in your inbox within 24 hours',
              'We follow up to answer any questions',
            ]).map((stepText, i) => (
              <div key={i} className="flex gap-3 items-start mb-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: '#4b5563' }}>{stepText}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setStep(1);
              setSelectedRole(null);
              setFormData({ name: '', email: '', schoolName: '', schoolCity: '', schoolState: '' });
              setFormErrors({});
            }}
            className="text-sm underline"
            style={{ color: '#6b7280' }}
          >
            Start over
          </button>
        </div>
      </main>
    );
  }

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

      {/* STEP 1: Role Selection */}
      {step === 1 && (
        <section className="py-12 px-4" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#2B8C96' }}>
                Step 1 of 2
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1e2749' }}>
                Who are you?
              </h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Select the option that best describes your role. We'll send you exactly where you need to go.
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest mb-3 ml-1" style={{ color: '#6b7280' }}>
              I work in a classroom
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classroomRoles.map((roleConfig) => (
                <RoleCard key={roleConfig.role} {...roleConfig} />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest mb-3 ml-1 mt-6" style={{ color: '#6b7280' }}>
              I lead a school or district
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leaderRoles.map((roleConfig) => (
                <RoleCard key={roleConfig.role} {...roleConfig} />
              ))}
            </div>

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
                  ? 'Loading...'
                  : selectedRole
                  ? `I'm a ${selectedRole} — Continue →`
                  : 'Select your role above to continue'}
              </button>

              <p className="text-center text-xs mt-3" style={{ color: '#9ca3af' }}>
                No account needed. Takes 10 seconds.
              </p>
            </div>

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
      )}

      {/* STEP 2: Form */}
      {step === 2 && (
        <section id="step-2" className="py-12 px-4" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#2B8C96' }}>
                Step 2 of 2
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1e2749' }}>
                {selectedRole === 'Teacher' || selectedRole === 'Para'
                  ? 'Tell us about the school'
                  : 'Tell us about your school'}
              </h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {selectedRole === 'Teacher' || selectedRole === 'Para'
                  ? "We'll reach out to their admin within 48 hours."
                  : "We'll send your custom PD plan within 24 hours."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <span
                className="px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: 'rgba(255,186,6,0.1)', border: '1px solid #ffba06', color: '#1e2749' }}
              >
                {selectedRole}
              </span>
              <button
                onClick={() => { setStep(1); setSelectedRole(null); setFormErrors({}); }}
                className="text-sm underline"
                style={{ color: '#6b7280' }}
              >
                Change
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }); }}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500"
                  style={{ borderColor: formErrors.name ? '#ef4444' : '#d1d5db' }}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@school.edu"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500"
                  style={{ borderColor: formErrors.email ? '#ef4444' : '#d1d5db' }}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                  {selectedRole === 'Teacher' || selectedRole === 'Para'
                    ? "School You're Nominating"
                    : 'Your School or District Name'}
                  {' '}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full school or district name"
                  value={formData.schoolName}
                  onChange={(e) => { setFormData({ ...formData, schoolName: e.target.value }); setFormErrors({ ...formErrors, schoolName: '' }); }}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500"
                  style={{ borderColor: formErrors.schoolName ? '#ef4444' : '#d1d5db' }}
                />
                {formErrors.schoolName && <p className="text-red-500 text-xs mt-1">{formErrors.schoolName}</p>}
              </div>

              <div className="grid grid-cols-[65%_35%] gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.schoolCity}
                    onChange={(e) => { setFormData({ ...formData, schoolCity: e.target.value }); setFormErrors({ ...formErrors, schoolCity: '' }); }}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500"
                    style={{ borderColor: formErrors.schoolCity ? '#ef4444' : '#d1d5db' }}
                  />
                  {formErrors.schoolCity && <p className="text-red-500 text-xs mt-1">{formErrors.schoolCity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.schoolState}
                    onChange={(e) => { setFormData({ ...formData, schoolState: e.target.value }); setFormErrors({ ...formErrors, schoolState: '' }); }}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 bg-white"
                    style={{ borderColor: formErrors.schoolState ? '#ef4444' : '#d1d5db' }}
                  >
                    <option value="">State</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {formErrors.schoolState && <p className="text-red-500 text-xs mt-1">{formErrors.schoolState}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{
                  backgroundColor: '#ffba06',
                  color: '#1e2749',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Submitting...' : (
                  selectedRole === 'Teacher' || selectedRole === 'Para'
                    ? 'Submit Nomination →'
                    : 'Send My PD Plan →'
                )}
              </button>
              <p className="text-center text-xs mt-3" style={{ color: '#9ca3af' }}>
                Your data is secure. We never sell your information.
              </p>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
