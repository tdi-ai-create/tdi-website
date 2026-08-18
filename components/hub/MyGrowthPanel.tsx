'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { useTranslation } from '@/lib/hub/useTranslation';

// Icon map for milestones
const milestoneIcons: Record<string, React.ElementType> = {
  'footprints': Footprints,
  'calendar-check': CalendarCheck,
  'brain': Brain,
  'trophy': Trophy,
  'heart': Heart,
};

/**
 * The "My Growth" view inside Achievements.
 *
 * This was previously its own top-level nav item at /hub/transformation. It is
 * now a panel, because the nav slot was expensive for a page most members could
 * not reach: it is gated on completing a course AND two check-ins.
 *
 * Note the deliberate omissions:
 *  - No "PD Hours Earned" stat. PD hours are not featured anywhere user facing.
 *  - No page heading. The parent Achievements page owns the h1.
 *  - No outer padding wrapper. The parent owns layout.
 */
export default function MyGrowthPanel() {
  const { user } = useHub();
  const { tUI } = useTranslation();
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
        const eligibilityResult = await checkTrackerEligibility(user.id);
        setEligibility(eligibilityResult);

        if (!eligibilityResult.isEligible) {
          setIsLoading(false);
          return;
        }

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
        console.error('Error loading growth data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="hub-card h-64 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="hub-card h-32 animate-pulse" />
          <div className="hub-card h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  // Locked. Previously this bounced the visitor to the dashboard with no
  // explanation. Showing what unlocks it turns a dead end into a next step.
  if (eligibility && !eligibility.isEligible) {
    const courseDone = eligibility.completedCourses >= eligibility.requiredCourses;
    const checkInsDone = eligibility.totalAssessments >= eligibility.requiredAssessments;
    const checkInsToGo = Math.max(0, eligibility.requiredAssessments - eligibility.totalAssessments);

    return (
      <div className="hub-card text-center py-12 px-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ backgroundColor: '#FFF8E7' }}
        >
          <TrendingUp size={28} style={{ color: '#E8B84B' }} />
        </div>
        <h2
          className="font-semibold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '20px',
            color: '#2B3A67',
          }}
        >
          {tUI('My Growth opens up shortly')}
        </h2>
        <p
          className="text-gray-500 text-[15px] max-w-[42ch] mx-auto mb-7"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {tUI('Once you have a course and a couple of check-ins behind you, this fills with how you are trending, the goals you set, and the milestones you pass.')}
        </p>

        <ul className="max-w-[380px] mx-auto text-left space-y-3 mb-8">
          <li className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: courseDone ? '#E8B84B' : 'transparent',
                border: courseDone ? 'none' : '2px solid #E5E5E5',
              }}
            >
              {courseDone && <CheckCircle size={13} style={{ color: 'white' }} />}
            </span>
            <span
              className="text-[14px]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              {tUI('Finish one course')}
              {courseDone && (
                <span className="text-gray-400 ml-2 text-[13px]">{tUI('done')}</span>
              )}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: checkInsDone ? '#E8B84B' : 'transparent',
                border: checkInsDone ? 'none' : '2px solid #E5E5E5',
              }}
            >
              {checkInsDone && <CheckCircle size={13} style={{ color: 'white' }} />}
            </span>
            <span
              className="text-[14px]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              {checkInsDone
                ? tUI('Two check-ins')
                : checkInsToGo === 1
                  ? tUI('One more check-in')
                  : tUI(`${checkInsToGo} more check-ins`)}
              <span className="text-gray-400 ml-2 text-[13px]">
                {checkInsDone ? tUI('done') : tUI('takes about a minute')}
              </span>
            </span>
          </li>
        </ul>

        <Link
          href="/hub"
          className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#E8B84B', color: '#1B2A4A' }}
        >
          {tUI('Go to my dashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p
        className="text-gray-500 text-[14px] mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {tUI('This is private. Only you can see this.')}
      </p>

      {/* Stress Over Time */}
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
            {tUI('Stress Over Time')}
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
                  formatter={(value: number) => [tUI(`Stress Level: ${value}`), '']}
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
              {tUI('Keep checking in to see your trend.')}
              <br />
              <span className="text-sm text-gray-400">
                {tUI(`${stressData.length}/3 check-ins recorded`)}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Learning stats. PD hours deliberately not shown. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
            {tUI('Courses Completed')}
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
            {tUI('Day Streak')}
          </p>
        </div>
      </div>

      {/* Goals Progress */}
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
              {tUI('Goals Progress')}
            </h2>
          </div>

          <div className="space-y-4">
            {goalsProgress.map((goal) => {
              const progressPct = goal.totalCoursesInCategory > 0
                ? (goal.coursesCompleted / goal.totalCoursesInCategory) * 100
                : 0;

              return (
                <div key={goal.goalName} className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E5E5" strokeWidth="4" />
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
                      style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                    >
                      {goal.goalName}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {goal.coursesCompleted === 1 ? tUI('1 course completed') : tUI(`${goal.coursesCompleted} courses completed`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Milestones */}
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
            {tUI('Milestones')}
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
                    style={{ backgroundColor: milestone.isUnlocked ? '#E8B84B' : '#E5E5E5' }}
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
