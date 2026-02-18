'use client';

import { useState, useEffect, useRef } from 'react';
import { CollapsibleSection, GlobalFilters, getInitialDateRange, type DateRangePreset } from './shared';
import {
  CourseCompletionBySchool,
  TimeToComplete,
  CoursePopularity,
  DropoffFunnel,
} from './course-performance';
import {
  ActiveDormantUsers,
  PeakUsageHeatmap,
  EngagementByPartnership,
  ReturnRate,
} from './user-engagement';
import {
  StressLevelTrends,
  PlanningTimeImprovements,
  StrategyImplementation,
  SchoolImpactCards,
} from './tdi-effect';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface DateRange {
  from: Date;
  to: Date;
  preset: DateRangePreset;
}

interface CoursePerformanceData {
  completionBySchool: any[];
  timeToComplete: any[];
  coursePopularity: any[];
  dropoffFunnel: any[];
  courses: { id: string; title: string }[];
  selectedCourseId: string | null;
}

interface UserEngagementData {
  activeVsDormant: any;
  dormantUsersList: any[];
  peakUsageHeatmap: any;
  engagementByPartnership: any[];
  returnRate: any[];
  totalUsers: number;
}

interface TdiEffectData {
  stressLevelTrends: {
    overall: any[];
    bySchool: any[];
    avgInitialStress: number | null;
    targetRange: { min: number; max: number };
  };
  planningTimeImprovements: {
    bySchool: any[];
    overall: { before: number | null; after: number | null; target: { min: number; max: number } };
  };
  strategyImplementation: {
    bySchool: any[];
    overallRate: number | null;
    targetRate: number;
    industryAverage: number;
  };
  schoolImpactCards: any[];
  dataStatus: {
    hasSurveyData: boolean;
    hasMetricSnapshots: boolean;
  };
}

