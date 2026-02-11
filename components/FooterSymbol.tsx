'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

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

export default function FooterSymbol() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const symbolCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const pathname = usePathname();

  // Reset animation state on pathname change (for client-side navigation)
  useEffect(() => {
    hasAnimatedRef.current = false;
    isAnimatingRef.current = false;
    startTimeRef.current = null;

    // Clear canvas if it exists
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
  }, [pathname]);

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
      const padding = 0.1;
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
      canvasSizeRef.current = { width, height };

      return { width, height };
    };

    setupCanvas();

    // Animation duration in milliseconds (2.5 seconds)
    const animationDuration = 2500;

    // Animation phases
    const drawPhaseEnd = 0.70;    // 0-70%: draw on
    const stampPhaseEnd = 0.80;   // 70-80%: stamp effect
    // 80-100%: settle (static)

    const strokeColor = 'rgba(255, 255, 255, 0.12)';
    const glowColor = 'rgba(255, 255, 255, 0.03)';
    const tipColor = 'rgba(255, 255, 255, 0.2)';

    const drawFinalState = () => {
      const { width, height } = canvasSizeRef.current;
      const points = pointsRef.current;
      const center = symbolCenterRef.current;

      if (points.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      const baseLineWidth = (width / 200) * 3.5;

      // Apply rotation
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(-8 * Math.PI / 180);
      ctx.translate(-center.x, -center.y);

      // Draw glow
      ctx.save();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = baseLineWidth * 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const next = points[Math.min(i + 1, points.length - 1)];
        const cpx = curr.x;
        const cpy = curr.y;
        const endx = (curr.x + next.x) / 2;
        const endy = (curr.y + next.y) / 2;
        if (i === points.length - 1) {
          ctx.lineTo(curr.x, curr.y);
        } else {
          ctx.quadraticCurveTo(cpx, cpy, endx, endy);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Draw main line
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = baseLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const next = points[Math.min(i + 1, points.length - 1)];
        const cpx = curr.x;
        const cpy = curr.y;
        const endx = (curr.x + next.x) / 2;
        const endy = (curr.y + next.y) / 2;
        if (i === points.length - 1) {
          ctx.lineTo(curr.x, curr.y);
        } else {
          ctx.quadraticCurveTo(cpx, cpy, endx, endy);
        }
      }
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore from rotation
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / animationDuration, 1);

      const { width, height } = canvasSizeRef.current;
      const points = pointsRef.current;
      const totalPoints = points.length;
      const center = symbolCenterRef.current;

      if (totalPoints === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate line width proportional to canvas size
      const baseLineWidth = (width / 200) * 3.5;

      // Calculate animation state based on phase
      let drawProgress = 1;
      let shadowOffsetY = 0;
      let shadowBlur = 0;
      let scaleFactor = 1;
      let showPenTip = false;

      if (rawProgress <= drawPhaseEnd) {
        // Phase 1: Draw on
        const phaseProgress = rawProgress / drawPhaseEnd;
        drawProgress = easeInOut(phaseProgress);
        showPenTip = true;
      } else if (rawProgress <= stampPhaseEnd) {
        // Phase 2: Stamp effect
        const phaseProgress = (rawProgress - drawPhaseEnd) / (stampPhaseEnd - drawPhaseEnd);
        drawProgress = 1;

        // Shadow grows then snaps to zero
        const stampCurve = Math.sin(phaseProgress * Math.PI);
        shadowOffsetY = stampCurve * 4;
        shadowBlur = stampCurve * 8;
        scaleFactor = 1 + stampCurve * 0.02;
      } else {
        // Phase 3: Settle - static
        drawProgress = 1;
      }

      const endIndex = Math.floor(drawProgress * (totalPoints - 1));

      if (endIndex < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Helper function to draw the symbol path
      const drawSymbolPath = (toIndex: number) => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i <= toIndex; i++) {
          const curr = points[i];
          const next = points[Math.min(i + 1, toIndex)];

          const cpx = curr.x;
          const cpy = curr.y;
          const endx = (curr.x + next.x) / 2;
          const endy = (curr.y + next.y) / 2;

          if (i === toIndex) {
            ctx.lineTo(curr.x, curr.y);
          } else {
            ctx.quadraticCurveTo(cpx, cpy, endx, endy);
          }
        }
      };

      // Apply rotation and scale transform centered on symbol
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(-8 * Math.PI / 180); // 8 degrees counter-clockwise
      ctx.scale(scaleFactor, scaleFactor);
      ctx.translate(-center.x, -center.y);

      // Draw drop shadow for stamp effect
      if (shadowBlur > 0 || shadowOffsetY > 0) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = baseLineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.shadowOffsetX = 0;

        drawSymbolPath(endIndex);
        ctx.stroke();
        ctx.restore();
      }

      // Draw subtle glow behind main line
      ctx.save();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = baseLineWidth * 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      drawSymbolPath(endIndex);
      ctx.stroke();
      ctx.restore();

      // Draw main line
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = baseLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      drawSymbolPath(endIndex);
      ctx.stroke();
      ctx.restore();

      // Draw pen tip dot during draw-on phase only
      if (showPenTip && endIndex > 0) {
        const tipPoint = points[endIndex];
        ctx.save();
        ctx.fillStyle = tipColor;
        ctx.beginPath();
        ctx.arc(tipPoint.x, tipPoint.y, baseLineWidth * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Restore from transforms
      ctx.restore();

      // Continue animation or stop
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - draw final state and stop
        isAnimatingRef.current = false;
        hasAnimatedRef.current = true;
        animationRef.current = null;
        drawFinalState();
      }
    };

    const startAnimation = () => {
      if (isAnimatingRef.current || hasAnimatedRef.current) return;

      isAnimatingRef.current = true;
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    };

    // IntersectionObserver to detect when footer scrolls into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current && !isAnimatingRef.current) {
            startAnimation();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(container);

    // Handle resize
    const handleResize = () => {
      setupCanvas();
      // If animation already completed, redraw final state
      if (hasAnimatedRef.current && !isAnimatingRef.current) {
        drawFinalState();
      }
    };

    window.addEventListener('resize', handleResize);

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
