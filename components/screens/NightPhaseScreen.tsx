"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { ROLE_DEFINITIONS, getNightRoles, type RoleName, type NightStepName } from "@/lib/roles";
import PlayerSelector from "@/components/PlayerSelector";
import FullscreenModal from "@/components/FullscreenModal";
import { useState, useEffect } from "react";
import { ChevronRight, SkipForward, Moon, Plus, Minus } from "lucide-react";
import type { NightAction } from "@/lib/gameStore";

type WitchChoice = "none" | "heal" | "poison";

export default function NightPhaseScreen() {
  const {
    players, roleConfigs, setNightAction, nightActions,
    setCurrentNightStep, currentNightStep, setPhase,
    witchHealUsed, witchPoisonUsed, round,
  } = useGameStore();

  const enabledRoles = roleConfigs.filter((rc) => rc.enabled).map((rc) => rc.role);
  const nightRoles = getNightRoles(enabledRoles).filter((step) => {
    if (step === "Cupid" && round > 1) return false;
    if (step === "WerewolfTeam") {
      return players.some(p => ["Werewolf", "AlphaWerewolf", "WolfSeer", "Minion"].includes(p.role!));
    }
    return players.some((p) => p.role === step);
  });

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [seerResult, setSeerResult] = useState<{ name: string; isEvil: boolean } | null>(null);
  const [witchChoice, setWitchChoice] = useState<WitchChoice>("none");
  const [witchPoisonTarget, setWitchPoisonTarget] = useState<string | null>(null);
  const [stepComplete, setStepComplete] = useState(false);
  const [showSeerResult, setShowSeerResult] = useState(false);
  const [visible, setVisible] = useState(true);

  // Werewolf Team States
  const [alphaOverrideId, setAlphaOverrideId] = useState<string | null>(null);
  const [alphaConvertId, setAlphaConvertId] = useState<string | null>(null);
  const [wolfSeerTargetId, setWolfSeerTargetId] = useState<string | null>(null);
  const [showWolfSeerResult, setShowWolfSeerResult] = useState(false);
  const [showWolfSeerModal, setShowWolfSeerModal] = useState(false);
  const [wolfSeerResult, setWolfSeerResult] = useState<{name: string; role: RoleName} | null>(null);

  const currentRole = nightRoles[currentNightStep];
  const isRoleAlive = currentRole === "WerewolfTeam" 
    ? players.some(p => p.isAlive && ["Werewolf", "AlphaWerewolf", "WolfSeer"].includes(p.role!))
    : players.some((p) => p.isAlive && p.role === currentRole);
  
  const totalSteps = nightRoles.length;
  const isLastStep = currentNightStep >= totalSteps - 1;
  const wwTarget = nightActions.find((a) => a.role === "WerewolfTeam")?.targetId ?? null;
  const wwTargetName = wwTarget ? players.find((p) => p.id === wwTarget)?.name : null;
  
  const wwTeamDef = {
    displayName: "Werewolf Team",
    color: "#dc2626",
    icon: "🐺",
    nightInstruction: "The pack awakens. Discuss and choose your victim.",
  };
  const roleDef = currentRole === "WerewolfTeam" ? wwTeamDef : (currentRole ? ROLE_DEFINITIONS[currentRole as RoleName] : null);

  const aliveWolvesCount = players.filter(p => p.isAlive && p.role && ["Werewolf", "AlphaWerewolf", "WolfSeer"].includes(p.role)).length;

  useEffect(() => {
    setSelectedTarget(null);
    setSelectedTargets([]);
    setSeerResult(null);
    setWitchChoice("none");
    setWitchPoisonTarget(null);
    setStepComplete(false);
    setShowSeerResult(false);
    setVisible(true);
    setAlphaOverrideId(null);
    setAlphaConvertId(null);
    setWolfSeerTargetId(null);
    setShowWolfSeerResult(false);
    setWolfSeerResult(null);
  }, [currentNightStep]);

  const handleSeerReveal = () => {
    if (!selectedTarget) return;
    const target = players.find((p) => p.id === selectedTarget);
    if (!target) return;
    const isEvil = ["Werewolf", "AlphaWerewolf", "WolfSeer", "SerialKiller"].includes(target.role!);
    setSeerResult({ name: target.name, isEvil });
    setShowSeerResult(true);
    
    if (isRoleAlive) {
      setNightAction({
        role: "Seer",
        actorId: players.find((p) => p.isAlive && p.role === "Seer")?.id ?? null,
        targetId: selectedTarget,
      });
    }
    setStepComplete(true);
  };

  const getFinalWwTarget = () => {
    if (alphaConvertId) return null;
    if (alphaOverrideId) return alphaOverrideId;
    return selectedTarget;
  };

  const handleConfirmStep = () => {
    if (!currentRole) return;

    if (isRoleAlive) {
      if (currentRole === "WerewolfTeam") {
         const action: NightAction = {
           role: "WerewolfTeam",
           actorId: null,
           targetId: getFinalWwTarget(),
           alphaConvertId: alphaConvertId,
           wolfSeerTargetId: wolfSeerTargetId,
         };
         setNightAction(action);
         if (alphaConvertId) {
            useGameStore.getState().setAlphaConvertsRemaining(useGameStore.getState().alphaConvertsRemaining - 1);
         }
      } else if (currentRole === "Witch") {
        if (witchChoice === "heal" && wwTarget) {
          setNightAction({ role: "WitchHeal", actorId: null, targetId: wwTarget });
          useGameStore.setState({ witchHealUsed: true });
        } else if (witchChoice === "poison" && witchPoisonTarget) {
          setNightAction({ role: "WitchPoison", actorId: null, targetId: witchPoisonTarget });
          useGameStore.setState({ witchPoisonUsed: true });
        }
      } else if (currentRole === "Cupid") {
        if (selectedTargets.length === 2) {
          const [a, b] = selectedTargets;
          useGameStore.setState((state) => ({
            players: state.players.map((p) =>
              p.id === a ? { ...p, loverId: b } : p.id === b ? { ...p, loverId: a } : p
            ),
          }));
        }
      } else if (currentRole !== "Seer") {
        if (selectedTarget) {
          const action: NightAction = {
            role: currentRole as NightAction["role"],
            actorId: players.find((p) => p.isAlive && p.role === currentRole)?.id ?? null,
            targetId: selectedTarget,
          };
          setNightAction(action);
        }
      }
    }
    
    advanceStep();
  };

  const advanceStep = () => {
    setVisible(false);
    setTimeout(() => {
      if (isLastStep) setPhase("day");
      else setCurrentNightStep(currentNightStep + 1);
    }, 250);
  };

  const canConfirm = (() => {
    if (!currentRole) return false;
    if (currentRole === "Seer") return stepComplete;
    if (currentRole === "Witch") return true;
    if (currentRole === "Cupid") return selectedTargets.length === 2;
    if (currentRole === "WerewolfTeam") return true;
    return selectedTarget !== null;
  })();

  if (totalSteps === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-5 gap-6">
        <div className="text-5xl">🌙</div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-cinzel)" }}>
            Silent Night
          </h2>
          <p className="text-sm text-gray-500">No roles have night actions this round.</p>
        </div>
        <motion.button
          onClick={() => setPhase("day")}
          className="w-full rounded-2xl font-bold text-white text-base"
          style={{ padding: "18px 24px", background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          whileTap={{ scale: 0.97 }}
        >
          Proceed to Day →
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-1 h-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060612 0%, #0a0a1a 100%)" }}
    >
      <div className="stars-bg" />

      <div className="relative z-10 flex-shrink-0" style={{ padding: "20px 20px 16px" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon size={17} className="text-indigo-400" />
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-cinzel)", color: "#818cf8" }}
            >
              Night Phase
            </h1>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {Math.min(currentNightStep + 1, totalSteps)}/{totalSteps}
          </span>
        </div>

        <div className="flex gap-1.5">
          {nightRoles.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentNightStep ? 20 : 6,
                height: 6,
                background:
                  i < currentNightStep ? "#374151"
                  : i === currentNightStep ? "#818cf8"
                  : "#1f2937",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto" style={{ padding: "0 20px 16px" }}>
        <AnimatePresence mode="wait">
          {visible && roleDef && (
            <motion.div
              key={currentNightStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              <div
                className="flex flex-col items-center gap-4 rounded-2xl text-center"
                style={{
                  padding: "24px 20px",
                  background: `linear-gradient(135deg, ${roleDef.color}12, rgba(16,16,26,0.95))`,
                  border: `1px solid ${roleDef.color}28`,
                }}
              >
                <motion.div
                  className="w-18 h-18 rounded-full flex items-center justify-center text-4xl"
                  style={{
                    width: 72,
                    height: 72,
                    background: `radial-gradient(circle, ${roleDef.color}22, transparent)`,
                    boxShadow: `0 0 28px ${roleDef.color}38`,
                    border: `2px solid ${roleDef.color}28`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 18px ${roleDef.color}28`,
                      `0 0 36px ${roleDef.color}48`,
                      `0 0 18px ${roleDef.color}28`,
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {roleDef.icon}
                </motion.div>

                <div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-cinzel)", color: roleDef.color }}
                  >
                    {roleDef.displayName}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-2">
                    {roleDef.nightInstruction}
                  </p>
                  {!isRoleAlive && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1" style={{ background: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)" }}>
                      <span>💀</span> Role is dead (Fake wake)
                    </div>
                  )}
                </div>
              </div>

              {currentRole === "Seer" && (
                <div className="flex flex-col gap-3">
                  <PlayerSelector
                    players={players}
                    selectedId={selectedTarget}
                    onSelect={setSelectedTarget}
                    label="Choose a player to divine"
                    excludeIds={[players.find((p) => p.isAlive && p.role === "Seer")?.id ?? ""]}
                  />
                  {!showSeerResult && (
                    <motion.button
                      onClick={handleSeerReveal}
                      disabled={!selectedTarget}
                      className="w-full rounded-2xl font-bold text-base"
                      style={{
                        padding: "16px 24px",
                        background: selectedTarget
                          ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                          : "rgba(255,255,255,0.07)",
                        color: selectedTarget ? "white" : "#4b5563",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Reveal Alignment
                    </motion.button>
                  )}
                  {showSeerResult && seerResult && (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-3 rounded-2xl text-center"
                      style={{
                        padding: "20px",
                        background: seerResult.isEvil ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)",
                        border: `1px solid ${seerResult.isEvil ? "rgba(220,38,38,0.3)" : "rgba(16,185,129,0.3)"}`,
                      }}
                    >
                      <div className="text-4xl">{seerResult.isEvil ? "👎" : "👍"}</div>
                      <div>
                        <p className="font-bold text-lg" style={{ color: seerResult.isEvil ? "#f87171" : "#34d399" }}>
                          {seerResult.name} is {seerResult.isEvil ? "Evil" : "Good"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {seerResult.isEvil ? "Aligned with evil forces." : "Aligned with the village."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {currentRole === "Witch" && (
                <div className="flex flex-col gap-3">
                  {wwTargetName ? (
                    <div
                      className="p-4 rounded-2xl text-center"
                      style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
                    >
                      <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">
                        Werewolf targeted
                      </p>
                      <p className="font-bold text-red-400 text-base">{wwTargetName}</p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-600 py-2">No werewolf attack tonight.</p>
                  )}

                  <div className="flex flex-col gap-2.5">
                    {wwTargetName && !witchHealUsed && (
                      <button
                        onClick={() => setWitchChoice(witchChoice === "heal" ? "none" : "heal")}
                        className="w-full rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                        style={{
                          padding: "16px 20px",
                          background: witchChoice === "heal" ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.05)",
                          border: witchChoice === "heal" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.09)",
                          color: witchChoice === "heal" ? "#34d399" : "#9ca3af",
                        }}
                      >
                        🧪 Use Heal Potion
                      </button>
                    )}
                    {!witchPoisonUsed && (
                      <button
                        onClick={() => setWitchChoice(witchChoice === "poison" ? "none" : "poison")}
                        className="w-full rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                        style={{
                          padding: "16px 20px",
                          background: witchChoice === "poison" ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.05)",
                          border: witchChoice === "poison" ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.09)",
                          color: witchChoice === "poison" ? "#a78bfa" : "#9ca3af",
                        }}
                      >
                        ☠️ Use Poison Potion
                      </button>
                    )}
                  </div>

                  {witchChoice === "poison" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <PlayerSelector
                        players={players}
                        selectedId={witchPoisonTarget}
                        onSelect={setWitchPoisonTarget}
                        label="Choose poison target"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {currentRole === "Cupid" && round === 1 && (
                <PlayerSelector
                  players={players}
                  selectedId={null}
                  onSelect={() => {}}
                  multiSelect
                  selectedIds={selectedTargets}
                  onMultiSelect={setSelectedTargets}
                  label="Select exactly 2 players to link as lovers"
                  maxSelect={2}
                />
              )}

              {currentRole === "WerewolfTeam" && (
                <div className="flex flex-col gap-4">
                  {players.some(p => p.role === "AlphaWerewolf" && p.isAlive) && (
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                       <h3 className="text-amber-500 font-bold mb-3 text-lg">👑 Alpha Decision</h3>
                       <div className="flex flex-col gap-2">
                          <button onClick={() => { setAlphaConvertId(null); setAlphaOverrideId(null); }} className={`w-full py-4 text-base font-bold rounded-xl transition-colors ${!alphaOverrideId && !alphaConvertId ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}>Follow Team</button>
                          {useGameStore.getState().settings.alphaOverrideVote && (
                            <button onClick={() => { setAlphaConvertId(null); setAlphaOverrideId(players.filter(p=>p.isAlive)[0].id); }} className={`w-full py-4 text-base font-bold rounded-xl transition-colors ${alphaOverrideId ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}>Override Kill</button>
                          )}
                          {useGameStore.getState().alphaConvertsRemaining > 0 && (
                            <button onClick={() => { setAlphaOverrideId(null); setAlphaConvertId(players.filter(p=>p.isAlive)[0].id); }} className={`w-full py-4 text-base font-bold rounded-xl transition-colors ${alphaConvertId ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}>Convert Target ({useGameStore.getState().alphaConvertsRemaining})</button>
                          )}
                       </div>
                       
                       {alphaOverrideId && (
                          <div className="mt-4"><PlayerSelector players={players} selectedId={alphaOverrideId} onSelect={setAlphaOverrideId} label="Alpha chooses kill target" /></div>
                       )}
                       {alphaConvertId && (
                          <div className="mt-4"><PlayerSelector players={players} selectedId={alphaConvertId} onSelect={setAlphaConvertId} label="Alpha chooses convert target" excludeIds={players.filter(p=>useGameStore.getState().settings.rolesImmuneToConvert.includes(p.role!)).map(p=>p.id)} /></div>
                       )}
                     </div>
                  )}

                  {players.some(p => p.role === "WolfSeer" && p.isAlive) && (
                     <div
                       className="flex flex-col gap-3 p-4 rounded-2xl"
                       style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}
                     >
                       <div className="flex items-center gap-2">
                         <span className="text-base">👁️</span>
                         <h3 className="text-sm font-bold" style={{ color: "#f87171" }}>Wolf Seer</h3>
                       </div>
                       <PlayerSelector 
                         players={players} 
                         selectedId={wolfSeerTargetId} 
                         onSelect={setWolfSeerTargetId} 
                         excludeIds={players.filter(p=>p.role==="WolfSeer").map(p=>p.id)} 
                         label="Select target to inspect"
                       />
                       <motion.button 
                         onClick={() => {
                          const target = players.find(p=>p.id===wolfSeerTargetId);
                          if(target && target.role) {
                             setWolfSeerResult({name: target.name, role: target.role});
                             setShowWolfSeerModal(true);
                          }
                         }} 
                         disabled={!wolfSeerTargetId} 
                         className="w-full rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                         style={{
                           padding: "14px 20px",
                           background: wolfSeerTargetId
                             ? "linear-gradient(135deg, #dc2626, #991b1b)"
                             : "rgba(255,255,255,0.07)",
                           color:  wolfSeerTargetId ? "white" : "#4b5563",
                           border: wolfSeerTargetId ? "1px solid rgba(220,38,38,0.35)" : "1px solid transparent",
                         }}
                         whileTap={{ scale: 0.97 }}
                       >
                         <span>👁️</span> Inspect Role
                       </motion.button>
                     </div>
                  )}

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <h3 className="text-red-400 font-bold mb-1">🐺 Kill Target</h3>
                     <p className="text-xs text-gray-400 mb-3">Select the pack's primary victim.</p>
                     <PlayerSelector 
                       players={players}
                       selectedId={selectedTarget}
                       onSelect={setSelectedTarget}
                       excludeIds={players.filter(p=>["Werewolf","AlphaWerewolf","WolfSeer","Minion"].includes(p.role!)).map(p=>p.id)}
                     />
                  </div>
                </div>
              )}

              {currentRole === "SerialKiller" && (
                <PlayerSelector
                  players={players}
                  selectedId={selectedTarget}
                  onSelect={setSelectedTarget}
                  label={`Choose Serial Killer's target`}
                  excludeIds={players.filter((p) => p.isAlive && p.role === "SerialKiller").map((p) => p.id)}
                />
              )}

              {currentRole === "Doctor" && (
                <PlayerSelector
                  players={players}
                  selectedId={selectedTarget}
                  onSelect={setSelectedTarget}
                  label="Choose a player to save"
                />
              )}

              {currentRole === "Bodyguard" && (
                <PlayerSelector
                  players={players}
                  selectedId={selectedTarget}
                  onSelect={setSelectedTarget}
                  label="Choose a player to protect"
                  excludeIds={[players.find((p) => p.isAlive && p.role === "Bodyguard")?.id ?? ""]}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="relative z-10 flex-shrink-0"
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(6,6,18,0.96)",
        }}
      >
        <div className="flex" style={{ gap: 12 }}>
          <motion.button
            onClick={advanceStep}
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

          <motion.button
            onClick={handleConfirmStep}
            disabled={!canConfirm}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-base"
            style={{
              padding: "16px 20px",
              background:
                canConfirm
                  ? `linear-gradient(135deg, ${roleDef?.color ?? "#4b5563"}, ${roleDef?.color ?? "#374151"}99)`
                  : "rgba(255,255,255,0.07)",
              color: canConfirm ? "white" : "#4b5563",
              border:
                canConfirm
                  ? `1px solid ${roleDef?.color ?? "#4b5563"}40`
                  : "1px solid transparent",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {isLastStep ? "End Night" : "Next Role"}
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>

      {/* Wolf Seer Inspect Result — centered modal, styled like role reveal */}
      <FullscreenModal
        isOpen={showWolfSeerModal}
        onClose={() => setShowWolfSeerModal(false)}
        showClose={false}
      >
        {wolfSeerResult && (() => {
          const roleDef = ROLE_DEFINITIONS[wolfSeerResult.role];
          const teamColors: Record<string, string> = {
            Village: "#10b981",
            Werewolf: "#dc2626",
            Neutral: "#f59e0b",
          };
          const teamColor = teamColors[roleDef.team] ?? "#6b7280";
          return (
            <div className="flex flex-col items-center text-center gap-6 px-6 py-10">

              {/* Glowing icon orb */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    fontSize: "64px",
                    background: `radial-gradient(circle, ${roleDef.color}30, transparent)`,
                    boxShadow: `0 0 56px ${roleDef.color}55, 0 0 112px ${roleDef.color}20`,
                    border: `2px solid ${roleDef.color}45`,
                  }}
                >
                  {roleDef.icon}
                </div>
                {/* Spinning ring */}
                <div
                  className="absolute inset-0 rounded-full animate-spin-slow"
                  style={{ border: `1px solid ${roleDef.color}30`, transform: "scale(1.3)" }}
                />
              </motion.div>

              {/* Player name label */}
              <motion.p
                className="text-sm font-semibold tracking-widest uppercase"
                style={{ color: "#6b7280" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {wolfSeerResult.name}
              </motion.p>

              {/* Role name + team badge */}
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
                    color: roleDef.color,
                    textShadow: `0 0 32px ${roleDef.color}60`,
                  }}
                >
                  {roleDef.displayName}
                </h2>
                <span
                  className="text-sm font-semibold px-4 py-1.5 rounded-full"
                  style={{
                    background: `${teamColor}18`,
                    color: teamColor,
                    border: `1px solid ${teamColor}38`,
                  }}
                >
                  {roleDef.team} Team
                </span>
              </motion.div>

              {/* Close CTA */}
              <motion.button
                onClick={() => setShowWolfSeerModal(false)}
                className="w-full font-bold text-base text-white rounded-2xl"
                style={{
                  padding: "18px 24px",
                  background: `linear-gradient(135deg, ${roleDef.color}, ${roleDef.color}99)`,
                  boxShadow: `0 6px 24px ${roleDef.color}40`,
                  border: `1px solid ${roleDef.color}55`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
              >
                Got it ✓
              </motion.button>
            </div>
          );
        })()}
      </FullscreenModal>
    </div>
  );
}
