'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  backLink?: {
    href: string;
    label: string;
  };
  action?: React.ReactNode;
}

/**
 * Consistent page header with title, subtitle, accent border, and optional action
 */
export function AdminPageHeader({
  title,
  subtitle,
  accentColor,
  backLink,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      {backLink && (
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft size={16} />
          {backLink.label}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#2B3A67',
              borderLeft: `4px solid ${accentColor}`,
              paddingLeft: '16px',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-gray-500 pl-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * Section header within a page
 */
export function AdminSectionHeader({
  title,
  subtitle,
  action,
}: AdminSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2
          className="font-semibold"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#2B3A67',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default AdminPageHeader;
