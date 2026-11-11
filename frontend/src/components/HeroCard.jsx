import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion/dist/framer-motion";

function Score({ to = 86 }) {
  const v = useMotionValue(0);
  const [scoreText, setScoreText] = useState(0);
  const dash = useTransform(v, (n) => 283 - (283 * n) / 100);

  useEffect(() => {
    const unsubscribe = v.onChange((latest) => {
      setScoreText(Math.round(latest));
    });
    const c = animate(v, to, { duration: 1.8, ease: "easeOut", delay: 0.5 });
    return () => {
      unsubscribe();
      if (c && c.stop) c.stop();
    };
  }, [to, v]);

  return (
    <div className="relative h-16 w-16 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#2a2a45"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="283"
          style={{ strokeDashoffset: dash }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
        <span>{scoreText}</span>&nbsp;pts
      </div>
    </div>
  );
}

function Float({ children, className, delay = 0, amp = 10 }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amp, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export default function HeroCard() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), {
    stiffness: 120,
    damping: 14,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 14,
  });
  const glowX = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["20%", "80%"]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      className="relative w-full max-w-md [perspective:1000px] select-none"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <Float className="absolute -top-6 right-0 z-20" delay={0.2}>
        <div className="rounded-xl border border-white/10 bg-[#0f0f1f]/90 px-4 py-2 text-sm font-semibold text-white backdrop-blur shadow-lg shadow-black/40">
          ✅ Score Automatisé (98.4%)
        </div>
      </Float>

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9 }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a33] to-[#0d0d1c] p-6 shadow-2xl shadow-violet-900/40"
      >
        <motion.div
          className="pointer-events-none absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl"
          style={{ left: glowX, top: glowY }}
        />

        <div className="flex items-center justify-between text-xs text-white">
          <span className="font-semibold">
            Dossier Candidat{" "}
            <span className="ml-1 rounded bg-white/10 px-2 py-0.5">
              #ABB-2026
            </span>
          </span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400 font-medium">
            ● Éligible & Validé
          </span>
        </div>

        <div
          style={{ transform: "translateZ(40px)" }}
          className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <Score to={86} />
          <div>
            <p className="text-sm font-bold tracking-wider text-white">
              ÉVALUATION AUTOMATISÉE
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mention Bien • Diplôme conforme • Bac 2021
            </p>
          </div>
        </div>

        {[
          ["Institution Cible", "Al Barid Bank"],
          ["Poste Sollicité", "Guichetier Chargé d'Opérations"],
          ["Reçu Horodaté", "Généré (PDF 6p)"],
        ].map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.15 }}
            style={{ transform: "translateZ(25px)" }}
            className="mt-3 flex justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <span className="text-slate-400">{k}</span>
            <span className="font-semibold text-white">{v}</span>
          </motion.div>
        ))}
      </motion.div>

      <Float className="absolute -bottom-5 -left-6 z-20" delay={1} amp={8}>
        <div className="rounded-xl border border-white/10 bg-[#0f0f1f]/90 px-4 py-2 text-sm font-semibold text-white backdrop-blur shadow-lg shadow-black/40">
          ⚡ Postulation en 1-Clic
        </div>
      </Float>
      <Float className="absolute -bottom-10 right-4 z-20" delay={1.8} amp={12}>
        <div className="rounded-xl border border-white/10 bg-[#0f0f1f]/90 px-4 py-2 text-sm font-semibold text-white backdrop-blur shadow-lg shadow-black/40">
          🛡️ Dossier Certifié CNDP
        </div>
      </Float>
    </div>
  );
}
