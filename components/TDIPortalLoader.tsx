'use client';

import { useEffect, useRef, useState } from 'react';

type PortalType = 'creators' | 'leadership' | 'hub';

interface TDIPortalLoaderProps {
  portal: PortalType;
  onComplete: () => void;
}

const PORTAL_BACKGROUNDS: Record<PortalType, string> = {
  creators: 'linear-gradient(135deg, #ffba06, #e5a800)',
  leadership: 'linear-gradient(135deg, #1e3a5f, #2c5a8f)',
  hub: 'linear-gradient(135deg, #2a9d8f, #1f7a6e)',
};

// The exact approved TDI symbol path - DO NOT MODIFY
const TDI_SYMBOL_PATH = `M 95 125
C 95 125 103 195 110 210
C 117 225 123 218 132 190
C 141 162 147 138 150 132
C 153 138 159 162 168 190
C 177 218 183 225 190 210
C 197 195 205 125 205 115
C 205 105 208 75 200 55
C 190 35 165 25 150 24
C 120 22 85 35 68 65
C 50 95 52 140 62 170
C 72 200 100 225 135 235
C 170 245 210 230 235 205
C 255 180 258 145 250 115
C 242 85 222 62 205 52`;

// Easing function: cubic ease-in-out
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Generate exit path points based on portal personality
function generateExitPath(
  portal: PortalType,
  startX: number,
  startY: number,
  endX: number,
  centerY: number,
  numPoints: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const x = startX + (endX - startX) * t;
    let y = startY;

    // Different exit personalities per portal
    if (portal === 'creators') {
      // Playful bouncing curves
      const bounce1 = Math.sin(t * Math.PI * 3) * 40 * (1 - t);
      const bounce2 = Math.sin(t * Math.PI * 5) * 20 * (1 - t);
      y = startY + (centerY - startY) * t * 0.3 + bounce1 + bounce2;
    } else if (portal === 'leadership') {
      // Clean confident arc
      const arc = Math.sin(t * Math.PI) * 60;
      y = startY + (centerY - startY) * t * 0.2 - arc;
    } else {
      // Gentle welcoming curve (hub)
      const wave = Math.sin(t * Math.PI) * 50;
      y = startY + (centerY - startY) * t * 0.2 + wave;
    }

    points.push({ x, y });
  }

  return points;
}

// Generate entry path points
function generateEntryPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  numPoints: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const x = startX + (endX - startX) * t;
    // Gentle S-curve entry
    const easedT = easeInOut(t);
    const y = startY + (endY - startY) * easedT;
    points.push({ x, y });
  }

  return points;
}

// MINIMUM time the loader must be visible (animation + fade + buffer)
const MINIMUM_MS = 4500;

