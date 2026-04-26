import type { Player, NightAction, NightResult } from "./gameStore";

// ============================================================
// NIGHT RESOLUTION ENGINE
// ============================================================

export function resolveNight(
  players: Player[],
  actions: NightAction[],
  witchHealUsed: boolean,
  witchPoisonUsed: boolean
): NightResult {
  const result: NightResult = {
    dead: [],
    saved: [],
    seerResults: [],
    bodyguardDied: false,
    bodyguardSavedId: null,
    loversTriggered: false,
    loversDeadId: null,
    conversions: [],
  };

  // --- Collect action sets ---
  const wwTeamAction = actions.find((a) => a.role === "WerewolfTeam");
  let werewolfKill = wwTeamAction?.targetId ?? null;
  const alphaConvert = wwTeamAction?.alphaConvertId ?? null;

  const serialKillerId = actions.find((a) => a.role === "SerialKiller")?.actorId ?? null;
  const serialKill = actions.find((a) => a.role === "SerialKiller")?.targetId ?? null;
  const doctorSave = actions.find((a) => a.role === "Doctor")?.targetId ?? null;
  const bodyguardProtect = actions.find((a) => a.role === "Bodyguard")?.targetId ?? null;
  const witchHeal = actions.find((a) => a.role === "WitchHeal")?.targetId ?? null;
  const witchPoison = actions.find((a) => a.role === "WitchPoison")?.targetId ?? null;
  const seerCheck = actions.find((a) => a.role === "Seer");

  // --- Build protection set ---
  const doctorProtected = new Set<string>();
  if (doctorSave) doctorProtected.add(doctorSave);
  if (witchHeal) doctorProtected.add(witchHeal);

  const bodyguardProtected: string | null = bodyguardProtect;

  // --- Resolve Seer ---
  if (seerCheck) {
    const target = players.find((p) => p.id === seerCheck.targetId);
    if (target) {
      result.seerResults.push({
        targetId: target.id,
        targetName: target.name,
        isEvil: target.role === "Werewolf" || target.role === "SerialKiller",
      });
    }
  }

  // --- Resolve Alpha Conversion ---
  if (alphaConvert) {
    const target = players.find((p) => p.id === alphaConvert && p.isAlive);
    if (target) {
      result.conversions.push({ id: target.id, newRole: "Werewolf" });
      werewolfKill = null; // Conversion overrides kill
    }
  }

  // --- Resolve Werewolf kill ---
  if (werewolfKill) {
    const isDocSaved = doctorProtected.has(werewolfKill);
    const isBGProtected = bodyguardProtected === werewolfKill;

    if (isBGProtected && !isDocSaved) {
      // Bodyguard takes the hit
      const bgPlayer = players.find(
        (p) => p.role === "Bodyguard" && p.isAlive
      );
      if (bgPlayer) {
        result.dead.push(werewolfKill); // target still dies without extra check? No — BG saves them
        // Actually: BG dies instead of target
        result.dead = result.dead.filter((id) => id !== werewolfKill);
        result.bodyguardDied = true;
        result.bodyguardSavedId = werewolfKill;
        result.saved.push(werewolfKill);
        result.dead.push(bgPlayer.id); // BG dies
      }
    } else if (isDocSaved && !isBGProtected) {
      result.saved.push(werewolfKill);
    } else if (isDocSaved && isBGProtected) {
      // Both protections — target survives, BG survives
      result.saved.push(werewolfKill);
    } else {
      // No protection
      result.dead.push(werewolfKill);
    }
  }

  // --- Resolve Serial Killer kill ---
  if (serialKill && serialKillerId) {
    const isDocSaved = doctorProtected.has(serialKill);
    const isBGProtected = bodyguardProtected === serialKill;

    if (isBGProtected && !isDocSaved) {
      const bgPlayer = players.find(
        (p) => p.role === "Bodyguard" && p.isAlive
      );
      if (bgPlayer) {
        result.bodyguardDied = true;
        result.bodyguardSavedId = serialKill;
        result.saved.push(serialKill);
        if (!result.dead.includes(bgPlayer.id)) {
          result.dead.push(bgPlayer.id);
        }
      }
    } else if (!isDocSaved) {
      if (!result.dead.includes(serialKill)) {
        result.dead.push(serialKill);
      }
    } else {
      if (!result.saved.includes(serialKill)) {
        result.saved.push(serialKill);
      }
    }
  }

  // --- Resolve Witch Poison (cannot be saved) ---
  if (witchPoison) {
    if (!result.dead.includes(witchPoison)) {
      result.dead.push(witchPoison);
    }
    // Remove from saved if present (poison overrides heal)
    result.saved = result.saved.filter((id) => id !== witchPoison);
  }

  // --- Resolve Lovers ---
  const alivePlayers = players.filter((p) => p.isAlive);
  const lovers = alivePlayers.filter((p) => p.loverId !== null);
  for (const deadId of result.dead) {
    const deadPlayer = players.find((p) => p.id === deadId);
    if (deadPlayer?.loverId) {
      const lover = players.find(
        (p) => p.id === deadPlayer.loverId && p.isAlive
      );
      if (lover && !result.dead.includes(lover.id)) {
        result.dead.push(lover.id);
        result.loversTriggered = true;
        result.loversDeadId = lover.id;
      }
    }
  }

  // --- Deduplicate ---
  result.dead = [...new Set(result.dead)];
  result.saved = result.saved.filter((id) => !result.dead.includes(id));

  return result;
}

