'use client';

import Link from 'next/link';
import { ClipboardCheck, Users, BookOpen, Headphones, BookMarked, DollarSign } from 'lucide-react';

interface ToolsGridProps {
  onToolClick?: (toolName: string) => void;
}

const resources = [
  {
    title: 'Take the\nPD Quiz',
    description: 'Get a personalized professional development plan in minutes.',
    href: '/free-pd-plan?utm_source=framework&utm_medium=page&utm_campaign=pdplan',
    icon: ClipboardCheck,
    iconBg: '#ffba06',
    iconColor: '#1e2749',
    external: false,
  },
  {
    title: 'Join the Free\nFB Community',
    description: 'Connect with thousands of educators\nwho get it.',
    href: 'https://www.facebook.com/groups/tdimovement',
    icon: Users,
    iconBg: '#1e2749',
    iconColor: '#ffffff',
    external: true,
  },
  {
    title: 'Read\nOur Blog',
    description: 'Weekly insights for educators who refuse to burn out.',
    href: 'https://raehughart.substack.com',
    icon: BookOpen,
    iconBg: '#80a4ed',
    iconColor: '#1e2749',
    external: true,
  },
  {
    title: 'Listen to Our Podcast',
    description: 'Real conversations about teaching, wellness, and building sustainable schools.',
    href: 'https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274',
    icon: Headphones,
    iconBg: '#22c55e',
    iconColor: '#ffffff',
    external: true,
  },
  {
    title: 'Order\nOur Book',
    description: 'Get your copy of Teachers Deserve It\non Amazon.',
    href: 'https://www.amazon.com/Teachers-Deserve-Rae-Hughart/dp/1951600649',
    icon: BookMarked,
    iconBg: '#f97316',
    iconColor: '#ffffff',
    external: true,
  },
  {
    title: 'See Pricing & Funding Options',
    description: 'Explore partnership models and learn how 80% of schools secure external funding.',
    href: '/for-schools/pricing?utm_source=framework&utm_medium=page&utm_campaign=pricing',
    icon: DollarSign,
    iconBg: '#8b5cf6',
    iconColor: '#ffffff',
    external: false,
  },
];

export default function ToolsGrid({ onToolClick }: ToolsGridProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            More Ways to Connect
          </h2>
          <p className="text-center text-lg mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
            Explore our resources and join the TDI community.
          </p>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              const linkProps = resource.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {};

              return (
                <Link
                  key={resource.title}
                  href={resource.href}
                  onClick={() => onToolClick?.(resource.title)}
                  className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                  style={{ textDecoration: 'none' }}
                  {...linkProps}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: resource.iconBg }}
                    >
                      <Icon style={{ color: resource.iconColor }} size={28} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors whitespace-pre-line" style={{ color: '#1e2749' }}>
                      {resource.title}
                    </h3>
                    <p className="text-sm whitespace-pre-line" style={{ color: '#1e2749', opacity: 0.7 }}>
                      {resource.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
