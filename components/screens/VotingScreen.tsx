"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { checkWinCondition } from "@/lib/nightResolution";
import { ROLE_DEFINITIONS } from "@/lib/roles";
import { useState } from "react";
import { Vote, Plus, Minus, SkipForward, AlertTriangle } from "lucide-react";
import PlayerSelector from "@/components/PlayerSelector";
import FullscreenModal from "@/components/FullscreenModal";

export default function VotingScreen() {
  const {
    players, addVote, resetVotes, eliminatePlayer,
    setPhase, setWinCondition, nextRound, addLog,
    settings, jesterId, round, hunterShoot
  } = useGameStore();

  const [confirmed, setConfirmed] = useState(false);
  const [eliminatedId, setEliminatedId] = useState<string | null>(null);
  const [showHunterModal, setShowHunterModal] = useState(false);
  const [hunterTarget, setHunterTarget] = useState<string | null>(null);

  const alivePlayers = players.filter((p) => p.isAlive);
  const maxVotes = alivePlayers.length > 0 ? Math.max(...alivePlayers.map((p) => p.votes)) : 0;
  const leaders = alivePlayers.filter((p) => p.votes === maxVotes && p.votes > 0);
  const tie = leaders.length > 1;
  const totalVotes = alivePlayers.reduce((sum, p) => sum + p.votes, 0);

  const handleEliminate = () => {
    if (tie && settings.tieBreaker === "no-elimination") return;
    const target = leaders[0];
    if (!target) return;

    const isJester = target.id === jesterId;
    eliminatePlayer(target.id, true);
    setEliminatedId(target.id);
    setConfirmed(true);
    addLog(`Day ${round}: ${target.name} was voted out.`);

    setTimeout(() => {
      const state = useGameStore.getState();
      const win = checkWinCondition(state.players, isJester, jesterId);
      if (win) { 
        setWinCondition(win); 
        setPhase("end"); 
      } else if (state.hunterActive) {
        setShowHunterModal(true);
      } else { 
        nextRound(); 
        setPhase("night"); 
      }
    }, 2200);
  };

  const handleHunterShoot = () => {
    if (!hunterTarget) return;
    hunterShoot(hunterTarget);
    addLog(`Hunter shot ${players.find((p) => p.id === hunterTarget)?.name} after being voted out.`);
    
    const state = useGameStore.getState();
    const win = checkWinCondition(state.players, false, jesterId);
    if (win) { 
      setWinCondition(win); 
      setPhase("end"); 
    } else { 
      nextRound(); 
      setPhase("night"); 
    }
  };

  const handleSkip = () => {
    resetVotes();
    nextRound();
    setPhase("night");
  };

  const eliminatedPlayer = players.find((p) => p.id === eliminatedId);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0" style={{ padding: "20px 20px 16px" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2.5 mb-1">
            <Vote size={19} className="text-green-400" />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-cinzel)" }}>
              Voting
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Round {round} · {alivePlayers.length} alive · {totalVotes} votes
          </p>
        </motion.div>

        {/* Tie warning */}
        <AnimatePresence>
          {tie && totalVotes > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center overflow-hidden rounded-2xl"
              style={{ marginTop: 12, gap: 10, padding: "14px 20px", background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-300">
                Tie! {settings.tieBreaker === "no-elimination"
                  ? "No one will be eliminated."
                  : "Moderator decides who is eliminated."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable vote list ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "0 20px 16px" }}>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {alivePlayers
            .slice()
            .sort((a, b) => b.votes - a.votes)
            .map((player, i) => {
              const isLeader = player.votes === maxVotes && player.votes > 0;
              const barPct = maxVotes > 0 ? (player.votes / maxVotes) * 100 : 0;
              const isEliminated = confirmed && eliminatedId === player.id;

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isEliminated ? 0.4 : 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    padding: "14px 20px",
                    background: isLeader ? "rgba(220,38,38,0.09)" : "rgba(255,255,255,0.04)",
                    border: isLeader ? "1px solid rgba(220,38,38,0.28)" : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Vote bar background */}
                  {player.votes > 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        transformOrigin: "left",
                        background: isLeader ? "rgba(220,38,38,0.18)" : "rgba(55,65,81,0.28)",
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: barPct / 100 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}

                  <div className="relative flex items-center" style={{ gap: 12 }}>
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        background: isLeader ? "rgba(220,38,38,0.22)" : "rgba(255,255,255,0.07)",
                        color: isLeader ? "#f87171" : "#9ca3af",
                      }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: isLeader ? "#fca5a5" : "#e5e7eb" }}>
                        {player.name}
                      </p>
                      {isLeader && player.votes > 0 && (
                        <p className="text-xs text-red-500 font-medium mt-0.5">Most votes</p>
                      )}
                    </div>

                    {/* Vote count */}
                    <motion.span
                      key={player.votes}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold flex-shrink-0 w-8 text-center"
                      style={{ color: isLeader ? "#f87171" : "#9ca3af" }}
                    >
                      {player.votes}
                    </motion.span>

                    {/* +/- Controls — side by side */}
                    {!confirmed && (
                      <div className="flex items-center flex-shrink-0" style={{ gap: 6 }}>
                        <motion.button
                          onClick={() => addVote(player.id, -1)}
                          disabled={player.votes === 0}
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: "rgba(255,255,255,0.07)",
                            opacity: player.votes === 0 ? 0.35 : 1,
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Minus size={14} className="text-gray-400" />
                        </motion.button>
                        <motion.button
                          onClick={() => addVote(player.id, 1)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(220,38,38,0.18)" }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus size={14} className="text-red-400" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Elimination result */}
        <AnimatePresence>
          {confirmed && eliminatedId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 rounded-2xl text-center"
              style={{
                padding: "24px 20px",
                background: "rgba(220,38,38,0.09)",
                border: "1px solid rgba(220,38,38,0.28)",
              }}
            >
              <div className="text-4xl mb-3">⚖️</div>
              <p className="font-bold text-red-300">
                {eliminatedPlayer?.name} has been eliminated
              </p>
              <p className="text-sm text-gray-500 mt-1.5">
                {(() => {
                  const r = eliminatedPlayer?.role;
                  return r ? `${ROLE_DEFINITIONS[r].icon} ${ROLE_DEFINITIONS[r].displayName}` : "Unknown";
                })()}
              </p>
              <p className="text-xs text-gray-600 mt-3">Starting next round…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky footer ── */}
      {!confirmed && (
        <div
        className="flex-shrink-0"
          style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,15,0.96)" }}
        >
          <div className="flex" style={{ gap: 12 }}>
            {/* Skip — secondary */}
            <motion.button
              onClick={handleSkip}
              className="flex items-center justify-center gap-2 rounded-2xl font-semibold text-sm flex-shrink-0"
              style={{
                padding: "16px 20px",
                background: "rgba(255,255,255,0.06)",
                color: "#9ca3af",
                border: "1px solid rgba(255,255,255,0.09)",
                minWidth: 96,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <SkipForward size={15} />
              Skip
            </motion.button>

            {/* Eliminate — primary */}
            <motion.button
              onClick={handleEliminate}
              disabled={leaders.length === 0 || (tie && settings.tieBreaker === "no-elimination")}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-base"
              style={{
                padding: "16px 20px",
                background:
                  leaders.length > 0 && !(tie && settings.tieBreaker === "no-elimination")
                    ? "linear-gradient(135deg, #dc2626, #991b1b)"
                    : "rgba(255,255,255,0.07)",
                color:
                  leaders.length > 0 && !(tie && settings.tieBreaker === "no-elimination")
                    ? "white"
                    : "#4b5563",
                border:
                  leaders.length > 0 && !(tie && settings.tieBreaker === "no-elimination")
                    ? "1px solid rgba(220,38,38,0.4)"
                    : "1px solid transparent",
              }}
              whileTap={{ scale: 0.97 }}
            >
              ⚖️ Eliminate{leaders.length === 1 ? ` ${leaders[0].name}` : ""}
            </motion.button>
          </div>
        </div>
      )}

      {/* ── Hunter Modal ── */}
      <FullscreenModal isOpen={showHunterModal}>
        <div className="flex flex-col h-full bg-black/40">
          <div className="flex-shrink-0" style={{ padding: "20px 20px 16px" }}>
            <h1 className="text-xl font-bold text-amber-500 mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>Hunter&apos;s Last Shot</h1>
            <p className="text-sm text-gray-400">The Hunter was voted out! Before they go, they can take one player down with them.</p>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ padding: "0 20px 16px" }}>
             <PlayerSelector
                players={players}
                selectedId={hunterTarget}
                onSelect={setHunterTarget}
                excludeIds={[eliminatedId ?? ""]}
                label="Hunter picks their final target"
             />
          </div>
          <div className="flex-shrink-0" style={{ padding: "16px 20px", background: "rgba(10,10,15,0.96)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <motion.button
              onClick={handleHunterShoot}
              disabled={!hunterTarget}
              className="w-full rounded-2xl font-bold text-base"
              style={{
                padding: "16px 24px",
                background: hunterTarget ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.07)",
                color: hunterTarget ? "white" : "#4b5563",
              }}
              whileTap={{ scale: 0.97 }}
            >
              Fire! 🏹
            </motion.button>
          </div>
        </div>
      </FullscreenModal>
    </div>
  );
}
