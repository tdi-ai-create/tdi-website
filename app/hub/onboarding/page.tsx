'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Play, Zap, Shield } from 'lucide-react';
import AvatarPicker from '@/components/hub/AvatarPicker';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/hub-auth';

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

type Role = 'classroom_teacher' | 'para' | 'coach' | 'school_leader' | 'district_staff' | 'other';

type GoalType = 'reduce_stress' | 'save_time' | 'classroom_management' | 'find_joy' | 'team_growth' | 'role_support';

const ROLES: { value: Role; label: string; subtitle: string }[] = [
  { value: 'classroom_teacher', label: 'Classroom Teacher', subtitle: 'Any grade, any subject' },
  { value: 'para', label: 'Paraprofessional', subtitle: 'Support staff, aides' },
  { value: 'coach', label: 'Instructional Coach', subtitle: 'PD lead, mentor' },
  { value: 'school_leader', label: 'School Leader', subtitle: 'Admin, principal, AP' },
  { value: 'district_staff', label: 'District Staff', subtitle: 'Central office, curriculum' },
  { value: 'other', label: 'Something Else', subtitle: 'Tell us in settings later' },
];

const GOALS: { value: GoalType; label: string }[] = [
  { value: 'reduce_stress', label: 'Manage my stress better' },
  { value: 'save_time', label: 'Get my time back' },
  { value: 'classroom_management', label: 'Improve classroom management' },
  { value: 'find_joy', label: 'Find the joy again' },
  { value: 'team_growth', label: 'Grow as a leader' },
  { value: 'role_support', label: 'Support my team' },
];

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
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
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
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
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
              Teaching should not feel like survival.
            </h1>

            <p
              className="max-w-md mb-12"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              We are on a mission to build a system that actually supports the educators inside it. This Hub is that system.
            </p>

            <button
              onClick={scrollToStory}
              className="px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Let's get started
            </button>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
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
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </section>

          {/* Section B: The Story */}
          <section
            ref={storyRef}
            className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12"
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
              className="text-2xl md:text-3xl font-semibold mb-8 text-center"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
                fontSize: '24px',
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
                color: '#374151',
              }}
            >
              <p>
                Rae Hughart was a passionate, high-performing educator who was ready to walk away from the classroom. Not because she stopped caring. Because the system was not built to sustain the people inside it.
              </p>
              <p>
                She built Teachers Deserve It to change that. Not with more inspiration posters or one-day PD events, but with real tools, real strategies, and a real community that helps teachers reclaim their time, manage their stress, and stay in the profession long enough to make the impact they were born to make.
              </p>
            </div>
          </section>

          {/* Section C: What the Hub Is */}
          <section
            className="py-16 md:py-24 px-6"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <div className="max-w-5xl mx-auto">
              <p
                className="text-sm tracking-widest mb-4 uppercase text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#E8B84B',
                }}
              >
                What You Get
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                {/* Card 1: Courses */}
                <div
                  className="p-6 rounded-xl text-center"
                  style={{ backgroundColor: 'white' }}
                >
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
                    Short, practical courses on stress management, classroom strategies, time-saving tools, and more. Every course earns PD hours.
                  </p>
                </div>

                {/* Card 2: Quick Wins */}
                <div
                  className="p-6 rounded-xl text-center"
                  style={{ backgroundColor: 'white' }}
                >
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
                <div
                  className="p-6 rounded-xl text-center"
                  style={{ backgroundColor: 'white' }}
                >
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
                    A space that is actually yours
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

          {/* Section D: The Promise */}
          <section
            className="py-16 md:py-24 px-6 text-center"
            style={{ backgroundColor: '#2B3A67' }}
          >
            <h2
              className="text-2xl md:text-3xl font-semibold mb-10"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: 'white',
                fontSize: '24px',
              }}
            >
              What we believe.
            </h2>

            <div
              className="max-w-md mx-auto space-y-4 mb-10"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
              }}
            >
              <p>Teachers deserve tools that respect their time.</p>
              <p>Teachers deserve PD that does not feel like punishment.</p>
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
          style={{ backgroundColor: '#FAFAF8' }}
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
              What is your role?
            </h1>

            <p
              className="text-gray-500 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              This helps us suggest the right stuff. You can change it later.
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
                      border: isSelected ? '2px solid #E8B84B' : '1px solid #E5E5E5',
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
          style={{ backgroundColor: '#FAFAF8' }}
        >
          <div className="max-w-lg mx-auto">
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

            <div className="flex flex-wrap gap-3 mb-8">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.value);
                return (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    className="px-4 py-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: isSelected ? '#E8B84B' : 'white',
                      color: isSelected ? 'white' : '#2B3A67',
                      border: isSelected ? '2px solid #E8B84B' : '1px solid #E5E5E5',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                    aria-pressed={isSelected}
                  >
                    {goal.label}
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
                  border: '1px solid #E5E5E5',
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
          style={{ backgroundColor: '#FAFAF8' }}
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
                    border: '1px solid #E5E5E5',
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
                className="text-sm text-gray-500 hover:text-gray-700"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
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
          style={{ backgroundColor: '#FAFAF8' }}
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
              style={{ backgroundColor: '#EEF2FF' }}
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
                        border: isSelected ? 'none' : '1px solid #E5E5E5',
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
                    border: '1px solid #E5E5E5',
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
                className="text-sm text-gray-500 hover:text-gray-700"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
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
            You are all set.
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
