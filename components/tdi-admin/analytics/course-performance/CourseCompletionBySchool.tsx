'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

// Color palette for courses
const COURSE_COLORS = [
  '#0D9488', // teal (primary)
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#EC4899', // pink
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#3B82F6', // blue
  '#EF4444', // red
];

interface SchoolCourseData {
  school: string;
  courses: {
    courseId: string;
    courseTitle: string;
    enrolled: number;
    completed: number;
    completionRate: number;
  }[];
  totalEnrolled: number;
  totalCompleted: number;
}

interface CourseCompletionBySchoolProps {
  data: SchoolCourseData[];
  courses: { id: string; title: string }[];
  isLoading?: boolean;
}

export function CourseCompletionBySchool({
  data,
  courses,
  isLoading = false,
}: CourseCompletionBySchoolProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  if (isLoading) {
    return (
      <ChartCard title="Course Completion Rates by School" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Course Completion Rates by School" subtitle="By partnership group">
        <EmptyChart
          title="No completion data yet"
          description="Course completion data will appear once users start completing courses."
          icon="chart"
        />
      </ChartCard>
    );
  }

  // Transform data for chart
  const chartData = data.map(school => {
    const result: Record<string, string | number> = { school: school.school.substring(0, 20) };
    school.courses.forEach((course, idx) => {
      if (selectedCourse === 'all' || selectedCourse === course.courseId) {
        result[course.courseTitle.substring(0, 15)] = course.completionRate;
      }
    });
    return result;
  });

  // Get unique course names for bars
  const courseNames = selectedCourse === 'all'
    ? [...new Set(data.flatMap(s => s.courses.map(c => c.courseTitle.substring(0, 15))))].slice(0, 8)
    : data[0]?.courses.filter(c => c.courseId === selectedCourse).map(c => c.courseTitle.substring(0, 15)) || [];

  const exportCSV = () => {
    let csv = 'School,Course,Enrolled,Completed,Completion Rate\n';
    data.forEach(school => {
      school.courses.forEach(course => {
        if (selectedCourse === 'all' || selectedCourse === course.courseId) {
          csv += `"${school.school}","${course.courseTitle}",${course.enrolled},${course.completed},${course.completionRate}%\n`;
        }
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `course-completion-by-school-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Course Completion Rates by School"
      subtitle="By partnership group"
      onExportCSV={exportCSV}
    >
      <div className="mb-4">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
          style={{ fontFamily: "'DM Sans', sans-serif", focusRing: theme.primary } as React.CSSProperties}
        >
          <option value="all">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="school" tick={{ fontSize: 11 }} width={100} />
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
              contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
            {courseNames.map((name, idx) => (
              <Bar
                key={name}
                dataKey={name}
                fill={COURSE_COLORS[idx % COURSE_COLORS.length]}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 font-medium text-gray-500">School</th>
              <th className="text-left py-2 px-2 font-medium text-gray-500">Course</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Enrolled</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Completed</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).flatMap(school =>
              school.courses
                .filter(c => selectedCourse === 'all' || c.courseId === selectedCourse)
                .slice(0, 3)
                .map((course, idx) => (
                  <tr key={`${school.school}-${course.courseId}`} className="border-b border-gray-50">
                    <td className="py-2 px-2 text-gray-700">{idx === 0 ? school.school.substring(0, 25) : ''}</td>
                    <td className="py-2 px-2 text-gray-600">{course.courseTitle.substring(0, 30)}</td>
                    <td className="py-2 px-2 text-right text-gray-600">{course.enrolled}</td>
                    <td className="py-2 px-2 text-right text-gray-600">{course.completed}</td>
                    <td className="py-2 px-2 text-right font-medium" style={{ color: theme.primary }}>{course.completionRate}%</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

export default CourseCompletionBySchool;
