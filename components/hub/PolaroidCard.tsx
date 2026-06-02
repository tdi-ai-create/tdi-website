'use client';

import { useState, useRef } from 'react';
import { Upload, Share2 } from 'lucide-react';

export type PolaroidSlot = 'love' | 'proud' | 'goal';

const SLOT_PROMPTS: Record<PolaroidSlot, string> = {
  love: 'something you love',
  proud: "something you're proud of",
  goal: 'a goal in life',
};

const SLOT_CAPTIONS: Record<PolaroidSlot, string> = {
  love: 'something i love',
  proud: "something i'm proud of",
  goal: 'a goal in life',
};

const SLOT_ROTATIONS: Record<PolaroidSlot, string> = {
  love: 'rotate(-3deg)',
  proud: 'rotate(2.5deg)',
  goal: 'rotate(-1.5deg)',
};

interface PolaroidCardProps {
  slot: PolaroidSlot;
  imageUrl?: string | null;
  caption?: string | null;
  userId: string;
  onUpdate?: (slot: PolaroidSlot, imageUrl: string) => void;
  onShare?: (slot: PolaroidSlot, imageUrl: string) => void;
  width?: number;
}

export default function PolaroidCard({
  slot,
  imageUrl,
  caption,
  userId,
  onUpdate,
  onShare,
  width = 160,
}: PolaroidCardProps) {
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUrl || null);
  const [hovering, setHovering] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rotation = SLOT_ROTATIONS[slot];
  const hoverScale = `${rotation} scale(1.03)`;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slot', slot);

      const res = await fetch('/api/hub/polaroids', { method: 'POST', body: formData });
      const result = await res.json();

      if (res.ok && result.image_url) {
        setCurrentImage(result.image_url);
        onUpdate?.(slot, result.image_url);
      } else {
        console.error('Polaroid upload failed:', result.error);
      }
    } catch (err) {
      console.error('Polaroid upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const isEmpty = !currentImage;

  return (
    <div
      style={{
        display: 'inline-block',
        width,
        flexShrink: 0,
        transform: hovering ? hoverScale : rotation,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => isEmpty && fileRef.current?.click()}
    >
      {/* Polaroid frame */}
      <div
        style={{
          background: 'white',
          padding: `${width * 0.05}px ${width * 0.05}px ${width * 0.28}px`,
          borderRadius: 3,
          boxShadow: hovering
            ? '0 4px 16px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.04)'
            : '0 2px 8px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Gold pin */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: width * 0.09,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #F5D98A, #C9A030)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.4)',
            zIndex: 2,
          }}
        />

        {/* Photo area */}
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 2,
            overflow: 'hidden',
            background: isEmpty ? 'linear-gradient(135deg, #F9FAFB, #F3F4F6)' : '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={caption || SLOT_CAPTIONS[slot]}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : uploading ? (
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Uploading...</div>
          ) : (
            <>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(232,184,75,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={13} style={{ color: '#E8B84B' }} />
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', padding: '0 4px' }}>
                {SLOT_PROMPTS[slot]}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#E8B84B',
                  background: 'rgba(232,184,75,0.1)',
                  border: '1px dashed rgba(232,184,75,0.4)',
                  padding: '3px 12px',
                  borderRadius: 6,
                }}
              >
                upload yours
              </div>
            </>
          )}
        </div>

        {/* Caption */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: width * 0.04,
            fontFamily: "'Caveat', cursive",
            fontSize: Math.max(18, width * 0.14),
            color: '#4B5563',
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          {caption || SLOT_CAPTIONS[slot]}
        </div>

        {/* Share button (filled state only, visible on hover) */}
        {currentImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(slot, currentImage);
            }}
            style={{
              position: 'absolute',
              bottom: width * 0.24,
              right: width * 0.08,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'rgba(30,39,73,0.7)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovering ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            <Share2 size={12} style={{ color: 'white' }} />
          </button>
        )}

        {/* Replace button (filled state, visible on hover) */}
        {currentImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            style={{
              position: 'absolute',
              bottom: width * 0.24,
              left: width * 0.08,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'rgba(30,39,73,0.7)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovering ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            <Upload size={12} style={{ color: 'white' }} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
