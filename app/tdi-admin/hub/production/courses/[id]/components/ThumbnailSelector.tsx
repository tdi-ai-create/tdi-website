'use client';

import { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon, Check } from 'lucide-react';

interface ThumbnailSelectorProps {
  videoId: string;
  currentThumbnail: string | null;
  onSelect: (url: string) => void;
}

const CF_SUBDOMAIN = 'customer-4n38x6badamh5yps';

export default function ThumbnailSelector({ videoId, currentThumbnail, onSelect }: ThumbnailSelectorProps) {
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(currentThumbnail);
  const [error, setError] = useState('');

  // Fetch video duration
  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDuration() {
      try {
        const res = await fetch(`/api/tdi-admin/videos/upload?uid=${videoId}`);
        if (!res.ok) throw new Error('Could not fetch video info');
        const data = await res.json();

        if (!cancelled) {
          if (data.duration) {
            setDuration(data.duration);
          } else {
            // Fallback: use a default duration for thumbnail generation
            setDuration(60);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load video info');
          setLoading(false);
        }
      }
    }

    fetchDuration();
    return () => { cancelled = true; };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Upload a video first to generate thumbnails</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
        <span className="text-sm text-gray-500">Loading thumbnails...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // Generate thumbnail URLs at 0s, 25%, 50%, 75%
  const timestamps = duration
    ? [0, Math.round(duration * 0.25), Math.round(duration * 0.5), Math.round(duration * 0.75)]
    : [0, 15, 30, 45];

  const thumbnails = timestamps.map((time) => ({
    time,
    url: `https://${CF_SUBDOMAIN}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg?time=${time}s`,
    label: `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`,
  }));

  const handleSelect = (url: string) => {
    setSelected(url);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Video Thumbnails</label>

      {/* Current thumbnail */}
      {currentThumbnail && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">Current thumbnail</p>
          <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentThumbnail}
              alt="Current thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </div>
      )}

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 gap-2">
        {thumbnails.map((thumb) => {
          const isSelected = selected === thumb.url;
          return (
            <button
              key={thumb.time}
              onClick={() => handleSelect(thumb.url)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                isSelected ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-video bg-gray-100">
                <img
                  src={thumb.url}
                  alt={`Thumbnail at ${thumb.label}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center h-full text-xs text-gray-400">Not available</div>';
                    }
                  }}
                />
              </div>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {thumb.label}
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 bg-teal-500 text-white rounded-full p-0.5">
                  <Check size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={!selected || selected === currentThumbnail}
        className="mt-3 w-full py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Use as course thumbnail
      </button>
    </div>
  );
}
