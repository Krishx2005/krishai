import { useEffect, useState, useCallback, useRef } from "react";
import confetti from "canvas-confetti";

const SEQUENCE = ["n", "i", "d", "h", "i"];
const DURATION = 5000;

export default function PartyMode() {
  const [active, setActive] = useState(false);
  const bufferRef = useRef([]);
  const timerRef = useRef(null);

  const launch = useCallback(() => {
    setActive(true);

    // --- green flash ---
    const flash = document.createElement("div");
    Object.assign(flash.style, {
      position: "fixed",
      inset: "0",
      background: "#0d6b38",
      zIndex: "99999",
      pointerEvents: "none",
      opacity: "0.6",
      transition: "opacity 0.5s ease-out",
    });
    document.body.appendChild(flash);
    requestAnimationFrame(() => (flash.style.opacity = "0"));
    setTimeout(() => flash.remove(), 600);

    // --- confetti burst ---
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 },
      colors: ["#0d6b38", "#2ecc71", "#f1c40f", "#ffffff"],
    });

    // --- fireworks ---
    const end = Date.now() + 3000;
    const fireworks = setInterval(() => {
      if (Date.now() > end) return clearInterval(fireworks);
      confetti({
        particleCount: 5,
        angle: 60 + Math.random() * 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: ["#0d6b38", "#2ecc71", "#f1c40f"],
      });
    }, 200);

    // --- soccer balls via confetti shapes ---
    const ballEnd = Date.now() + 3500;
    const balls = setInterval(() => {
      if (Date.now() > ballEnd) return clearInterval(balls);
      confetti({
        particleCount: 2,
        spread: 360,
        startVelocity: 30 + Math.random() * 20,
        gravity: 0.6,
        ticks: 300,
        origin: { x: Math.random(), y: -0.1 },
        shapes: ["circle"],
        colors: ["#000000", "#ffffff"],
        scalar: 2,
      });
    }, 150);

    // --- auto-dismiss ---
    timerRef.current = setTimeout(() => setActive(false), DURATION);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (active) return;
      const buf = bufferRef.current;
      buf.push(e.key.toLowerCase());
      if (buf.length > SEQUENCE.length) buf.shift();
      if (buf.length === SEQUENCE.length && buf.every((k, i) => k === SEQUENCE[i])) {
        buf.length = 0;
        launch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, launch]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
      style={{ perspective: "800px" }}
    >
      {/* floating hearts */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-2xl animate-float-heart"
          style={{
            left: `${5 + Math.random() * 90}%`,
            bottom: "-40px",
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
          }}
        >
          💚
        </span>
      ))}

      {/* soccer balls flying across */}
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={`ball-${i}`}
          className="absolute text-3xl animate-fly-ball"
          style={{
            top: `${10 + Math.random() * 70}%`,
            animationDelay: `${Math.random() * 2.5}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
          }}
        >
          ⚽
        </span>
      ))}

      {/* centered message */}
      <div className="animate-party-message text-center">
        <div className="text-5xl sm:text-7xl font-black text-white drop-shadow-[0_0_30px_rgba(46,204,113,0.8)] animate-glow-pulse">
          Hi Nidhi! 💚⚽
        </div>
      </div>
    </div>
  );
}
