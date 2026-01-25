import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export default function FluidBackground() {
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
    let scrollY = 0;
    let targetScrollY = 0;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

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

    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      targetScrollProgress = maxScroll > 0 ? y / maxScroll : 0;
      targetScrollY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const lerp = (a, b, t) => a + (b - a) * t;

    const lerpColor = (c1, c2, t) => {
      const a = c1.match(/\d+/g).map(Number);
      const b = c2.match(/\d+/g).map(Number);
      return `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(
        lerp(a[1], b[1], t)
      )}, ${Math.round(lerp(a[2], b[2], t))})`;
    };

    const drawLayer = (from, to, z, speed, alpha, parallax = 1) => {
      ctx.beginPath();
      const mirror = Math.abs(scrollProgress - 0.5) * 2;
      const offset = scrollY * parallax * 0.25;

      for (let x = 0; x <= width; x += 6) {
        const nx = x / width;
        const noise =
          noise3D(nx * 2.4+ z * 10, z * 1.5, time * speed) * heightPx * 0.07;

        const y =
          heightPx * (0.55 + z * 0.25) + noise - offset;

        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, heightPx);
      ctx.lineTo(0, heightPx);
      ctx.closePath();

      ctx.fillStyle = lerpColor(from, to, mirror);
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const render = () => {
      time += 0.003;
      scrollProgress = lerp(scrollProgress, targetScrollProgress, 0.08);
      scrollY = lerp(scrollY, targetScrollY, 0.08);

      ctx.clearRect(0, 0, width, heightPx);

      const isDark = document.documentElement.classList.contains("dark");
      const mirror = Math.abs(scrollProgress - 0.5) * 2;

      /* ---------- BASE ---------- */
      const base = ctx.createLinearGradient(0, 0, 0, heightPx);

      if (!isDark) {
        base.addColorStop(
          0,
          lerpColor("rgb(252, 245, 235)", "rgb(245, 238, 226)", mirror)
        );
        base.addColorStop(
          1,
          lerpColor("rgb(245, 238, 226)", "rgb(252, 245, 235)", mirror)
        );
      } else {
        base.addColorStop(
          0,
          lerpColor("rgb(10, 14, 12)", "rgb(18, 24, 20)", mirror)
        );
        base.addColorStop(
          1,
          lerpColor("rgb(18, 24, 20)", "rgb(10, 14, 12)", mirror)
        );
      }

      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, heightPx);

      /* ---------- LIGHT MODE LAYERS (VISIBLE GREEN) ---------- */
      if (!isDark) {
        drawLayer(
          "rgb(110, 145, 125)", // deep sage
          "rgb(150, 175, 155)",
          0.6, 0.3, 0.18, 0.4
        );
        drawLayer(
          "rgb(140, 170, 150)",
          "rgb(180, 205, 185)",
          0.35, 0.5, 0.22, 0.6
        );
        drawLayer(
          "rgb(190, 215, 200)",
          "rgb(220, 235, 225)",
          0.1, 0.7, 0.26, 0.8
        );
      }

      /* ---------- DARK MODE LAYERS (CLEAR GREEN-BLACK) ---------- */
      else {
        drawLayer(
          "rgb(8, 20, 16)",   // green-black
          "rgb(20, 45, 36)",  // emerald core
          0.6, 0.3, 0.18, 0.4
        );
        drawLayer(
          "rgb(14, 35, 28)",
          "rgb(35, 70, 58)",
          0.35, 0.5, 0.22, 0.6
        );
        drawLayer(
          "rgb(30, 65, 54)",
          "rgb(70, 120, 100)",
          0.1, 0.7, 0.20, 0.8
        );
      }

      if (!prefersReducedMotion) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