import { ROLE_DEFINITIONS } from "./roles";

// ============================================================
// WIN CONDITION CHECK
// ============================================================

export type WinCondition =
  | "Village"
  | "Werewolf"
  | "SerialKiller"
  | "Jester"
  | null;

export function checkWinCondition(
  players: Player[],
  jesterEliminatedByVote: boolean = false,
  jesterId: string | null = null
): WinCondition {
  const alive = players.filter((p) => p.isAlive);

  // Jester win: was jester eliminated by vote?
  if (jesterEliminatedByVote && jesterId) {
    return "Jester";
  }

  // Serial Killer: last one standing
  const skAlive = alive.find((p) => p.role === "SerialKiller");
  if (skAlive && alive.length === 1) {
    return "SerialKiller";
  }

  // All killing werewolves dead
  const killingWolvesAlive = alive.filter(
    (p) => p.role && ["Werewolf", "AlphaWerewolf", "WolfSeer"].includes(p.role)
  );
  if (killingWolvesAlive.length === 0) {
    // Check if SK is still alive — SK wins over village if last standing
    if (skAlive) return null; // game continues
    return "Village";
  }

  // Werewolf team >= remaining non-wolf players
  const wolfTeamPower = alive.filter(
    (p) => p.role && ROLE_DEFINITIONS[p.role].team === "Werewolf"
  ).length;
  const nonWolfPower = alive.length - wolfTeamPower;
  if (wolfTeamPower >= nonWolfPower) {
    return "Werewolf";
  }

  return null;
}

export function getWinnerDetails(condition: WinCondition): {
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
} {
  switch (condition) {
    case "Village":
      return {
        title: "Villagers Win!",
        subtitle: "The werewolves have been eliminated. Peace returns to the village.",
        emoji: "🎉",
        color: "#10b981",
      };
    case "Werewolf":
      return {
        title: "Werewolves Win!",
        subtitle: "The wolves now outnumber the innocent. Darkness reigns.",
        emoji: "🐺",
        color: "#dc2626",
      };
    case "SerialKiller":
      return {
        title: "Serial Killer Wins!",
        subtitle: "The lone predator outlasted everyone. No one was safe.",
        emoji: "🗡️",
        color: "#7c3aed",
      };
    case "Jester":
      return {
        title: "Jester Wins!",
        subtitle: "The fool played everyone perfectly and got what they wanted.",
        emoji: "🃏",
        color: "#f59e0b",
      };
    default:
      return {
        title: "Game Over",
        subtitle: "The game has ended.",
        emoji: "🎮",
        color: "#6b7280",
      };
  }
}
