import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleName } from "./roles";
import { ALL_ROLES } from "./roles";

// ============================================================
// TYPES
// ============================================================

export type GamePhase =
  | "setup"
  | "player-input"
  | "role-distribution"
  | "night"
  | "day"
  | "voting"
  | "end";

export interface Player {
  id: string;
  name: string;
  role: RoleName | null;
  isAlive: boolean;
  isRevealed: boolean; // for role distribution screen
  votes: number;
  loverId: string | null;
  status: "alive" | "dead" | "saved" | "protected";
}

export interface RoleConfig {
  role: RoleName;
  count: number;
  enabled: boolean;
}

export interface NightAction {
  role: "Werewolf" | "Seer" | "Doctor" | "Bodyguard" | "WitchHeal" | "WitchPoison" | "SerialKiller" | "Cupid";
  actorId: string | null;
  targetId: string | null;
}

export interface SeerResult {
  targetId: string;
  targetName: string;
  isEvil: boolean;
}

export interface NightResult {
  dead: string[];
  saved: string[];
  seerResults: SeerResult[];
  bodyguardDied: boolean;
  bodyguardSavedId: string | null;
  loversTriggered: boolean;
  loversDeadId: string | null;
}

export interface GameLog {
  round: number;
  phase: string;
  event: string;
  timestamp: number;
}

export interface GameSettings {
  tieBreaker: "no-elimination" | "random" | "revote";
  soundEnabled: boolean;
  allowDoctorSelfSave: boolean;
}

// ============================================================
// STORE
// ============================================================

interface GameStore {
  phase: GamePhase;
  players: Player[];
  roleConfigs: RoleConfig[];
  nightActions: NightAction[];
  nightResult: NightResult | null;
  currentNightStep: number; // index into night role sequence
  round: number;
  logs: GameLog[];
  settings: GameSettings;
  witchHealUsed: boolean;
  witchPoisonUsed: boolean;
  hunterActive: boolean; // hunter died and needs to shoot
  hunterId: string | null;
  jesterEliminatedByVote: boolean;
  jesterId: string | null;
  winCondition: "Village" | "Werewolf" | "SerialKiller" | "Jester" | null;
  eliminatedPlayerId: string | null; // last player eliminated by vote

  // Actions
  setPhase: (phase: GamePhase) => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  reorderPlayers: (players: Player[]) => void;
  setRoleConfig: (role: RoleName, count: number, enabled: boolean) => void;
  distributeRoles: () => boolean; // returns false if mismatch
  revealRole: (playerId: string) => void;
  setNightAction: (action: NightAction) => void;
  clearNightActions: () => void;
  setCurrentNightStep: (step: number) => void;
  applyNightResult: (result: NightResult) => void;
  addVote: (playerId: string, delta: number) => void;
  resetVotes: () => void;
  eliminatePlayer: (playerId: string, byVote?: boolean) => void;
  setHunterActive: (hunterId: string) => void;
  hunterShoot: (targetId: string) => void;
  setWinCondition: (cond: "Village" | "Werewolf" | "SerialKiller" | "Jester") => void;
  addLog: (event: string) => void;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetGame: () => void;
  nextRound: () => void;
}

const DEFAULT_ROLE_CONFIGS: RoleConfig[] = ALL_ROLES.map((role) => ({
  role,
  count: role === "Werewolf" ? 2 : role === "Villager" ? 4 : 1,
  enabled: ["Villager", "Werewolf", "Seer", "Doctor"].includes(role),
}));

const DEFAULT_SETTINGS: GameSettings = {
  tieBreaker: "no-elimination",
  soundEnabled: true,
  allowDoctorSelfSave: true,
};

