"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/lib/gameStore";
import PhaseIndicator from "@/components/PhaseIndicator";
import SetupScreen from "@/components/screens/SetupScreen";
import PlayerInputScreen from "@/components/screens/PlayerInputScreen";
import RoleDistributionScreen from "@/components/screens/RoleDistributionScreen";
import NightPhaseScreen from "@/components/screens/NightPhaseScreen";
import DayPhaseScreen from "@/components/screens/DayPhaseScreen";
import VotingScreen from "@/components/screens/VotingScreen";
import EndScreen from "@/components/screens/EndScreen";

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.99 },
};

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.25,
};

export default function GameRouter() {
  const { phase } = useGameStore();

  const renderScreen = () => {
    switch (phase) {
      case "setup":             return <SetupScreen key="setup" />;
      case "player-input":     return <PlayerInputScreen key="player-input" />;
      case "role-distribution":return <RoleDistributionScreen key="role-distribution" />;
      case "night":            return <NightPhaseScreen key="night" />;
      case "day":              return <DayPhaseScreen key="day" />;
      case "voting":           return <VotingScreen key="voting" />;
      case "end":              return <EndScreen key="end" />;
      default:                 return <SetupScreen key="setup-default" />;
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ height: "100dvh", background: "var(--bg-primary)", overflow: "hidden" }}
    >
      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            phase === "night"
              ? "radial-gradient(ellipse at top, rgba(30,27,75,0.5) 0%, transparent 65%)"
              : phase === "day" || phase === "voting"
              ? "radial-gradient(ellipse at top, rgba(30,25,5,0.5) 0%, transparent 65%)"
              : "radial-gradient(ellipse at top, rgba(20,10,30,0.4) 0%, transparent 65%)",
        }}
      />

      {/* Main Centered Container */}
      <div
        className="relative z-10 w-full flex flex-col"
        style={{ maxWidth: 520, height: "100dvh" }}
      >
        <PhaseIndicator />

        {/* Screen Container */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
