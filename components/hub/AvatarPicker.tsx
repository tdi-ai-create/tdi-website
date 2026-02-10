'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  X,
  Bird,
  Dog,
  Cat,
  Squirrel,
  Feather,
  Turtle,
  PawPrint,
  Flower2,
  Coffee,
  BookOpen,
  Sprout,
  Headphones,
  Sunrise,
  Mountain,
  Sparkles,
  RotateCcw,
  LucideIcon,
} from 'lucide-react';

// Map avatar IDs to Lucide icon components
const AVATAR_ICON_MAP: Record<string, LucideIcon> = {
  'owl': Bird,
  'golden-retriever': Dog,
  'cat': Cat,
  'squirrel': Squirrel,
  'hummingbird': Feather,
  'turtle': Turtle,
  'bear': PawPrint,
  'butterfly': Flower2,
  'coffee-mug': Coffee,
  'books': BookOpen,
  'plant': Sprout,
  'headphones': Headphones,
  'sunrise': Sunrise,
  'mountain': Mountain,
  'starburst': Sparkles,
  'spiral': RotateCcw,
};

// Avatar definitions with LIGHT BRIGHT colors and personality names
export const AVATARS = [
  // Animals (1-8)
  { id: 'owl', name: 'Owl', personality: 'Old soul energy', color: '#E8D5F2', iconColor: '#6B21A8' },
  { id: 'golden-retriever', name: 'Golden Retriever', personality: 'Dog lover, obviously', color: '#FFF3C4', iconColor: '#B45309' },
  { id: 'cat', name: 'Cat', personality: 'Cat lover, no apologies', color: '#E2E8F0', iconColor: '#475569' },
  { id: 'squirrel', name: 'Squirrel', personality: 'Quietly running the show', color: '#FFDDC1', iconColor: '#C2410C' },
  { id: 'hummingbird', name: 'Hummingbird', personality: 'High achiever', color: '#C6F6D5', iconColor: '#15803D' },
  { id: 'turtle', name: 'Turtle', personality: 'Patience is my superpower', color: '#B2F5EA', iconColor: '#0D9488' },
  { id: 'bear', name: 'Bear', personality: 'Tough love specialist', color: '#FEEBC8', iconColor: '#92400E' },
  { id: 'butterfly', name: 'Butterfly', personality: 'Still becoming', color: '#E9D8FD', iconColor: '#7C3AED' },
  // Objects (9-12)
  { id: 'coffee-mug', name: 'Coffee Mug', personality: 'But first, coffee', color: '#FED7AA', iconColor: '#9A3412' },
  { id: 'books', name: 'Books', personality: 'Total bookworm', color: '#FECACA', iconColor: '#B91C1C' },
  { id: 'plant', name: 'Plant', personality: 'Kids first, always', color: '#C6F6D5', iconColor: '#166534' },
  { id: 'headphones', name: 'Headphones', personality: 'Main character energy', color: '#BFDBFE', iconColor: '#1D4ED8' },
  // Nature (13-14)
  { id: 'sunrise', name: 'Sunrise', personality: 'Fresh start kind of person', color: '#FEF3C7', iconColor: '#D97706' },
  { id: 'mountain', name: 'Mountain', personality: 'Built for the climb', color: '#D1FAE5', iconColor: '#047857' },
  // Abstract (15-16)
  { id: 'starburst', name: 'Starburst', personality: 'Rule breaker', color: '#FDE68A', iconColor: '#CA8A04' },
  { id: 'spiral', name: 'Spiral', personality: 'Go with the flow type', color: '#DDD6FE', iconColor: '#7C3AED' },
];

