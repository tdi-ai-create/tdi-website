import { notFound } from 'next/navigation'
import { fetchDashboardData } from '@/lib/dashboard/fetchDashboardData'
import { DashboardHeader } from '@/components/dashboard/shared/DashboardHeader'
import { StatCards } from '@/components/dashboard/shared/StatCards'
import { MomentumBar } from '@/components/dashboard/shared/MomentumBar'
import { PartnershipTimeline } from '@/components/dashboard/shared/PartnershipTimeline'
import { InvestmentNumbers } from '@/components/dashboard/shared/InvestmentNumbers'
import { LoveNotesCallout } from '@/components/dashboard/shared/LoveNotesCallout'
import { LeadingIndicators } from '@/components/dashboard/shared/LeadingIndicators'
import { ExampleBanner } from '@/components/dashboard/shared/ExampleBanner'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PartnerDashboardPage({ params }: PageProps) {
  const { slug } = await params
  const data = await fetchDashboardData(slug)

  if (!data) {
    notFound()
  }

  const { partnership, organization, timelineEvents, metrics, defaults } = data

  // Get latest metrics snapshot
  const latestMetrics = metrics[0] || {}

  // Determine if we're showing mostly example data
  const hasRealData = partnership.staff_enrolled > 0 || latestMetrics.hub_login_pct

  // Calculate observation days from completed timeline events
  const completedObservations = timelineEvents.filter(
    (e: any) => e.status === 'completed' && e.event_type === 'observation'
  ).length || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        schoolName={partnership.name || organization.name || 'Partner Dashboard'}
        location={organization.city && organization.state ? `${organization.city}, ${organization.state}` : undefined}
        phase={partnership.current_phase || 'IGNITE'}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Example Mode Banner */}
        {!hasRealData && (
          <div className="mb-6">
            <ExampleBanner
              message="You're viewing example data. Real metrics will appear as your partnership progresses."
            />
          </div>
        )}

        {/* Stat Cards */}
        <section className="mb-8">
          <StatCards
            staffEnrolled={partnership.staff_enrolled}
            hubLoginPct={latestMetrics.hub_login_pct}
            observationsUsed={partnership.observation_days_used || 0}
            observationsTotal={partnership.observation_days_contracted || 6}
            virtualUsed={partnership.virtual_sessions_used || 0}
            virtualTotal={partnership.virtual_sessions_contracted || 4}
            executiveUsed={partnership.exec_sessions_used || 0}
            executiveTotal={partnership.exec_sessions_contracted || 2}
            phase={partnership.current_phase || 'IGNITE'}
            defaults={defaults}
          />
        </section>

        {/* Momentum Bar */}
        <section className="mb-8">
          <MomentumBar
            status={latestMetrics.momentum_status}
            detail={latestMetrics.momentum_detail}
            defaults={defaults}
          />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Partnership Timeline */}
            <PartnershipTimeline events={timelineEvents} />

            {/* Love Notes */}
            <LoveNotesCallout
              loveNotesCount={latestMetrics.love_notes_count}
              schoolName={partnership.name || organization.name || 'your'}
              observationDays={completedObservations}
              defaults={defaults}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Investment Numbers */}
            <InvestmentNumbers
              costPerEducator={latestMetrics.cost_per_educator}
              hubLoginPct={latestMetrics.hub_login_pct}
              loveNotesCount={latestMetrics.love_notes_count}
              highEngagementPct={latestMetrics.high_engagement_pct}
              perEducatorNote={latestMetrics.per_educator_value_note}
              defaults={defaults}
            />

            {/* Leading Indicators */}
            <LeadingIndicators
              teacherStress={partnership.teacher_stress_score || latestMetrics.teacher_stress}
              strategyImplementation={latestMetrics.strategy_implementation}
              retentionIntent={latestMetrics.retention_intent}
              defaults={defaults}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Questions about your dashboard? Contact your TDI partner success manager.
          </p>
        </footer>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const data = await fetchDashboardData(slug)

  if (!data) {
    return { title: 'Partner Dashboard | Teachers Deserve It' }
  }

  return {
    title: `${data.partnership.name || 'Partner'} Dashboard | Teachers Deserve It`,
    description: 'Your partnership progress and impact metrics',
  }
}
