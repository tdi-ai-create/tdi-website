'use client';

import { Calendar } from 'lucide-react';

interface MilestoneMeetingBannerProps {
  milestoneName: string;
  note: string | null;
}

export function MilestoneMeetingBanner({ milestoneName, note }: MilestoneMeetingBannerProps) {
  return (
    <div className="bg-rose-50 border-l-4 border-rose-600 rounded-r-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            Milestone Meeting
          </p>
          <p className="font-medium text-rose-900">{milestoneName}</p>
          {note && (
            <p className="text-sm text-rose-700 italic mt-2 leading-relaxed">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
