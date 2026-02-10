'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatsWidgetProps {
  count: number;
  label: string;
  icon: LucideIcon;
  linkText?: string;
  linkHref?: string;
}

export default function StatsWidget({
  count,
  label,
  icon: Icon,
  linkText,
  linkHref,
}: StatsWidgetProps) {
  return (
    <div className="hub-card">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#FFF8E7' }}
        >
          <Icon size={20} style={{ color: '#E8B84B' }} />
        </div>
        <div>
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            {count}
          </p>
        </div>
      </div>
      <p
        className="text-sm text-gray-600 mb-3"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="text-sm font-medium hover:underline"
          style={{
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
