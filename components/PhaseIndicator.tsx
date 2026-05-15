"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { ROLE_DEFINITIONS, type RoleName } from "@/lib/roles";
import { RefreshCw, Moon, Sun, Vote, Star, Settings, Users, X } from "lucide-react";
import { useState } from "react";

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
  const { phase, round, resetGame, players } = useGameStore();
  const cfg = PHASE_CONFIG[phase];
  const [showRoles, setShowRoles] = useState(false);

  // Only show the view-roles button when roles have been assigned
  const hasRoles = players.some((p) => p.role);

  return (
    <>
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

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* View Roles button — only shown when roles are assigned */}
            {hasRoles && (
              <button
                onClick={() => setShowRoles(true)}
                className="flex items-center gap-1.5 rounded-lg transition-colors"
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  color: "#818cf8",
                  background: "rgba(129,140,248,0.08)",
                  border: "1px solid rgba(129,140,248,0.18)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(129,140,248,0.16)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(129,140,248,0.08)"; }}
              >
                <Users size={13} />
                <span className="hidden sm:inline">Roles</span>
              </button>
            )}

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
        </div>
      </motion.header>

      {/* ── View Roles Popup ── */}
      <AnimatePresence>
        {showRoles && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoles(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed z-50 left-1/2 top-1/2"
              style={{
                translateX: "-50%",
                translateY: "-50%",
                width: "min(92vw, 400px)",
                maxHeight: "80vh",
                background: "linear-gradient(145deg, #0d0d1f, #111120)",
                border: "1px solid rgba(129,140,248,0.2)",
                borderRadius: "20px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(129,140,248,0.08)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between flex-shrink-0"
                style={{
                  padding: "16px 20px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-indigo-400" />
                  <h2
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
                  >
                    Player Roles
                  </h2>
                </div>
                <button
                  onClick={() => setShowRoles(false)}
                  className="flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    width: 30,
                    height: 30,
                    background: "rgba(255,255,255,0.06)",
                    color: "#9ca3af",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Legend */}
              <div
                className="flex items-center gap-3 flex-shrink-0"
                style={{ padding: "10px 20px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                  <span className="text-xs text-gray-500">Alive</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4b5563", display: "inline-block" }} />
                  <span className="text-xs text-gray-500">Dead</span>
                </div>
                <span className="text-xs text-gray-600 ml-auto">{players.filter(p => p.isAlive).length} / {players.length} alive</span>
              </div>

              {/* Player list */}
              <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px 16px" }}>
                <div className="flex flex-col gap-2">
                  {players.map((player, i) => {
                    const roleDef = player.role ? ROLE_DEFINITIONS[player.role as RoleName] : null;
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 rounded-xl"
                        style={{
                          padding: "10px 14px",
                          background: player.isAlive
                            ? `linear-gradient(135deg, ${roleDef?.color ?? "#6b7280"}10, rgba(255,255,255,0.03))`
                            : "rgba(255,255,255,0.02)",
                          border: player.isAlive
                            ? `1px solid ${roleDef?.color ?? "#6b7280"}22`
                            : "1px solid rgba(255,255,255,0.05)",
                          opacity: player.isAlive ? 1 : 0.5,
                        }}
                      >
                        {/* Status dot */}
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: player.isAlive ? "#34d399" : "#4b5563",
                            flexShrink: 0,
                            boxShadow: player.isAlive ? "0 0 6px #34d39966" : "none",
                          }}
                        />

                        {/* Role icon */}
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>
                          {roleDef?.icon ?? "❓"}
                        </span>

                        {/* Name + role */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm truncate"
                            style={{ color: player.isAlive ? "#f3f4f6" : "#6b7280" }}
                          >
                            {player.name}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: roleDef?.color ?? "#6b7280", opacity: player.isAlive ? 0.85 : 0.5 }}
                          >
                            {roleDef?.displayName ?? "Unknown"}
                          </p>
                        </div>

                        {/* Dead badge */}
                        {!player.isAlive && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(220,38,38,0.12)", color: "#f87171", border: "1px solid rgba(220,38,38,0.2)" }}
                          >
                            💀 Dead
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
