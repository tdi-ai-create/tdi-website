'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

// SVG Icon components for avatars
interface IconProps {
  size?: number;
}

const OwlIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="10" r="2.5" />
    <circle cx="15" cy="10" r="2.5" />
    <circle cx="9" cy="10" r="1" fill="#FFFFFF" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="#FFFFFF" stroke="none" />
    <path d="M12 14l-1 2h2l-1-2" />
    <path d="M6 8c0-3 2.5-5 6-5s6 2 6 5" />
    <path d="M4 12c0 4 3.5 8 8 8s8-4 8-8" />
    <path d="M4 12c-1-1-1-3 0-4" />
    <path d="M20 12c1-1 1-3 0-4" />
  </svg>
);

const DogIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 11c0-4 2-7 7-7s7 3 7 7" />
    <path d="M4 11c-1 0-2 1-2 3s1 3 2 3" />
    <path d="M20 11c1 0 2 1 2 3s-1 3-2 3" />
    <ellipse cx="12" cy="14" rx="7" ry="6" />
    <circle cx="9" cy="12" r="1" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="1" fill="#FFFFFF" />
    <ellipse cx="12" cy="16" rx="2" ry="1.5" />
    <path d="M10 19c0 1 1 2 2 2s2-1 2-2" />
  </svg>
);

const CatIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="14" rx="8" ry="6" />
    <path d="M8 8c-2-4-4-5-4-5" />
    <path d="M16 8c2-4 4-5 4-5" />
    <path d="M20 8c0 2-3 4-8 4s-8-2-8-4" />
    <circle cx="9" cy="12" r="1" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="1" fill="#FFFFFF" />
    <path d="M12 14v1" />
    <path d="M10 16c1 1 3 1 4 0" />
  </svg>
);

const FoxIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4l2 6" />
    <path d="M18 4l-2 6" />
    <path d="M4 10c0 6 3.5 10 8 10s8-4 8-10" />
    <path d="M4 10c-1-2 0-4 2-4" />
    <path d="M20 10c1-2 0-4-2-4" />
    <circle cx="9" cy="12" r="1" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="1" fill="#FFFFFF" />
    <path d="M12 14l-1.5 2h3l-1.5-2" />
  </svg>
);

const HummingbirdIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="10" cy="12" rx="5" ry="4" />
    <path d="M15 12l6-2" />
    <path d="M6 9c-3 0-4-2-4-2" />
    <path d="M6 15c-3 0-4 2-4 2" />
    <path d="M8 8c2-4 6-5 6-5" />
    <path d="M8 16c2 4 6 5 6 5" />
    <circle cx="8" cy="11" r="0.5" fill="#FFFFFF" />
  </svg>
);

const TurtleIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="14" rx="7" ry="5" />
    <path d="M5 14c-2 0-3-1-3-2s1-2 2-2" />
    <path d="M6 17l-1 3" />
    <path d="M18 17l1 3" />
    <path d="M7 11l-1-2" />
    <path d="M17 11l1-2" />
    <path d="M9 12a3 3 0 016 0" />
    <path d="M12 12v5" />
    <path d="M9 15h6" />
  </svg>
);

const BearIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <ellipse cx="12" cy="13" rx="8" ry="7" />
    <circle cx="9" cy="11" r="1" fill="#FFFFFF" />
    <circle cx="15" cy="11" r="1" fill="#FFFFFF" />
    <ellipse cx="12" cy="15" rx="2.5" ry="2" />
    <path d="M12 15v1" />
  </svg>
);

const ButterflyIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v16" />
    <path d="M12 6c-4-2-8 0-9 4s2 6 5 6c2 0 4-2 4-4" />
    <path d="M12 6c4-2 8 0 9 4s-2 6-5 6c-2 0-4-2-4-4" />
    <circle cx="7" cy="9" r="1" fill="#FFFFFF" />
    <circle cx="17" cy="9" r="1" fill="#FFFFFF" />
    <path d="M10 3c-1-1-2-1-2-1" />
    <path d="M14 3c1-1 2-1 2-1" />
  </svg>
);

const CoffeeMugIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9h12v9a3 3 0 01-3 3H8a3 3 0 01-3-3V9z" />
    <path d="M17 12h2a2 2 0 010 4h-2" />
    <path d="M8 4c0-1 0.5-2 2-2" />
    <path d="M11 5c0-2 1-3 2-3" />
    <path d="M14 4c0-1 0.5-2 1.5-2" />
  </svg>
);

const BooksIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19l2-14h4l-2 14H4z" />
    <path d="M9 19l1-14h4l-1 14H9z" />
    <path d="M14 19l0-14h5l0 14h-5z" />
    <path d="M19 7h-5" />
    <path d="M7 5l1 0" />
    <path d="M16 3v3" />
  </svg>
);

const PlantIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 21h10" />
    <path d="M8 21l1-6h6l1 6" />
    <path d="M12 15v-5" />
    <path d="M12 10c-3 0-5-2-5-5 2 0 5 2 5 5" />
    <path d="M12 10c3 0 5-2 5-5-2 0-5 2-5 5" />
    <path d="M12 7c0-3 2-5 4-5 0 2-1 4-4 5" />
    <path d="M12 7c0-3-2-5-4-5 0 2 1 4 4 5" />
  </svg>
);

const HeadphonesIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12a8 8 0 0116 0" />
    <path d="M4 12v6a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H4" />
    <path d="M20 12v6a2 2 0 01-2 2h-1a1 1 0 01-1-1v-4a1 1 0 011-1h3" />
  </svg>
);

const SunriseIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17h18" />
    <path d="M12 13a4 4 0 010 0c-2.2 0-4 1.3-4 4h8c0-2.7-1.8-4-4-4z" />
    <path d="M12 9V5" />
    <path d="M6.3 11.3l-1.4-1.4" />
    <path d="M17.7 11.3l1.4-1.4" />
    <path d="M4 17l1-1" />
    <path d="M19 16l1 1" />
    <path d="M8 8L6.5 6.5" />
    <path d="M16 8l1.5-1.5" />
  </svg>
);

const MountainIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20l6-12 4 6 5-10 4 16H3z" />
    <path d="M14 4v3" />
    <path d="M14 4l2 1" />
    <path d="M14 4l-2 1" />
    <path d="M8 14l2-2 2 2" />
  </svg>
);

const StarburstIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </svg>
);

const SpiralIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
    <path d="M12 10c1 0 2 1 2 2s-1 2-2 2-3-1-3-3 2-4 4-4 5 2 5 5-3 6-6 6-7-3-7-7 4-8 8-8" />
  </svg>
);

// Map icon IDs to components
const AVATAR_ICONS: Record<string, React.FC<IconProps>> = {
  'owl': OwlIcon,
  'golden-retriever': DogIcon,
  'cat': CatIcon,
  'fox': FoxIcon,
  'hummingbird': HummingbirdIcon,
  'turtle': TurtleIcon,
  'bear': BearIcon,
  'butterfly': ButterflyIcon,
  'coffee-mug': CoffeeMugIcon,
  'books': BooksIcon,
  'plant': PlantIcon,
  'headphones': HeadphonesIcon,
  'sunrise': SunriseIcon,
  'mountain': MountainIcon,
  'starburst': StarburstIcon,
  'spiral': SpiralIcon,
};

// Avatar definitions with their colors and personality names
export const AVATARS = [
  // Animals (1-8)
  { id: 'owl', name: 'Owl', personality: 'Wise but tired', color: '#2B3A67' },
  { id: 'golden-retriever', name: 'Golden Retriever', personality: 'Sunshine in human form', color: '#3D4F7C' },
  { id: 'cat', name: 'Cat', personality: 'Do not disturb', color: '#4A5568' },
  { id: 'fox', name: 'Fox', personality: 'Quietly running the show', color: '#C05621' },
  { id: 'hummingbird', name: 'Hummingbird', personality: 'Fueled by caffeine', color: '#5B8C8A' },
  { id: 'turtle', name: 'Turtle', personality: 'Slow and steady wins the sanity', color: '#4A7C59' },
  { id: 'bear', name: 'Bear', personality: 'Tough outside, marshmallow inside', color: '#8B6F47' },
  { id: 'butterfly', name: 'Butterfly', personality: 'Still becoming', color: '#7C6FA0' },
  // Objects (9-12)
  { id: 'coffee-mug', name: 'Coffee Mug', personality: "Don't talk to me yet", color: '#92400E' },
  { id: 'books', name: 'Books', personality: 'Has a book for that', color: '#9C4221' },
  { id: 'plant', name: 'Plant', personality: 'Growing things is my deal', color: '#4A7C59' },
  { id: 'headphones', name: 'Headphones', personality: 'Main character energy', color: '#5B6B8A' },
  // Nature (13-14)
  { id: 'sunrise', name: 'Sunrise', personality: 'Tomorrow is a fresh start', color: '#C05621' },
  { id: 'mountain', name: 'Mountain', personality: 'High standards, higher expectations', color: '#4A7C59' },
  // Abstract (15-16)
  { id: 'starburst', name: 'Starburst', personality: 'A lot of energy, small package', color: '#4A5568' },
  { id: 'spiral', name: 'Spiral', personality: 'Go with the flow type', color: '#2B3A67' },
];

