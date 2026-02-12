'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Award, Download, Share2, X } from 'lucide-react';
import ShareMenu from './ShareMenu';
import confetti from 'canvas-confetti';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  pdHours: number;
  verificationCode: string;
  courseSlug: string;
}

export default function CourseCompletionModal({
  isOpen,
  onClose,
  courseTitle,
  pdHours,
  verificationCode,
  courseSlug,
}: CourseCompletionModalProps) {
  const hasConfetti = useRef(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    if (isOpen && !hasConfetti.current) {
      hasConfetti.current = true;

      // Fire confetti from both sides
      const fireConfetti = () => {
        const colors = ['#E8B84B', '#2B3A67', '#10B981', '#F59E0B', '#ffffff'];

        // Left side
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });

        // Right side
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });
      };

      // Fire immediately
      fireConfetti();

      // Fire again after a short delay
      setTimeout(fireConfetti, 250);
    }
  }, [isOpen]);

  // Reset confetti flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasConfetti.current = false;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showShareMenu) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, showShareMenu, onClose]);

  if (!isOpen) return null;

  const shareMessage = `I just completed "${courseTitle}" and earned ${pdHours} PD hours on the TDI Learning Hub! 🎓`;
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/hub/verify/${verificationCode}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(43, 58, 103, 0.9)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ maxHeight: '90vh' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close celebration"
        >
          <X size={20} />
        </button>

        {/* Gold ribbon at top */}
        <div
          className="h-2"
          style={{ backgroundColor: '#E8B84B' }}
        />

        {/* Content */}
        <div className="p-8 text-center">
          {/* Trophy/Award icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Award size={40} style={{ color: '#E8B84B' }} />
          </div>

          {/* Congratulations text */}
          <h2
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#2B3A67',
            }}
          >
            Congratulations!
          </h2>

          <p
            className="mb-2"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              color: '#4B5563',
            }}
          >
            You completed
          </p>

          <p
            className="font-semibold mb-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '18px',
              color: '#2B3A67',
            }}
          >
            {courseTitle}
          </p>

          {/* PD Hours badge */}
          <div
            className="inline-block px-4 py-2 rounded-full mb-6"
            style={{
              backgroundColor: '#FFF8E7',
              border: '2px solid #E8B84B',
            }}
          >
            <span
              className="font-semibold"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#2B3A67',
              }}
            >
              You earned {pdHours} PD hour{pdHours !== 1 ? 's' : ''}!
            </span>
          </div>

          {/* Certificate code */}
          <div
            className="p-3 rounded-lg mb-6"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-xs text-gray-500 mb-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Certificate Verification Code
            </p>
            <p
              className="font-mono font-semibold"
              style={{
                fontSize: '16px',
                color: '#2B3A67',
                letterSpacing: '0.05em',
              }}
            >
              {verificationCode}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Download Certificate */}
            <Link
              href={`/api/hub/certificate?code=${verificationCode}`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Download size={18} />
              Download Certificate
            </Link>

            {/* Share Achievement */}
            <ShareMenu
              text={shareMessage}
              url={shareUrl}
              type="certificate"
              courseTitle={courseTitle}
              pdHours={pdHours}
              buttonVariant="secondary"
            />

            {/* Back to Dashboard */}
            <Link
              href="/hub"
              className="block text-center py-2 text-sm transition-colors hover:underline"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#6B7280',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Warm message at bottom */}
        <div
          className="px-8 py-4 text-center"
          style={{ backgroundColor: '#FAFAF8', borderTop: '1px solid #E5E5E5' }}
        >
          <p
            className="text-sm italic"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#6B7280',
            }}
          >
            Teachers rarely get celebrated. You deserve this. 💛
          </p>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
