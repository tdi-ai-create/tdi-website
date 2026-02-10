'use client';

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
    32: 'w-8 h-8 text-sm',
    48: 'w-12 h-12 text-lg',
    96: 'w-24 h-24 text-3xl',
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

  // If we have a preset avatar ID, show a placeholder with the avatar name's first letter
  // (Real illustrations will replace this later)
  if (avatarId) {
    const avatarColors: Record<string, string> = {
      owl: '#8B7355',
      'coffee-mug': '#6F4E37',
      plant: '#228B22',
      book: '#4169E1',
      apple: '#DC143C',
      pencil: '#FFD700',
      star: '#FFD700',
      heart: '#FF69B4',
    };

    const bgColor = avatarColors[avatarId] || '#2B3A67';
    const initial = avatarId.charAt(0).toUpperCase();

    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: bgColor }}
      >
        <span
          className="font-semibold text-white"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {initial}
        </span>
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
        }}
      >
        {getInitial()}
      </span>
    </div>
  );
}
