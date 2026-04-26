"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { ROLE_DEFINITIONS, ALL_ROLES, type RoleName } from "@/lib/roles";
import { useState } from "react";
import { Plus, Minus, AlertCircle, ChevronRight, Users, Settings2 } from "lucide-react";

const TEAM_COLORS: Record<string, string> = {
  Village: "#10b981",
  Werewolf: "#dc2626",
  Neutral: "#f59e0b",
};

export default function SetupScreen() {
  const { roleConfigs, setRoleConfig, players, setPhase, settings, updateSetting } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [popupRole, setPopupRole] = useState<RoleName | null>(null);

  const totalAssigned = roleConfigs.reduce(
    (sum, rc) => sum + (rc.enabled ? rc.count : 0),
    0
  );
  const totalPlayers = players.length;
  const mismatch = totalPlayers > 0 && totalAssigned !== totalPlayers;
  const canProceed = totalAssigned > 0;

  const handleToggle = (role: RoleName) => {
    const rc = roleConfigs.find((r) => r.role === role)!;
    setRoleConfig(role, rc.count, !rc.enabled);
  };
  const handleCount = (role: RoleName, delta: number) => {
    const rc = roleConfigs.find((r) => r.role === role)!;
    setRoleConfig(role, Math.max(1, rc.count + delta), rc.enabled);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-8">

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <h1
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Role Setup
          </h1>
          <p className="text-sm text-gray-500">Toggle and configure roles for this game</p>
        </motion.div>

        {/* Status strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center rounded-2xl mb-4"
          style={{
            gap: 16,
            padding: "16px 20px",
            background: mismatch ? "rgba(220,38,38,0.08)" : "rgba(255,255,255,0.04)",
            border: mismatch ? "1px solid rgba(220,38,38,0.25)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {mismatch ? (
            <AlertCircle size={16} style={{ color: "#f87171", flexShrink: 0 }} />
          ) : (
            <Users size={16} style={{ color: "#6b7280", flexShrink: 0 }} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: mismatch ? "#f87171" : "#e5e7eb" }}>
              {totalAssigned} roles assigned
              {totalPlayers > 0 && ` · ${totalPlayers} players`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: mismatch ? "#f87171" : "#6b7280" }}>
              {mismatch
                ? `Need ${totalPlayers}, have ${totalAssigned} — adjust counts`
                : totalPlayers > 0
                  ? "✓ Roles match player count"
                  : "Configure player count in the next step"}
            </p>
          </div>
          {mismatch && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: "rgba(220,38,38,0.18)", color: "#f87171" }}
            >
              {totalAssigned > totalPlayers ? `+${totalAssigned - totalPlayers}` : `-${totalPlayers - totalAssigned}`}
            </span>
          )}
        </motion.div>

        {/* Role list grid */}
        <div className="grid grid-cols-2 gap-3">
          {ALL_ROLES.map((roleName, i) => {
            const def = ROLE_DEFINITIONS[roleName];
            const config = roleConfigs.find((r) => r.role === roleName)!;
            const isEnabled = config.enabled;

            return (
              <motion.div
                key={roleName}
                onClick={() => setPopupRole(roleName)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="rounded-[20px] p-4 flex flex-col relative overflow-hidden cursor-pointer"
                style={{
                  background: isEnabled
                    ? `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`
                    : "rgba(18,18,24,0.5)",
                  border: isEnabled
                    ? `1px solid ${def.color}40`
                    : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: isEnabled ? `inset 0 0 20px ${def.color}08` : "none",
                  opacity: isEnabled ? 1 : 0.65,
                }}
              >
                {/* Top: Icon + Badge */}
                <div className="flex items-start justify-between mb-3">
                   <div className="text-3xl filter drop-shadow-md">{def.icon}</div>
                   <span
                     className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                     style={{
                       background: `${TEAM_COLORS[def.team]}20`,
                       color: TEAM_COLORS[def.team],
                     }}
                   >
                     {def.team}
                   </span>
                </div>

                {/* Middle: Name */}
                <h3 className="font-bold text-base leading-tight mb-5 flex-1 text-white">
                  {def.displayName}
                </h3>

                {/* Bottom: Controls */}
                <div className="flex items-center justify-between mt-auto">
                   {isEnabled ? (
                     <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                       <button
                         onClick={() => handleCount(roleName, -1)}
                         className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                       >
                         <Minus size={12} className="text-gray-400" />
                       </button>
                       <span className="w-5 text-center text-sm font-bold" style={{ color: def.color }}>
                         {config.count}
                       </span>
                       <button
                         onClick={() => handleCount(roleName, 1)}
                         className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                       >
                         <Plus size={12} className="text-gray-400" />
                       </button>
                     </div>
                   ) : (
                     <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Disabled</span>
                   )}

                   {/* Toggle */}
                   <button
                     onClick={(e) => { e.stopPropagation(); handleToggle(roleName); }}
                     className="relative rounded-full transition-all duration-300 flex-shrink-0"
                     style={{ width: 36, height: 20, background: isEnabled ? def.color : "rgba(255,255,255,0.1)" }}
                   >
                     <div
                       className="absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-300"
                       style={{ left: isEnabled ? "calc(100% - 17.5px)" : "3px" }}
                     />
                   </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 mt-6 mb-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <Settings2 size={16} />
          Advanced Game Settings
        </button>

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-5 mb-8 p-6 rounded-2xl overflow-hidden"
            style={{ background: "rgba(22,22,31,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Day Phase: Tie Breaker</label>
              <select
                value={settings.tieBreaker}
                onChange={(e) => updateSetting("tieBreaker", e.target.value as any)}
                className="bg-black/50 text-white text-sm rounded-lg p-2.5 border border-white/10 outline-none"
              >
                <option value="no-elimination">No Elimination</option>
                <option value="random">Random Target</option>
                <option value="revote">Moderator Decides</option>
              </select>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-red-400 font-semibold uppercase tracking-wider">Werewolf Team: Tie Breaker</label>
              <select
                value={settings.werewolfTieBreaker}
                onChange={(e) => updateSetting("werewolfTieBreaker", e.target.value as any)}
                className="bg-black/50 text-white text-sm rounded-lg p-2.5 border border-white/10 outline-none"
              >
                <option value="alpha">Alpha Decides</option>
                <option value="random">Random Target</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300 font-medium">Alpha Override Vote</label>
              <button
                onClick={() => updateSetting("alphaOverrideVote", !settings.alphaOverrideVote)}
                className="relative rounded-full w-11 h-6 transition-colors"
                style={{ background: settings.alphaOverrideVote ? "#dc2626" : "rgba(255,255,255,0.1)" }}
              >
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: settings.alphaOverrideVote ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300 font-medium">Alpha Convert Limit</label>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSetting("alphaConvertLimit", Math.max(0, settings.alphaConvertLimit - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"><Minus size={14} /></button>
                <span className="text-white text-base font-bold w-4 text-center">{settings.alphaConvertLimit}</span>
                <button onClick={() => updateSetting("alphaConvertLimit", settings.alphaConvertLimit + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"><Plus size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>

      {/* ── Sticky CTA ── */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,10,15,0.96)",
        }}
      >
        <motion.button
          onClick={() => setPhase("player-input")}
          disabled={!canProceed}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-base"
          style={{
            padding: "18px 24px",
            background: canProceed ? "linear-gradient(135deg, #dc2626, #991b1b)" : "rgba(255,255,255,0.07)",
            color: canProceed ? "white" : "#4b5563",
            border: canProceed ? "1px solid rgba(220,38,38,0.35)" : "1px solid transparent",
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={canProceed ? { scale: 1.01 } : {}}
        >
          <Users size={16} />
          Continue to Players
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* ── ROLE DETAIL POPUP ── */}
      <AnimatePresence>
        {popupRole && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setPopupRole(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-white/10 p-6 rounded-[32px] w-full max-w-[340px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 blur-[60px] rounded-full pointer-events-none" style={{ background: `${ROLE_DEFINITIONS[popupRole].color}30` }} />
              
              <div className="text-center relative z-10">
                <div className="text-6xl mb-3 filter drop-shadow-lg">{ROLE_DEFINITIONS[popupRole].icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{ROLE_DEFINITIONS[popupRole].displayName}</h2>
                <div className="inline-block px-3 py-1 mb-6 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: `${TEAM_COLORS[ROLE_DEFINITIONS[popupRole].team]}20`, color: TEAM_COLORS[ROLE_DEFINITIONS[popupRole].team] }}>
                   {ROLE_DEFINITIONS[popupRole].team} Team
                </div>
              </div>

              <div className="relative z-10 space-y-4 text-left bg-white/5 p-4 rounded-2xl">
                 <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{ROLE_DEFINITIONS[popupRole].description}</p>
                 </div>
                 {ROLE_DEFINITIONS[popupRole].nightInstruction && (
                   <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Night Action</h4>
                      <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 pl-3" style={{ borderColor: ROLE_DEFINITIONS[popupRole].color }}>"{ROLE_DEFINITIONS[popupRole].nightInstruction}"</p>
                   </div>
                 )}
              </div>
              
              <button 
                onClick={() => setPopupRole(null)} 
                className="w-full mt-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 font-bold text-white transition-colors relative z-10"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
