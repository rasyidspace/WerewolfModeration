"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { RefreshCw, Moon, Sun, Vote, Star, Settings } from "lucide-react";

type Phase = "setup" | "player-input" | "role-distribution" | "night" | "day" | "voting" | "end";

const PHASE_CONFIG: Record<Phase, { label: string; icon: React.ReactNode; color: string }> = {
  setup:               { label: "Setup",   icon: <Settings size={13} />, color: "#6b7280" },
  "player-input":      { label: "Players", icon: <Star size={13} />,    color: "#9ca3af" },
  "role-distribution": { label: "Roles",   icon: <Star size={13} />,    color: "#f59e0b" },
  night:               { label: "Night",   icon: <Moon size={13} />,    color: "#818cf8" },
  day:                 { label: "Day",     icon: <Sun size={13} />,     color: "#fbbf24" },
  voting:              { label: "Voting",  icon: <Vote size={13} />,    color: "#34d399" },
  end:                 { label: "End",     icon: <Star size={13} />,    color: "#f87171" },
};

const PHASE_ORDER: Phase[] = ["setup", "player-input", "role-distribution", "night", "day", "voting", "end"];

export default function PhaseIndicator() {
  const { phase, round, resetGame } = useGameStore();
  const cfg = PHASE_CONFIG[phase];

  return (
    <motion.header
      className="relative z-40 flex-shrink-0 w-full"
      style={{
        height: "56px",
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Inner row */}
      <div className="h-full w-full flex items-center justify-between" style={{ padding: "0 20px" }}>

        {/* Phase badge */}
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: `${cfg.color}18`,
            color: cfg.color,
            border: `1px solid ${cfg.color}38`,
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
          key={phase}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {cfg.icon}
          <span>{cfg.label}</span>
          {(phase === "night" || phase === "day" || phase === "voting") && (
            <span style={{ opacity: 0.6, fontSize: "11px" }}>· R{round}</span>
          )}
        </motion.div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 flex-1 justify-center px-2">
          {PHASE_ORDER.slice(0, 6).map((p) => {
            const idx = PHASE_ORDER.indexOf(phase);
            const isActive = p === phase;
            const isPast = PHASE_ORDER.indexOf(p) < idx;
            return (
              <div
                key={p}
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 18 : 5,
                  height: 5,
                  background: isActive ? cfg.color : isPast ? "#4b5563" : "#1f2937",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm("Reset the game? All progress will be lost.")) resetGame();
          }}
          className="flex items-center gap-1.5 rounded-lg transition-colors"
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            color: "#6b7280",
            background: "transparent",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "transparent"; }}
        >
          <RefreshCw size={13} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </motion.header>
  );
}
