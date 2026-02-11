'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import {
  checkTrackerEligibility,
  getStressOverTime,
  getLearningStats,
  getGoalsProgress,
  getMilestones,
  type TrackerEligibility,
  type StressDataPoint,
  type LearningStats,
  type GoalProgress,
  type Milestone,
} from '@/lib/hub/transformation';
import {
  TrendingUp,
  BookOpen,
  Clock,
  Flame,
  Award,
  Lock,
  CheckCircle,
  Footprints,
  CalendarCheck,
  Brain,
  Trophy,
  Heart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Icon map for milestones
const milestoneIcons: Record<string, React.ElementType> = {
  'footprints': Footprints,
  'calendar-check': CalendarCheck,
  'brain': Brain,
  'trophy': Trophy,
  'heart': Heart,
};

export default function TransformationTrackerPage() {
  const router = useRouter();
  const { user } = useHub();
  const [eligibility, setEligibility] = useState<TrackerEligibility | null>(null);
  const [stressData, setStressData] = useState<StressDataPoint[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [goalsProgress, setGoalsProgress] = useState<GoalProgress[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        // First check eligibility
        const eligibilityResult = await checkTrackerEligibility(user.id);
        setEligibility(eligibilityResult);

        if (!eligibilityResult.isEligible) {
          setIsLoading(false);
          return;
        }

        // Load all tracker data
        const [stress, stats, goals, milestonesData] = await Promise.all([
          getStressOverTime(user.id),
          getLearningStats(user.id),
          getGoalsProgress(user.id),
          getMilestones(user.id),
        ]);

        setStressData(stress);
        setLearningStats(stats);
        setGoalsProgress(goals);
        setMilestones(milestonesData);
      } catch (error) {
        console.error('Error loading transformation data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-48 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="hub-card h-64 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="hub-card h-32 animate-pulse" />
            <div className="hub-card h-32 animate-pulse" />
            <div className="hub-card h-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Not eligible - redirect to dashboard
  if (eligibility && !eligibility.isEligible) {
    router.push('/hub');
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Your Growth Journey
        </h1>
        <p
          className="text-gray-500 text-[14px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          This is private. Only you can see this.
        </p>
      </div>

      {/* Section 1: Stress Over Time */}
      <div className="hub-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <TrendingUp size={20} style={{ color: '#E8B84B' }} />
          </div>
          <h2
            className="font-semibold"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '18px',
              color: '#2B3A67',
            }}
          >
            Stress Over Time
          </h2>
        </div>

        {stressData.length >= 3 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                  labelStyle={{ color: '#2B3A67', fontWeight: 'bold' }}
                  formatter={(value: number) => [`Stress Level: ${value}`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#E8B84B"
                  strokeWidth={2}
                  dot={{ fill: '#E8B84B', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#E8B84B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="h-48 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-gray-500 text-center"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Keep checking in to see your trend.
              <br />
              <span className="text-sm text-gray-400">
                ({stressData.length}/3 check-ins recorded)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Learning Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="hub-card text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <BookOpen size={24} style={{ color: '#E8B84B' }} />
          </div>
          <p
            className="text-3xl font-bold mb-1"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            {learningStats?.completedCourses || 0}
          </p>
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Courses Completed
          </p>
        </div>

        <div className="hub-card text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Clock size={24} style={{ color: '#E8B84B' }} />
          </div>
          <p
            className="text-3xl font-bold mb-1"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            {learningStats?.totalPdHours || 0}
          </p>
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            PD Hours Earned
          </p>
        </div>

        <div className="hub-card text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Flame size={24} style={{ color: '#E8B84B' }} />
          </div>
          <p
            className="text-3xl font-bold mb-1"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            {learningStats?.currentStreak || 0}
          </p>
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Day Streak
          </p>
        </div>
      </div>

      {/* Section 3: Goals Progress */}
      {goalsProgress.length > 0 && (
        <div className="hub-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <CheckCircle size={20} style={{ color: '#E8B84B' }} />
            </div>
            <h2
              className="font-semibold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '18px',
                color: '#2B3A67',
              }}
            >
              Goals Progress
            </h2>
          </div>

          <div className="space-y-4">
            {goalsProgress.map((goal) => {
              const progressPct = goal.totalCoursesInCategory > 0
                ? (goal.coursesCompleted / goal.totalCoursesInCategory) * 100
                : 0;

              return (
                <div key={goal.goalName} className="flex items-center gap-4">
                  {/* Progress Ring */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#E5E5E5"
                        strokeWidth="4"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#E8B84B"
                        strokeWidth="4"
                        strokeDasharray={`${progressPct * 1.256} 125.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                      style={{ color: '#2B3A67' }}
                    >
                      {Math.round(progressPct)}%
                    </span>
                  </div>

                  <div className="flex-1">
                    <p
                      className="font-medium"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {goal.goalName}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {goal.coursesCompleted} course{goal.coursesCompleted !== 1 ? 's' : ''} completed
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Milestones */}
      <div className="hub-card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Award size={20} style={{ color: '#E8B84B' }} />
          </div>
          <h2
            className="font-semibold"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '18px',
              color: '#2B3A67',
            }}
          >
            Milestones
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((milestone) => {
            const IconComponent = milestoneIcons[milestone.icon] || Award;

            return (
              <div
                key={milestone.id}
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: milestone.isUnlocked ? '#E8B84B' : '#E5E5E5',
                  backgroundColor: milestone.isUnlocked ? '#FFF8E7' : '#FAFAF8',
                  opacity: milestone.isUnlocked ? 1 : 0.7,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: milestone.isUnlocked ? '#E8B84B' : '#E5E5E5',
                    }}
                  >
                    {milestone.isUnlocked ? (
                      <IconComponent size={20} style={{ color: 'white' }} />
                    ) : (
                      <Lock size={16} style={{ color: '#9CA3AF' }} />
                    )}
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: milestone.isUnlocked ? '#2B3A67' : '#6B7280',
                      }}
                    >
                      {milestone.title}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: milestone.isUnlocked ? '#6B7280' : '#9CA3AF',
                      }}
                    >
                      {milestone.isUnlocked ? milestone.description : milestone.requirement}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
