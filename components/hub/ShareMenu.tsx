'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Link2,
  Linkedin,
  Twitter,
  Mail,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface ShareMenuProps {
  text: string;
  url?: string;
  type: 'certificate' | 'tip';
  courseTitle?: string;
  pdHours?: number;
  buttonVariant?: 'primary' | 'secondary' | 'ghost';
  buttonSize?: 'sm' | 'md';
}

export default function ShareMenu({
  text,
  url,
  type,
  courseTitle,
  pdHours,
  buttonVariant = 'secondary',
  buttonSize = 'md',
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<'link' | 'text' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Generate share text based on type
  const getLinkedInText = () => {
    if (type === 'certificate' && courseTitle && pdHours) {
      return `I just earned ${pdHours} PD hours by completing ${courseTitle} on the Teachers Deserve It Learning Hub! #TeacherPD #TeachersDeserveIt`;
    }
    return text;
  };

  const getTwitterText = () => {
    if (type === 'certificate' && courseTitle) {
      return `Just earned my PD certificate for ${courseTitle} from @TeachersDeserveIt! #TeacherPD`;
    }
    return `${text} - @TeachersDeserveIt #TeacherTip`;
  };

  const getCopyText = () => {
    if (type === 'tip') {
      return `${text} - Teachers Deserve It`;
    }
    return text;
  };

  const getEmailSubject = () => {
    if (type === 'certificate') {
      return 'Check out my PD certificate';
    }
    return 'A tip from Teachers Deserve It';
  };

  const getEmailBody = () => {
    if (type === 'certificate' && url) {
      return `I just earned a PD certificate from Teachers Deserve It!\n\nVerify it here: ${url}`;
    }
    return `${text}\n\n- Teachers Deserve It`;
  };

  // Share handlers
  const handleCopyLink = async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied('link');
    }
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(getCopyText());
    setCopied('text');
  };

  const handleLinkedIn = () => {
    const shareUrl = url || 'https://www.teachersdeserveit.com/hub';
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleTwitter = () => {
    const tweetText = getTwitterText();
    const twitterUrl = url
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`
      : `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(getEmailSubject());
    const body = encodeURIComponent(getEmailBody());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  // Button styles
  const buttonClasses = {
    primary: 'bg-[#2B3A67] text-white hover:bg-[#1e2a4a]',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-lg transition-colors ${buttonClasses[buttonVariant]} ${sizeClasses[buttonSize]}`}
      >
        <Share2 size={buttonSize === 'sm' ? 14 : 16} />
        <span>Share</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
          {/* Copy Link (for certificates) */}
          {type === 'certificate' && url && (
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied === 'link' ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Link2 size={16} className="text-gray-400" />
              )}
              <span>{copied === 'link' ? 'Copied!' : 'Copy link'}</span>
            </button>
          )}

          {/* Copy Text (for tips) */}
          {type === 'tip' && (
            <button
              onClick={handleCopyText}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied === 'text' ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} className="text-gray-400" />
              )}
              <span>{copied === 'text' ? 'Copied!' : 'Copy text'}</span>
            </button>
          )}

          {/* LinkedIn (for certificates) */}
          {type === 'certificate' && (
            <button
              onClick={handleLinkedIn}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Linkedin size={16} className="text-[#0A66C2]" />
              <span>Share on LinkedIn</span>
            </button>
          )}

          {/* Twitter/X */}
          <button
            onClick={handleTwitter}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Twitter size={16} className="text-gray-700" />
            <span>Share on X</span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmail}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Mail size={16} className="text-gray-400" />
            <span>Send via email</span>
          </button>
        </div>
      )}
    </div>
  );
}
