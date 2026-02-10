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

export default function SymbolAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const scaleInfoRef = useRef<{ scale: number; offsetX: number; offsetY: number } | null>(null);

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
      const padding = 0.15; // 15% padding on each side
      const availableWidth = width * (1 - padding * 2);
      const availableHeight = height * (1 - padding * 2);
      const scale = Math.min(availableWidth / bbox.width, availableHeight / bbox.height);

      // Calculate center offset
      const centerX = width / 2;
      const centerY = height / 2;
      const offsetX = centerX - (bbox.x + bbox.width / 2) * scale;
      const offsetY = centerY - (bbox.y + bbox.height / 2) * scale;

      // Store scale info for line width calculation
      scaleInfoRef.current = { scale, offsetX, offsetY };

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

    // Animation duration in milliseconds (5 seconds per cycle)
    const animationDuration = 5000;

    // Animation phases
    const drawPhaseEnd = 0.60;   // 0-60%: drawing
    const holdPhaseEnd = 0.75;   // 60-75%: hold
    const fadePhaseEnd = 0.90;   // 75-90%: fade out
    // 90-100%: pause (blank canvas)

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

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // During pause phase (90-100%), don't draw anything
      if (rawProgress >= fadePhaseEnd) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate how much of the symbol to draw and opacity
      let drawProgress: number;
      let opacity = 1;

      if (rawProgress <= drawPhaseEnd) {
        // Drawing phase: progressively reveal the symbol
        const phaseProgress = rawProgress / drawPhaseEnd;
        drawProgress = easeInOut(phaseProgress);
      } else if (rawProgress <= holdPhaseEnd) {
        // Hold phase: full symbol visible
        drawProgress = 1;
      } else {
        // Fade phase: full symbol fading out
        drawProgress = 1;
        const fadeProgress = (rawProgress - holdPhaseEnd) / (fadePhaseEnd - holdPhaseEnd);
        opacity = 1 - easeInOut(fadeProgress);
      }

      const endIndex = Math.floor(drawProgress * (totalPoints - 1));

      if (endIndex < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate line width proportional to canvas size (3-4px at 200px wide)
      const baseLineWidth = (width / 200) * 3.5;

      // Draw subtle glow (behind main line)
      ctx.save();
      ctx.globalAlpha = opacity * 0.05;
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = baseLineWidth * 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i <= endIndex; i++) {
        const curr = points[i];
        const next = points[Math.min(i + 1, endIndex)];

        const cpx = curr.x;
        const cpy = curr.y;
        const endx = (curr.x + next.x) / 2;
        const endy = (curr.y + next.y) / 2;

        if (i === endIndex) {
          ctx.lineTo(curr.x, curr.y);
        } else {
          ctx.quadraticCurveTo(cpx, cpy, endx, endy);
        }
      }

      ctx.stroke();
      ctx.restore();

      // Draw main line
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = baseLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i <= endIndex; i++) {
        const curr = points[i];
        const next = points[Math.min(i + 1, endIndex)];

        const cpx = curr.x;
        const cpy = curr.y;
        const endx = (curr.x + next.x) / 2;
        const endy = (curr.y + next.y) / 2;

        if (i === endIndex) {
          ctx.lineTo(curr.x, curr.y);
        } else {
          ctx.quadraticCurveTo(cpx, cpy, endx, endy);
        }
      }

      ctx.stroke();
      ctx.restore();

      // Draw pen tip dot during draw-on phase only
      if (rawProgress <= drawPhaseEnd && endIndex > 0) {
        const tipPoint = points[endIndex];
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath();
        ctx.arc(tipPoint.x, tipPoint.y, baseLineWidth * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // IntersectionObserver for performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !animationRef.current) {
            startTimeRef.current = null; // Reset timing when becoming visible
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
      />
    </div>
  );
}
