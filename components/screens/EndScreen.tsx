"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { ROLE_DEFINITIONS } from "@/lib/roles";
import { getWinnerDetails } from "@/lib/nightResolution";
import { RefreshCw, Trophy } from "lucide-react";

const TEAM_COLORS: Record<string, string> = {
  Village: "#10b981",
  Werewolf: "#dc2626",
  Neutral: "#f59e0b",
};

export default function EndScreen() {
  const { players, winCondition, logs, resetGame, round } = useGameStore();
  const winner = winCondition ? getWinnerDetails(winCondition) : getWinnerDetails(null);

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* ── Winner hero ── */}
      <div
        className="relative flex-shrink-0 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ padding: "40px 20px", background: `radial-gradient(circle at center, ${winner.color}14 0%, transparent 68%)` }}
      >
        {/* Decorative rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full"
            style={{
              width: ring * 120,
              height: ring * 120,
              border: `1px solid ${winner.color}${Math.max(8, Math.floor(18 / ring)).toString(16)}`,
              pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: ring * 0.5 }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 14, delay: 0.2 }}
          className="text-6xl mb-4 relative z-10"
        >
          {winner.emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10"
        >
          <h1
            className="text-2xl font-black mb-2"
            style={{
              fontFamily: "var(--font-cinzel)",
              color: winner.color,
              textShadow: `0 0 36px ${winner.color}55`,
            }}
          >
            {winner.title}
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">{winner.subtitle}</p>
          <p className="text-xs text-gray-600 mt-2">Game lasted {round} round{round !== 1 ? "s" : ""}</p>
        </motion.div>
      </div>

      {/* ── Final standings ── */}
      <div style={{ padding: "0 20px 16px" }}>
        <motion.div
          className="flex items-center"
          style={{ gap: 8, marginBottom: 12 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Trophy size={13} className="text-gray-500" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Standings</h2>
        </motion.div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          {sortedPlayers.map((player, i) => {
            const role = player.role ? ROLE_DEFINITIONS[player.role] : null;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.06 }}
                className="flex items-center rounded-xl"
                style={{
                  gap: 12,
                  padding: "12px 16px",
                  background: player.isAlive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: player.isAlive ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(255,255,255,0.04)",
                  opacity: player.isAlive ? 1 : 0.55,
                }}
              >
                {/* Alive dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: player.isAlive ? "#10b981" : "#374151" }}
                />

                {/* Role icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: role ? `${role.color}14` : "rgba(255,255,255,0.04)" }}
                >
                  {role?.icon ?? "❓"}
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: player.isAlive ? "#f1f1f7" : "#6b7280" }}
                  >
                    {player.name}
                  </p>
                  {role && (
                    <p className="text-xs" style={{ color: TEAM_COLORS[role.team] }}>
                      {role.displayName}
                    </p>
                  )}
                </div>

                {/* Status */}
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: player.isAlive ? "rgba(16,185,129,0.14)" : "rgba(220,38,38,0.09)",
                    color: player.isAlive ? "#34d399" : "#9ca3af",
                  }}
                >
                  {player.isAlive ? "Survived" : "Eliminated"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Game log ── */}
      {logs.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
            Game Log
          </h2>
          <div
            className="rounded-xl"
            style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            {logs.map((log, i) => (
              <div key={i} className="text-xs text-gray-500 flex" style={{ gap: 8 }}>
                <span className="text-gray-700 flex-shrink-0 font-mono">R{log.round}</span>
                <span className="flex-1">{log.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Play again ── */}
      <div className="flex-shrink-0" style={{ padding: "8px 20px 40px" }}>
        <motion.button
          onClick={resetGame}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-semibold text-white text-sm"
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, #dc2626, #991b1b)",
            border: "1px solid rgba(220,38,38,0.3)",
            boxShadow: "0 0 28px rgba(220,38,38,0.18)",
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <RefreshCw size={15} />
          Play Again
        </motion.button>
      </div>
    </div>
  );
}
