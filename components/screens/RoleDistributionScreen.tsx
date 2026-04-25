"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { ROLE_DEFINITIONS } from "@/lib/roles";
import FullscreenModal from "@/components/FullscreenModal";
import { useState } from "react";
import { Eye, ChevronRight, CheckCircle } from "lucide-react";

const TEAM_LABELS: Record<string, { label: string; color: string }> = {
  Village:  { label: "Village Team", color: "#10b981" },
  Werewolf: { label: "Wolf Pack",    color: "#dc2626" },
  Neutral:  { label: "Neutral",      color: "#f59e0b" },
};

export default function RoleDistributionScreen() {
  const { players, revealRole, setPhase } = useGameStore();
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [autoHideTimer, setAutoHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [countdown, setCountdown] = useState(0);

  const revealed = players.filter((p) => p.isRevealed).length;
  const allRevealed = revealed === players.length;

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const role = activePlayer?.role ? ROLE_DEFINITIONS[activePlayer.role] : null;

  const handleTap = (id: string) => {
    const player = players.find((p) => p.id === id);
    if (!player || player.isRevealed) return;
    setActivePlayerId(id);

    let secs = 12;
    setCountdown(secs);
    const interval = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) clearInterval(interval);
    }, 1000);

    const timer = setTimeout(() => {
      handleDone(id);
      clearInterval(interval);
    }, 12000);
    setAutoHideTimer(timer);
  };

  const handleDone = (id?: string) => {
    const pid = id ?? activePlayerId;
    if (pid) revealRole(pid);
    setActivePlayerId(null);
    setCountdown(0);
    if (autoHideTimer) { clearTimeout(autoHideTimer); setAutoHideTimer(null); }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* ── Role reveal modal ── */}
      <FullscreenModal isOpen={activePlayerId !== null}>
        {role && activePlayer && (
          <div className="flex flex-col items-center text-center gap-6 px-6 py-8">
            {/* Glow orb */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
                style={{
                  background: `radial-gradient(circle, ${role.color}28, transparent)`,
                  boxShadow: `0 0 48px ${role.color}45, 0 0 96px ${role.color}18`,
                  border: `2px solid ${role.color}38`,
                }}
              >
                {role.icon}
              </div>
              <div
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{ border: `1px solid ${role.color}25`, transform: "scale(1.25)" }}
              />
            </motion.div>

            {/* Player name */}
            <motion.p
              className="text-xs font-semibold text-gray-400 tracking-widest uppercase"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {activePlayer.name}
            </motion.p>

            {/* Role name + team */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2
                className="text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: role.color,
                  textShadow: `0 0 32px ${role.color}55`,
                }}
              >
                {role.displayName}
              </h2>
              <span
                className="text-sm font-semibold px-4 py-1.5 rounded-full"
                style={{
                  background: `${TEAM_LABELS[role.team].color}18`,
                  color: TEAM_LABELS[role.team].color,
                  border: `1px solid ${TEAM_LABELS[role.team].color}38`,
                }}
              >
                {TEAM_LABELS[role.team].label}
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-sm text-gray-400 leading-relaxed"
              style={{ maxWidth: 300 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {role.description}
            </motion.p>

            {/* Countdown + button */}
            <motion.div
              className="w-full flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: role.color }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 12, ease: "linear" }}
                />
              </div>
              <p className="text-xs text-gray-600">Closes in {countdown}s</p>

              {/* ── Primary CTA — tall, full width ── */}
              <motion.button
                onClick={() => handleDone()}
                className="w-full font-bold text-base text-white rounded-2xl"
                style={{
                  padding: "18px 24px",
                  background: `linear-gradient(135deg, ${role.color}, ${role.color}99)`,
                  boxShadow: `0 6px 24px ${role.color}35`,
                  border: `1px solid ${role.color}50`,
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
              >
                I&apos;ve seen my role ✓
              </motion.button>
            </motion.div>
          </div>
        )}
      </FullscreenModal>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Role Distribution
          </h1>
          <p className="text-sm text-gray-500">Each player taps their name privately</p>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #dc2626, #991b1b)" }}
              animate={{ width: `${(revealed / players.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span
            className="text-sm font-bold flex-shrink-0"
            style={{
              color: revealed === players.length ? "#10b981" : "#f1f1f7",
              minWidth: 36,
              textAlign: "right",
            }}
          >
            {revealed}/{players.length}
          </span>
        </div>
      </div>

      {/* ── Scrollable player grid ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {players.map((player, i) => (
            <motion.button
              key={player.id}
              onClick={() => handleTap(player.id)}
              disabled={player.isRevealed}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: player.isRevealed ? 1 : 0.94 }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl transition-all"
              style={{
                padding: "20px 16px",
                minHeight: 120,
                background: player.isRevealed ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)",
                border: player.isRevealed
                  ? "1px solid rgba(16,185,129,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                cursor: player.isRevealed ? "default" : "pointer",
              }}
            >
              {player.isRevealed ? (
                <>
                  <CheckCircle size={26} className="text-green-400" />
                  <span className="text-sm font-semibold text-green-400 text-center leading-tight">
                    {player.name}
                  </span>
                  <span className="text-xs text-green-600 font-medium">Revealed</span>
                </>
              ) : (
                <>
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(220,38,38,0.13)",
                      border: "1px solid rgba(220,38,38,0.25)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 0px rgba(220,38,38,0)",
                        "0 0 16px rgba(220,38,38,0.3)",
                        "0 0 0px rgba(220,38,38,0)",
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Eye size={20} className="text-red-400" />
                  </motion.div>
                  <span className="text-sm font-semibold text-gray-300 text-center leading-tight">
                    {player.name}
                  </span>
                  <span className="text-xs text-gray-600">Tap to reveal</span>
                </>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            className="flex-shrink-0 px-5 py-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(10,10,15,0.96)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button
              onClick={() => setPhase("night")}
              className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white text-base"
              style={{
                padding: "18px 24px",
                background: "linear-gradient(135deg, #312e81, #1e1b4b)",
                border: "1px solid rgba(129,140,248,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              animate={{
                boxShadow: [
                  "0 0 0px rgba(129,140,248,0)",
                  "0 0 28px rgba(129,140,248,0.35)",
                  "0 0 0px rgba(129,140,248,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌙 Begin Night Phase
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
