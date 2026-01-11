'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // Default to true to prevent flash

  // Mouse position tracking
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check if touch device
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      return hasTouch && hasCoarsePointer;
    };

    setIsTouchDevice(checkTouchDevice());

    // Don't run cursor logic on touch devices
    if (checkTouchDevice()) return;

    // Add cursor-none class to body
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Update dot position immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Show cursor when mouse moves
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check for clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        !!target.closest('a') ||
        !!target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('hover-card') ||
        target.classList.contains('hover-glow') ||
        target.classList.contains('hover-lift') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(isClickable);
    };

    // Animate ring with delay
    let animationFrameId: number;
    const animateRing = () => {
      const ease = 0.15; // Smoothing factor

      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }

      animationFrameId = requestAnimationFrame(animateRing);
    };

    // Start animation loop
    animationFrameId = requestAnimationFrame(animateRing);

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  // Don't render on touch devices
  if (isTouchDevice) return null;

  return (
    <>
      {/* Cursor Dot */}
      <div
        ref={dotRef}
        className={`cursor-dot ${isHovering ? 'hovering' : ''}`}
        style={{
          opacity: isVisible ? 1 : 0,
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '12px' : '8px',
          height: isHovering ? '12px' : '8px',
          backgroundColor: '#abc4ab',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          marginLeft: isHovering ? '-6px' : '-4px',
          marginTop: isHovering ? '-6px' : '-4px',
          transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease, opacity 0.2s ease',
          mixBlendMode: 'difference',
        }}
      />

      {/* Cursor Ring */}
      <div
        ref={ringRef}
        className={`cursor-ring ${isHovering ? 'hovering' : ''}`}
        style={{
          opacity: isVisible ? 1 : 0,
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '48px' : '36px',
          height: isHovering ? '48px' : '36px',
          border: '2px solid rgba(171, 196, 171, 0.6)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          marginLeft: isHovering ? '-24px' : '-18px',
          marginTop: isHovering ? '-24px' : '-18px',
          transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease, opacity 0.2s ease, border-color 0.2s ease',
          mixBlendMode: 'difference',
        }}
      />

      {/* Global styles for cursor hiding */}
      <style jsx global>{`
        .custom-cursor-active,
        .custom-cursor-active * {
          cursor: none !important;
        }

        /* Fallback: show default cursor if JS fails */
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
