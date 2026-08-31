'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AgreementReminderModalProps {
  isOpen: boolean;
  /** Changes the copy for the three creators who are already live unsigned. */
  alreadyPublished?: boolean;
  onDismiss: () => void;
}

/**
 * The reminder for creators who moved past the agreement without signing it.
 *
 * Dismissible on purpose. These people missed a step by accident, they are not
 * refusing, and locking them out of their own project would punish the wrong
 * thing. The wall lives at publish instead, in
 * app/api/admin/update-publish-status/route.ts.
 *
 * Dismissal is state only, never stored. Rule A says this returns on every
 * portal load until the agreement is actually signed, so there is nothing to
 * persist and no key that could get stuck saying "dismissed forever".
 */
export default function AgreementReminderModal({
  isOpen,
  alreadyPublished = false,
  onDismiss,
}: AgreementReminderModalProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isOpen) return null;

  const handleSign = () => {
    setIsLeaving(true);
    router.push('/creator-portal/agreement');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#E8F6F7] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#5BBEC4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#2B3A67] mb-2">
            One thing we still need from you
          </h2>
          <p className="text-gray-600 text-sm">
            {alreadyPublished ? (
              <>
                Your work is live, but your Creator Partnership Agreement is not
                signed yet. We need it on file. It takes about a minute.
              </>
            ) : (
              <>
                Your Creator Partnership Agreement is not signed yet. It takes
                about a minute, and your work cannot go live until it is on file.
              </>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            disabled={isLeaving}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Not right now
          </button>
          <button
            onClick={handleSign}
            disabled={isLeaving}
            className="flex-1 px-4 py-3 bg-[#5BBEC4] text-white rounded-lg font-medium hover:bg-[#4AA9AF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLeaving ? 'Opening...' : 'Sign it now'}
          </button>
        </div>
      </div>
    </div>
  );
}
