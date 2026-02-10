'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Play, Zap, Shield } from 'lucide-react';
import AvatarPicker from '@/components/hub/AvatarPicker';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/hub-auth';

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

type Role = 'classroom_teacher' | 'para' | 'coach' | 'school_leader' | 'district_staff' | 'other';

type GoalType = 'reduce_stress' | 'save_time' | 'classroom_management' | 'find_joy' | 'team_growth' | 'role_support' | 'stop_bringing_work_home' | 'feel_like_myself' | 'make_it_to_summer' | 'all_of_the_above';

const ROLES: { value: Role; label: string; subtitle: string }[] = [
  { value: 'classroom_teacher', label: 'Classroom Teacher', subtitle: 'Any grade, any subject' },
  { value: 'para', label: 'Paraprofessional', subtitle: 'Support staff, aides' },
  { value: 'coach', label: 'Instructional Coach', subtitle: 'PD lead, mentor' },
  { value: 'school_leader', label: 'School Leader', subtitle: 'Admin, principal, AP' },
  { value: 'district_staff', label: 'District Staff', subtitle: 'Central office, curriculum' },
  { value: 'other', label: 'Something Else', subtitle: 'Tell us in settings later' },
];

// Goal icons as inline SVGs
const GoalIcons: Record<GoalType, React.ReactNode> = {
  reduce_stress: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="12" r="8" />
      <path d="M8 12c2 0 3-1 3-3" />
      <path d="M24 12c-2 0-3-1-3-3" />
      <path d="M12 22c0 2 1.8 4 4 4s4-2 4-4" />
      <path d="M10 28c1-1 3-2 6-2s5 1 6 2" />
    </svg>
  ),
  save_time: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12" />
      <path d="M16 8v8l5 3" />
      <path d="M26 10l3-3" />
      <path d="M24 8l2-2" />
    </svg>
  ),
  classroom_management: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="24" height="16" rx="2" />
      <path d="M8 26h16" />
      <path d="M12 22v4" />
      <path d="M20 22v4" />
      <path d="M10 12h12" />
      <path d="M10 16h8" />
    </svg>
  ),
  find_joy: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="6" />
      <path d="M16 2v4" />
      <path d="M16 26v4" />
      <path d="M2 16h4" />
      <path d="M26 16h4" />
      <path d="M6 6l3 3" />
      <path d="M23 23l3 3" />
      <path d="M6 26l3-3" />
      <path d="M23 9l3-3" />
    </svg>
  ),
  team_growth: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4v24" />
      <path d="M8 12l8-8 8 8" />
      <path d="M6 20h20" />
    </svg>
  ),
  role_support: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <circle cx="22" cy="10" r="4" />
      <path d="M4 24c0-4 2.7-7 6-7 1.5 0 2.9.5 4 1.4" />
      <path d="M28 24c0-4-2.7-7-6-7-1.5 0-2.9.5-4 1.4" />
      <path d="M16 18v6" />
    </svg>
  ),
  stop_bringing_work_home: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14l11-10 11 10" />
      <path d="M7 13v11a2 2 0 002 2h14a2 2 0 002-2V13" />
      <path d="M6 6l20 20" />
      <path d="M26 6L6 26" />
    </svg>
  ),
  feel_like_myself: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 28c-1.5-2-6-6-6-12a6 6 0 0112 0c0 6-4.5 10-6 12z" />
      <path d="M12 16h8" />
      <path d="M16 12v8" />
      <circle cx="16" cy="16" r="2" />
    </svg>
  ),
  make_it_to_summer: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="24" height="20" rx="2" />
      <path d="M4 12h24" />
      <path d="M10 4v4" />
      <path d="M22 4v4" />
      <circle cx="20" cy="20" r="3" />
      <path d="M20 15v2" />
      <path d="M23 18l-1.5 1" />
      <path d="M17 18l1.5 1" />
    </svg>
  ),
  all_of_the_above: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16l6 6L26 8" />
      <path d="M6 8l6 6" />
      <path d="M18 20l8-8" />
    </svg>
  ),
};

const GOALS: { value: GoalType; label: string }[] = [
  { value: 'reduce_stress', label: 'Manage my stress' },
  { value: 'save_time', label: 'Get my time back' },
  { value: 'classroom_management', label: 'Classroom management' },
  { value: 'find_joy', label: 'Find the joy again' },
  { value: 'team_growth', label: 'Grow as a leader' },
  { value: 'role_support', label: 'Support my team' },
  { value: 'stop_bringing_work_home', label: 'Stop bringing work home' },
  { value: 'feel_like_myself', label: 'Feel like myself again' },
  { value: 'make_it_to_summer', label: 'Make it to summer' },
  { value: 'all_of_the_above', label: 'Honestly? All of the above' },
];

