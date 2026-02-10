'use client';

import { AVATARS, getAvatarIcon } from './AvatarPicker';

interface AvatarDisplayProps {
  size: 32 | 48 | 96;
  userId?: string;
  avatarId?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
}

export default function AvatarDisplay({
  size,
  avatarId,
  avatarUrl,
  displayName,
}: AvatarDisplayProps) {
  const sizeClasses = {
    32: 'w-8 h-8',
    48: 'w-12 h-12',
    96: 'w-24 h-24',
  };

  // Icon sizes for each avatar size
  const iconSizes = {
    32: 16,
    48: 22,
    96: 44,
  };

  const getInitial = (): string => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    return 'T'; // Default to T for Teacher
  };

  // If we have an uploaded avatar URL, show it
  if (avatarUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}
        style={{ backgroundColor: '#2B3A67' }}
      >
        <img
          src={avatarUrl}
          alt={displayName || 'User avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If we have a preset avatar ID, show the SVG icon
  if (avatarId) {
    const avatar = AVATARS.find((a) => a.id === avatarId);
    const bgColor = avatar?.color || '#2B3A67';
    const icon = getAvatarIcon(avatarId, iconSizes[size]);

    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
    );
  }

  // Default: blue circle with gold initial
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: '#2B3A67' }}
    >
      <span
        className="font-semibold"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: '#E8B84B',
          fontSize: size === 96 ? '2rem' : size === 48 ? '1.125rem' : '0.875rem',
        }}
      >
        {getInitial()}
      </span>
    </div>
  );
}
