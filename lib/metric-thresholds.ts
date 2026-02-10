// Metric threshold utilities for TDI Partnership Dashboards
// Reference: TDI-DASHBOARD-SCHEMA.md

export type MetricStatus = 'strong' | 'on_track' | 'developing' | 'needs_support' | 'no_data';

export function getMetricStatus(metricName: string, value: number | null | undefined): MetricStatus {
  if (value === null || value === undefined) return 'no_data';

  switch (metricName) {
    case 'hub_login_pct':
      if (value >= 90) return 'strong';
      if (value >= 70) return 'on_track';
      if (value >= 50) return 'developing';
      return 'needs_support';

    case 'courses_avg':
      if (value >= 3.0) return 'strong';
      if (value >= 2.0) return 'on_track';
      if (value >= 1.0) return 'developing';
      return 'needs_support';

    case 'avg_stress':
      // INVERTED: lower is better
      if (value <= 5.0) return 'strong';
      if (value <= 6.5) return 'on_track';
      if (value <= 7.5) return 'developing';
      return 'needs_support';

    case 'implementation_pct':
      if (value >= 50) return 'strong';
      if (value >= 35) return 'on_track';
      if (value >= 20) return 'developing';
      return 'needs_support';

    default:
      return 'no_data';
  }
}

export const statusColors: Record<MetricStatus, string> = {
  strong: '#4ecdc4',      // Teal
  on_track: '#38618C',    // Navy blue
  developing: '#f59e0b',  // Amber
  needs_support: '#F96767', // Coral
  no_data: '#9CA3AF',     // Gray
};

export const statusShapes: Record<MetricStatus, string> = {
  strong: '●',        // filled circle
  on_track: '◆',      // diamond
  developing: '▲',    // triangle
  needs_support: '■', // square
  no_data: '○',       // empty circle
};

export const statusLabels: Record<MetricStatus, string> = {
  strong: 'Strong',
  on_track: 'On Track',
  developing: 'Developing',
  needs_support: 'Needs Support',
  no_data: 'Awaiting Data',
};

// Get human-readable description for metric
export function getMetricDescription(metricName: string): string {
  switch (metricName) {
    case 'hub_login_pct':
      return 'Hub logins';
    case 'courses_avg':
      return 'Courses';
    case 'avg_stress':
      return 'Stress';
    case 'implementation_pct':
      return 'Implementation';
    default:
      return metricName;
  }
}

// Format value for display
export function formatMetricValue(metricName: string, value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';

  switch (metricName) {
    case 'hub_login_pct':
    case 'implementation_pct':
      return `${Math.round(value)}%`;
    case 'courses_avg':
      return value.toFixed(1);
    case 'avg_stress':
      return value.toFixed(1);
    default:
      return String(value);
  }
}