// Get the icon component for an avatar
export function getAvatarIcon(avatarId: string, size: number = 24) {
  const IconComponent = AVATAR_ICON_MAP[avatarId];
  const avatar = AVATARS.find((a) => a.id === avatarId);
  if (!IconComponent) return null;
  return <IconComponent size={size} strokeWidth={1.5} color={avatar?.iconColor || '#2B3A67'} />;
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
  onClearUpload,
  size,
  isUploading = false,
  onFileSelect,
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isOnboarding = size === 'onboarding';

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

  // Onboarding: horizontal card list layout
  if (isOnboarding) {
    return (
      <div>
        {/* Uploaded Avatar Preview */}
        {uploadedAvatarUrl && (
          <div className="mb-6 flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#FFF8E7', border: '2px solid #E8B84B' }}>
            <div className="relative">
              <div
                className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0"
                style={{ border: '3px solid #E8B84B' }}
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
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                Your photo
              </p>
              <p
                className="text-[13px]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#9CA3AF',
                }}
              >
                Looking good!
              </p>
            </div>
          </div>
        )}

        {/* Avatar List - Scrollable vertical list of horizontal cards */}
        <div
          className="overflow-y-auto space-y-3 pr-2"
          style={{ maxHeight: '60vh' }}
        >
          {AVATARS.map((avatar) => {
            const isSelected = selectedAvatarId === avatar.id && !uploadedAvatarUrl;
            const IconComponent = AVATAR_ICON_MAP[avatar.id];

            return (
              <button
                key={avatar.id}
                onClick={() => onSelect(avatar.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: isSelected ? '#FFF8E7' : '#FFFFFF',
                  border: isSelected ? '2px solid #E8B84B' : '1.5px solid #E5E7EB',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
                aria-label={`${avatar.name}: ${avatar.personality}`}
                aria-pressed={isSelected}
              >
                {/* Avatar Circle - 72px with light bright background */}
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: avatar.color,
                  }}
                >
                  {IconComponent && <IconComponent size={40} strokeWidth={1.5} color={avatar.iconColor} />}
                </div>

                {/* Text content */}
                <div className="text-left flex-1">
                  {/* Avatar name as headline */}
                  <p
                    className="text-[18px] font-bold leading-tight"
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      color: '#2B3A67',
                    }}
                  >
                    {avatar.name}
                  </p>
                  {/* Personality tagline below */}
                  <p
                    className="text-[14px] italic mt-1"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#6B7280',
                    }}
                  >
                    {avatar.personality}
                  </p>
                </div>
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

  // Settings: compact grid layout
  return (
    <div>
      {/* Uploaded Avatar Preview */}
      {uploadedAvatarUrl && (
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full overflow-hidden"
              style={{ border: '2px solid #E8B84B' }}
            >
              <img
                src={uploadedAvatarUrl}
                alt="Your uploaded avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={onClearUpload}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Remove uploaded photo"
            >
              <X size={12} />
            </button>
          </div>
          <div>
            <p
              className="font-medium text-sm"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Your photo
            </p>
          </div>
        </div>
      )}

      {/* Avatar Grid for Settings */}
      <div className="grid grid-cols-4 gap-2">
        {AVATARS.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id && !uploadedAvatarUrl;
          const IconComponent = AVATAR_ICON_MAP[avatar.id];

          return (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className="flex flex-col items-center p-2 rounded-lg transition-all duration-200 focus:outline-none"
              style={{
                backgroundColor: isSelected ? '#FFF8E7' : 'transparent',
                border: isSelected ? '2px solid #E8B84B' : '2px solid transparent',
              }}
              aria-label={`${avatar.name}: ${avatar.personality}`}
              aria-pressed={isSelected}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: avatar.color }}
              >
                {IconComponent && <IconComponent size={18} strokeWidth={1.5} color={avatar.iconColor} />}
              </div>
              <p
                className="text-[10px] mt-1 truncate w-full text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                {avatar.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Upload Option */}
      <div className="mt-4 text-center">
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
          className="inline-flex items-center gap-2 text-xs hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          <Upload size={14} />
          {isUploading ? 'Uploading...' : 'Upload photo'}
        </button>

        {uploadError && (
          <p
            className="mt-2 text-xs text-red-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