// All goals except "all_of_the_above" for the select-all behavior
const ALL_INDIVIDUAL_GOALS: GoalType[] = GOALS.filter(g => g.value !== 'all_of_the_above').map(g => g.value);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  // Form state
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [stressScore, setStressScore] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/hub/login');
      }
    }
    loadUser();
  }, [router]);

  const goToStep = (newStep: OnboardingStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 150);
  };

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!userId) return;

    setIsUploading(true);
    try {
      const supabase = getSupabase();
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('hub-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('hub-avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setUploadedAvatarUrl(urlData.publicUrl);
        setSelectedAvatarId(null); // Clear preset selection
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const supabase = getSupabase();

      // 1. Update hub_profiles
      const profileUpdate: Record<string, unknown> = {
        role: selectedRole,
        onboarding_completed: true,
        onboarding_data: {
          goals: selectedGoals,
          completed_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      if (uploadedAvatarUrl) {
        profileUpdate.avatar_url = uploadedAvatarUrl;
        profileUpdate.avatar_id = null;
      } else if (selectedAvatarId) {
        profileUpdate.avatar_id = selectedAvatarId;
        profileUpdate.avatar_url = null;
      }

      const { error: profileError } = await supabase
        .from('hub_profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // 2. Insert hub_user_goals
      if (selectedGoals.length > 0) {
        const goalRows = selectedGoals.map((goal) => ({
          user_id: userId,
          goal_type: goal,
        }));

        const { error: goalsError } = await supabase
          .from('hub_user_goals')
          .insert(goalRows);

        if (goalsError) {
          console.error('Goals insert error:', goalsError);
        }
      }

      // 3. Insert hub_assessments (if stress score provided)
      if (stressScore !== null) {
        const { error: assessmentError } = await supabase
          .from('hub_assessments')
          .insert({
            user_id: userId,
            type: 'onboarding',
            stress_score: stressScore,
            responses: { stress_score: stressScore },
          });

        if (assessmentError) {
          console.error('Assessment insert error:', assessmentError);
        }
      }

      // Redirect to dashboard
      router.push('/hub');
    } catch (err) {
      console.error('Onboarding save error:', err);
      setIsSaving(false);
    }
  };

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) => {
      // Special handling for "All of the above"
      if (goal === 'all_of_the_above') {
        // If already selected, deselect all
        if (prev.includes('all_of_the_above')) {
          return [];
        }
        // Select all goals including "all_of_the_above"
        return [...ALL_INDIVIDUAL_GOALS, 'all_of_the_above'];
      }

      // For individual goals
      if (prev.includes(goal)) {
        // Deselecting an individual goal also deselects "all_of_the_above"
        return prev.filter((g) => g !== goal && g !== 'all_of_the_above');
      } else {
        // Selecting an individual goal
        const newGoals = [...prev, goal];
        // Check if all individual goals are now selected
        const allIndividualSelected = ALL_INDIVIDUAL_GOALS.every((g) => newGoals.includes(g));
        if (allIndividualSelected) {
          return [...newGoals, 'all_of_the_above'];
        }
        return newGoals;
      }
    });
  };

  // Progress bar component
  const ProgressBar = ({ currentStep }: { currentStep: number }) => (
    <div
      className="flex gap-2 mb-8"
      role="progressbar"
      aria-label={`Step ${currentStep} of 4`}
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={4}
    >
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: s <= currentStep ? '#E8B84B' : '#E5E5E5',
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-opacity duration-150 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Step 0: Welcome - Full scrollable experience */}
      {step === 0 && (
        <div className="scroll-smooth">
          {/* Section A: Hero */}
          <section
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative"
            style={{ backgroundColor: '#2B3A67' }}
          >
            <p
              className="text-sm tracking-widest mb-6 uppercase"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#E8B84B',
              }}
            >
              The TDI Learning Hub
            </p>

            <h1
              className="text-3xl md:text-4xl font-semibold mb-6 max-w-lg"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: 'white',
                fontSize: '36px',
                lineHeight: 1.2,
              }}
            >
              Teaching shouldn't feel like survival.
            </h1>

            <p
              className="max-w-lg mb-10"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              Teachers Deserve It started as a conversation about what educators actually need. The Learning Hub is where that conversation becomes action. Courses, tools, and a space built just for you.
            </p>

            <button
              onClick={() => goToStep(1)}
              className="px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Let's get started
            </button>

            {/* Scroll to learn more */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={scrollToStory}
                className="hover:underline transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Or scroll to learn more about TDI
              </button>
              <button
                onClick={scrollToStory}
                className="mt-3"
                style={{ animation: 'bobUpDown 2s ease-in-out infinite' }}
                aria-label="Scroll down"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <style jsx>{`
              @keyframes bobUpDown {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(6px); }
              }
            `}</style>
          </section>

          {/* Section B: The Origin Story */}
          <section
            ref={storyRef}
            className="py-12 md:py-16 px-6 flex flex-col items-center"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-sm tracking-widest mb-4 uppercase"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#E8B84B',
              }}
            >
              How It Started
            </p>

            <h2
              className="font-semibold mb-8 text-center"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
                fontSize: '28px',
              }}
            >
              TDI was born from burnout.
            </h2>

            <div
              className="max-w-xl text-center space-y-6"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                lineHeight: 1.7,
                color: '#4B5563',
              }}
            >
              <p>
                We all knew the feeling. Walking into another teacher institute day, greeted with donuts and a full agenda of sessions that had nothing to do with what you actually needed in your classroom. Hours of "someday you'll use this" and "you'll need time for outside planning."
              </p>
              <p>
                None of it helped us be better for our students on Monday.
              </p>
              <p>
                That system was not built with teachers in mind. TDI was. Through books, a podcast, school partnerships, and a growing community of educators who refuse to settle. The Learning Hub is the newest piece: a place where all of those tools, strategies, and resources live in one spot, built around your goals, on your schedule.
              </p>
            </div>
          </section>

          {/* Section C: Impact Stats */}
          <section
            className="py-12 md:py-16 px-6"
            style={{ backgroundColor: '#2B3A67' }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                {[
                  { number: '87K+', label: 'Educators in our community' },
                  { number: '21', label: 'States with partner schools' },
                  { number: '65%', label: 'Implementation rate' },
                  { number: '4.8/5', label: 'Average course rating' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p
                      className="font-bold"
                      style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontSize: '36px',
                        color: '#E8B84B',
                      }}
                    >
                      {stat.number}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <p
                className="text-center italic max-w-xl mx-auto"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Industry average PD implementation is just 10%. Our teachers actually use what they learn because it's built for Monday morning, not someday.
              </p>
            </div>
          </section>

          {/* Section D: The TDI Blueprint */}
          <section
            className="py-12 md:py-16 px-6"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <div className="max-w-3xl mx-auto">
              <p
                className="text-sm tracking-widest mb-8 uppercase text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#E8B84B',
                }}
              >
                The TDI Blueprint
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { num: '1', title: 'Respect Teachers\' Time', desc: 'PD that fits into real life, not consumes it.' },
                  { num: '2', title: 'Deliver Real Strategies', desc: 'Practical tools that work Monday morning.' },
                  { num: '3', title: 'Prioritize Wellness', desc: 'Sustainable teaching starts with supported teachers.' },
                  { num: '4', title: 'Measure What Matters', desc: 'Real impact, not just attendance sheets.' },
                ].map((item) => (
                  <div key={item.num} className="flex gap-4 items-start">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#E8B84B' }}
                    >
                      <span
                        className="font-bold"
                        style={{
                          fontFamily: "'Source Serif 4', Georgia, serif",
                          color: 'white',
                        }}
                      >
                        {item.num}
                      </span>
                    </div>
                    <div>
                      <p
                        className="font-bold mb-1"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '16px',
                          color: '#2B3A67',
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '14px',
                          color: '#6B7280',
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section E: What the Hub Gives You */}
          <section
            className="py-12 md:py-16 px-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="max-w-5xl mx-auto">
              <p
                className="text-sm tracking-widest mb-8 uppercase text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#E8B84B',
                }}
              >
                What The Learning Hub Gives You
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Courses */}
                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#FAFAF8' }}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#2B3A67' }}
                  >
                    <Play size={20} color="white" fill="white" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      color: '#2B3A67',
                    }}
                  >
                    Courses built by teachers, for teachers
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#6B7280',
                      lineHeight: 1.6,
                    }}
                  >
                    Short, practical courses on stress management, classroom strategies, time-saving tools, and more. Every course earns real PD hours.
                  </p>
                </div>

                {/* Card 2: Quick Wins */}
                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#FAFAF8' }}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#2B3A67' }}
                  >
                    <Zap size={20} color="white" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      color: '#2B3A67',
                    }}
                  >
                    Quick Wins for busy days
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#6B7280',
                      lineHeight: 1.6,
                    }}
                  >
                    3-5 minute tools you can use right now. No prep. No commitment. Just something that actually helps.
                  </p>
                </div>

                {/* Card 3: Privacy */}
                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#FAFAF8' }}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#2B3A67' }}
                  >
                    <Shield size={20} color="white" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      color: '#2B3A67',
                    }}
                  >
                    A space that's actually yours
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#6B7280',
                      lineHeight: 1.6,
                    }}
                  >
                    No one sees your data. No one watches your progress. This is professional development without the surveillance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section F: Community Quote */}
          <section
            className="py-12 md:py-16 px-6 text-center"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <div className="max-w-xl mx-auto">
              <p
                className="italic mb-6"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: '22px',
                  color: '#2B3A67',
                  lineHeight: 1.5,
                }}
              >
                "They're done pretending burnout is a badge of honor. They're practical optimists who believe there's a smarter way to do this work. They're still here because they still believe in teaching. They just refuse to destroy themselves doing it."
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#E8B84B',
                }}
              >
                The educators in our community share something.
              </p>
            </div>
          </section>

          {/* Section G: CTA */}
          <section
            className="py-12 md:py-16 px-6 text-center"
            style={{ backgroundColor: '#2B3A67' }}
          >
            <h2
              className="font-semibold mb-8"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: 'white',
                fontSize: '28px',
              }}
            >
              Ready to get started?
            </h2>

            <div
              className="max-w-md mx-auto space-y-3 mb-10"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
              }}
            >
              <p>Teachers deserve tools that respect their time.</p>
              <p>Teachers deserve PD that doesn't feel like punishment.</p>
              <p>Teachers deserve a system that was built for them.</p>
            </div>

            <button
              onClick={() => goToStep(1)}
              className="px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              I'm ready. Let's go.
            </button>
          </section>
        </div>
      )}

      {/* Step 1: Pick Your Role */}
      {step === 1 && (
        <div
          className="min-h-screen p-6 md:p-8"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="max-w-lg mx-auto">
            <ProgressBar currentStep={1} />

            <h1
              className="text-2xl md:text-3xl font-semibold mb-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              What's your role?
            </h1>

            <p
              className="text-gray-500 mb-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              This helps us suggest the right stuff. You can change it later.
            </p>

            <p
              className="text-center mb-8 max-w-md mx-auto"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: '#6B7280',
                marginTop: '4px',
              }}
            >
              Wear multiple hats? Pick the one that fits most days. You can update this anytime in Settings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: isSelected ? '#FFF8E7' : 'white',
                      border: isSelected ? '2px solid #E8B84B' : '1.5px solid #E5E7EB',
                    }}
                    aria-pressed={isSelected}
                  >
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {role.label}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {role.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedRole && (
              <button
                onClick={() => goToStep(2)}
                className="w-full py-4 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Pick Your Goals */}
      {step === 2 && (
        <div
          className="min-h-screen p-6 md:p-8"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="max-w-2xl mx-auto">
            <ProgressBar currentStep={2} />

            <h1
              className="text-2xl md:text-3xl font-semibold mb-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              What matters most to you right now?
            </h1>

            <p
              className="text-gray-500 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Pick as many as you want. These shape your suggestions.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.value);
                return (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    className="p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex flex-col items-center text-center"
                    style={{
                      backgroundColor: isSelected ? '#FFF8E7' : '#FFFFFF',
                      border: isSelected ? '2px solid #E8B84B' : '1.5px solid #E5E7EB',
                      minHeight: '130px',
                    }}
                    aria-pressed={isSelected}
                  >
                    <div
                      className="mb-3"
                      style={{ color: isSelected ? '#E8B84B' : '#2B3A67' }}
                    >
                      {GoalIcons[goal.value]}
                    </div>
                    <p
                      className="font-bold text-sm"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {goal.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => goToStep(1)}
                className="px-6 py-4 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: 'white',
                  color: '#2B3A67',
                  border: '1.5px solid #E5E7EB',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Back
              </button>
              {selectedGoals.length > 0 && (
                <button
                  onClick={() => goToStep(3)}
                  className="flex-1 py-4 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Pick Your Avatar */}
      {step === 3 && (
        <div
          className="min-h-screen p-6 md:p-8"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="max-w-xl mx-auto">
            <ProgressBar currentStep={3} />

            <h1
              className="text-2xl md:text-3xl font-semibold mb-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Pick the one that feels like you.
            </h1>

            <p
              className="text-gray-500 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              This is your Hub identity. Have fun with it.
            </p>

            <AvatarPicker
              selectedAvatarId={selectedAvatarId}
              uploadedAvatarUrl={uploadedAvatarUrl}
              onSelect={(id) => {
                setSelectedAvatarId(id);
                setUploadedAvatarUrl(null);
              }}
              onUpload={setUploadedAvatarUrl}
              onClearUpload={() => setUploadedAvatarUrl(null)}
              size="onboarding"
              isUploading={isUploading}
              onFileSelect={handleAvatarUpload}
            />

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => goToStep(2)}
                  className="px-6 py-4 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: 'white',
                    color: '#2B3A67',
                    border: '1.5px solid #E5E7EB',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Back
                </button>
                {(selectedAvatarId || uploadedAvatarUrl) && (
                  <button
                    onClick={() => goToStep(4)}
                    className="flex-1 py-4 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: '#E8B84B',
                      color: '#2B3A67',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Next
                  </button>
                )}
              </div>

              <button
                onClick={() => goToStep(4)}
                className="text-sm hover:underline"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#9CA3AF',
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Quick Check-In */}
      {step === 4 && (
        <div
          className="min-h-screen p-6 md:p-8"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="max-w-lg mx-auto">
            <ProgressBar currentStep={4} />

            <h1
              className="text-2xl md:text-3xl font-semibold mb-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Quick check-in. Totally optional.
            </h1>

            <p
              className="text-gray-500 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              On a scale of 1 to 10, how stressed are you right now?
            </p>

            {/* Privacy callout */}
            <div
              className="p-4 rounded-lg mb-8"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <p
                className="text-sm"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                This is private. Only you see this. We use it to suggest courses that actually help.
              </p>
            </div>

            {/* Number buttons */}
            <div className="mb-4">
              <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = stressScore === num;
                  return (
                    <button
                      key={num}
                      onClick={() => setStressScore(num)}
                      className="w-10 h-10 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        backgroundColor: isSelected ? '#E8B84B' : 'white',
                        color: isSelected ? 'white' : '#2B3A67',
                        border: isSelected ? 'none' : '1.5px solid #E5E7EB',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      aria-label={`Stress level ${num}`}
                      aria-pressed={isSelected}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Not stressed at all
                </span>
                <span
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Completely overwhelmed
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => goToStep(3)}
                  className="px-6 py-4 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: 'white',
                    color: '#2B3A67',
                    border: '1.5px solid #E5E7EB',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Back
                </button>
                {stressScore !== null && (
                  <button
                    onClick={() => goToStep(5)}
                    className="flex-1 py-4 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: '#E8B84B',
                      color: '#2B3A67',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Show me my Hub
                  </button>
                )}
              </div>

              <button
                onClick={() => goToStep(5)}
                className="text-sm hover:underline"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#9CA3AF',
                }}
              >
                Skip, take me to my Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Ready (Completion) */}
      {step === 5 && (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          style={{ backgroundColor: '#2B3A67' }}
        >
          {/* Green checkmark */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-8"
            style={{ backgroundColor: '#22C55E' }}
          >
            <Check size={32} className="text-white" />
          </div>

          <h1
            className="text-3xl md:text-4xl font-semibold mb-6"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: 'white',
            }}
          >
            You're all set.
          </h1>

          <p
            className="max-w-md mb-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              lineHeight: 1.6,
            }}
          >
            We picked a Quick Win based on what you told us. It takes about 3 minutes. No pressure.
          </p>

          <p
            className="max-w-md mb-12"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '14px',
            }}
          >
            You can change your role, goals, or avatar anytime in Settings.
          </p>

          <button
            onClick={handleComplete}
            disabled={isSaving}
            className="px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isSaving ? 'Saving...' : 'Go to my Dashboard'}
          </button>
        </div>
      )}
    </div>
  );
}
