import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'testimonial' | 'stat' | 'pricing';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  featured?: boolean;
}

export function Card({
  children,
  variant = 'default',
  className,
  featured = false,
}: CardProps) {
  const variantStyles = {
    default: 'card',
    testimonial: 'card-testimonial',
    stat: 'bg-white rounded-xl p-8 text-center',
    pricing: cn(
      'bg-white rounded-2xl p-8 border-2',
      featured
        ? 'border-[var(--tdi-yellow)] shadow-lg'
        : 'border-gray-200'
    ),
  };

  return (
    <div className={cn(variantStyles[variant], className)}>
      {children}
    </div>
  );
}

// Testimonial Card with quote styling
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  location?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  location,
}: TestimonialCardProps) {
  return (
    <Card variant="testimonial">
      <blockquote className="text-xl italic mb-4 leading-relaxed">
        "{quote}"
      </blockquote>
      <cite className="not-italic text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
        {author}, {role}{location ? `, ${location}` : ''}
      </cite>
    </Card>
  );
}

// Stat Card for the stats section
interface StatCardProps {
  number: string;
  label: string;
}

export function StatCard({ number, label }: StatCardProps) {
  return (
    <div className="text-center">
      <p 
        className="text-5xl md:text-6xl font-bold mb-2"
        style={{ color: 'var(--tdi-yellow)' }}
      >
        {number}
      </p>
      <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
        {label}
      </p>
    </div>
  );
}

// Pricing Card
interface PricingCardProps {
  name: string;
  phase: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

export function PricingCard({
  name,
  phase,
  price,
  description,
  features,
  featured = false,
  ctaText = 'Schedule a Call',
  ctaHref = '/contact',
}: PricingCardProps) {
  return (
    <Card variant="pricing" featured={featured}>
      {featured && (
        <div 
          className="text-xs font-semibold uppercase tracking-wide mb-4 px-3 py-1 rounded-full inline-block"
          style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}
        >
          Most Popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-1">{name}</h3>
        <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.6 }}>{phase}</p>
      </div>
      <div className="mb-4">
        <p className="text-3xl font-bold">{price}</p>
        <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.6 }}>/year</p>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
        {description}
      </p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--tdi-sage)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className={featured ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}
      >
        {ctaText}
      </a>
    </Card>
  );
}
