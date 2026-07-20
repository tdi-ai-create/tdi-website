'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/lib/hub/useTranslation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase } from '@/lib/supabase-hub';

interface UniversalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  message: string;
  emailSubject?: string;
}

export default function UniversalShareModal({
  isOpen,
  onClose,
  title = 'Share this',
  subtitle = 'Help another educator find something great',
  message,
  emailSubject = 'Something worth sharing',
}: UniversalShareModalProps) {
  const { tUI } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useHub();
  const loggedRef = useRef(false);

  // Log share_used action once when modal opens
  useEffect(() => {
    if (isOpen && user?.id && !loggedRef.current) {
      loggedRef.current = true;
      const supabase = getHubSupabase();
      supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'share_used',
        metadata: { title },
      }).then(() => {});
    }
    if (!isOpen) loggedRef.current = false;
  }, [isOpen, user?.id, title]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: use a hidden textarea for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = message;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silent fail
      }
    }
  };

  if (!isOpen) return null;

  const encodedMessage = encodeURIComponent(message);
  const encodedSubject = encodeURIComponent(emailSubject);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col bg-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#1e2749' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{tUI(title)}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{tUI(subtitle)}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Pre-written message */}
          <div
            className="p-4 rounded-xl mb-4"
            style={{ background: '#1e2749' }}
          >
            <p style={{ fontSize: '15px', color: 'white', lineHeight: '1.65', fontStyle: 'italic', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              &ldquo;{message}&rdquo;
            </p>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mb-5"
            style={
              copied
                ? { background: '#D1FAE5', color: '#065F46' }
                : { background: '#ffba06', color: '#1e2749' }
            }
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? tUI('Copied!') : tUI('Copy and paste anywhere')}
          </button>

          {/* Email options */}
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
            {tUI('Email it')}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <a href={`mailto:?subject=${encodedSubject}&body=${encodedMessage}`}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px' }}>@</span>{tUI('Default')}
            </a>
            <a href={`https://mail.google.com/mail/?view=cm&su=${encodedSubject}&body=${encodedMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px', color: '#EA4335' }}>G</span>{tUI('Gmail')}
            </a>
            <a href={`https://outlook.live.com/mail/0/deeplink/compose?subject=${encodedSubject}&body=${encodedMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px', color: '#0078D4' }}>O</span>{tUI('Outlook')}
            </a>
          </div>

          {/* Share options */}
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
            {tUI('Share it')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a href={`sms:?&body=${encodedMessage}`}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px', color: '#34C759' }}>+</span>{tUI('Text')}
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px', color: '#1877F2' }}>f</span>{tUI('Facebook')}
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodedMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px' }}>X</span>{tUI('Twitter')}
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://teachersdeserveit.com')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px', color: '#0A66C2' }}>in</span>{tUI('LinkedIn')}
            </a>
            <a href={`https://wa.me/?text=${encodedMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}>
              <span style={{ fontSize: '20px', color: '#25D366' }}>W</span>{tUI('WhatsApp')}
            </a>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('https://teachersdeserveit.com');
                } catch {
                  const ta = document.createElement('textarea');
                  ta.value = 'https://teachersdeserveit.com';
                  ta.style.position = 'fixed';
                  ta.style.left = '-9999px';
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                }
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: linkCopied ? '#D1FAE5' : '#E5E7EB', color: linkCopied ? '#065F46' : '#374151', backgroundColor: linkCopied ? '#D1FAE5' : undefined }}>
              <span style={{ fontSize: '20px' }}>{linkCopied ? '\u2713' : '~'}</span>{linkCopied ? tUI('Copied!') : tUI('Link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
