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
          noise3D(nx * 3.2 + mouseX * 0.25, z*1.8, time * speed) *
          0.5;

        const y =
          heightPx * (0.50 + z * 0.35) +
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
      time += 0.003; // global motion speed
      // try 0.0015 for calmer, 0.003 for more energy

      ctx.clearRect(0, 0, width, heightPx);

      // base warm wash
      const base = ctx.createLinearGradient(0, 0, width, heightPx);
      base.addColorStop(0, "#faf6f1");
      base.addColorStop(1, "#f2ebe3");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, heightPx);

      // layered warm fields
      // drawLayer("rgb(243, 214, 182)", 0.1, 0.8, 0.45); // sand
      // drawLayer("rgb(238, 197, 165)", 0.3, 0.6, 0.30); // peach
      // drawLayer("rgb(227, 173, 132)", 0.5, 0.4, 0.25); // amber
      // drawLayer("rgb(210, 160, 120)", 0.7, 0.3, 0.20); // deeper warmth

      // drawLayer("rgb(255, 236, 215)", 0.05, 0.9, 0.40); // warm ivory
      // drawLayer("rgb(245, 210, 170)", 0.30, 0.6, 0.32); // soft apricot
      // drawLayer("rgb(232, 185, 140)", 0.50, 0.45, 0.25); // honey
      // drawLayer("rgb(215, 165, 120)", 0.70, 0.3, 0.18); // sun-warm earth
      
      // drawLayer("rgb(185, 115, 135)", 0.65, 0.3, 0.22); // deep rose
      // drawLayer("rgb(210, 145, 165)", 0.45, 0.5, 0.26); // muted rose
      // drawLayer("rgb(235, 190, 205)", 0.25, 0.7, 0.32); // dusty blush
      // drawLayer("rgb(250, 225, 230)", 0.05, 0.9, 0.40); // soft blush mist

      drawLayer("rgb(135, 160, 140)", 0.65, 0.3, 0.22); // deep sage
      drawLayer("rgb(165, 190, 170)", 0.45, 0.5, 0.26); // muted moss
      drawLayer("rgb(205, 225, 210)", 0.25, 0.7, 0.32); // soft sage
      drawLayer("rgb(235, 245, 235)", 0.05, 0.9, 0.40); // pale mint haze

      // drawLayer("rgb(150, 170, 155)", 0.65, 0.3, 0.18);
      // drawLayer("rgb(180, 200, 185)", 0.45, 0.5, 0.22);
      // drawLayer("rgb(220, 235, 225)", 0.25, 0.7, 0.28);
      // drawLayer("rgb(235, 245, 235)", 0.05, 0.9, 0.40);




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
