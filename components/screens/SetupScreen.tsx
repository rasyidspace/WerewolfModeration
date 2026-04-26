"use client";

import { motion } from "framer-motion";
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

        {/* Role list */}
        <div className="flex flex-col gap-2.5">
          {ALL_ROLES.map((roleName, i) => {
            const def = ROLE_DEFINITIONS[roleName];
            const config = roleConfigs.find((r) => r.role === roleName)!;
            const isEnabled = config.enabled;

            return (
              <motion.div
                key={roleName}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isEnabled
                    ? `linear-gradient(135deg, ${def.color}12, rgba(22,22,31,0.95))`
                    : "rgba(18,18,24,0.7)",
                  border: isEnabled
                    ? `1px solid ${def.color}30`
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center" style={{ gap: 16, padding: "20px 24px" }}>
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: isEnabled ? `${def.color}18` : "rgba(255,255,255,0.05)" }}
                  >
                    {def.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: isEnabled ? "#f1f1f7" : "#6b7280" }}
                      >
                        {def.displayName}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium leading-none"
                        style={{
                          background: `${TEAM_COLORS[def.team]}18`,
                          color: TEAM_COLORS[def.team],
                        }}
                      >
                        {def.team}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#6b7280" }}>
                      {def.description}
                    </p>
                  </div>

                  {/* Count controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEnabled && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCount(roleName, -1)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        >
                          <Minus size={12} style={{ color: "#9ca3af" }} />
                        </button>
                        <span
                          className="w-6 text-center text-sm font-bold"
                          style={{ color: def.color }}
                        >
                          {config.count}
                        </span>
                        <button
                          onClick={() => handleCount(roleName, 1)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        >
                          <Plus size={12} style={{ color: "#9ca3af" }} />
                        </button>
                      </div>
                    )}

                    {/* Toggle pill */}
                    <button
                      onClick={() => handleToggle(roleName)}
                      className="relative rounded-full transition-all duration-300 flex-shrink-0"
                      style={{
                        width: 44,
                        height: 24,
                        background: isEnabled ? def.color : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <motion.div
                        className="absolute top-[4px] w-4 h-4 bg-white rounded-full shadow"
                        animate={{ left: isEnabled ? "calc(100% - 20px)" : "4px" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
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
                <button onClick={() => updateSetting("alphaConvertLimit", Math.max(0, settings.alphaConvertLimit - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"><Minus size={14}/></button>
                <span className="text-white text-base font-bold w-4 text-center">{settings.alphaConvertLimit}</span>
                <button onClick={() => updateSetting("alphaConvertLimit", settings.alphaConvertLimit + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white"><Plus size={14}/></button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>

      {/* ── Sticky CTA ── */}
      <div
        className="flex-shrink-0 px-8 py-6"
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
    </div>
  );
}
