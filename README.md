# 🐺 Werewolf Moderator Assistant

A modern, mobile-first moderator tool for running offline **Werewolf** (Mafia) social deduction games. Built for a single device used by the game moderator while players sit together in the same room.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff0055?logo=framer)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)

---

## 🎮 What Is This?

This is **NOT** a multiplayer online game.

It is a **single-device assistant tool** used by a moderator while players are physically present around a table. The app handles all the complex logic — role distribution, night phase resolution, voting — so the moderator can focus on storytelling and keeping the game fun.

---

## ✨ Features

- 🎭 **Role Setup** — Toggle and configure roles and their counts before the game starts
- 👥 **Player Management** — Add, edit, and remove players with inline editing
- 🔒 **Private Role Reveal** — Each player taps their name privately to see their role (tap-to-reveal modal with auto-close timer)
- 🌙 **Night Phase Guidance** — Step-by-step role caller that walks the moderator through each night action in the correct order
- ⚔️ **Automatic Night Resolution** — All interactions (protection, kills, poison) resolved automatically with correct priority rules
- ☀️ **Day Phase Announcement** — Results displayed clearly with moderator script ready to announce
- 🗳️ **Voting System** — Live vote tally with +/− controls, tie detection, and elimination confirmation
- 🏆 **Win Condition Detection** — Automatically detects Village, Werewolf, Serial Killer, and Jester wins
- 💾 **Auto-Save** — Game state persisted to localStorage, survives accidental browser refreshes

---

## 🧙 Supported Roles

| Role | Team | Night Action |
|---|---|---|
| 🧑‍🌾 Villager | Village | None |
| 🐺 Werewolf | Werewolf | Chooses a player to eliminate |
| 🔮 Seer | Village | Reveals whether a player is good or evil |
| 💉 Doctor | Village | Protects one player from death |
| 🏹 Hunter | Village | Shoots one player when eliminated |
| 🧪 Witch | Village | One heal potion + one poison potion |
| 🛡️ Bodyguard | Village | Protects a player, dies in their place |
| 💘 Cupid | Village | Links two lovers (round 1 only) |
| 🔪 Serial Killer | Neutral | Kills one player per night |
| 🃏 Jester | Neutral | Wins if voted out by the village |

### Night Resolution Priority
```
Protection (Doctor / Bodyguard) → Kill (Werewolf / SK) → Poison (Witch)
```

---

## 🃏 How to Play

### Setup (Moderator Only)

1. **Open the app** on the moderator's phone or tablet
2. Go to **Role Setup** — toggle which roles are in this game and set the count for each role
3. Go to **Players** — add the name of every player joining the game
4. Tap **Distribute Roles** — roles are randomly assigned

### Role Distribution (Private)

5. Pass the device around the table
6. Each player **taps their own name** to privately view their role for 12 seconds
7. After all players have seen their role, the moderator taps **Begin Night Phase**

### Night Phase

8. The app guides the moderator through each role one by one
9. Ask each role's player(s) to silently perform their action:
   - *"Werewolves, open your eyes. Point to your victim."*
   - *"Werewolves, close your eyes."*
   - *"Seer, open your eyes. Point to the player you wish to divine."* — app reveals their alignment
10. Tap **Next Role** after each action, or **Skip** if the role player is dead
11. After all roles have acted, tap **End Night**

### Day Phase (Dawn Breaks)

12. The app shows who died / was saved during the night
13. Read the **Moderator Announce** script to the players
14. Players discuss openly — anyone can accuse, defend, or bluff
15. When ready, tap **Begin Voting**

### Voting

16. Players raise hands to vote for who they suspect
17. Moderator taps **+** to add votes to each player
18. Tap **Eliminate [Name]** to confirm the vote-out, or **Skip** if there's a tie
19. The eliminated player's role is revealed, and the next night begins

### Win Conditions

| Condition | Winner |
|---|---|
| All werewolves eliminated | 🏡 Village wins |
| Werewolves equal or outnumber villagers | 🐺 Werewolves win |
| Serial Killer is last one standing | 🔪 Serial Killer wins |
| Jester is voted out by the village | 🃏 Jester wins |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework (App Router) |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Zustand** | Global game state management |
| **Lucide React** | Icons |

---

## 📁 Project Structure

```
werewolfmod/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # Entry point
│   └── globals.css         # Global styles & CSS variables
├── components/
│   ├── GameRouter.tsx      # Phase-based screen router
│   ├── PhaseIndicator.tsx  # Fixed header with phase info
│   ├── PlayerSelector.tsx  # Reusable player selection grid
│   ├── FullscreenModal.tsx # Blur overlay modal
│   └── screens/
│       ├── SetupScreen.tsx           # Role configuration
│       ├── PlayerInputScreen.tsx     # Player name entry
│       ├── RoleDistributionScreen.tsx # Private role reveal
│       ├── NightPhaseScreen.tsx      # Night actions
│       ├── DayPhaseScreen.tsx        # Dawn results
│       ├── VotingScreen.tsx          # Vote tally
│       └── EndScreen.tsx             # Game over / standings
└── lib/
    ├── gameStore.ts        # Zustand store (full game state)
    ├── nightResolution.ts  # Night action logic & win conditions
    └── roles.ts            # Role definitions & night order
```

---

## 👤 Author

Made by **Rasyid** — [github.com/rasyidspace](https://github.com/rasyidspace)
