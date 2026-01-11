'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Check if touch device
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      return hasTouch && hasCoarsePointer;
    };

    setIsTouchDevice(checkTouchDevice());

    if (checkTouchDevice()) return;

    // Add cursor-none class to body
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Position cursor with hotspot at arrow tip (top-left)
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Arrow Cursor */}
      <div
        ref={cursorRef}
        style={{
          opacity: isVisible ? 1 : 0,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 0.15s ease',
        }}
      >
        {/* SVG Arrow with double outline and drop shadow for depth */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3))' }}
        >
          {/* Outer black stroke for visibility on light backgrounds */}
          <path
            d="M3 3L27 15L15 15L11 27L3 3Z"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner white stroke for visibility on dark backgrounds */}
          <path
            d="M3 3L27 15L15 15L11 27L3 3Z"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Periwinkle blue fill with gradient for subtle 3D effect */}
          <defs>
            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ab8f2" />
              <stop offset="100%" stopColor="#6b91d9" />
            </linearGradient>
          </defs>
          <path
            d="M3 3L27 15L15 15L11 27L3 3Z"
            fill="url(#arrowGradient)"
          />
        </svg>
      </div>

      {/* Global styles for cursor hiding */}
      <style jsx global>{`
        .custom-cursor-active,
        .custom-cursor-active * {
          cursor: none !important;
        }

        @media (scripting: none) {
          .custom-cursor-active,
          .custom-cursor-active * {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
}
