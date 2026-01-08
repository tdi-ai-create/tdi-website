'use client';

import Link from 'next/link';
import { ClipboardCheck, Calculator, FileText, DollarSign } from 'lucide-react';

interface ToolsGridProps {
  onToolClick?: (toolName: string) => void;
}

const tools = [
  {
    title: 'PD Diagnostic',
    description: 'Find out which type describes your school',
    href: '/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=diagnostic_cta',
    icon: ClipboardCheck,
    iconBg: '#ffba06',
    iconColor: '#1e2749',
  },
  {
    title: 'Impact Calculator',
    description: 'See potential outcomes for your school',
    href: '/calculator?utm_source=framework&utm_medium=page&utm_campaign=calculator',
    icon: Calculator,
    iconBg: '#1e2749',
    iconColor: '#ffffff',
  },
  {
    title: 'Free PD Plan',
    description: 'Get a custom roadmap in 24 hours',
    href: '/free-pd-plan?utm_source=framework&utm_medium=page&utm_campaign=pdplan',
    icon: FileText,
    iconBg: '#80a4ed',
    iconColor: '#1e2749',
  },
  {
    title: 'Funding Guide',
    description: 'Discover funding options for your school',
    href: '/funding?utm_source=framework&utm_medium=page&utm_campaign=funding',
    icon: DollarSign,
    iconBg: '#22c55e',
    iconColor: '#ffffff',
  },
];

export default function ToolsGrid({ onToolClick }: ToolsGridProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Explore More Resources
          </h2>
          <p className="text-center text-lg mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
            Tools to help you take the next step.
          </p>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  onClick={() => onToolClick?.(tool.title)}
                  className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tool.iconBg }}
                    >
                      <Icon style={{ color: tool.iconColor }} size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors" style={{ color: '#1e2749' }}>
                        {tool.title}
                      </h3>
                      <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                        {tool.description}
                      </p>
                    </div>
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
