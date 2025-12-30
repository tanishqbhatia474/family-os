import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export default function FluidBackground({ height = "85vh" }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const noise3D = createNoise3D();

    let width, heightPx, time = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      heightPx = window.innerHeight;
      canvas.width = width * DPR;
      canvas.height = heightPx * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener("mousemove", onMouseMove);

    const drawLayer = (color, z, speed, alpha) => {
      ctx.beginPath();

      for (let x = 0; x <= width; x += 6) {
        const nx = x / width;
        const noise =
          noise3D(nx * 3.2 + mouseX * 0.25, z * 1.8, time * speed) *
          0.5;

        const y =
          heightPx * (0.5 + z * 0.35) +
          noise * heightPx * 0.12;

        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, heightPx);
      ctx.lineTo(0, heightPx);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const render = () => {
      time += 0.003;
      ctx.clearRect(0, 0, width, heightPx);

      const isDark = document.documentElement.classList.contains("dark");

      /* ---------- BASE WASH ---------- */
      const base = ctx.createLinearGradient(0, 0, width, heightPx);

      if (isDark) {
        base.addColorStop(0, "#050807"); // near black
        base.addColorStop(1, "#0B1411"); // green-black
      } else {
        base.addColorStop(0, "#faf6f1");
        base.addColorStop(1, "#f2ebe3");
      }

      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, heightPx);

      /* ---------- LAYERED FIELDS ---------- */

      if (!isDark) {
        drawLayer("rgb(135, 160, 140)", 0.65, 0.3, 0.22);
        drawLayer("rgb(165, 190, 170)", 0.45, 0.5, 0.26);
        drawLayer("rgb(205, 225, 210)", 0.25, 0.7, 0.32);
        drawLayer("rgb(235, 245, 235)", 0.05, 0.9, 0.40);
      }

      /* ---------- DARK MODE LAYERS ---------- */
      else {
        drawLayer("rgb(22, 44, 38)", 0.65, 0.3, 0.18);   // deep black-green
        drawLayer("rgb(32, 66, 56)", 0.45, 0.5, 0.20);   // forest shadow
        drawLayer("rgb(50, 98, 84)", 0.25, 0.7, 0.18);   // muted jade
        drawLayer("rgb(90, 150, 132)", 0.05, 0.9, 0.14); // soft green glow
      }

      if (!prefersReducedMotion) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
