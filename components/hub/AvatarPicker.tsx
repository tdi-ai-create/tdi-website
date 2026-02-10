'use client';

import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';

// Avatar definitions with their colors and personality names
export const AVATARS = [
  // Animals (1-8)
  { id: 'owl', name: 'Owl', personality: 'Wise but tired', color: '#2B3A67', icon: '🦉' },
  { id: 'golden-retriever', name: 'Golden Retriever', personality: 'Sunshine in human form', color: '#8B7355', icon: '🐕' },
  { id: 'cat', name: 'Cat', personality: 'Do not disturb', color: '#2B3A67', icon: '🐱' },
  { id: 'fox', name: 'Fox', personality: 'Quietly running the show', color: '#8B7355', icon: '🦊' },
  { id: 'hummingbird', name: 'Hummingbird', personality: 'Fueled by caffeine', color: '#2B3A67', icon: '🐦' },
  { id: 'turtle', name: 'Turtle', personality: 'Slow and steady wins the sanity', color: '#8B7355', icon: '🐢' },
  { id: 'bear', name: 'Bear', personality: 'Tough outside, marshmallow inside', color: '#2B3A67', icon: '🐻' },
  { id: 'butterfly', name: 'Butterfly', personality: 'Still becoming', color: '#8B7355', icon: '🦋' },
  // Objects (9-12)
  { id: 'coffee-mug', name: 'Coffee Mug', personality: "Don't talk to me yet", color: '#C9A227', icon: '☕' },
  { id: 'books', name: 'Books', personality: 'Has a book for that', color: '#D4A84B', icon: '📚' },
  { id: 'plant', name: 'Plant', personality: 'Growing things is my deal', color: '#5D8A4A', icon: '🌱' },
  { id: 'headphones', name: 'Headphones', personality: 'Main character energy', color: '#C9A227', icon: '🎧' },
  // Nature (13-14)
  { id: 'sunrise', name: 'Sunrise', personality: 'Tomorrow is a fresh start', color: '#7BA05B', icon: '🌅' },
  { id: 'mountain', name: 'Mountain', personality: 'High standards, higher expectations', color: '#5D8A4A', icon: '⛰️' },
  // Abstract (15-16)
  { id: 'starburst', name: 'Starburst', personality: 'A lot of energy, small package', color: '#2B3A67', icon: '✨' },
  { id: 'spiral', name: 'Spiral', personality: 'Go with the flow type', color: '#2B3A67', icon: '🌀' },
];

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
  const iconSize = isOnboarding ? 'text-2xl' : 'text-xl';

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
                }}
              >
                <span className={iconSize}>{avatar.icon}</span>
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
