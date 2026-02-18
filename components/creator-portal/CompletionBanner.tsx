'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface CompletionBannerProps {
  creatorName: string;
  contentPath: string | null;
  onReady?: () => void;
  creatorId: string;
}

export function CompletionBanner({ creatorName, contentPath, onReady, creatorId }: CompletionBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentPathLabels: Record<string, string> = {
    blog: 'blog post',
    download: 'digital download',
    course: 'online course',
  };
  const contentPathLabel = contentPath ? contentPathLabels[contentPath] || contentPath : 'content';

  const handleReadyToCreate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call API to create a new project (same as choosing "yes" on create_again)
      const response = await fetch('/api/creator-portal/create-new-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the page to show the new project
        window.location.reload();
      } else {
        setError(data.error || 'Failed to start new project. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create new project error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center mb-8">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-green-800 mb-2">
        Thanks for creating with us!
      </h2>
      <p className="text-green-700 mb-6 max-w-md mx-auto">
        Congratulations on completing your {contentPathLabel}, {creatorName.split(' ')[0]}!
        If you change your mind about creating again, we&apos;d love to hear from you.
      </p>

      <button
        onClick={handleReadyToCreate}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Starting new project...
          </>
        ) : (
          "I'm ready to create again"
        )}
      </button>

      {error && (
        <p className="text-red-600 text-sm mt-4">{error}</p>
      )}

      <p className="text-green-600 text-sm mt-4">
        Or reach out to{' '}
        <a href="mailto:rachel@teachersdeserveit.com" className="underline hover:text-green-800">
          rachel@teachersdeserveit.com
        </a>
        {' '}anytime.
      </p>
    </div>
  );
}