// Get the icon component for an avatar
export function getAvatarIcon(avatarId: string, size: number = 24) {
  const IconComponent = AVATAR_ICONS[avatarId];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

interface AvatarPickerProps {
  selectedAvatarId: string | null;
  uploadedAvatarUrl: string | null;
  onSelect: (avatarId: string) => void;
  onUpload: (url: string) => void;
  onClearUpload: () => void;
  size: 'onboarding' | 'settings';
  isUploading?: boolean;
  onFileSelect?: (file: File) => Promise<void>;
}

export default function AvatarPicker({
  selectedAvatarId,
  uploadedAvatarUrl,
  onSelect,
  onUpload,
  onClearUpload,
  size,
  isUploading = false,
  onFileSelect,
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isOnboarding = size === 'onboarding';
  const gridCols = isOnboarding ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-4';
  const avatarSize = isOnboarding ? 'w-16 h-16' : 'w-12 h-12';
  const iconSize = isOnboarding ? 28 : 22;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError('Please upload a JPG or PNG image');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be less than 2MB');
      return;
    }

    if (onFileSelect) {
      await onFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* Uploaded Avatar Preview */}
      {uploadedAvatarUrl && (
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-3"
              style={{ borderColor: '#E8B84B' }}
            >
              <img
                src={uploadedAvatarUrl}
                alt="Your uploaded avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={onClearUpload}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Remove uploaded photo"
            >
              <X size={14} />
            </button>
          </div>
          <div>
            <p
              className="font-medium"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Your photo
            </p>
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Looking good!
            </p>
          </div>
        </div>
      )}

      {/* Avatar Grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {AVATARS.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id && !uploadedAvatarUrl;

          return (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSelected
                  ? 'scale-105 ring-3'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: isSelected ? '#FFF8E7' : 'transparent',
              }}
              aria-label={`${avatar.name}: ${avatar.personality}`}
              aria-pressed={isSelected}
            >
              {/* Avatar Circle */}
              <div
                className={`${avatarSize} rounded-full flex items-center justify-center mb-2 transition-transform duration-200 ${
                  isSelected ? 'ring-3' : ''
                }`}
                style={{
                  backgroundColor: avatar.color,
                  ringColor: isSelected ? '#E8B84B' : undefined,
                }}
              >
                {getAvatarIcon(avatar.id, iconSize)}
              </div>

              {/* Name and Personality */}
              {isOnboarding && (
                <div className="text-center">
                  <p
                    className="text-xs font-semibold truncate w-full"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: isSelected ? '#E8B84B' : '#2B3A67',
                    }}
                  >
                    {avatar.name}
                  </p>
                  <p
                    className="text-[10px] text-gray-500 leading-tight mt-0.5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {avatar.personality}
                  </p>
                </div>
              )}

              {/* Settings size: show name on hover */}
              {!isOnboarding && (
                <p
                  className="text-[10px] font-medium truncate"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isSelected ? '#E8B84B' : '#2B3A67',
                  }}
                >
                  {avatar.name}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Upload Option */}
      <div className="mt-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload your own photo"
        />

        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="inline-flex items-center gap-2 text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          <Upload size={16} />
          {isUploading ? 'Uploading...' : 'Or upload your own photo'}
        </button>

        {uploadError && (
          <p
            className="mt-2 text-sm text-red-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
