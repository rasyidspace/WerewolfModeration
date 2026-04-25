"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { resolveNight, checkWinCondition } from "@/lib/nightResolution";
import { ROLE_DEFINITIONS } from "@/lib/roles";
import PlayerSelector from "@/components/PlayerSelector";
import { useEffect, useState } from "react";
import { Sun, Skull, Shield, ChevronRight } from "lucide-react";

export default function DayPhaseScreen() {
  const {
    players, nightActions, nightResult, applyNightResult, setPhase,
    hunterActive, hunterId, hunterShoot, setWinCondition, addLog,
    round, witchHealUsed, witchPoisonUsed,
  } = useGameStore();

  const [resolved, setResolved] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hunterTarget, setHunterTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!resolved) {
      const result = resolveNight(players, nightActions, witchHealUsed, witchPoisonUsed);
      applyNightResult(result);
      setResolved(true);

      if (result.dead.length > 0) {
        const names = result.dead
          .map((id) => players.find((p) => p.id === id)?.name)
          .filter(Boolean)
          .join(", ");
        addLog(`Night ${round}: ${names} died.`);
      } else {
        addLog(`Night ${round}: No deaths.`);
      }

      setTimeout(() => setShowResults(true), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceedToVoting = () => {
    const updatedPlayers = useGameStore.getState().players;
    const win = checkWinCondition(updatedPlayers);
    if (win) { setWinCondition(win); setPhase("end"); }
    else setPhase("voting");
  };

  const handleHunterShoot = () => {
    if (!hunterTarget) return;
    hunterShoot(hunterTarget);
    addLog(`Hunter shot ${players.find((p) => p.id === hunterTarget)?.name}.`);
    const updatedPlayers = useGameStore.getState().players;
    const win = checkWinCondition(updatedPlayers);
    if (win) { setWinCondition(win); setPhase("end"); }
    else setPhase("voting");
  };

  const dead = nightResult?.dead ?? [];
  const saved = nightResult?.saved ?? [];
  const bgDied = nightResult?.bodyguardDied ?? false;
  const loversTriggered = nightResult?.loversTriggered ?? false;

  const deadPlayers = players.filter((p) => dead.includes(p.id));
  const savedPlayers = players.filter((p) => saved.includes(p.id));

  return (
    <div
      className="flex flex-col flex-1"
      style={{ background: "linear-gradient(180deg, #0f0e04 0%, #0a0a0a 100%)" }}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 text-center" style={{ padding: "20px 20px 16px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <Sun size={20} className="text-amber-400" />
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fbbf24" }}
            >
              Dawn Breaks
            </h1>
          </div>
          <p className="text-sm text-gray-500">Round {round} — Night Results</p>
        </motion.div>
      </div>

      {/* ── Scrollable results ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "0 20px 16px" }}>
        <AnimatePresence>
          {showResults && (
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Peaceful night */}
              {dead.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 rounded-2xl text-center"
                  style={{
                    padding: "28px 20px",
                    background: "rgba(16,185,129,0.07)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <div className="text-5xl">🌅</div>
                  <div>
                    <h3 className="font-bold text-green-400 text-base mb-1">A peaceful night!</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      No one died. The village is safe… for now.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Dead players */}
              {deadPlayers.map((player, i) => {
                const role = player.role ? ROLE_DEFINITIONS[player.role] : null;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-center gap-4 rounded-2xl"
                    style={{
                    padding: "14px 20px",
                      background: "rgba(220,38,38,0.09)",
                      border: "1px solid rgba(220,38,38,0.22)",
                    }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(220,38,38,0.18)" }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.8, delay: i * 0.12 + 0.2 }}
                    >
                      <Skull size={20} className="text-red-400" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-red-300 text-sm truncate">{player.name}</p>
                      {role && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {role.icon} was the {role.displayName}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs font-semibold flex-shrink-0 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(220,38,38,0.15)", color: "#f87171" }}
                    >
                      Eliminated
                    </span>
                  </motion.div>
                );
              })}

              {/* Saved players */}
              {savedPlayers.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dead.length * 0.12 + i * 0.08 }}
                  className="flex items-center gap-4 rounded-2xl"
                  style={{
                    padding: "14px 20px",
                    background: "rgba(16,185,129,0.07)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)" }}
                  >
                    <Shield size={20} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-green-300 text-sm truncate">{player.name}</p>
                    <p className="text-xs text-green-600 mt-0.5">Targeted — but saved!</p>
                  </div>
                  <span
                    className="text-xs font-semibold flex-shrink-0 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}
                  >
                    Saved
                  </span>
                </motion.div>
              ))}

              {/* Special events */}
              {bgDied && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center rounded-2xl"
                  style={{ gap: 12, padding: "14px 20px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)" }}
                >
                  <span className="text-2xl flex-shrink-0">🛡️</span>
                  <p className="text-cyan-400 text-sm font-semibold leading-snug">
                    The Bodyguard sacrificed themselves to save their target!
                  </p>
                </motion.div>
              )}

              {loversTriggered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center rounded-2xl"
                  style={{ gap: 12, padding: "14px 20px", background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.2)" }}
                >
                  <span className="text-2xl flex-shrink-0">💔</span>
                  <p className="text-pink-400 text-sm font-semibold leading-snug">
                    A lover has died of heartbreak…
                  </p>
                </motion.div>
              )}

              {/* ── Moderator guidance — bigger, more prominent ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(245,158,11,0.25)" }}
              >
                {/* Header strip */}
                <div
                  className="flex items-center"
                  style={{ gap: 10, padding: "12px 20px", background: "rgba(245,158,11,0.14)" }}
                >
                  <span className="text-lg">📢</span>
                  <span className="text-sm font-bold text-amber-400">Moderator — Announce</span>
                </div>
                {/* Body */}
                <div
                  style={{ padding: "16px 20px", background: "rgba(245,158,11,0.06)" }}
                >
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {dead.length > 0
                      ? `"${deadPlayers.map((p) => p.name).join(" and ")} ${dead.length === 1 ? "has" : "have"} been eliminated last night." Players may now discuss and decide who to vote out.`
                      : `"No one died last night. It was a peaceful night." Players may now discuss who among them is the werewolf.`}
                  </p>
                </div>
              </motion.div>

              {/* Hunter section */}
              {hunterActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: 10, padding: "12px 20px", background: "rgba(245,158,11,0.14)" }}
                  >
                    <span className="text-lg">🏹</span>
                    <span className="text-sm font-bold text-amber-400">Hunter&apos;s Last Shot</span>
                  </div>
                  <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, background: "rgba(245,158,11,0.06)" }}>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The Hunter was eliminated. Before they go, they get to take one player with them.
                    </p>
                    <PlayerSelector
                      players={players}
                      selectedId={hunterTarget}
                      onSelect={setHunterTarget}
                      excludeIds={[hunterId ?? ""]}
                      label="Hunter picks their final target"
                    />
                    <motion.button
                      onClick={handleHunterShoot}
                      disabled={!hunterTarget}
                      className="w-full rounded-2xl font-bold text-base"
                      style={{
                        padding: "16px 24px",
                        background: hunterTarget
                          ? "linear-gradient(135deg, #f59e0b, #d97706)"
                          : "rgba(255,255,255,0.07)",
                        color: hunterTarget ? "white" : "#4b5563",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Fire! 🏹
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky CTA ── */}
      {!hunterActive && (
        <AnimatePresence>
          {showResults && (
            <motion.div
              className="flex-shrink-0"
              style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(10,10,5,0.96)",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
            >
              <motion.button
                onClick={handleProceedToVoting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white text-base"
                style={{
                  padding: "18px 24px",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  border: "1px solid rgba(16,185,129,0.35)",
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
              >
                Begin Voting
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
