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

// Custom SVG icons for platforms not in Lucide
const FacebookIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const BlueskyIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
  </svg>
);

const PinterestIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

export interface ShareMenuProps {
  text: string;
  url?: string;
  type: 'certificate' | 'tip';
  courseTitle?: string;
  pdHours?: number;
  buttonVariant?: 'primary' | 'secondary' | 'ghost';
  buttonSize?: 'sm' | 'md';
}

type CopiedType = 'link' | 'text' | 'instagram' | 'tiktok' | null;

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
  const [copied, setCopied] = useState<CopiedType>(null);
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

  const getShareUrl = () => url || 'https://www.teachersdeserveit.com/hub';

  // Generate share text based on type
  const getTwitterText = () => {
    if (type === 'certificate' && courseTitle) {
      return `Just earned my PD certificate for ${courseTitle} from @TeachersDeserveIt! #TeacherPD`;
    }
    return `${text} - @TeachersDeserveIt #TeacherTip`;
  };

  const getFacebookText = () => {
    if (type === 'certificate' && courseTitle && pdHours) {
      return `I just earned ${pdHours} PD hours by completing "${courseTitle}" on the Teachers Deserve It Learning Hub!`;
    }
    return text;
  };

  const getCopyText = () => {
    if (type === 'tip') {
      return `${text} - Teachers Deserve It`;
    }
    return text;
  };

  const getInstagramText = () => {
    const shareUrl = getShareUrl();
    if (type === 'certificate' && courseTitle && pdHours) {
      return `I just earned ${pdHours} PD hours by completing "${courseTitle}" on the Teachers Deserve It Learning Hub! 🎓\n\nVerify: ${shareUrl}\n\n#TeacherPD #TeachersDeserveIt #ProfessionalDevelopment`;
    }
    return `${text}\n\n${shareUrl}\n\n#TeacherTip #TeachersDeserveIt`;
  };

  const getTikTokText = () => {
    const shareUrl = getShareUrl();
    if (type === 'certificate' && courseTitle && pdHours) {
      return `I just earned ${pdHours} PD hours! 🎓 ${courseTitle} on Teachers Deserve It Learning Hub\n\n${shareUrl}`;
    }
    return `${text}\n\n${shareUrl}`;
  };

  const getBlueskyText = () => {
    if (type === 'certificate' && courseTitle) {
      return `Just earned my PD certificate for ${courseTitle} from Teachers Deserve It! #TeacherPD`;
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
    const shareUrl = getShareUrl();
    if (type === 'certificate') {
      return `I just earned a PD certificate from Teachers Deserve It!\n\nVerify it here: ${shareUrl}`;
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

  const handleFacebook = () => {
    const shareUrl = getShareUrl();
    const shareText = getFacebookText();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleTwitter = () => {
    const tweetText = getTwitterText();
    const shareUrl = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleLinkedIn = () => {
    const shareUrl = getShareUrl();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleInstagram = async () => {
    await navigator.clipboard.writeText(getInstagramText());
    setCopied('instagram');
  };

  const handleTikTok = async () => {
    await navigator.clipboard.writeText(getTikTokText());
    setCopied('tiktok');
  };

  const handleBluesky = () => {
    const shareText = getBlueskyText();
    const shareUrl = getShareUrl();
    const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(blueskyUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handlePinterest = () => {
    const shareUrl = getShareUrl();
    const description = type === 'certificate' && courseTitle
      ? `I earned my PD certificate for ${courseTitle}!`
      : text;
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(description)}`;
    window.open(pinterestUrl, '_blank', 'width=600,height=400');
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

  // Get copied message based on type
  const getCopiedMessage = () => {
    switch (copied) {
      case 'link':
        return 'Copied!';
      case 'text':
        return 'Copied!';
      case 'instagram':
        return 'Copied! Paste into your Instagram caption';
      case 'tiktok':
        return 'Copied! Paste into your TikTok caption';
      default:
        return '';
    }
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
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 max-h-[400px] overflow-y-auto">
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

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Facebook */}
          <button
            onClick={handleFacebook}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FacebookIcon size={16} className="text-[#1877F2]" />
            <span>Share on Facebook</span>
          </button>

          {/* Twitter/X */}
          <button
            onClick={handleTwitter}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Twitter size={16} className="text-gray-700" />
            <span>Share on X</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleLinkedIn}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Linkedin size={16} className="text-[#0A66C2]" />
            <span>Share on LinkedIn</span>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagram}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied === 'instagram' ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <InstagramIcon size={16} className="text-[#E4405F]" />
            )}
            <span className="flex-1 text-left">
              {copied === 'instagram' ? 'Copied! Paste into caption' : 'Copy for Instagram'}
            </span>
          </button>

          {/* TikTok */}
          <button
            onClick={handleTikTok}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied === 'tiktok' ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <TikTokIcon size={16} className="text-gray-900" />
            )}
            <span className="flex-1 text-left">
              {copied === 'tiktok' ? 'Copied! Paste into caption' : 'Copy for TikTok'}
            </span>
          </button>

          {/* Bluesky */}
          <button
            onClick={handleBluesky}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BlueskyIcon size={16} className="text-[#0085FF]" />
            <span>Share on Bluesky</span>
          </button>

          {/* Pinterest */}
          <button
            onClick={handlePinterest}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PinterestIcon size={16} className="text-[#E60023]" />
            <span>Share on Pinterest</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

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
