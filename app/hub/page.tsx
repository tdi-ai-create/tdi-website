'use client';

import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import { BookOpen, Zap, Award, ArrowRight } from 'lucide-react';

export default function HubDashboard() {
  const { profile, user } = useHub();

  const firstName = profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-8">
        <AvatarDisplay
          size={48}
          avatarId={profile?.avatar_id}
          avatarUrl={profile?.avatar_url}
          displayName={profile?.display_name}
        />
        <div>
          <h1
            className="text-2xl md:text-3xl font-semibold"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Your learning journey continues here
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Continue Learning Card */}
        <div className="hub-card">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <BookOpen size={20} style={{ color: '#E8B84B' }} />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Continue Learning
            </h2>
          </div>

          <div
            className="p-6 rounded-lg text-center"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-gray-500 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your courses will appear here once you enroll
            </p>
            <Link href="/hub/courses" className="hub-btn-primary inline-flex items-center gap-2">
              Browse courses
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Got 5 Minutes Card */}
        <div className="hub-card">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <Zap size={20} style={{ color: '#E8B84B' }} />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Got 5 minutes?
            </h2>
          </div>

          <div
            className="p-6 rounded-lg text-center"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-gray-500 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Quick wins for busy days coming soon
            </p>
            <Link href="/hub/quick-wins" className="hub-btn-secondary inline-flex items-center gap-2">
              Explore Quick Wins
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Certificates Card */}
        <div className="hub-card">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <Award size={20} style={{ color: '#E8B84B' }} />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Your Certificates
            </h2>
          </div>

          <div
            className="p-6 rounded-lg text-center"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-gray-500 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Complete courses to earn PD certificates
            </p>
            <Link href="/hub/certificates" className="hub-btn-secondary inline-flex items-center gap-2">
              View certificates
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Building Notice */}
        <div
          className="hub-card flex flex-col items-center justify-center text-center p-8"
          style={{ backgroundColor: '#FFF8E7', border: 'none' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#E8B84B' }}
          >
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              !
            </span>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            Your Hub is being built
          </h3>
          <p
            className="text-gray-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            More features are on the way. Check back soon for courses, resources, and your personalized learning path.
          </p>
        </div>
      </div>
    </div>
  );
}
