'use client';

interface AdminProgressBarProps {
  value: number;
  max?: number;
  accentColor?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

/**
 * Progress bar with rounded ends and consistent styling
 */
export function AdminProgressBar({
  value,
  max = 100,
  accentColor = '#6B5CE7',
  size = 'md',
  showLabel = false,
  className = '',
}: AdminProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-sm text-gray-500 min-w-[3rem] text-right"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

interface AdminUsageBarProps {
  used: number;
  total: number;
  accentColor?: string;
  className?: string;
}

/**
 * Usage bar showing used/total
 */
export function AdminUsageBar({
  used,
  total,
  accentColor = '#F59E0B',
  className = '',
}: AdminUsageBarProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
      <span
        className="text-sm text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {used}/{total}
      </span>
    </div>
  );
}

export default AdminProgressBar;
