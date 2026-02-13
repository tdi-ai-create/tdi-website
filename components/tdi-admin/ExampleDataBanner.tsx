'use client';

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';

interface ExampleDataBannerProps {
  onDataRemoved?: () => void;
}

export default function ExampleDataBanner({ onDataRemoved }: ExampleDataBannerProps) {
  const { isOwner } = useTDIAdmin();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveExampleData = async () => {
    if (!confirm('Are you sure you want to remove all example data? This cannot be undone.')) {
      return;
    }

    setIsRemoving(true);
    setError(null);

    try {
      const response = await fetch('/api/tdi-admin/cleanup-example-data', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove example data');
      }

      // Refresh the page to show updated data
      if (onDataRemoved) {
        onDataRemoved();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsRemoving(false);
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className="relative mb-6 p-4 rounded-xl"
      style={{
        backgroundColor: '#FEF3C7',
        border: '2px solid #E8B84B',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(232, 184, 75, 0.3)' }}
        >
          <AlertTriangle size={20} style={{ color: '#92400E' }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold mb-1"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#92400E',
            }}
          >
            You are viewing EXAMPLE DATA
          </h3>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#92400E',
              opacity: 0.9,
            }}
          >
            This sample data demonstrates how reports and analytics will look with 500+ active educators.
            Example data will be removed once real enrollment reaches scale.
          </p>

          {error && (
            <p
              className="mt-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#DC2626',
              }}
            >
              {error}
            </p>
          )}

          {isOwner && (
            <button
              onClick={handleRemoveExampleData}
              disabled={isRemoving}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#92400E',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
              }}
            >
              {isRemoving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Example Data'
              )}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-amber-200/50 transition-colors"
          title="Dismiss"
        >
          <X size={18} style={{ color: '#92400E' }} />
        </button>
      </div>
    </div>
  );
}
