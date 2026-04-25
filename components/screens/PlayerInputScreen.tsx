"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import { useState, useRef } from "react";
import { Plus, Trash2, ChevronRight, ChevronLeft, Users, Edit3, Check, X } from "lucide-react";

export default function PlayerInputScreen() {
  const { players, addPlayer, removePlayer, updatePlayerName, setPhase, roleConfigs } =
    useGameStore();
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalRoles = roleConfigs.reduce(
    (sum, rc) => sum + (rc.enabled ? rc.count : 0),
    0
  );
  const canProceed = players.length > 0 && players.length === totalRoles;
  const mismatch = players.length > 0 && players.length !== totalRoles;

  const handleAdd = () => {
    addPlayer(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };
  const commitEdit = () => {
    if (editingId && editValue.trim()) updatePlayerName(editingId, editValue.trim());
    setEditingId(null);
    setEditValue("");
  };

  const handleDistribute = () => {
    const ok = useGameStore.getState().distributeRoles();
    if (!ok) alert("Role count doesn't match player count!");
  };

  return (
    <div className="flex flex-col flex-1">
      {/* ── Fixed header section ── */}
      <div className="flex-shrink-0" style={{ padding: "20px 20px 16px" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Players
          </h1>
          <p className="text-sm text-gray-500">Add everyone who is joining this game</p>
        </motion.div>

        {/* Status strip */}
        <div
          className="flex items-center rounded-2xl"
          style={{
            marginTop: 12,
            gap: 12,
            padding: "14px 20px",
            background: canProceed
              ? "rgba(16,185,129,0.08)"
              : mismatch
              ? "rgba(220,38,38,0.08)"
              : "rgba(255,255,255,0.04)",
            border: canProceed
              ? "1px solid rgba(16,185,129,0.25)"
              : mismatch
              ? "1px solid rgba(220,38,38,0.25)"
              : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Users
            size={15}
            style={{
              color: canProceed ? "#34d399" : mismatch ? "#f87171" : "#6b7280",
              flexShrink: 0,
            }}
          />
          <p
            className="text-sm flex-1"
            style={{ color: canProceed ? "#34d399" : mismatch ? "#f87171" : "#9ca3af" }}
          >
            {players.length} / {totalRoles} players
            {canProceed && " — ✓ Ready"}
            {mismatch && ` — Need exactly ${totalRoles}`}
          </p>
        </div>

        {/* Input row */}
        <div className="flex" style={{ marginTop: 12, gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Player name, press Enter to add…"
            maxLength={24}
            className="flex-1 rounded-2xl text-sm outline-none transition-all"
            style={{
              padding: "14px 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "#f1f1f7",
              minWidth: 0,
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(220,38,38,0.45)";
              e.target.style.background = "rgba(220,38,38,0.05)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(255,255,255,0.09)";
              e.target.style.background = "rgba(255,255,255,0.05)";
            }}
          />
          <motion.button
            onClick={handleAdd}
            className="rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              width: 50,
              height: 50,
              background: "linear-gradient(135deg, #dc2626, #991b1b)",
            }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Plus size={22} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* ── Scrollable player list ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "0 20px 16px" }}>
        <AnimatePresence mode="popLayout">
          {players.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                👥
              </div>
              <p className="text-sm text-gray-500">No players yet</p>
              <p className="text-xs text-gray-600 mt-1">Type a name above and press Enter</p>
            </motion.div>
          )}

          {players.map((player, i) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex items-center rounded-2xl"
              style={{
                gap: 12,
                padding: "13px 20px",
                marginBottom: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Number badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "rgba(220,38,38,0.15)", color: "#f87171" }}
              >
                {i + 1}
              </div>

              {/* Name / Edit */}
              {editingId === player.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={commitEdit}
                  className="flex-1 bg-transparent text-sm outline-none border-b pb-0.5"
                  style={{ color: "#f1f1f7", borderColor: "rgba(220,38,38,0.45)", minWidth: 0 }}
                  maxLength={24}
                />
              ) : (
                <span
                  className="flex-1 text-sm font-medium truncate"
                  style={{ color: "#e5e7eb", minWidth: 0 }}
                >
                  {player.name}
                </span>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {editingId === player.id ? (
                  <>
                    <button
                      onClick={commitEdit}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.12)" }}
                    >
                      <Check size={14} className="text-green-400" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(player.id, player.name)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <Edit3 size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "rgba(220,38,38,0.08)" }}
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Sticky footer ── */}
      <div
        className="flex-shrink-0 flex"
        style={{
          gap: 12,
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,10,15,0.96)",
        }}
      >
        <motion.button
          onClick={() => setPhase("setup")}
          className="flex items-center justify-center gap-1.5 rounded-2xl font-semibold text-sm flex-shrink-0"
          style={{
            padding: "16px 20px",
            background: "rgba(255,255,255,0.05)",
            color: "#9ca3af",
            border: "1px solid rgba(255,255,255,0.09)",
            minWidth: 96,
          }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={15} />
          Back
        </motion.button>

        <motion.button
          onClick={handleDistribute}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-base"
          style={{
            padding: "16px 20px",
            background: canProceed ? "linear-gradient(135deg, #dc2626, #991b1b)" : "rgba(255,255,255,0.07)",
            color: canProceed ? "white" : "#4b5563",
            border: canProceed ? "1px solid rgba(220,38,38,0.35)" : "1px solid transparent",
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={canProceed ? { scale: 1.01 } : {}}
        >
          Distribute Roles
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
