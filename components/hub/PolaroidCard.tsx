'use client';

import { useState, useRef } from 'react';
import { Upload, Share2, Palette } from 'lucide-react';
import { useTranslation } from '@/lib/hub/useTranslation';

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

const PIN_COLORS = [
  { id: 'gold', light: '#F5D98A', dark: '#C9A030' },
  { id: 'red', light: '#F5A0A0', dark: '#C03030' },
  { id: 'teal', light: '#8AD8CF', dark: '#2A9D8F' },
  { id: 'blue', light: '#93B5F5', dark: '#2563EB' },
  { id: 'purple', light: '#C4A0F5', dark: '#8B5CF6' },
  { id: 'pink', light: '#F5A0D0', dark: '#EC4899' },
];

function getPinGradient(colorId?: string | null) {
  const color = PIN_COLORS.find(c => c.id === colorId) || PIN_COLORS[0];
  return `radial-gradient(circle at 35% 35%, ${color.light}, ${color.dark})`;
}

interface PolaroidCardProps {
  slot: PolaroidSlot;
  imageUrl?: string | null;
  caption?: string | null;
  pinColor?: string | null;
  userId: string;
  onUpdate?: (slot: PolaroidSlot, imageUrl: string) => void;
  onPinColorChange?: (slot: PolaroidSlot, color: string) => void;
  onShare?: (slot: PolaroidSlot, imageUrl: string) => void;
  width?: number;
}

export default function PolaroidCard({
  slot,
  imageUrl,
  caption,
  pinColor,
  userId,
  onUpdate,
  onPinColorChange,
  onShare,
  width = 150,
}: PolaroidCardProps) {
  const { tUI } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUrl || null);
  const [currentPinColor, setCurrentPinColor] = useState(pinColor || 'gold');
  const [hovering, setHovering] = useState(false);
  const [showPinPicker, setShowPinPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slot', slot);
      formData.append('userId', userId);

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
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handlePinColorChange = async (colorId: string) => {
    setCurrentPinColor(colorId);
    setShowPinPicker(false);
    onPinColorChange?.(slot, colorId);

    // Persist to server
    fetch('/api/hub/polaroids', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, slot, pinColor: colorId }),
    }).catch(() => {});
  };

  const isEmpty = !currentImage;
  const pad = Math.round(width * 0.05);

  return (
    <div
      style={{
        display: 'inline-block',
        width,
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowPinPicker(false); }}
      onClick={() => isEmpty && fileRef.current?.click()}
    >
      {/* Polaroid frame */}
      <div
        style={{
          background: 'white',
          padding: `${pad}px ${pad}px 34px`,
          borderRadius: 3,
          boxShadow: hovering
            ? '0 4px 16px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.04)'
            : '0 2px 8px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Pin -- clickable to open color picker */}
        <div
          onClick={(e) => { e.stopPropagation(); setShowPinPicker(!showPinPicker); }}
          style={{
            position: 'absolute',
            top: -8,
            right: Math.round(width * 0.09),
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: getPinGradient(currentPinColor),
            boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.4)',
            zIndex: 5,
            cursor: 'pointer',
          }}
        />

        {/* Pin color picker dropdown */}
        {showPinPicker && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: Math.round(width * 0.09) - 20,
              background: 'white',
              borderRadius: 10,
              padding: 8,
              display: 'flex',
              gap: 6,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {PIN_COLORS.map(c => (
              <div
                key={c.id}
                onClick={() => handlePinColorChange(c.id)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${c.light}, ${c.dark})`,
                  cursor: 'pointer',
                  border: currentPinColor === c.id ? '2px solid #1e2749' : '2px solid transparent',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>
        )}

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
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{tUI('Uploading...')}</div>
          ) : (
            <>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(232,184,75,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Upload size={13} style={{ color: '#E8B84B' }} />
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', padding: '0 4px' }}>
                {tUI(SLOT_PROMPTS[slot])}
              </div>
              <div
                style={{
                  fontSize: 10, fontWeight: 600, color: '#E8B84B',
                  background: 'rgba(232,184,75,0.1)',
                  border: '1px dashed rgba(232,184,75,0.4)',
                  padding: '3px 12px', borderRadius: 6,
                }}
              >
                {tUI('upload yours')}
              </div>
            </>
          )}
        </div>

        {/* Caption */}
        <div
          style={{
            textAlign: 'center', paddingTop: 6,
            fontFamily: "'Caveat', cursive", fontSize: 17,
            color: '#4B5563', fontWeight: 600, lineHeight: 1.1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {caption || tUI(SLOT_CAPTIONS[slot])}
        </div>

        {/* Hover action buttons (filled state only) */}
        {currentImage && (
          <>
            {/* Replace photo */}
            <button
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              style={{
                position: 'absolute', bottom: 38, left: 12,
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(30,39,73,0.7)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hovering ? 1 : 0, transition: 'opacity 0.2s',
              }}
            >
              <Upload size={11} style={{ color: 'white' }} />
            </button>
            {/* Share */}
            <button
              onClick={(e) => { e.stopPropagation(); onShare?.(slot, currentImage); }}
              style={{
                position: 'absolute', bottom: 38, right: 12,
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(30,39,73,0.7)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hovering ? 1 : 0, transition: 'opacity 0.2s',
              }}
            >
              <Share2 size={11} style={{ color: 'white' }} />
            </button>
          </>
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
