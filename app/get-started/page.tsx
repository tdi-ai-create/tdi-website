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
    pd_plan_audience: [] as string[],
    pd_plan_scope: '',
    pd_pain_point: '',
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
    fetch('https://services.leadconnectorhq.com/hooks/3V0PYKAGmdo86GbTC1GC/webhook-trigger/afb49642-3913-454a-97e5-9823b40cf6c6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'get-started page',
        role: (({"Teacher":"teacher","Para":"paraprofessional","Building Leader":"building leader","District Leader":"district leader"} as Record<string, string>)[selectedRole ?? ""]) ?? selectedRole?.toLowerCase(),
        tags: ['get-started', selectedRole.toLowerCase().replace(' ', '-')],
      }),
    }).catch(() => {});

    setStep(2);
    setIsSubmitting(false);
    setTimeout(() => {
      document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAudienceChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      pd_plan_audience: prev.pd_plan_audience.includes(option)
        ? prev.pd_plan_audience.filter((item: string) => item !== option)
        : [...prev.pd_plan_audience, option]
    }));
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
    const isTeacherPath = selectedRole === 'Teacher' || selectedRole === 'Para';

    if (!isTeacherPath) {
      if (formData.pd_plan_audience.length === 0) {
        alert('Please select at least one audience for your PD plan.');
        return;
      }
      if (!formData.pd_plan_scope) {
        alert('Please select how you want to roll this out.');
        return;
      }
      if (!formData.pd_pain_point.trim()) {
        alert('Please describe your biggest frustration with PD.');
        return;
      }
    }

    setIsSubmitting(true);

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
      ...(!isTeacherPath && {
        'PD Plan Audience': formData.pd_plan_audience.join(', '),
        'PD Plan Scope': formData.pd_plan_scope,
        'PD Pain Point': formData.pd_pain_point,
      }),
    };

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      fetch('https://services.leadconnectorhq.com/hooks/3V0PYKAGmdo86GbTC1GC/webhook-trigger/afb49642-3913-454a-97e5-9823b40cf6c6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: (({"Teacher":"teacher","Para":"paraprofessional","Building Leader":"building leader","District Leader":"district leader"} as Record<string, string>)[selectedRole ?? ""]) ?? selectedRole?.toLowerCase(),
          school_name: formData.schoolName,
          school_city: formData.schoolCity,
          school_state: formData.schoolState,
          path: isTeacherPath ? 'nomination' : 'pd-plan',
          source: 'get-started page',
          tags: ['get-started', selectedRole?.toLowerCase().replace(' ', '-')],
          ...(!isTeacherPath && {
            pd_plan_audience: formData.pd_plan_audience.join(', '),
            pd_plan_scope: formData.pd_plan_scope,
            pd_pain_point: formData.pd_pain_point,
          }),
        }),
      }).catch(() => {});

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'get_started_form_submit', { role: (({"Teacher":"teacher","Para":"paraprofessional","Building Leader":"building leader","District Leader":"district leader"} as Record<string, string>)[selectedRole ?? ""]) ?? selectedRole?.toLowerCase(), path: isTeacherPath ? 'nomination' : 'pd-plan' });
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
        className="relative rounded-2xl p-5 md:p-6 cursor-pointer transition-all duration-200 flex flex-col items-center text-center"
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
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ backgroundColor: isSelected ? 'rgba(255,186,6,0.12)' : '#f5f5f5' }}
        >
          <Icon className="w-6 h-6" style={{ color: '#1e2749' }} />
        </div>

        <p className="text-lg font-bold mb-1" style={{ color: '#1e2749' }}>{role}</p>
        <p className="text-sm mb-2" style={{ color: '#6b7280' }}>{description}</p>
        <p className="text-xs font-medium" style={{ color: isSelected ? '#2B8C96' : '#9ca3af' }}>{tagline}</p>
      </div>
    );
  };

  const GroupLabel = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1" style={{ backgroundColor: '#e5e5e5' }} />
      <p className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: '#1e2749' }}>
        {label}
      </p>
      <div className="h-px flex-1" style={{ backgroundColor: '#e5e5e5' }} />
    </div>
  );

  // STEP 3: Confirmation
  if (step === 3) {
    const isTeacherPath = selectedRole === 'Teacher' || selectedRole === 'Para';
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <section className="py-8 md:py-10" style={{ backgroundColor: '#1e2749' }}>
          <div className="container-default text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
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
              setFormData({ name: '', email: '', schoolName: '', schoolCity: '', schoolState: '', pd_plan_audience: [], pd_plan_scope: '', pd_pain_point: '' });
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
      <section className="py-8 md:py-10" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Select Your Role to Get Started
          </h1>
          <p className="text-sm md:text-base max-w-lg mx-auto mb-4" style={{ color: '#ffffff', opacity: 0.9 }}>
            Choose the option that best describes you — we'll send you exactly where you need to go.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['87,000+ educators served', '21 states', 'Takes 10 seconds'].map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: '#ffffff',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 1: Role Selection */}
      {step === 1 && (
        <section className="py-8 px-4" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-xs font-medium mb-2" style={{ color: '#2B8C96' }}>
                Step 1 of 2
              </p>
              <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#1e2749' }}>
                Who are you?
              </h2>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                Select the option that best describes your role.
              </p>
            </div>

            <GroupLabel label="I work in a classroom" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classroomRoles.map((roleConfig) => (
                <RoleCard key={roleConfig.role} {...roleConfig} />
              ))}
            </div>

            <div className="mt-5">
              <GroupLabel label="I lead a school or district" />
            </div>
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
                  : 'Who are you? Pick a card above.'}
              </button>

              <p className="text-center text-xs mt-3" style={{ color: '#9ca3af' }}>
                No account needed. Takes 10 seconds.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
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
        <section id="step-2" className="py-8 px-4" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-xs font-medium mb-2" style={{ color: '#2B8C96' }}>
                Step 2 of 2
              </p>
              <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#1e2749' }}>
                {selectedRole === 'Teacher' || selectedRole === 'Para'
                  ? 'Tell us about the school'
                  : 'Tell us about your school'}
              </h2>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                {selectedRole === 'Teacher' || selectedRole === 'Para'
                  ? "We'll reach out to their admin within 48 hours."
                  : "We'll send your custom PD plan within 24 hours."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
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

              {/* PD Plan Fields - Leader Path Only */}
              {(selectedRole === 'Building Leader' || selectedRole === 'District Leader') && (
                <>
                  {/* PD Plan Audience - Checkboxes */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      Who is this PD plan for? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
                      Select everyone you&#39;re thinking about - you can always start with just one group.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Classroom teachers',
                        'Paraprofessionals',
                        'Special education staff',
                        'Building leadership team',
                        'New teacher onboarding',
                        'Full school or district - everyone'
                      ].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="pd_plan_audience"
                            checked={formData.pd_plan_audience.includes(option)}
                            onChange={() => handleAudienceChange(option)}
                            className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="text-sm" style={{ color: '#374151' }}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* PD Plan Scope - Radio Buttons */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      How do you want to roll this out? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
                      No wrong answer - most schools start small and expand from there.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Small pilot - a select group of teachers or one department',
                        'One full building',
                        'Multiple buildings or full district',
                        'Not sure yet - I\'d like guidance'
                      ].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="pd_plan_scope"
                            value={option}
                            checked={formData.pd_plan_scope === option}
                            onChange={(e) => setFormData(prev => ({ ...prev, pd_plan_scope: e.target.value }))}
                            className="w-5 h-5 border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="text-sm" style={{ color: '#374151' }}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* PD Pain Point - Text Area */}
                  <div className="mb-5">
                    <label htmlFor="pd_pain_point" className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      What&#39;s your biggest frustration with PD at your school right now? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
                      There are no wrong answers - the more specific you are, the more useful your plan will be.
                    </p>
                    <textarea
                      id="pd_pain_point"
                      name="pd_pain_point"
                      rows={4}
                      value={formData.pd_pain_point}
                      onChange={(e) => setFormData(prev => ({ ...prev, pd_pain_point: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 resize-none"
                      style={{ borderColor: '#d1d5db' }}
                      placeholder='e.g. "Teachers sit through PD days but nothing changes in classrooms" or "I have no way to know if strategies are actually being used"'
                    />
                  </div>
                </>
              )}

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
