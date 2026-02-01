'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Users,
  TrendingUp,
  Facebook,
  Twitter,
  Mail,
  Copy,
  Check,
  CheckCircle,
  FileText,
  BarChart3,
  Headphones,
  MessageSquare,
  Heart,
  Loader2,
  Award,
  Bot,
  Star,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Gift,
  BookOpen,
  Shuffle,
  ArrowDown,
} from 'lucide-react';

// Update this number as spots fill
const VIP_SPOTS_REMAINING = 5;

type Track = 'partner-leader-referral' | 'partner-teacher-nomination' | 'non-partner-nomination' | null;

interface FormData {
  name: string;
  email: string;
  yourSchool: string;
  nominatedSchool: string;
  schoolCityState: string;
  principalName: string;
  pdChallenge: string;
  relationship: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  yourSchool?: string;
  nominatedSchool?: string;
  schoolCityState?: string;
  relationship?: string;
}

export default function NominatePage() {
  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  // Form routing state
  const [isPartner, setIsPartner] = useState<boolean | null>(null);
  const [role, setRole] = useState<'leader' | 'teacher' | null>(null);
  const [track, setTrack] = useState<Track>(null);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    yourSchool: '',
    nominatedSchool: '',
    schoolCityState: '',
    principalName: '',
    pdChallenge: '',
    relationship: '',
    notes: '',
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Track 3 optional fields toggle
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Form start tracking (to only fire once)
  const [hasTrackedFormStart, setHasTrackedFormStart] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Copy button state
  const [copied, setCopied] = useState(false);

  // Ref for smooth scroll
  const confirmationRef = useRef<HTMLDivElement>(null);

  // Refs for form fields (for scrolling to errors)
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const yourSchoolRef = useRef<HTMLInputElement>(null);
  const nominatedSchoolRef = useRef<HTMLInputElement>(null);
  const schoolCityStateRef = useRef<HTMLInputElement>(null);
  const relationshipRef = useRef<HTMLSelectElement>(null);

  // GA4 page view tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_page_view', { page: '/nominate' });
    }
  }, []);

  // Scroll to confirmation after submission
  useEffect(() => {
    if (submitted && confirmationRef.current) {
      const timer = setTimeout(() => {
        confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  // Accordion toggle
  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  // Scroll to form
  const scrollToForm = () => {
    document.getElementById('nomination-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Determine track based on selections
  const getTrack = (): Track => {
    if (isPartner === false) return 'non-partner-nomination';
    if (isPartner === true && role === 'leader') return 'partner-leader-referral';
    if (isPartner === true && role === 'teacher') return 'partner-teacher-nomination';
    return null;
  };

  const currentTrack = getTrack();

  // Determine progress step
  const getProgressStep = (): number => {
    if (!currentTrack) return 1;
    const hasRequiredFields = formData.name && formData.email && formData.nominatedSchool;
    if (currentTrack === 'non-partner-nomination' && (!formData.relationship || !formData.schoolCityState)) {
      return 2;
    }
    if ((currentTrack === 'partner-leader-referral' || currentTrack === 'partner-teacher-nomination') && !formData.yourSchool) {
      return 2;
    }
    if (hasRequiredFields) return 3;
    return 2;
  };

  const progressStep = getProgressStep();

  // Get track type label for Web3Forms
  const getTrackTypeLabel = (): string => {
    switch (currentTrack) {
      case 'partner-leader-referral':
        return 'Partner Leader Referral';
      case 'partner-teacher-nomination':
        return 'Partner Teacher Nomination';
      case 'non-partner-nomination':
        return 'Non-Partner Nomination';
      default:
        return 'Unknown';
    }
  };

  // Get subject line based on track
  const getSubjectLine = (): string => {
    switch (currentTrack) {
      case 'partner-leader-referral':
        return `New Referral (Track 1: Partner Leader) - ${formData.nominatedSchool}`;
      case 'partner-teacher-nomination':
        return `New Nomination (Track 2: Partner Teacher) - ${formData.nominatedSchool}`;
      case 'non-partner-nomination':
        return `New Nomination (Track 3: Non-Partner) - ${formData.nominatedSchool}`;
      default:
        return 'New Nomination - TDI Website';
    }
  };

  // Get encouragement line based on track
  const getEncouragementLine = (): string => {
    switch (currentTrack) {
      case 'partner-leader-referral':
        return 'A recommendation from a current partner carries real weight. Thank you for thinking of someone.';
      case 'partner-teacher-nomination':
        return 'The people doing the work every day are usually the first to know which schools need this.';
      case 'non-partner-nomination':
        return "You don't have to be connected to TDI to start this conversation. We're glad you're here.";
      default:
        return '';
    }
  };

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Please enter your name';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if ((currentTrack === 'partner-leader-referral' || currentTrack === 'partner-teacher-nomination') && !formData.yourSchool.trim()) {
      errors.yourSchool = 'Please enter your school name';
    }

    if (!formData.nominatedSchool.trim()) {
      errors.nominatedSchool = 'Please enter the school name';
    }

    if (currentTrack === 'non-partner-nomination') {
      if (!formData.relationship) {
        errors.relationship = 'Please select your relationship';
      }
      if (!formData.schoolCityState.trim()) {
        errors.schoolCityState = 'Please enter the city and state';
      }
    }

    return errors;
  };

  // Scroll to first error
  const scrollToFirstError = (errors: FormErrors) => {
    if (errors.name && nameRef.current) {
      nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameRef.current.focus();
    } else if (errors.email && emailRef.current) {
      emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      emailRef.current.focus();
    } else if (errors.yourSchool && yourSchoolRef.current) {
      yourSchoolRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      yourSchoolRef.current.focus();
    } else if (errors.relationship && relationshipRef.current) {
      relationshipRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      relationshipRef.current.focus();
    } else if (errors.nominatedSchool && nominatedSchoolRef.current) {
      nominatedSchoolRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nominatedSchoolRef.current.focus();
    } else if (errors.schoolCityState && schoolCityStateRef.current) {
      schoolCityStateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      schoolCityStateRef.current.focus();
    }
  };

  // Clear individual error when user types
  const clearFieldError = (field: keyof FormErrors) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Track form start (first field interaction)
  const trackFormStart = () => {
    if (!hasTrackedFormStart && currentTrack) {
      setHasTrackedFormStart(true);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'nominate_form_start', { track: currentTrack });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Validate form
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
      return;
    }

    setIsSubmitting(true);
    setError(false);

    const submitData: Record<string, string | undefined> = {
      access_key: '6533e850-3216-4ba6-bdd3-3d1273ce353b',
      subject: getSubjectLine(),
      from_name: 'TDI Nominate Page',
      replyto: formData.email,
      'Track Type': getTrackTypeLabel(),
      'Is TDI Partner': isPartner ? 'Yes' : 'No',
      'Your Name': formData.name,
      'Your Email': formData.email,
    };

    if (isPartner && role) {
      submitData['Role'] = role === 'leader' ? 'School Leader' : 'Teacher or Staff';
    }

    if (currentTrack === 'partner-leader-referral' || currentTrack === 'partner-teacher-nomination') {
      submitData['Your School Name'] = formData.yourSchool;
    }

    if (currentTrack === 'non-partner-nomination') {
      submitData['Relationship to School'] = formData.relationship;
    }

    const schoolFieldName = currentTrack === 'partner-leader-referral' ? 'School Being Referred' : 'School Being Nominated';
    submitData[schoolFieldName] = formData.nominatedSchool;

    if (currentTrack === 'non-partner-nomination') {
      submitData['School City and State'] = formData.schoolCityState;
    }

    if (formData.principalName) {
      submitData['Principal Name (If Known)'] = formData.principalName;
    }

    if (formData.pdChallenge) {
      submitData['Biggest PD Challenge'] = formData.pdChallenge;
    }

    if (formData.notes) {
      submitData['Additional Notes'] = formData.notes;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setSubmitted(true);
        setTrack(currentTrack);

        // GA4 form submit tracking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'nominate_form_submit', { track: currentTrack });
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    // GA4 tracking for nominate another click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_another_click');
    }

    setIsPartner(null);
    setRole(null);
    setTrack(null);
    setFormData({
      name: '',
      email: '',
      yourSchool: '',
      nominatedSchool: '',
      schoolCityState: '',
      principalName: '',
      pdChallenge: '',
      relationship: '',
      notes: '',
    });
    setFormErrors({});
    setHasAttemptedSubmit(false);
    setHasTrackedFormStart(false);
    setShowOptionalFields(false);
    setSubmitted(false);
    setError(false);
    setCopied(false);
  };

  const getConfirmationContent = () => {
    const schoolName = formData.nominatedSchool || 'the school';

    switch (track) {
      case 'partner-leader-referral':
        return {
          heading: 'Thank you for the referral.',
          body: `Your recommendation means a lot. We'll reach out to ${schoolName} within 48 hours and we'll mention your name.`,
        };
      case 'partner-teacher-nomination':
        return {
          heading: 'Your nomination is in.',
          body: `Thanks for advocating for your school. We'll reach out to ${schoolName}'s admin within 48 hours. They'll know you started this.`,
        };
      case 'non-partner-nomination':
      default:
        return {
          heading: 'Your nomination is in.',
          body: `Thanks for nominating ${schoolName}. We'll reach out to their admin within 48 hours to start the conversation.`,
        };
    }
  };

  const shareableText =
    "I just nominated a school for a TDI partnership. If your school needs better PD, you can nominate yours too: teachersdeserveit.com/nominate";
  const shareUrl = 'https://teachersdeserveit.com/nominate';

  const handleCopy = async () => {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_share_click', { method: 'copy' });
    }

    try {
      await navigator.clipboard.writeText(shareableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareableText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFacebookShare = () => {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_share_click', { method: 'facebook' });
    }

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTwitterShare = () => {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_share_click', { method: 'twitter' });
    }

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareableText)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleEmailShare = () => {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_share_click', { method: 'email' });
    }

    const subject = encodeURIComponent('Nominate Your School for Better PD');
    const body = encodeURIComponent(shareableText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Handle partner status change with GA4 tracking
  const handlePartnerChange = (value: boolean) => {
    setIsPartner(value);
    setRole(null);

    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_partner_status', { is_partner: value ? 'yes' : 'no' });
    }
  };

  // Handle role change with GA4 tracking
  const handleRoleChange = (value: 'leader' | 'teacher') => {
    setRole(value);

    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'nominate_role_selected', { role: value === 'leader' ? 'school-leader' : 'teacher-staff' });
    }
  };

  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/images/hero-for-schools.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.5) 0%, rgba(30, 39, 73, 0.65) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 container-default text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Know a School That Deserves Better PD?
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Nominate them. If it leads to a partnership, we celebrate you.
          </p>

          {/* Trust Line */}
          <p className="text-base mb-6" style={{ color: '#ffffff', opacity: 0.8 }}>
            Trusted by 87,000+ educators in 21 states
          </p>

          {/* VIP Spots Counter */}
          <div
            className="inline-block px-6 py-3 rounded-lg mb-6"
            style={{ backgroundColor: 'rgba(53, 167, 255, 0.2)', border: '1px solid #35A7FF' }}
          >
            <p className="font-semibold" style={{ color: '#35A7FF' }}>
              Only <span className="text-2xl font-bold">{VIP_SPOTS_REMAINING}</span> Blueprint Founders Circle spots available for Fall 2026
            </p>
          </div>

          {/* Start Your Nomination CTA Button */}
          <div>
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: '#ffffff', color: '#1e2749' }}
            >
              Start Your Nomination
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. The Mission Moment */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#fafafa' }}>
        <div className="container-default">
          <div className="max-w-[700px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-10" style={{ color: '#1e2749' }}>
              One Conversation Can Change Everything for a School
            </h2>

            <div className="space-y-6 text-lg md:text-xl" style={{ color: '#1e2749', lineHeight: 1.7 }}>
              <p>
                Every TDI partnership started because someone said something. A principal mentioned us to a friend. A teacher told us about a school down the road that was struggling.
              </p>
              <p>
                You probably know a school right now where teachers are burning out, PD feels like a waste of time, and nobody's doing anything about it.
              </p>
              <p className="font-semibold" style={{ color: '#1e2749' }}>
                This is how it changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Accordion — What Happens When You Nominate */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ color: '#1e2749' }}>
              What Happens When You Nominate
            </h2>
            <p className="text-center mb-10" style={{ color: '#1e2749', opacity: 0.7 }}>
              Everything you'd want to know before you start.
            </p>

            <div className="space-y-4">
              {/* Accordion Item 1 */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5' }}
              >
                <button
                  onClick={() => toggleAccordion(0)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  <span className="font-semibold text-lg" style={{ color: '#1e2749' }}>
                    What happens after I nominate?
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${openAccordion === 0 ? 'rotate-180' : ''}`}
                    style={{ color: '#35A7FF' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openAccordion === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5">
                    <p style={{ color: '#1e2749', opacity: 0.8 }}>
                      We reach out to the school's admin team within 48 hours. They'll know you started the conversation. You don't have to do anything else — we take it from here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accordion Item 2 */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5' }}
              >
                <button
                  onClick={() => toggleAccordion(1)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  <span className="font-semibold text-lg" style={{ color: '#1e2749' }}>
                    What do I earn if it becomes a partnership?
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${openAccordion === 1 ? 'rotate-180' : ''}`}
                    style={{ color: '#35A7FF' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openAccordion === 1 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 space-y-4">
                    <p style={{ color: '#1e2749', opacity: 0.8 }}>
                      If you're a teacher or community member who nominates a school, you earn a personal celebration reward — up to $500. That could be a gift card, classroom supplies, or whatever feels right for you.
                    </p>
                    <p style={{ color: '#1e2749', opacity: 0.8 }}>
                      If you're a school leader who refers another school, your entire staff gets celebrated. We're talking TDI swag for every teacher, plus you choose how to use the rest of the budget.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accordion Item 3 */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5' }}
              >
                <button
                  onClick={() => toggleAccordion(2)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  <span className="font-semibold text-lg" style={{ color: '#1e2749' }}>
                    Wait — my whole staff gets celebrated?
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${openAccordion === 2 ? 'rotate-180' : ''}`}
                    style={{ color: '#35A7FF' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openAccordion === 2 ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 space-y-4">
                    <p style={{ color: '#1e2749', opacity: 0.8 }}>
                      Yes. When a school leader refers another school and it becomes a partnership, TDI funds a celebration for the referring school's teachers. You pick from the menu:
                    </p>

                    {/* Reward menu cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div
                        className="p-4 rounded-lg flex items-start gap-3"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#ffba06' }}
                        >
                          <UtensilsCrossed className="w-5 h-5" style={{ color: '#1e2749' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#1e2749' }}>Catered Celebration</p>
                          <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>A team lunch or breakfast for your whole staff</p>
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-lg flex items-start gap-3"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#ffba06' }}
                        >
                          <Gift className="w-5 h-5" style={{ color: '#1e2749' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#1e2749' }}>Individual Gift Cards</p>
                          <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Every teacher gets a gift card — Target, Amazon, Visa, your choice</p>
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-lg flex items-start gap-3"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#ffba06' }}
                        >
                          <BookOpen className="w-5 h-5" style={{ color: '#1e2749' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#1e2749' }}>Classroom Supply Grants</p>
                          <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Teachers submit wish lists, TDI fulfills them</p>
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-lg flex items-start gap-3"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#ffba06' }}
                        >
                          <Shuffle className="w-5 h-5" style={{ color: '#1e2749' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#1e2749' }}>Hybrid</p>
                          <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Mix and match from the options above</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm font-medium" style={{ color: '#35A7FF' }}>
                      Plus TDI swag — hats, tees, the works — is included no matter what you choose.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accordion Item 4 */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5' }}
              >
                <button
                  onClick={() => toggleAccordion(3)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  <span className="font-semibold text-lg" style={{ color: '#1e2749' }}>
                    What's Blueprint Founders Circle?
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${openAccordion === 3 ? 'rotate-180' : ''}`}
                    style={{ color: '#35A7FF' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openAccordion === 3 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 space-y-4">
                    <p style={{ color: '#1e2749', opacity: 0.8 }}>
                      The first 5 schools each semester that come in through a referral or nomination receive Blueprint Founders Circle status.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#35A7FF' }}
                        >
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <p style={{ color: '#1e2749' }}>A bonus executive coaching session</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#35A7FF' }}
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <p style={{ color: '#1e2749' }}>Early access to Desi, our AI-powered teacher support tool</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#35A7FF' }}
                        >
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <p style={{ color: '#1e2749' }}>A spotlight feature on the TDI website</p>
                      </div>
                    </div>

                    <p className="text-sm font-medium mt-4" style={{ color: '#35A7FF' }}>
                      Only {VIP_SPOTS_REMAINING} spots remain for Fall 2026. Once they're gone, they're gone until next semester.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accordion Item 5 */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5' }}
              >
                <button
                  onClick={() => toggleAccordion(4)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  <span className="font-semibold text-lg" style={{ color: '#1e2749' }}>
                    Is there a catch?
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${openAccordion === 4 ? 'rotate-180' : ''}`}
                    style={{ color: '#35A7FF' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openAccordion === 4 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5">
                    <p style={{ color: '#1e2749', opacity: 0.8 }}>
                      No. You nominate a school. We reach out. If it becomes a partnership, we celebrate you. If it doesn't, no harm done — you advocated for a school that needed it, and that matters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Proof Section */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          {/* Stat Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-6 h-6" style={{ color: '#ffba06' }} />
                <p className="text-4xl md:text-5xl font-bold" style={{ color: '#ffffff' }}>21</p>
              </div>
              <p className="font-medium" style={{ color: '#ffffff' }}>States</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.6 }}>Active TDI partnerships</p>
            </div>
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6" style={{ color: '#ffba06' }} />
                <p className="text-4xl md:text-5xl font-bold" style={{ color: '#ffffff' }}>87,000+</p>
              </div>
              <p className="font-medium" style={{ color: '#ffffff' }}>Educators</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.6 }}>In the TDI community</p>
            </div>
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6" style={{ color: '#ffba06' }} />
                <p className="text-4xl md:text-5xl font-bold" style={{ color: '#ffffff' }}>65%</p>
              </div>
              <p className="font-medium" style={{ color: '#ffffff' }}>Implementation Rate</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.6 }}>Industry average: 10%</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="relative px-6 py-8 rounded-xl"
              style={{ backgroundColor: 'rgba(53, 167, 255, 0.1)' }}
            >
              {/* Decorative quote mark */}
              <div
                className="absolute left-6 top-4 text-7xl font-serif leading-none select-none"
                style={{ color: '#35A7FF', opacity: 0.4, fontFamily: 'Georgia, serif' }}
              >
                "
              </div>
              <p
                className="text-xl md:text-2xl italic mb-4 relative z-10 pt-6"
                style={{ color: '#ffffff' }}
              >
                I went from spending 12 hours a week planning to 6. I want that for every teacher I know.
              </p>
              <p className="text-sm font-semibold" style={{ color: '#35A7FF' }}>
                — TDI Partner Teacher, IL
              </p>
              <p className="text-xs font-medium mt-2" style={{ color: '#35A7FF' }}>
                This is why people nominate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Form */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="max-w-2xl mx-auto" ref={confirmationRef}>
            {/* Confirmation Message */}
            {submitted ? (
              <div className="space-y-8">
                {/* Main Confirmation */}
                <div
                  className="bg-white rounded-xl p-8 text-center shadow-md animate-fade-in"
                  style={{ border: '2px solid #22c55e' }}
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: '#22c55e' }}
                  >
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#1e2749' }}>
                    {getConfirmationContent().heading}
                  </h3>
                  <p className="text-lg mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                    {getConfirmationContent().body}
                  </p>
                  <p className="text-sm mb-6" style={{ color: '#1e2749', opacity: 0.7 }}>
                    When a nomination leads to a partnership, we celebrate the person who started the conversation.
                  </p>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                    style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                  >
                    Nominate Another School
                  </button>
                </div>

                {/* Share This Nomination */}
                <div className="bg-white rounded-xl p-6 shadow-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <h4 className="text-lg font-bold mb-4 text-center" style={{ color: '#1e2749' }}>
                    Spread the word
                  </h4>

                  <div
                    className="p-4 rounded-lg mb-4"
                    style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5' }}
                  >
                    <p className="text-sm mb-3" style={{ color: '#1e2749' }}>
                      {shareableText}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                      style={{ backgroundColor: copied ? '#22c55e' : '#1e2749', color: '#ffffff' }}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleFacebookShare}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: '#1877F2' }}
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleTwitterShare}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: '#000000' }}
                      aria-label="Share on X"
                    >
                      <Twitter className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleEmailShare}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: '#35A7FF' }}
                      aria-label="Share via Email"
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Something For You */}
                <div className="bg-white rounded-xl p-6 shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <h4 className="text-lg font-bold mb-4 text-center" style={{ color: '#1e2749' }}>
                    While we get to work on your nomination, here's something for you.
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                      href="/free-pd-plan"
                      className="p-4 rounded-lg text-center transition-all hover:shadow-md"
                      style={{ backgroundColor: '#f5f5f5' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <FileText className="w-5 h-5" style={{ color: '#1e2749' }} />
                      </div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#1e2749' }}>Free PD Plan</p>
                      <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>Get a custom plan in 24 hours</p>
                    </Link>

                    <Link
                      href="/pd-diagnostic"
                      className="p-4 rounded-lg text-center transition-all hover:shadow-md"
                      style={{ backgroundColor: '#f5f5f5' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <BarChart3 className="w-5 h-5" style={{ color: '#1e2749' }} />
                      </div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#1e2749' }}>PD Diagnostic</p>
                      <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>Find out where your PD stands</p>
                    </Link>

                    <a
                      href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg text-center transition-all hover:shadow-md"
                      style={{ backgroundColor: '#f5f5f5' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <Headphones className="w-5 h-5" style={{ color: '#1e2749' }} />
                      </div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#1e2749' }}>TDI Podcast</p>
                      <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>Listen to Sustainable Teaching</p>
                    </a>
                  </div>
                </div>

                {/* What Happens Next Timeline */}
                <div className="bg-white rounded-xl p-6 shadow-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h4 className="text-lg font-bold mb-6 text-center" style={{ color: '#1e2749' }}>
                    What happens from here
                  </h4>

                  <div className="max-w-md mx-auto">
                    {/* Step 1 - Active */}
                    <div className="flex gap-4 pb-6 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#35A7FF' }}
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: '#35A7FF' }} />
                      </div>
                      <div className="pb-2">
                        <p className="font-semibold" style={{ color: '#35A7FF' }}>Within 48 hours</p>
                        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                          We reach out to their admin team to start the conversation.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 pb-6 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                          style={{ borderColor: '#35A7FF', backgroundColor: 'rgba(53, 167, 255, 0.1)' }}
                        >
                          <MessageSquare className="w-5 h-5" style={{ color: '#35A7FF' }} />
                        </div>
                        <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: '#e5e5e5' }} />
                      </div>
                      <div className="pb-2">
                        <p className="font-semibold" style={{ color: '#1e2749' }}>If there's a fit</p>
                        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                          We walk them through what a TDI partnership looks like.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                          style={{ borderColor: '#35A7FF', backgroundColor: 'rgba(53, 167, 255, 0.1)' }}
                        >
                          <Heart className="w-5 h-5" style={{ color: '#35A7FF' }} />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#1e2749' }}>When a deal closes</p>
                        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                          We celebrate you for starting it.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div id="nomination-form" className="bg-white rounded-xl p-6 md:p-8 shadow-md">
                {/* Progress Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between max-w-xs mx-auto">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          progressStep > 1 ? 'bg-[#35A7FF] text-white' : progressStep === 1 ? 'bg-[#35A7FF] text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {progressStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                      </div>
                      <span className={`text-xs mt-1 ${progressStep >= 1 ? 'text-[#35A7FF]' : 'text-gray-400'}`}>About You</span>
                    </div>
                    {/* Line */}
                    <div className={`flex-1 h-0.5 mx-2 ${progressStep > 1 ? 'bg-[#35A7FF]' : 'bg-gray-200'}`} />
                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          progressStep > 2 ? 'bg-[#35A7FF] text-white' : progressStep === 2 ? 'bg-[#35A7FF] text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {progressStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                      </div>
                      <span className={`text-xs mt-1 ${progressStep >= 2 ? 'text-[#35A7FF]' : 'text-gray-400'}`}>The School</span>
                    </div>
                    {/* Line */}
                    <div className={`flex-1 h-0.5 mx-2 ${progressStep > 2 ? 'bg-[#35A7FF]' : 'bg-gray-200'}`} />
                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          progressStep === 3 ? 'bg-[#35A7FF] text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        3
                      </div>
                      <span className={`text-xs mt-1 ${progressStep === 3 ? 'text-[#35A7FF]' : 'text-gray-400'}`}>Submit</span>
                    </div>
                  </div>
                </div>

                {/* Form Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: '#1e2749' }}>
                  Nominate a School
                </h2>
                <p className="text-center mb-8" style={{ color: '#35A7FF' }}>
                  <span className="font-semibold">{VIP_SPOTS_REMAINING} of 5</span> Blueprint Founders Circle spots remaining for Fall 2026
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Question 1: Is your school a TDI partner? */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                      Is your school currently a TDI partner? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isPartner"
                          checked={isPartner === true}
                          onChange={() => handlePartnerChange(true)}
                          className="w-5 h-5"
                          style={{ accentColor: '#1e2749' }}
                        />
                        <span style={{ color: '#1e2749' }}>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isPartner"
                          checked={isPartner === false}
                          onChange={() => handlePartnerChange(false)}
                          className="w-5 h-5"
                          style={{ accentColor: '#1e2749' }}
                        />
                        <span style={{ color: '#1e2749' }}>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Question 2: Role (only if partner) */}
                  {isPartner === true && (
                    <div
                      className="mb-6 p-4 rounded-lg transition-all duration-300 ease-in-out animate-fade-in"
                      style={{ backgroundColor: '#f5f5f5' }}
                    >
                      <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                        What is your role? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            checked={role === 'leader'}
                            onChange={() => handleRoleChange('leader')}
                            className="w-5 h-5"
                            style={{ accentColor: '#1e2749' }}
                          />
                          <span style={{ color: '#1e2749' }}>School Leader (principal, AP, admin)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            checked={role === 'teacher'}
                            onChange={() => handleRoleChange('teacher')}
                            className="w-5 h-5"
                            style={{ accentColor: '#1e2749' }}
                          />
                          <span style={{ color: '#1e2749' }}>Teacher or Staff</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Track-specific fields */}
                  {currentTrack && (
                    <div className="space-y-5 transition-all duration-300 ease-in-out animate-fade-in">
                      {/* Encouragement line */}
                      <p
                        className="text-sm italic mb-4 transition-all duration-300 ease-in-out"
                        style={{ color: '#35A7FF' }}
                      >
                        {getEncouragementLine()}
                      </p>

                      {/* Common fields: Name and Email */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={nameRef}
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            clearFieldError('name');
                            trackFormStart();
                          }}
                          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 ${
                            formErrors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          Your Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={emailRef}
                          type="email"
                          placeholder="you@school.edu"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            clearFieldError('email');
                          }}
                          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Track 1 & 2: Your school name */}
                      {(currentTrack === 'partner-leader-referral' || currentTrack === 'partner-teacher-nomination') && (
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                            Your School Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={yourSchoolRef}
                            type="text"
                            placeholder="Your school or district name"
                            value={formData.yourSchool}
                            onChange={(e) => {
                              setFormData({ ...formData, yourSchool: e.target.value });
                              clearFieldError('yourSchool');
                            }}
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 ${
                              formErrors.yourSchool ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formErrors.yourSchool && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.yourSchool}</p>
                          )}
                        </div>
                      )}

                      {/* Track 3: Relationship to school */}
                      {currentTrack === 'non-partner-nomination' && (
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                            Your Relationship to This School <span className="text-red-500">*</span>
                          </label>
                          <select
                            ref={relationshipRef}
                            value={formData.relationship}
                            onChange={(e) => {
                              setFormData({ ...formData, relationship: e.target.value });
                              clearFieldError('relationship');
                            }}
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 ${
                              formErrors.relationship ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select one</option>
                            <option value="I teach there">I teach there</option>
                            <option value="I used to teach there">I used to teach there</option>
                            <option value="I know someone who teaches there">I know someone who teaches there</option>
                            <option value="I'm a parent">I'm a parent</option>
                            <option value="Other">Other</option>
                          </select>
                          {formErrors.relationship && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.relationship}</p>
                          )}
                        </div>
                      )}

                      {/* Nominated school name */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          {currentTrack === 'partner-leader-referral' ? 'School You\'re Referring' : 'School You\'re Nominating'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={nominatedSchoolRef}
                          type="text"
                          placeholder="Full school name (e.g., Lincoln Elementary)"
                          value={formData.nominatedSchool}
                          onChange={(e) => {
                            setFormData({ ...formData, nominatedSchool: e.target.value });
                            clearFieldError('nominatedSchool');
                          }}
                          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 ${
                            formErrors.nominatedSchool ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.nominatedSchool && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.nominatedSchool}</p>
                        )}
                      </div>

                      {/* Track 3: City and State */}
                      {currentTrack === 'non-partner-nomination' && (
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                            School City and State <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={schoolCityStateRef}
                            type="text"
                            placeholder="Springfield, IL"
                            value={formData.schoolCityState}
                            onChange={(e) => {
                              setFormData({ ...formData, schoolCityState: e.target.value });
                              clearFieldError('schoolCityState');
                            }}
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-gray-500 ${
                              formErrors.schoolCityState ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formErrors.schoolCityState && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.schoolCityState}</p>
                          )}
                        </div>
                      )}

                      {/* Track 2: Principal name and PD Challenge (always visible) */}
                      {currentTrack === 'partner-teacher-nomination' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                              Principal Name (If Known)
                            </label>
                            <input
                              type="text"
                              placeholder="First and last name"
                              value={formData.principalName}
                              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                              Biggest PD Challenge at That School
                            </label>
                            <textarea
                              rows={3}
                              placeholder="This helps us start a better conversation with their admin."
                              value={formData.pdChallenge}
                              onChange={(e) => setFormData({ ...formData, pdChallenge: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                            />
                          </div>
                        </>
                      )}

                      {/* Track 3: Optional fields toggle */}
                      {currentTrack === 'non-partner-nomination' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowOptionalFields(!showOptionalFields)}
                            className="flex items-center gap-2 text-sm font-medium transition-colors"
                            style={{ color: '#35A7FF' }}
                          >
                            {showOptionalFields ? (
                              <>
                                Optional details
                                <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Want to tell us more? (optional)
                                <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          {showOptionalFields && (
                            <div className="space-y-5 transition-all duration-300 ease-in-out animate-fade-in">
                              <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                                  Principal Name (If Known)
                                </label>
                                <input
                                  type="text"
                                  placeholder="First and last name"
                                  value={formData.principalName}
                                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                                  Biggest PD Challenge at That School
                                </label>
                                <textarea
                                  rows={3}
                                  placeholder="This helps us start a better conversation with their admin."
                                  value={formData.pdChallenge}
                                  onChange={(e) => setFormData({ ...formData, pdChallenge: e.target.value })}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Additional notes (Track 1 only) */}
                      {currentTrack === 'partner-leader-referral' && (
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                            Anything Else We Should Know?
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Any context that would help us reach out"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                          />
                        </div>
                      )}

                      {/* Error message */}
                      {error && (
                        <div
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}
                        >
                          <p style={{ color: '#ef4444' }}>
                            Something went wrong. Please try again or email us at{' '}
                            <a href="mailto:info@teachersdeserveit.com" className="underline">
                              info@teachersdeserveit.com
                            </a>
                          </p>
                        </div>
                      )}

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Nomination'
                        )}
                      </button>

                      <p className="text-xs text-center" style={{ color: '#1e2749', opacity: 0.6 }}>
                        Your data is encrypted and never sold. We respect your privacy.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Not ready to nominate? That's okay.
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Follow us to see what TDI schools are doing.
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#ffba06' }}
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6" style={{ color: '#1e2749' }} />
            </a>
            {/* TODO: Add TDI Instagram URL */}
            <a
              href="https://www.instagram.com/teachersdeserveit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#ffba06' }}
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
          </div>

          <Link
            href="/for-schools"
            className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
            style={{ color: '#ffba06' }}
          >
            Learn more about TDI partnerships
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
