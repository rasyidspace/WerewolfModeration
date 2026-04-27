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
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">

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
          className="flex items-center rounded-2xl mb-5"
          style={{
            gap: 14,
            padding: "14px 16px",
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
              {totalAssigned > totalPlayers
                ? `+${totalAssigned - totalPlayers}`
                : `-${totalPlayers - totalAssigned}`}
            </span>
          )}
        </motion.div>

        {/* Role list grid */}
        <div className="grid grid-cols-2 gap-3">
          {ALL_ROLES.map((roleName, i) => {
            const def = ROLE_DEFINITIONS[roleName];
            const config = roleConfigs.find((r) => r.role === roleName)!;
            const isEnabled = config.enabled;
            const teamColor = TEAM_COLORS[def.team];

            return (
              <motion.div
                key={roleName}
                onClick={() => setPopupRole(roleName)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="rounded-[18px] flex flex-col relative overflow-hidden cursor-pointer"
                style={{
                  background: isEnabled
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(14,14,20,0.55)",
                  border: isEnabled
                    ? `1px solid ${def.color}35`
                    : "1px solid rgba(255,255,255,0.06)",
                  opacity: isEnabled ? 1 : 0.58,
                  filter: isEnabled ? "none" : "grayscale(40%)",
                  minHeight: 164,
                  transition: "opacity 0.25s, border-color 0.25s",
                }}
              >
                {/* Top accent bar — glows team color when enabled */}
                <div
                  style={{
                    height: 3,
                    background: def.color,
                    opacity: isEnabled ? 0.85 : 0,
                    transition: "opacity 0.3s",
                    flexShrink: 0,
                  }}
                />

                {/* Icon + Name + Badge — vertically centered in the card body */}
                <div className="flex flex-col items-center justify-center flex-1 px-3 pt-3 pb-2 gap-1.5">
                  <div className="text-[40px] leading-none">{def.icon}</div>
                  <h3 className="font-bold text-[13px] text-center text-white leading-tight mt-0.5">
                    {def.displayName}
                  </h3>
                  <span
                    className="text-[9px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider"
                    style={{
                      background: `${teamColor}1A`,
                      color: teamColor,
                      border: `1px solid ${teamColor}30`,
                    }}
                  >
                    {def.team}
                  </span>
                </div>

                {/* Controls row — anchored to card bottom */}
                <div
                  className="flex items-center justify-between px-3 py-2.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Count or "off" label */}
                  {isEnabled ? (
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.80 }}
                        onClick={() => handleCount(roleName, -1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <Minus size={11} className="text-gray-400" />
                      </motion.button>
                      <span
                        className="w-5 text-center text-sm font-bold"
                        style={{ color: def.color }}
                      >
                        {config.count}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.80 }}
                        onClick={() => handleCount(roleName, 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <Plus size={11} className="text-gray-400" />
                      </motion.button>
                    </div>
                  ) : (
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                      Off
                    </span>
                  )}

                  {/* Toggle switch */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(roleName); }}
                    className="relative rounded-full flex-shrink-0"
                    style={{
                      width: 34,
                      height: 18,
                      background: isEnabled ? def.color : "rgba(255,255,255,0.1)",
                      transition: "background 0.25s",
                    }}
                  >
                    <div
                      className="absolute top-[2px] bg-white rounded-full shadow"
                      style={{
                        width: 14,
                        height: 14,
                        left: isEnabled ? "calc(100% - 16px)" : "2px",
                        transition: "left 0.25s",
                      }}
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
            style={{
              background: "rgba(22,22,31,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Day Phase: Tie Breaker
              </label>
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
              <label className="text-xs text-red-400 font-semibold uppercase tracking-wider">
                Werewolf Team: Tie Breaker
              </label>
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
                style={{
                  background: settings.alphaOverrideVote ? "#dc2626" : "rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ left: settings.alphaOverrideVote ? "calc(100% - 20px)" : "4px" }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300 font-medium">Alpha Convert Limit</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSetting("alphaConvertLimit", Math.max(0, settings.alphaConvertLimit - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white text-base font-bold w-4 text-center">
                  {settings.alphaConvertLimit}
                </span>
                <button
                  onClick={() => updateSetting("alphaConvertLimit", settings.alphaConvertLimit + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>

      {/* Sticky CTA */}
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
            background: canProceed
              ? "linear-gradient(135deg, #dc2626, #991b1b)"
              : "rgba(255,255,255,0.07)",
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

      {/* Role Detail Popup */}
      <AnimatePresence>
        {popupRole && (() => {
          const def = ROLE_DEFINITIONS[popupRole];
          const teamColor = TEAM_COLORS[def.team];
          return (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-5"
              style={{ background: "rgba(0,0,0,0.78)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPopupRole(null)}
            >
              {/* Backdrop blur layer */}
              <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />

              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 32 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 24 }}
                transition={{ type: "spring", damping: 24, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[340px] rounded-[28px] overflow-hidden shadow-2xl"
                style={{
                  background: "#0e0e16",
                  border: `1px solid ${def.color}25`,
                  boxShadow: `0 0 60px ${def.color}20, 0 24px 48px rgba(0,0,0,0.6)`,
                }}
              >
                {/* ── HERO HEADER ── */}
                <div
                  className="relative flex flex-col items-center pt-8 pb-6 px-6 overflow-hidden"
                  style={{
                    background: `linear-gradient(180deg, ${def.color}28 0%, transparent 100%)`,
                  }}
                >
                  {/* Ambient glow orb */}
                  <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-56 h-36 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse, ${def.color}50 0%, transparent 70%)`,
                      filter: "blur(24px)",
                    }}
                  />

                  {/* Icon ring */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, type: "spring", damping: 18, stiffness: 280 }}
                    className="relative z-10 flex items-center justify-center mb-4"
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${def.color}20 0%, ${def.color}08 100%)`,
                      border: `2px solid ${def.color}55`,
                      boxShadow: `0 0 0 6px ${def.color}10, 0 0 28px ${def.color}35`,
                    }}
                  >
                    <span style={{ fontSize: 44, lineHeight: 1 }}>{def.icon}</span>
                  </motion.div>

                  {/* Role name */}
                  <motion.h2
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="relative z-10 text-[22px] font-bold text-white tracking-wide"
                    style={{ fontFamily: "var(--font-cinzel)" }}
                  >
                    {def.displayName}
                  </motion.h2>

                  {/* Team badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.16 }}
                    className="relative z-10 mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{
                      background: `${teamColor}18`,
                      border: `1px solid ${teamColor}40`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: teamColor, boxShadow: `0 0 4px ${teamColor}` }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: teamColor }}
                    >
                      {def.team} Team
                    </span>
                  </motion.div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${def.color}30, transparent)` }} />

                {/* ── BODY ── */}
                <div className="px-5 pt-4 pb-5 space-y-3">

                  {/* Description card */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
                      style={{ color: "rgba(255,255,255,0.35)" }}>
                      Description
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {def.description}
                    </p>
                  </motion.div>

                  {/* Night action card */}
                  {def.nightInstruction && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 }}
                      className="rounded-2xl overflow-hidden"
                      style={{
                        background: `${def.color}12`,
                        border: `1px solid ${def.color}35`,
                      }}
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2.5"
                        style={{ borderBottom: `1px solid ${def.color}25` }}
                      >
                        <span style={{ fontSize: 13, lineHeight: 1 }}>🌙</span>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: def.color }}
                        >
                          Night Action
                        </p>
                      </div>
                      <div className="px-4 py-3.5">
                        <p
                          className="text-sm leading-relaxed italic"
                          style={{ color: "rgba(255,255,255,0.72)" }}
                        >
                          "{def.nightInstruction}"
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Close button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.26 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPopupRole(null)}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all mt-1"
                    style={{
                      background: `${def.color}22`,
                      border: `1px solid ${def.color}40`,
                      color: def.color,
                      letterSpacing: "0.04em",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = `${def.color}35`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = `${def.color}22`;
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}