export function AnalyticsDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDropoffCourse, setSelectedDropoffCourse] = useState<string | null>(null);

  // Data states
  const [courseData, setCourseData] = useState<CoursePerformanceData | null>(null);
  const [engagementData, setEngagementData] = useState<UserEngagementData | null>(null);
  const [tdiEffectData, setTdiEffectData] = useState<TdiEffectData | null>(null);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);

    const dateParams = new URLSearchParams({
      date_from: dateRange.from.toISOString().split('T')[0],
      date_to: dateRange.to.toISOString().split('T')[0],
    });

    if (selectedDropoffCourse) {
      dateParams.set('course_id', selectedDropoffCourse);
    }

    try {
      const [courseRes, engagementRes, tdiRes] = await Promise.all([
        fetch(`/api/tdi-admin/hub-analytics/course-performance?${dateParams}`),
        fetch(`/api/tdi-admin/hub-analytics/user-engagement?${dateParams}`),
        fetch(`/api/tdi-admin/hub-analytics/tdi-effect?${dateParams}`),
      ]);

      if (courseRes.ok) {
        const data = await courseRes.json();
        setCourseData(data);
        if (!selectedDropoffCourse && data.selectedCourseId) {
          setSelectedDropoffCourse(data.selectedCourseId);
        }
      }

      if (engagementRes.ok) {
        const data = await engagementRes.json();
        setEngagementData(data);
      }

      if (tdiRes.ok) {
        const data = await tdiRes.json();
        setTdiEffectData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Refetch dropoff data when course changes
  useEffect(() => {
    if (selectedDropoffCourse) {
      const dateParams = new URLSearchParams({
        date_from: dateRange.from.toISOString().split('T')[0],
        date_to: dateRange.to.toISOString().split('T')[0],
        course_id: selectedDropoffCourse,
      });

      fetch(`/api/tdi-admin/hub-analytics/course-performance?${dateParams}`)
        .then(res => res.json())
        .then(data => {
          setCourseData(prev => prev ? { ...prev, dropoffFunnel: data.dropoffFunnel } : data);
        })
        .catch(console.error);
    }
  }, [selectedDropoffCourse]);

  // Export full page as PDF
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 1,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      // Add TDI branding header
      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, 0, canvas.width, 60, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Learning Hub Analytics Report', 20, 40);
      pdf.setFontSize(12);
      pdf.text(
        `Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        canvas.width - 200,
        40
      );

      pdf.addImage(imgData, 'PNG', 0, 70, canvas.width, canvas.height);
      pdf.save(`learning-hub-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Export school impact report
  const handleExportSchoolReport = async (school: any) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
      });

      // Header
      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, 0, 8.5, 1.2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('TDI Impact Report', 0.5, 0.8);
      pdf.setFontSize(12);
      pdf.text(school.school, 0.5, 1.0);

      // Content
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text(`Partnership Phase: ${school.phase || 'N/A'}`, 0.5, 1.8);
      pdf.text(`Started: ${school.startDate ? new Date(school.startDate).toLocaleDateString() : 'N/A'}`, 0.5, 2.1);
      pdf.text(`Survey Responses: ${school.surveyCount}`, 0.5, 2.4);

      pdf.setFontSize(18);
      pdf.text('Before & After Metrics', 0.5, 3.0);

      pdf.setFontSize(12);
      const metrics = [
        ['Stress Level', school.metrics.stress.before, school.metrics.stress.after, '/10'],
        ['Planning Hours', school.metrics.planningHours.before, school.metrics.planningHours.after, ' hrs/week'],
        ['Implementation Rate', school.metrics.implementationRate.before, school.metrics.implementationRate.after, '%'],
      ];

      let y = 3.4;
      metrics.forEach(([name, before, after, unit]) => {
        pdf.text(`${name}:`, 0.5, y);
        pdf.text(`Before: ${before !== null ? before + unit : 'N/A'}`, 2.5, y);
        pdf.text(`After: ${after !== null ? after + unit : 'N/A'}`, 4.5, y);
        if (before !== null && after !== null) {
          const change = Number(after) - Number(before);
          pdf.text(`Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}${unit}`, 6.5, y);
        }
        y += 0.4;
      });

      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by Teachers Deserve It', 0.5, 10.5);
      pdf.text(new Date().toLocaleDateString(), 7.0, 10.5);

      pdf.save(`${school.school.replace(/\s+/g, '-').toLowerCase()}-impact-report.pdf`);
    } catch (error) {
      console.error('Error generating school report:', error);
    }
  };

  return (
    <div ref={dashboardRef}>
      {/* Global Filters */}
      <GlobalFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportPDF={handleExportPDF}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Sections */}
      <div className="space-y-6">
        {/* Section 1: Course Performance */}
        <CollapsibleSection
          title="Course Performance"
          subtitle="Completion rates, timing, and learner progress"
          badge={courseData?.courses?.length ? `${courseData.courses.length} courses` : undefined}
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <CourseCompletionBySchool
              data={courseData?.completionBySchool || []}
              courses={courseData?.courses || []}
              isLoading={isLoading}
            />
            <TimeToComplete
              data={courseData?.timeToComplete || []}
              isLoading={isLoading}
            />
          </div>
          <div className="mt-6">
            <CoursePopularity
              data={courseData?.coursePopularity || []}
              isLoading={isLoading}
            />
          </div>
          <div className="mt-6">
            <DropoffFunnel
              data={courseData?.dropoffFunnel || []}
              courses={courseData?.courses || []}
              selectedCourseId={selectedDropoffCourse}
              onCourseChange={setSelectedDropoffCourse}
              isLoading={isLoading}
            />
          </div>
        </CollapsibleSection>

        {/* Section 2: User Engagement */}
        <CollapsibleSection
          title="User Engagement"
          subtitle="Activity patterns and retention metrics"
          badge={engagementData?.totalUsers ? `${engagementData.totalUsers} users` : undefined}
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <ActiveDormantUsers
              activityData={engagementData?.activeVsDormant}
              dormantUsers={engagementData?.dormantUsersList || []}
              isLoading={isLoading}
            />
            <PeakUsageHeatmap
              heatmapData={engagementData?.peakUsageHeatmap}
              isLoading={isLoading}
            />
          </div>
          <div className="mt-6">
            <EngagementByPartnership
              data={engagementData?.engagementByPartnership || []}
              isLoading={isLoading}
            />
          </div>
          <div className="mt-6">
            <ReturnRate
              data={engagementData?.returnRate || []}
              totalUsers={engagementData?.totalUsers || 0}
              isLoading={isLoading}
            />
          </div>
        </CollapsibleSection>

        {/* Section 3: TDI Effect Metrics */}
        <CollapsibleSection
          title="TDI Effect Metrics"
          subtitle="Measuring real-world impact on teacher wellness"
          badge={tdiEffectData?.dataStatus?.hasSurveyData ? 'Survey data available' : undefined}
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <StressLevelTrends
              overallData={tdiEffectData?.stressLevelTrends?.overall || []}
              bySchoolData={tdiEffectData?.stressLevelTrends?.bySchool || []}
              avgInitialStress={tdiEffectData?.stressLevelTrends?.avgInitialStress || null}
              targetRange={tdiEffectData?.stressLevelTrends?.targetRange || { min: 5, max: 7 }}
              isLoading={isLoading}
            />
            <PlanningTimeImprovements
              bySchoolData={tdiEffectData?.planningTimeImprovements?.bySchool || []}
              overallData={tdiEffectData?.planningTimeImprovements?.overall || { before: null, after: null, target: { min: 6, max: 8 } }}
              isLoading={isLoading}
            />
          </div>
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <StrategyImplementation
              bySchoolData={tdiEffectData?.strategyImplementation?.bySchool || []}
              overallRate={tdiEffectData?.strategyImplementation?.overallRate || null}
              targetRate={tdiEffectData?.strategyImplementation?.targetRate || 65}
              industryAverage={tdiEffectData?.strategyImplementation?.industryAverage || 10}
              isLoading={isLoading}
            />
            <SchoolImpactCards
              data={tdiEffectData?.schoolImpactCards || []}
              isLoading={isLoading}
              onExportPDF={handleExportSchoolReport}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