export default function TDIPortalLoader({ portal, onComplete }: TDIPortalLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isFading, setIsFading] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const hasCompletedRef = useRef<boolean>(false);

  // Store onComplete in a ref so it doesn't cause useEffect to re-run
  // when the parent re-renders (which would reset the animation!)
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    const pathElement = pathRef.current;

    if (!canvas || !svg || !pathElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Get the path length and sample 500 points from the SVG path
    const pathLength = pathElement.getTotalLength();
    const symbolPointCount = 500;
    const symbolPoints: { x: number; y: number }[] = [];

    // Get bounding box of the path to calculate scale and offset
    const bbox = pathElement.getBBox();

    // Calculate scale to fit ~25% of viewport's smaller dimension
    const targetSize = Math.min(width, height) * 0.25;
    const scale = targetSize / Math.max(bbox.width, bbox.height);

    // Calculate center offset
    const centerX = width / 2;
    const centerY = height / 2;
    const offsetX = centerX - (bbox.x + bbox.width / 2) * scale;
    const offsetY = centerY - (bbox.y + bbox.height / 2) * scale;

    // Sample points from the SVG path
    for (let i = 0; i < symbolPointCount; i++) {
      const point = pathElement.getPointAtLength((i / (symbolPointCount - 1)) * pathLength);
      symbolPoints.push({
        x: point.x * scale + offsetX,
        y: point.y * scale + offsetY,
      });
    }

    // Get first and last points of symbol for entry/exit connection
    const symbolStart = symbolPoints[0];
    const symbolEnd = symbolPoints[symbolPoints.length - 1];

    // Generate entry path (from left edge to symbol start)
    const entryPointCount = 150;
    const entryPoints = generateEntryPath(
      -50, // Start off-screen left
      centerY,
      symbolStart.x,
      symbolStart.y,
      entryPointCount
    );

    // Generate exit path (from symbol end to right edge)
    const exitPointCount = 150;
    const exitPoints = generateExitPath(
      portal,
      symbolEnd.x,
      symbolEnd.y,
      width + 50, // End off-screen right
      centerY,
      exitPointCount
    );

    // Combine all points: entry + symbol + exit
    const allPoints = [...entryPoints, ...symbolPoints, ...exitPoints];
    const totalPoints = allPoints.length;

    // The snake length equals the symbol portion
    const snakeLength = symbolPointCount;

    // Animation duration in milliseconds (3.4 seconds total for animation)
    const animationDuration = 3400;

    // Animation phases
    const drawPhaseEnd = 0.65; // 0-65%: drawing
    const holdPhaseEnd = 0.75; // 65-75%: hold
    // 75-100%: exit

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / animationDuration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate head and tail positions based on animation phase
      let headIndex: number;
      let tailIndex: number;

      if (rawProgress <= drawPhaseEnd) {
        // Drawing phase: head moves through entry + symbol
        const phaseProgress = rawProgress / drawPhaseEnd;
        const easedProgress = easeInOut(phaseProgress);
        const drawEndIndex = entryPointCount + symbolPointCount;
        headIndex = Math.floor(easedProgress * drawEndIndex);
        tailIndex = Math.max(0, headIndex - snakeLength);
      } else if (rawProgress <= holdPhaseEnd) {
        // Hold phase: freeze in place
        headIndex = entryPointCount + symbolPointCount;
        tailIndex = entryPointCount;
      } else {
        // Exit phase: head moves through exit, tail follows
        const phaseProgress = (rawProgress - holdPhaseEnd) / (1 - holdPhaseEnd);
        const easedProgress = easeInOut(phaseProgress);
        const startHeadIndex = entryPointCount + symbolPointCount;
        const endHeadIndex = totalPoints - 1;
        headIndex = startHeadIndex + Math.floor(easedProgress * (endHeadIndex - startHeadIndex));
        tailIndex = Math.max(0, headIndex - snakeLength);
      }

      // Clamp indices
      headIndex = Math.min(headIndex, totalPoints - 1);
      tailIndex = Math.max(0, tailIndex);

      // Only draw if there are points to draw
      if (headIndex > tailIndex) {
        // Draw glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(allPoints[tailIndex].x, allPoints[tailIndex].y);

        for (let i = tailIndex + 1; i <= headIndex; i++) {
          const prev = allPoints[i - 1];
          const curr = allPoints[i];
          const next = allPoints[Math.min(i + 1, headIndex)];

          // Use quadratic curves for smoothness
          const cpx = curr.x;
          const cpy = curr.y;
          const endx = (curr.x + next.x) / 2;
          const endy = (curr.y + next.y) / 2;

          if (i === headIndex) {
            ctx.lineTo(curr.x, curr.y);
          } else {
            ctx.quadraticCurveTo(cpx, cpy, endx, endy);
          }
        }

        ctx.stroke();
        ctx.restore();

        // Draw main white line
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(allPoints[tailIndex].x, allPoints[tailIndex].y);

        for (let i = tailIndex + 1; i <= headIndex; i++) {
          const curr = allPoints[i];
          const next = allPoints[Math.min(i + 1, headIndex)];

          const cpx = curr.x;
          const cpy = curr.y;
          const endx = (curr.x + next.x) / 2;
          const endy = (curr.y + next.y) / 2;

          if (i === headIndex) {
            ctx.lineTo(curr.x, curr.y);
          } else {
            ctx.quadraticCurveTo(cpx, cpy, endx, endy);
          }
        }

        ctx.stroke();
        ctx.restore();
      }

      // Continue animation or trigger completion
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - trigger the completion handler
        handleAnimationEnd();
      }
    };

    // This function is called when the canvas animation loop finishes (rawProgress >= 1)
    function handleAnimationEnd() {
      if (hasCompletedRef.current) return; // prevent double-fire
      hasCompletedRef.current = true;

      const elapsed = Date.now() - mountTimeRef.current;
      const waitMore = Math.max(0, MINIMUM_MS - 500 - elapsed); // subtract fade duration

      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          // Use ref to avoid stale closure
          if (onCompleteRef.current) onCompleteRef.current();
        }, 600); // fade duration + buffer
      }, waitMore);
    }

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [portal]); // Note: onComplete removed - using ref instead to prevent animation reset

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: PORTAL_BACKGROUNDS[portal],
        transition: 'opacity 500ms ease-out',
        opacity: isFading ? 0 : 1,
      }}
    >
      {/* Hidden SVG for path sampling */}
      <svg
        ref={svgRef}
        width="0"
        height="0"
        style={{ position: 'absolute', visibility: 'hidden' }}
      >
        <path
          ref={pathRef}
          d={TDI_SYMBOL_PATH}
          fill="none"
          stroke="none"
        />
      </svg>

      {/* Canvas for animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ transform: 'rotate(-8deg)' }}
      />

      {/* Story text at bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center px-6">
        <p
          className="text-sm max-w-md mx-auto leading-relaxed"
          style={{ color: 'rgba(255, 255, 255, 0.35)' }}
        >
          The quick scribble a teacher leaves on student work. An h that says &ldquo;I see you&rdquo; wrapped in a circle that says &ldquo;I&rsquo;ve got you.&rdquo; One stroke. Never lifts.
        </p>
        <a
          href="/about#symbol"
          className="inline-block mt-3 text-sm underline decoration-1 underline-offset-2"
          style={{ color: 'rgba(255, 255, 255, 0.25)' }}
        >
          The story behind the symbol
        </a>
      </div>
    </div>
  );
}
