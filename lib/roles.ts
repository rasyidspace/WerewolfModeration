// ============================================================
// ROLE DEFINITIONS
// ============================================================

export type RoleName =
  | "Villager"
  | "Werewolf"
  | "Seer"
  | "Doctor"
  | "Hunter"
  | "Witch"
  | "Bodyguard"
  | "Cupid"
  | "SerialKiller"
  | "Jester"
  | "AlphaWerewolf"
  | "WolfSeer"
  | "Minion";

export type Team = "Village" | "Werewolf" | "Neutral";

export type NightStepName = RoleName | "WerewolfTeam";

export interface RoleDefinition {
  name: RoleName;
  displayName: string;
  team: Team;
  description: string;
  nightOrder: number; // lower = earlier in night phase (0 = no night action)
  icon: string; // emoji
  color: string; // tailwind/css color token
  glowClass: string;
  nightInstruction: string;
  hasNightAction: boolean;
}

export const ROLE_DEFINITIONS: Record<RoleName, RoleDefinition> = {
  Villager: {
    name: "Villager",
    displayName: "Villager",
    team: "Village",
    description:
      "An ordinary villager. Your power lies in observation and persuasion. Work with your fellow villagers to find and eliminate the werewolves during the day.",
    nightOrder: 0,
    icon: "🧑‍🌾",
    color: "#6b7280",
    glowClass: "",
    nightInstruction: "",
    hasNightAction: false,
  },
  Werewolf: {
    name: "Werewolf",
    displayName: "Werewolf",
    team: "Werewolf",
    description:
      "A bloodthirsty predator hiding in plain sight. Each night, you and your pack choose one victim to devour. Blend in during the day—and lie convincingly.",
    nightOrder: 3,
    icon: "🐺",
    color: "#dc2626",
    glowClass: "glow-red",
    nightInstruction:
      "All Werewolves, open your eyes. Silently agree on one target to eliminate tonight.",
    hasNightAction: true,
  },
  AlphaWerewolf: {
    name: "AlphaWerewolf",
    displayName: "Alpha Werewolf",
    team: "Werewolf",
    description: "The leader of the pack. You can override the team's kill vote, or choose to infect and convert a player into a werewolf.",
    nightOrder: 3,
    icon: "👑",
    color: "#b91c1c",
    glowClass: "glow-red",
    nightInstruction: "Alpha, make your final decision for the pack.",
    hasNightAction: true,
  },
  WolfSeer: {
    name: "WolfSeer",
    displayName: "Wolf Seer",
    team: "Werewolf",
    description: "A corrupted visionary. Each night you can inspect one player to reveal their exact role to aid the werewolf pack.",
    nightOrder: 3,
    icon: "🐺",
    color: "#991b1b",
    glowClass: "glow-red",
    nightInstruction: "Wolf Seer, point to a player to learn their exact role.",
    hasNightAction: true,
  },
  Minion: {
    name: "Minion",
    displayName: "Minion",
    team: "Werewolf",
    description: "A loyal servant to the werewolves. You know who the werewolves are, but you do not wake up with them. Help them win during the day.",
    nightOrder: 0,
    icon: "🧎",
    color: "#f87171",
    glowClass: "",
    nightInstruction: "",
    hasNightAction: false,
  },
  Seer: {
    name: "Seer",
    displayName: "Seer",
    team: "Village",
    description:
      "Gifted with mystical sight, you can divine the true nature of any player each night. Use your knowledge wisely—your identity must remain secret.",
    nightOrder: 1,
    icon: "🔮",
    color: "#3b82f6",
    glowClass: "glow-blue",
    nightInstruction: "Seer, open your eyes. Point to a player to see their alignment.",
    hasNightAction: true,
  },
  Doctor: {
    name: "Doctor",
    displayName: "Doctor",
    team: "Village",
    description:
      "A healer who can protect one player each night from death. You may save yourself, but choose wisely—you cannot save the same person twice in a row.",
    nightOrder: 4,
    icon: "💉",
    color: "#10b981",
    glowClass: "glow-green",
    nightInstruction:
      "Doctor, open your eyes. Point to the player you wish to save tonight.",
    hasNightAction: true,
  },
  Hunter: {
    name: "Hunter",
    displayName: "Hunter",
    team: "Village",
    description:
      "A fierce protector. When you are eliminated—by vote or at night—you immediately take someone down with you. Your death is not without consequence.",
    nightOrder: 0,
    icon: "🏹",
    color: "#f59e0b",
    glowClass: "glow-gold",
    nightInstruction: "",
    hasNightAction: false,
  },
  Witch: {
    name: "Witch",
    displayName: "Witch",
    team: "Village",
    description:
      "A dual-powered mystic. You possess one healing potion (save the werewolf victim) and one poison potion (kill any player). Each potion can only be used once per game.",
    nightOrder: 5,
    icon: "🧙‍♀️",
    color: "#7c3aed",
    glowClass: "glow-purple",
    nightInstruction:
      "Witch, open your eyes. The werewolves targeted someone tonight. Do you wish to act?",
    hasNightAction: true,
  },
  Bodyguard: {
    name: "Bodyguard",
    displayName: "Bodyguard",
    team: "Village",
    description:
      "A loyal protector. You can protect one player each night. If your protected target is attacked, you die in their place—a heroic sacrifice.",
    nightOrder: 2,
    icon: "🛡️",
    color: "#06b6d4",
    glowClass: "",
    nightInstruction:
      "Bodyguard, open your eyes. Point to the player you will guard with your life tonight.",
    hasNightAction: true,
  },
  Cupid: {
    name: "Cupid",
    displayName: "Cupid",
    team: "Village",
    description:
      "On the first night only, you link two players as lovers. If one lover dies, the other dies of heartbreak. The lovers' loyalty shifts—they now win together.",
    nightOrder: 0,
    icon: "💘",
    color: "#ec4899",
    glowClass: "",
    nightInstruction:
      "Cupid, open your eyes. Point to two players to link as lovers. (First night only)",
    hasNightAction: true,
  },
  SerialKiller: {
    name: "SerialKiller",
    displayName: "Serial Killer",
    team: "Neutral",
    description:
      "A lone predator with no allegiance. Each night you eliminate one player. You win if you are the last one standing. Both villagers and werewolves are your enemies.",
    nightOrder: 3,
    icon: "🗡️",
    color: "#6d28d9",
    glowClass: "glow-purple",
    nightInstruction:
      "Serial Killer, open your eyes. Choose your victim for tonight.",
    hasNightAction: true,
  },
  Jester: {
    name: "Jester",
    displayName: "Jester",
    team: "Neutral",
    description:
      "The chaos agent. You win if you get eliminated by a vote during the day phase. Act suspicious, manipulate, and get voted out—that's your goal.",
    nightOrder: 0,
    icon: "🃏",
    color: "#f59e0b",
    glowClass: "",
    nightInstruction: "",
    hasNightAction: false,
  },
};

export const ALL_ROLES: RoleName[] = [
  "Villager",
  "Werewolf",
  "Seer",
  "Doctor",
  "Hunter",
  "Witch",
  "Bodyguard",
  "Cupid",
  "SerialKiller",
  "Jester",
  "AlphaWerewolf",
  "WolfSeer",
  "Minion",
];

// Roles that act during night phase, sorted by nightOrder
export function getNightRoles(enabledRoles: RoleName[]): NightStepName[] {
  const steps: NightStepName[] = [];
  let wwTeamAdded = false;

  const sortedRoles = enabledRoles
    .filter((r) => ROLE_DEFINITIONS[r].hasNightAction)
    .sort((a, b) => ROLE_DEFINITIONS[a].nightOrder - ROLE_DEFINITIONS[b].nightOrder);

  for (const role of sortedRoles) {
    if (ROLE_DEFINITIONS[role].team === "Werewolf") {
      if (!wwTeamAdded) {
        steps.push("WerewolfTeam");
        wwTeamAdded = true;
      }
    } else {
      steps.push(role);
    }
  }

  return steps;
}
