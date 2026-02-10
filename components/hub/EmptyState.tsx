'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  iconBgColor?: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  buttonVariant?: 'primary' | 'secondary';
}

export default function EmptyState({
  icon: Icon,
  iconBgColor = '#FFF8E7',
  title,
  description,
  buttonText,
  buttonLink,
  buttonVariant = 'primary',
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div
        className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={32} style={{ color: '#2B3A67' }} />
      </div>
      <h3
        className="text-xl font-semibold mb-3"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: '#2B3A67',
        }}
      >
        {title}
      </h3>
      <p
        className="text-gray-600 max-w-md mx-auto mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {description}
      </p>
      {buttonText && buttonLink && (
        <Link
          href={buttonLink}
          className={buttonVariant === 'primary' ? 'hub-btn-primary' : 'hub-btn-secondary'}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
