'use client';

import { useHub } from '@/components/hub/HubContext';
import { useMembership, MembershipTier, getShortTierLabel, getTierBadgeColors } from '@/lib/hub/use-membership';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

interface TierFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: MembershipTier;
  name: string;
  price: number | null;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: TierFeature[];
  highlight?: boolean;
  buttonText: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    period: '',
    description: 'Access rotating free content each week',
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      { text: 'Rotating free content each week', included: true },
      { text: 'Save favorites for later', included: true },
      { text: 'Track your PD hours', included: true },
      { text: 'Individual quick wins', included: false },
      { text: 'Resource packs', included: false },
      { text: 'Full course library', included: false },
    ],
    buttonText: 'Current Plan',
  },
  {
    id: 'essentials',
    name: 'Essentials',
    price: 5,
    period: '/mo',
    description: 'Download individual quick wins and resources',
    icon: <Zap className="w-6 h-6" />,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'All individual quick wins', included: true },
      { text: 'Download PDFs & templates', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Resource packs', included: false },
      { text: 'Full course library', included: false },
    ],
    buttonText: 'Upgrade',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 10,
    period: '/mo',
    description: 'Comprehensive resource packs for your classroom',
    icon: <Crown className="w-6 h-6" />,
    highlight: true,
    features: [
      { text: 'Everything in Essentials', included: true },
      { text: 'Comprehensive resource packs', included: true },
      { text: 'Monthly new content drops', included: true },
      { text: 'Early access to new courses', included: true },
      { text: 'Community discussion access', included: true },
      { text: 'Full course library', included: false },
    ],
    buttonText: 'Upgrade',
  },
  {
    id: 'all_access',
    name: 'All-Access',
    price: 25,
    period: '/mo',
    description: 'Unlock everything, including the full course library',
    icon: <Crown className="w-6 h-6" />,
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Full course library access', included: true },
      { text: 'Earn PD certificates', included: true },
      { text: 'Exclusive workshops', included: true },
      { text: 'Direct creator access', included: true },
      { text: '1-on-1 coaching sessions', included: true },
    ],
    buttonText: 'Upgrade',
  },
];

export default function MembershipPage() {
  const { user } = useHub();
  const { membership, effectiveTier, isLoading } = useMembership();

  const isDistrictUser = membership?.source === 'district_partner';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="font-bold mb-3"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '32px',
            color: '#2B3A67',
          }}
        >
          Membership Plans
        </h1>
        <p
          className="text-gray-500 text-lg max-w-xl mx-auto"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Choose the plan that fits your needs. Upgrade anytime.
        </p>
      </div>

      {/* Current Plan Banner (if logged in) */}
      {user && !isLoading && (
        <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-blue-600 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Your current plan
              </p>
              <p className="text-xl font-semibold text-blue-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {getShortTierLabel(effectiveTier)}
                {isDistrictUser && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    (provided by your district)
                  </span>
                )}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColors(effectiveTier)}`}>
              {membership?.status === 'active' ? 'Active' : membership?.status || 'Free'}
            </span>
          </div>
        </div>
      )}

      {/* District Partner Notice */}
      {isDistrictUser && (
        <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                District Partner Access
              </p>
              <p className="text-sm text-green-700 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Your district has provided you with All-Access membership. You have full access to all content, courses, and resources at no cost to you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {PRICING_TIERS.map((tier) => {
          const isCurrentTier = effectiveTier === tier.id;
          const isUpgrade = PRICING_TIERS.findIndex(t => t.id === tier.id) > PRICING_TIERS.findIndex(t => t.id === effectiveTier);

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 transition-all ${
                tier.highlight
                  ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 shadow-lg'
                  : 'bg-white border border-gray-200 shadow-sm'
              } ${isCurrentTier && !tier.highlight ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Popular badge */}
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current badge */}
              {isCurrentTier && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    Current
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  tier.highlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tier.icon}
              </div>

              {/* Name */}
              <h3
                className="text-xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-3">
                {tier.price !== null ? (
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-gray-500 ml-1">{tier.period}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">Free</span>
                )}
              </div>

              {/* Description */}
              <p
                className="text-sm text-gray-500 mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {tier.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature.included
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="w-2 h-0.5 bg-gray-300 rounded" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {isCurrentTier ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-lg font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Current Plan
                </button>
              ) : isDistrictUser ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-lg font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  District Access
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => {
                    // TODO: Integrate with Stripe checkout
                    alert(`Stripe integration coming soon! Upgrade to ${tier.name} for $${tier.price}/mo`);
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    tier.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {tier.buttonText}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-lg font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Included
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ or Info section */}
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
        <h2
          className="text-xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Yes! You can cancel your subscription at any time. You&apos;ll keep access until the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              What&apos;s included in the free rotating content?
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Each week, we rotate different quick wins and resources to be available for free. This gives you a taste of our content before upgrading.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Is there a discount for annual billing?
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Annual plans are coming soon with 2 months free! Stay tuned.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Does my school or district qualify for group access?
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Yes! We partner with schools and districts to provide access for all teachers.{' '}
              <Link href="/for-schools" className="text-blue-600 hover:underline">
                Learn more about district partnerships
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link
          href="/hub"
          className="text-gray-500 hover:text-gray-700 text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          &larr; Back to Hub
        </Link>
      </div>
    </div>
  );
}
