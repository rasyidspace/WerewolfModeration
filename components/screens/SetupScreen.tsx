"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { ROLE_DEFINITIONS, ALL_ROLES, type RoleName } from "@/lib/roles";
import { useState } from "react";
import FullscreenModal from "@/components/FullscreenModal";
import {
  Plus, Minus, AlertCircle, ChevronRight, Users,
  Settings2, ChevronDown, Shuffle, Crown, Shield, Info,
} from "lucide-react";

const TEAM_COLORS: Record<string, string> = {
  Village:  "#10b981",
  Werewolf: "#dc2626",
  Neutral:  "#f59e0b",
};

const TEAM_ORDER: Array<"Village" | "Werewolf" | "Neutral"> = ["Village", "Werewolf", "Neutral"];

const TEAM_LABELS: Record<string, string> = {
  Village:  "Villagers",
  Werewolf: "Werewolf Pack",
  Neutral:  "Neutral",
};

export default function SetupScreen() {
  const { roleConfigs, setRoleConfig, players, setPhase, settings, updateSetting } =
    useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [popupRole, setPopupRole] = useState<RoleName | null>(null);
  const [flashingRole, setFlashingRole] = useState<RoleName | null>(null);

  const totalAssigned = roleConfigs.reduce((s, rc) => s + (rc.enabled ? rc.count : 0), 0);
  const totalPlayers  = players.length;
  const mismatch      = totalPlayers > 0 && totalAssigned !== totalPlayers;
  const canProceed    = totalAssigned > 0;

  const handleToggle = (role: RoleName) => {
    const rc = roleConfigs.find((r) => r.role === role)!;
    setRoleConfig(role, rc.count, !rc.enabled);
    // Trigger border flash
    setFlashingRole(role);
    setTimeout(() => setFlashingRole(null), 500);
  };
  const handleCount = (role: RoleName, delta: number) => {
    const rc = roleConfigs.find((r) => r.role === role)!;
    setRoleConfig(role, Math.max(1, rc.count + delta), rc.enabled);
  };

  const grouped = TEAM_ORDER.map((team) => ({
    team,
    roles: ALL_ROLES.filter((r) => ROLE_DEFINITIONS[r].team === team),
  }));

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-6">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4"
        >
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-cinzel)" }}>
            Role Setup
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Select and configure roles for this session</p>
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-5"
          style={{
            background: mismatch ? "rgba(220,38,38,0.09)" : "rgba(255,255,255,0.04)",
            border:     mismatch ? "1px solid rgba(220,38,38,0.28)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {mismatch
            ? <AlertCircle size={14} className="shrink-0" style={{ color: "#f87171" }} />
            : <Users       size={14} className="shrink-0" style={{ color: "#6b7280" }} />
          }
          <p className="flex-1 text-xs font-medium" style={{ color: mismatch ? "#f87171" : "#9ca3af" }}>
            {mismatch
              ? `${totalAssigned} assigned · need ${totalPlayers} — adjust counts`
              : totalPlayers > 0
                ? `${totalAssigned} roles assigned · ✓ matches ${totalPlayers} players`
                : `${totalAssigned} roles assigned`
            }
          </p>
          {mismatch && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "rgba(220,38,38,0.2)", color: "#f87171" }}
            >
              {totalAssigned > totalPlayers ? `+${totalAssigned - totalPlayers}` : `-${totalPlayers - totalAssigned}`}
            </span>
          )}
        </motion.div>

        {/* Role groups — 2-column card grid per team */}
        <div className="flex flex-col gap-6">
          {grouped.map(({ team, roles }) => {
            const teamColor = TEAM_COLORS[team];
            return (
              <motion.div
                key={team}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section label */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: teamColor }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest shrink-0"
                    style={{ color: teamColor }}
                  >
                    {TEAM_LABELS[team]}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `${teamColor}22` }} />
                </div>

                {/* 2-col card grid */}
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((roleName, idx) => {
                    const def       = ROLE_DEFINITIONS[roleName];
                    const config    = roleConfigs.find((r) => r.role === roleName)!;
                    const isEnabled = config.enabled;

                    return (
                      <motion.div
                        key={roleName}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04, duration: 0.2 }}
                        className="flex flex-col rounded-2xl cursor-pointer select-none"
                        onClick={() => handleToggle(roleName)}
                        style={{
                          background:  isEnabled ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.018)",
                          border:      flashingRole === roleName
                            ? `2px solid ${def.color}`
                            : isEnabled
                              ? `1px solid ${def.color}28`
                              : "1px solid rgba(255,255,255,0.07)",
                          transition:  flashingRole === roleName
                            ? "border-color 0.05s, border-width 0.05s, background 0.2s"
                            : "border-color 0.3s, border-width 0.3s, background 0.2s",
                          padding:     flashingRole === roleName ? "11px" : "12px", // compensate border-width
                          gap:         "12px",
                          boxShadow:   flashingRole === roleName
                            ? `0 0 0 3px ${def.color}25, 0 0 20px ${def.color}20`
                            : "none",
                        }}
                      >
                        {/* Row 1 — badge left, info button right */}
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider rounded-full"
                            style={{
                              padding:    "3px 8px",
                              background: isEnabled ? `${teamColor}18` : "rgba(255,255,255,0.06)",
                              color:      isEnabled ? teamColor : "rgba(255,255,255,0.28)",
                              border:     `1px solid ${isEnabled ? teamColor + "30" : "rgba(255,255,255,0.08)"}`,
                              transition: "all 0.2s",
                            }}
                          >
                            {def.team}
                          </span>

                          {/* Info button — stopPropagation so it doesn't trigger toggle */}
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); setPopupRole(roleName); }}
                            whileTap={{ scale: 0.85 }}
                            className="flex items-center justify-center rounded-full shrink-0"
                            style={{
                              width:      26,
                              height:     26,
                              background: "rgba(255,255,255,0.05)",
                              border:     "1px solid rgba(255,255,255,0.08)",
                              opacity:    0.55,
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
                          >
                            <Info size={11} className="text-gray-300" />
                          </motion.button>
                        </div>

                        {/* Row 2 — icon + name + enabled checkmark */}
                        <div
                          className="flex flex-col items-center gap-2.5 flex-1"
                          style={{ opacity: isEnabled ? 1 : 0.38, transition: "opacity 0.2s" }}
                        >
                          <div
                            className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              fontSize:   "28px",
                              background: isEnabled ? `${def.color}16` : "rgba(255,255,255,0.05)",
                              border:     `1px solid ${isEnabled ? def.color + "28" : "rgba(255,255,255,0.07)"}`,
                              transition: "background 0.2s, border-color 0.2s",
                            }}
                          >
                            {def.icon}
                          </div>
                          <p
                            className="text-[13px] font-semibold text-center leading-tight w-full"
                            style={{ color: isEnabled ? "#f1f1f7" : "rgba(255,255,255,0.32)" }}
                          >
                            {def.displayName}
                          </p>
                        </div>

                        {/* Row 3 — stepper (stopPropagation so stepper doesn't toggle card) */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {isEnabled ? (
                            <div
                              className="flex items-center justify-between rounded-xl"
                              style={{
                                background: "rgba(255,255,255,0.07)",
                                border:     "1px solid rgba(255,255,255,0.09)",
                                padding:    "7px 8px",
                              }}
                            >
                              <motion.button
                                whileTap={{ scale: 0.75 }}
                                onClick={() => handleCount(roleName, -1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "rgba(255,255,255,0.09)" }}
                              >
                                <Minus size={12} className="text-gray-400" />
                              </motion.button>
                              <span className="text-sm font-bold" style={{ color: def.color }}>
                                {config.count}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.75 }}
                                onClick={() => handleCount(roleName, 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "rgba(255,255,255,0.09)" }}
                              >
                                <Plus size={12} className="text-gray-400" />
                              </motion.button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center justify-center rounded-xl"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border:     "1px solid rgba(255,255,255,0.05)",
                                padding:    "8px",
                              }}
                            >
                              <span
                                className="text-[9px] font-semibold uppercase tracking-widest"
                                style={{ color: "rgba(255,255,255,0.18)" }}
                              >
                                off
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Advanced Settings */}
        <div className="mt-5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors w-full"
          >
            <Settings2 size={13} />
            <span>Advanced Settings</span>
            <ChevronDown
              size={13}
              className="ml-auto transition-transform duration-200"
              style={{ transform: showSettings ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-col gap-2">

                  {/* Day Tie Breaker */}
                  <div
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <Shuffle size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300 leading-none mb-0.5">Day Tie Breaker</p>
                      <p className="text-[10px] text-gray-600">What happens on a voting tie</p>
                    </div>
                    <select
                      value={settings.tieBreaker}
                      onChange={(e) => updateSetting("tieBreaker", e.target.value as any)}
                      className="text-white text-xs rounded-xl outline-none shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "6px 10px",
                        maxWidth: 110,
                      }}
                    >
                      <option value="no-elimination">No Elim.</option>
                      <option value="random">Random</option>
                      <option value="revote">Mod Decides</option>
                    </select>
                  </div>

                  {/* Werewolf Tie Breaker */}
                  <div
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.12)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(220,38,38,0.12)" }}
                    >
                      <span style={{ fontSize: 16 }}>🐺</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: "#f87171" }}>Werewolf Tie Breaker</p>
                      <p className="text-[10px] text-gray-600">Wolf pack kill vote tie</p>
                    </div>
                    <select
                      value={settings.werewolfTieBreaker}
                      onChange={(e) => updateSetting("werewolfTieBreaker", e.target.value as any)}
                      className="text-white text-xs rounded-xl outline-none shrink-0"
                      style={{
                        background: "rgba(220,38,38,0.12)",
                        border: "1px solid rgba(220,38,38,0.2)",
                        padding: "6px 10px",
                        maxWidth: 110,
                      }}
                    >
                      <option value="alpha">Alpha Decides</option>
                      <option value="random">Random</option>
                    </select>
                  </div>

                  {/* Alpha Override Vote */}
                  <div
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(185,28,28,0.12)" }}
                    >
                      <Crown size={14} style={{ color: "#f87171" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300 leading-none mb-0.5">Alpha Override Vote</p>
                      <p className="text-[10px] text-gray-600">Alpha can overrule pack decision</p>
                    </div>
                    <MiniToggle
                      value={settings.alphaOverrideVote}
                      color="#dc2626"
                      onChange={() => updateSetting("alphaOverrideVote", !settings.alphaOverrideVote)}
                    />
                  </div>

                  {/* Alpha Convert Limit */}
                  <div
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(185,28,28,0.12)" }}
                    >
                      <Shield size={14} style={{ color: "#f87171" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300 leading-none mb-0.5">Alpha Convert Limit</p>
                      <p className="text-[10px] text-gray-600">Max conversions per game</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateSetting("alphaConvertLimit", Math.max(0, settings.alphaConvertLimit - 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-bold text-white w-5 text-center">
                        {settings.alphaConvertLimit}
                      </span>
                      <button
                        onClick={() => updateSetting("alphaConvertLimit", settings.alphaConvertLimit + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-2" />
      </div>

      {/* ── Sticky CTA ── */}
      <div
        className="flex-shrink-0"
        style={{
          padding:    "16px 20px",
          borderTop:  "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,10,15,0.96)",
        }}
      >
        <motion.button
          onClick={() => setPhase("player-input")}
          disabled={!canProceed}
          whileTap={canProceed ? { scale: 0.97 } : {}}
          whileHover={canProceed ? { scale: 1.01 } : {}}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-base"
          style={{
            padding:    "16px 20px",
            background: canProceed
              ? "linear-gradient(135deg, #dc2626, #991b1b)"
              : "rgba(255,255,255,0.07)",
            color:      canProceed ? "white" : "#4b5563",
            border:     canProceed ? "1px solid rgba(220,38,38,0.35)" : "1px solid transparent",
            transition: "all 0.2s",
          }}
        >
          <Users size={16} />
          Continue to Players
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* ── Role Detail Popup — centered modal like role reveal ── */}
      <FullscreenModal
        isOpen={popupRole !== null}
        onClose={() => setPopupRole(null)}
        showClose
      >
        {popupRole && (() => {
          const def       = ROLE_DEFINITIONS[popupRole];
          const teamColor = TEAM_COLORS[def.team];
          return (
            <div className="flex flex-col items-center text-center gap-5 px-6 py-8">

              {/* Glowing icon orb — exactly like role reveal */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                  style={{
                    background: `radial-gradient(circle, ${def.color}28, transparent)`,
                    boxShadow:  `0 0 48px ${def.color}45, 0 0 96px ${def.color}18`,
                    border:     `2px solid ${def.color}38`,
                  }}
                >
                  {def.icon}
                </div>
                <div
                  className="absolute inset-0 rounded-full animate-spin-slow"
                  style={{ border: `1px solid ${def.color}25`, transform: "scale(1.25)" }}
                />
              </motion.div>

              {/* Role name */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h2
                  className="text-3xl font-bold"
                  style={{
                    fontFamily:  "var(--font-cinzel)",
                    color:       def.color,
                    textShadow:  `0 0 32px ${def.color}55`,
                  }}
                >
                  {def.displayName}
                </h2>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: `${teamColor}18`,
                    color:      teamColor,
                    border:     `1px solid ${teamColor}38`,
                  }}
                >
                  {def.team} Team
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-sm text-gray-400 leading-relaxed text-left"
                style={{ maxWidth: 300 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {def.description}
              </motion.p>

              {/* Night action */}
              {def.nightInstruction && (
                <motion.div
                  className="w-full rounded-2xl overflow-hidden text-left"
                  style={{ background: `${def.color}10`, border: `1px solid ${def.color}28` }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ borderBottom: `1px solid ${def.color}20` }}
                  >
                    <span className="text-sm">🌙</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: def.color }}>
                      Night Instruction
                    </p>
                  </div>
                  <p className="px-4 py-3 text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.65)" }}>
                    "{def.nightInstruction}"
                  </p>
                </motion.div>
              )}

              {/* Close CTA */}
              <motion.button
                onClick={() => setPopupRole(null)}
                className="w-full font-bold text-base text-white rounded-2xl"
                style={{
                  padding:    "16px 24px",
                  background: `linear-gradient(135deg, ${def.color}, ${def.color}99)`,
                  boxShadow:  `0 6px 24px ${def.color}35`,
                  border:     `1px solid ${def.color}50`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
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

/* ─── Sub-components ─────────────────────────────────────────────── */

function MiniToggle({
  value,
  color,
  onChange,
}: {
  value: boolean;
  color: string;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="relative rounded-full shrink-0"
      style={{
        width:      32,
        height:     18,
        background: value ? color : "rgba(255,255,255,0.1)",
        transition: "background 0.2s",
      }}
    >
      <div
        className="absolute top-[2px] bg-white rounded-full shadow"
        style={{
          width:      14,
          height:     14,
          left:       value ? "calc(100% - 16px)" : "2px",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}