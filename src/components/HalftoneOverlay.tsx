import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  radius: number;
}

const HalftoneOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const points: Point[] = [];
    const spacing = 25;
    const rows = Math.ceil(window.innerHeight / spacing);
    const cols = Math.ceil(window.innerWidth / spacing);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        points.push({
          x: x * spacing,
          y: y * spacing,
          radius: 1
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 118, 118, 0.15)';

      points.forEach(point => {
        const distanceFromCenter = Math.sqrt(
          Math.pow(point.x - canvas.width / 2, 2) +
          Math.pow(point.y - canvas.height / 2, 2)
        );

        const maxDistance = Math.sqrt(
          Math.pow(canvas.width / 2, 2) +
          Math.pow(canvas.height / 2, 2)
        );

        const normalizedDistance = distanceFromCenter / maxDistance;
        const time = Date.now() / 1000;
        const wave = Math.sin(time + normalizedDistance * 5) * 0.5 + 0.5;
        point.radius = Math.max(1.5, (1 - normalizedDistance) * 6 * wave);

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none opacity-70 mix-blend-multiply"
    />
  );
};

export default HalftoneOverlay;