const INITIAL_STATE = {
  phase: "setup" as GamePhase,
  players: [],
  roleConfigs: DEFAULT_ROLE_CONFIGS,
  nightActions: [],
  nightResult: null,
  currentNightStep: 0,
  round: 1,
  logs: [],
  settings: DEFAULT_SETTINGS,
  witchHealUsed: false,
  witchPoisonUsed: false,
  hunterActive: false,
  hunterId: null,
  jesterEliminatedByVote: false,
  jesterId: null,
  winCondition: null,
  eliminatedPlayerId: null,
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setPhase: (phase) => set({ phase }),

      addPlayer: (name) =>
        set((state) => {
          const num = state.players.length + 1;
          const playerName = name.trim() || `Player ${num}`;
          return {
            players: [
              ...state.players,
              {
                id: generateId(),
                name: playerName,
                role: null,
                isAlive: true,
                isRevealed: false,
                votes: 0,
                loverId: null,
                status: "alive",
              },
            ],
          };
        }),

      removePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      updatePlayerName: (id, name) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      reorderPlayers: (players) => set({ players }),

      setRoleConfig: (role, count, enabled) =>
        set((state) => ({
          roleConfigs: state.roleConfigs.map((rc) =>
            rc.role === role ? { ...rc, count, enabled } : rc
          ),
        })),

      distributeRoles: () => {
        const { players, roleConfigs } = get();
        const rolePool: RoleName[] = [];
        for (const rc of roleConfigs) {
          if (rc.enabled) {
            for (let i = 0; i < rc.count; i++) {
              rolePool.push(rc.role);
            }
          }
        }
        if (rolePool.length !== players.length) return false;
        const shuffled = shuffle(rolePool);
        const updatedPlayers = players.map((p, i) => ({
          ...p,
          role: shuffled[i],
          isRevealed: false,
        }));
        // Identify jester
        const jesterPlayer = updatedPlayers.find((p) => p.role === "Jester");
        set({
          players: updatedPlayers,
          jesterId: jesterPlayer?.id ?? null,
          phase: "role-distribution",
        });
        return true;
      },

      revealRole: (playerId) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, isRevealed: true } : p
          ),
        })),

      setNightAction: (action) =>
        set((state) => {
          const existing = state.nightActions.findIndex(
            (a) => a.role === action.role
          );
          if (existing >= 0) {
            const updated = [...state.nightActions];
            updated[existing] = action;
            return { nightActions: updated };
          }
          return { nightActions: [...state.nightActions, action] };
        }),

      clearNightActions: () => set({ nightActions: [] }),

      setCurrentNightStep: (step) => set({ currentNightStep: step }),

      applyNightResult: (result) => {
        set((state) => {
          let players = state.players.map((p) => {
            if (result.dead.includes(p.id)) {
              return { ...p, isAlive: false, status: "dead" as const };
            }
            if (result.saved.includes(p.id)) {
              return { ...p, status: "saved" as const };
            }
            return { ...p, status: "alive" as const };
          });

          // Check if hunter died
          let hunterActive = state.hunterActive;
          let hunterId = state.hunterId;
          for (const deadId of result.dead) {
            const deadPlayer = players.find((p) => p.id === deadId);
            if (deadPlayer?.role === "Hunter") {
              hunterActive = true;
              hunterId = deadId;
            }
          }

          return {
            players,
            nightResult: result,
            hunterActive,
            hunterId,
            round: state.round,
          };
        });
      },

      addVote: (playerId, delta) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId
              ? { ...p, votes: Math.max(0, p.votes + delta) }
              : p
          ),
        })),

      resetVotes: () =>
        set((state) => ({
          players: state.players.map((p) => ({ ...p, votes: 0 })),
        })),

      eliminatePlayer: (playerId, byVote = false) =>
        set((state) => {
          const player = state.players.find((p) => p.id === playerId);
          let jesterEliminatedByVote = state.jesterEliminatedByVote;
          let hunterActive = state.hunterActive;
          let hunterId = state.hunterId;

          if (player?.role === "Jester" && byVote) {
            jesterEliminatedByVote = true;
          }
          if (player?.role === "Hunter" && !hunterActive) {
            hunterActive = true;
            hunterId = playerId;
          }

          // Handle lovers
          let players = state.players.map((p) =>
            p.id === playerId
              ? { ...p, isAlive: false, status: "dead" as const }
              : p
          );

          // Lover chain
          if (player?.loverId) {
            const lover = players.find(
              (p) => p.id === player.loverId && p.isAlive
            );
            if (lover) {
              players = players.map((p) =>
                p.id === lover.id
                  ? { ...p, isAlive: false, status: "dead" as const }
                  : p
              );
            }
          }

          return {
            players,
            jesterEliminatedByVote,
            hunterActive,
            hunterId,
            eliminatedPlayerId: playerId,
          };
        }),

      setHunterActive: (hunterId) =>
        set({ hunterActive: true, hunterId }),

      hunterShoot: (targetId) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === targetId
              ? { ...p, isAlive: false, status: "dead" as const }
              : p
          ),
          hunterActive: false,
          hunterId: null,
        })),

      setWinCondition: (cond) => set({ winCondition: cond }),

      addLog: (event) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              round: state.round,
              phase: state.phase,
              event,
              timestamp: Date.now(),
            },
          ],
        })),

      updateSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),

      resetGame: () =>
        set({
          ...INITIAL_STATE,
          roleConfigs: DEFAULT_ROLE_CONFIGS,
          settings: get().settings,
        }),

      nextRound: () =>
        set((state) => ({
          round: state.round + 1,
          nightActions: [],
          nightResult: null,
          currentNightStep: 0,
          hunterActive: false,
          hunterId: null,
          jesterEliminatedByVote: false,
          players: state.players.map((p) => ({ ...p, status: p.isAlive ? "alive" : "dead", votes: 0 })),
        })),
    }),
    {
      name: "werewolf-game-state",
      partialize: (state) => ({
        phase: state.phase,
        players: state.players,
        roleConfigs: state.roleConfigs,
        nightActions: state.nightActions,
        nightResult: state.nightResult,
        currentNightStep: state.currentNightStep,
        round: state.round,
        logs: state.logs,
        settings: state.settings,
        witchHealUsed: state.witchHealUsed,
        witchPoisonUsed: state.witchPoisonUsed,
        jesterEliminatedByVote: state.jesterEliminatedByVote,
        jesterId: state.jesterId,
        winCondition: state.winCondition,
        hunterActive: state.hunterActive,
        hunterId: state.hunterId,
      }),
    }
  )
);
