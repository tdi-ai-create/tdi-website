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
          width: '28px',
          height: '28px',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 0.15s ease',
        }}
      >
        {/* SVG Arrow with double outline for visibility on all backgrounds */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          {/* Outer black stroke for visibility on light backgrounds */}
          <path
            d="M2 2L26 14L14 14L10 26L2 2Z"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner white stroke for visibility on dark backgrounds */}
          <path
            d="M2 2L26 14L14 14L10 26L2 2Z"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Periwinkle blue fill */}
          <path
            d="M2 2L26 14L14 14L10 26L2 2Z"
            fill="#80a4ed"
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
