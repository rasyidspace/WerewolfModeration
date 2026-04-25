"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Player } from "@/lib/gameStore";

interface PlayerSelectorProps {
  players: Player[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  excludeIds?: string[];
  multiSelect?: boolean;
  selectedIds?: string[];
  onMultiSelect?: (ids: string[]) => void;
  label?: string;
  maxSelect?: number;
}

export default function PlayerSelector({
  players,
  selectedId,
  onSelect,
  excludeIds = [],
  multiSelect = false,
  selectedIds = [],
  onMultiSelect,
  label,
  maxSelect,
}: PlayerSelectorProps) {
  const eligible = players.filter((p) => p.isAlive && !excludeIds.includes(p.id));

  const handleMultiToggle = (id: string) => {
    if (!onMultiSelect) return;
    if (selectedIds.includes(id)) {
      onMultiSelect(selectedIds.filter((sid) => sid !== id));
    } else {
      if (maxSelect && selectedIds.length >= maxSelect) return;
      onMultiSelect([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
      )}

      {eligible.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-5">No eligible players</p>
      )}

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {eligible.map((player) => {
          const isSelected = multiSelect
            ? selectedIds.includes(player.id)
            : selectedId === player.id;

          return (
            <motion.button
              key={player.id}
              onClick={() =>
                multiSelect ? handleMultiToggle(player.id) : onSelect(player.id)
              }
              className="flex items-center gap-3 rounded-2xl text-left"
              style={{
                padding: "12px 14px",
                minHeight: 56,
                background: isSelected ? "rgba(220,38,38,0.14)" : "rgba(255,255,255,0.04)",
                border: isSelected
                  ? "1px solid rgba(220,38,38,0.48)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Avatar initial */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: isSelected ? "rgba(220,38,38,0.28)" : "rgba(255,255,255,0.08)",
                  color: isSelected ? "#f87171" : "#9ca3af",
                }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>

              <span
                className="text-sm font-semibold flex-1 truncate"
                style={{ color: isSelected ? "#f1f1f7" : "#9ca3af" }}
              >
                {player.name}
              </span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <Check size={14} className="text-red-400" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
