'use client';

import { useEffect, useRef } from 'react';

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

// Seeded random for consistent texture per point (no flickering)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Draw a single chalk point as a cluster of semi-transparent dots
function drawChalkPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lineWidth: number,
  color: string,
  pointIndex: number,
  globalOpacity: number
) {
  const numDots = 10;
  const scatter = lineWidth * 0.55;

  for (let i = 0; i < numDots; i++) {
    const seed = pointIndex * numDots + i;
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = seededRandom(seed + 1000) * scatter;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    const dotSize = 0.4 + seededRandom(seed + 2000) * 1.0;
    const dotOpacity = (0.2 + seededRandom(seed + 3000) * 0.5) * globalOpacity;

    ctx.beginPath();
    ctx.arc(x + dx, y + dy, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = dotOpacity;
    ctx.fill();
  }
}

// Draw chalk line along path points
function drawChalkLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  fromIndex: number,
  toIndex: number,
  lineWidth: number,
  color: string,
  globalOpacity: number
) {
  // First pass: main chalk texture at each point
  for (let i = fromIndex; i <= toIndex; i++) {
    drawChalkPoint(ctx, points[i].x, points[i].y, lineWidth, color, i, globalOpacity);
  }

  // Second pass: fewer, slightly larger dots for body/density
  for (let i = fromIndex; i <= toIndex; i += 2) {
    const numDots = 5;
    const scatter = lineWidth * 0.35;
    for (let j = 0; j < numDots; j++) {
      const seed = i * 100 + j + 50000;
      const angle = seededRandom(seed) * Math.PI * 2;
      const dist = seededRandom(seed + 1000) * scatter;

      ctx.beginPath();
      ctx.arc(
        points[i].x + Math.cos(angle) * dist,
        points[i].y + Math.sin(angle) * dist,
        0.6 + seededRandom(seed + 2000) * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = color;
      ctx.globalAlpha = (0.4 + seededRandom(seed + 3000) * 0.35) * globalOpacity;
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1.0;
}

// Draw textured pen tip (small cluster instead of clean circle)
function drawChalkTip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  globalOpacity: number
) {
  const numDots = 8;
  for (let i = 0; i < numDots; i++) {
    const seed = 99999 + i;
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = seededRandom(seed + 1000) * size * 0.5;

    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * dist,
      y + Math.sin(angle) * dist,
      0.5 + seededRandom(seed + 2000) * 0.8,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.globalAlpha = (0.5 + seededRandom(seed + 3000) * 0.4) * globalOpacity;
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

export default function SymbolAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const symbolCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    const pathElement = pathRef.current;
    const container = containerRef.current;

    if (!canvas || !svg || !pathElement || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas with device pixel ratio
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

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

      // Calculate scale to fit canvas with padding
      const padding = 0.15;
      const availableWidth = width * (1 - padding * 2);
      const availableHeight = height * (1 - padding * 2);
      const scale = Math.min(availableWidth / bbox.width, availableHeight / bbox.height);

      // Calculate center offset
      const centerX = width / 2;
      const centerY = height / 2;
      const offsetX = centerX - (bbox.x + bbox.width / 2) * scale;
      const offsetY = centerY - (bbox.y + bbox.height / 2) * scale;

      // Store symbol center for scale transforms
      symbolCenterRef.current = { x: centerX, y: centerY };

      // Sample points from the SVG path
      for (let i = 0; i < symbolPointCount; i++) {
        const point = pathElement.getPointAtLength((i / (symbolPointCount - 1)) * pathLength);
        symbolPoints.push({
          x: point.x * scale + offsetX,
          y: point.y * scale + offsetY,
        });
      }

      pointsRef.current = symbolPoints;

      return { width, height };
    };

    let canvasSize = setupCanvas();

    // Animation duration in milliseconds (6 seconds per cycle)
    const animationDuration = 6000;

    // Animation phases (total = 100%)
    const drawPhaseEnd = 0.50;    // 0-50%: draw on with lift
    const stampPhaseEnd = 0.58;   // 50-58%: stamp down
    const restPhaseEnd = 0.90;    // 58-90%: rest as static
    const fadePhaseEnd = 0.97;    // 90-97%: fade out
    // 97-100%: pause (blank canvas)

    const chalkColor = '#1e3a5f';

    const animate = (timestamp: number) => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = (elapsed % animationDuration) / animationDuration;

      const { width, height } = canvasSize;
      const points = pointsRef.current;
      const totalPoints = points.length;
      const center = symbolCenterRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // During pause phase (97-100%), don't draw anything
      if (rawProgress >= fadePhaseEnd) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate line width proportional to canvas size (slightly thicker for chalk)
      const baseLineWidth = (width / 200) * 4.5;

      // Calculate animation state based on phase
      let drawProgress = 1;
      let opacity = 1;
      let shadowOffsetY = 0;
      let shadowBlur = 0;
      let scaleFactor = 1;
      let showPenTip = false;

      if (rawProgress <= drawPhaseEnd) {
        // Phase 1: Draw on with lift effect
        const phaseProgress = rawProgress / drawPhaseEnd;
        drawProgress = easeInOut(phaseProgress);
        showPenTip = true;

        // Growing shadow and scale as it "lifts off the page"
        shadowOffsetY = phaseProgress * 6;
        shadowBlur = phaseProgress * 12;
        scaleFactor = 1 + phaseProgress * 0.03;

      } else if (rawProgress <= stampPhaseEnd) {
        // Phase 2: Stamp down
        const phaseProgress = (rawProgress - drawPhaseEnd) / (stampPhaseEnd - drawPhaseEnd);
        drawProgress = 1;

        // Quick snap down of shadow
        shadowOffsetY = 6 * (1 - phaseProgress);
        shadowBlur = 12 * (1 - phaseProgress);

        // Bounce effect: 1.03 -> 0.98 -> 1.0
        const bounce = 1.0 - 0.03 * Math.sin(phaseProgress * Math.PI) * (1 - phaseProgress * 0.5);
        scaleFactor = 1.03 * (1 - phaseProgress) + bounce * phaseProgress;

      } else if (rawProgress <= restPhaseEnd) {
        // Phase 3: Rest as static image
        drawProgress = 1;
        shadowOffsetY = 0;
        shadowBlur = 0;
        scaleFactor = 1;

      } else {
        // Phase 4: Fade out
        drawProgress = 1;
        const fadeProgress = (rawProgress - restPhaseEnd) / (fadePhaseEnd - restPhaseEnd);
        opacity = 1 - easeInOut(fadeProgress);
      }

      const endIndex = Math.floor(drawProgress * (totalPoints - 1));

      if (endIndex < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Apply scale transform centered on symbol
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.scale(scaleFactor, scaleFactor);
      ctx.translate(-center.x, -center.y);

      // Draw drop shadow for lift effect (subtle, under the chalk)
      if (shadowBlur > 0 || shadowOffsetY > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(30, 58, 95, 0.12)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.shadowOffsetX = 0;

        // Draw a faint version of the chalk for shadow
        drawChalkLine(ctx, points, 0, endIndex, baseLineWidth, chalkColor, opacity * 0.08);
        ctx.restore();
      }

      // Draw the main chalk line
      drawChalkLine(ctx, points, 0, endIndex, baseLineWidth, chalkColor, opacity);

      // Draw textured pen tip during draw-on phase only
      if (showPenTip && endIndex > 0) {
        const tipPoint = points[endIndex];
        drawChalkTip(ctx, tipPoint.x, tipPoint.y, baseLineWidth * 0.8, chalkColor, opacity);
      }

      // Restore from scale transform
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    // IntersectionObserver for performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !animationRef.current) {
            startTimeRef.current = null;
            animationRef.current = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    // Handle resize
    const handleResize = () => {
      canvasSize = setupCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
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
        className="w-full h-full"
        style={{ transform: 'rotate(-8deg)' }}
      />
    </div>
  );
}
