'use client';

import dynamic from 'next/dynamic';

const FundingFinder = dynamic(() => import('@/components/FundingFinder'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto text-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  ),
});

export default function FundingFinderWrapper() {
  return <FundingFinder />;
}
