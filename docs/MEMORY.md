# MEMORY.md — GoTASK Durable Project Memory

> **Last Updated:** 2026-11-04 (Phase 34 Active)  
> **Repository:** https://github.com/Shryansh16/Gotask-2  
> This file contains the complete durable context, active architecture, TypeSafe/Jev decision model specifications, and verified milestone evidence for GoTASK.

---

## 1. Project Identity & Architecture Baseline

* **Project:** GoTASK
* **Repository:** https://github.com/Shryansh16/Gotask-2
* **Target Hardware:** OnePlus 11R (6.74", 2772×1240, 20.1:9 aspect ratio, Android 13/14, 120Hz Fluid AMOLED, punch-hole camera inset).
* **Framework & Runtime:** Bare React Native 0.71.4 (React 18.2.0, Metro 0.73.8). Native Android (`android/`) & iOS (`ios/`) harnesses. Zero Expo runtime.
* **Styling Engine:** `@shopify/restyle@2.4.2` + Elevate Tactile 3D Design Tokens (`src/styles/theme.js`).
* **Navigation Architecture:** Hybrid React Navigation system:
  * Root Stack Navigator (`src/navigation/navigation.js`)
  * Drawer Navigator (`src/navigation/drawer.js` with `DrawerComponent.js`)
  * Persistent 5 Core Tactile Bottom Bar (`src/components/ElevateTabBar.js`)
* **State Management:** Layered React Context providers (`ThemeProvider`, `TaskProvider`, `PlanningProvider`, `NoteProvider`, `GoalProvider`, `HabitProvider`) wrapped in `src/App.js`.
* **Backend & Persistence:** Node.js REST API (`backend/server.js`), atomic tmp-file staging on `backend/data/db.json` with SHA-256 integrity checksums and Last-Write-Wins (LWW) conflict resolution. Offline-first local persistence via AsyncStorage.

---

## 2. Elevate Labs Tactile Design Benchmark

* **Benchmark Standard:** Elevate (Elevate Labs - Brain Training) physical UI benchmarks:
  * **Primary Canvas:** Luminous Pure White (`#FFFFFF`) / Slate-50 (`#F8FAFC`).
  * **Special/Hero Canvas:** Energetic Sky Blue (`#00A3FF` / `#0082CC`) for recommended workouts and daily focus sessions.
  * **3D Tactile "Bevel":** Every card and button features a solid `borderBottomWidth: 4px` in a darker tint (`#CBD5E1` for white cards, `#0082CC` for sky blue, `#16A34A` for mint active cards, `#BAE6FD` for ice-blue cards).
  * **No Neon Outlines:** Pinned tasks and notes use a warm amber star badge with subtle tint (`#FEF3C7`), completely replacing harsh orange full-card borders.
  * **Signature 5-Tab Core Bottom Bar (`ElevateTabBar.js`):**
    * `Today` (`#00A3FF`) -> `FunctionScreen` (Dashboard & Today's Agenda)
    * `Tasks` (`#00A3FF`) -> `TasksScreen` (Backlog & Task Inventory)
    * `Vault` (`#00A3FF`) -> `NotesScreen` (Knowledge Vault)
    * `Goals` (`#00A3FF`) -> `GoalsScreen` (Goals Mastery & Stepper)
    * `Habits` (`#00A3FF`) -> `HabitsScreen` (Habits & Consistency)
    * Active tab displays an Elevate rounded pill highlight (`#E0F2FE` with 1.5px border `#BAE6FD`).
  * **Gamified Quests (`ElevateQuests.js`):** Section header with `⏳ 4 HOURS LEFT` countdown pill, streak extension progress bar with 3D gift box reward 🎁, and tactile challenge cards.
  * **Emerald League & Leaderboard (`ElevateLeagueLeaderboard.js`):** Crowned emerald shield, ranked contender list, promotion cutoff banner (`▲▲ MOVING TO NEXT LEAGUE ▲▲`), and mint green user card highlight.
  * **Recommended Workout Stepper Path (`ElevateRecommendedPath.js`):** Sky Blue `#00A3FF` canvas with vertical connecting line, checkmark nodes, active play indicator node, and mystery box `?`.
  * **Non-Colliding Device Geometry & Native Border Engine:**
    * `ScreenContainer.js` computes safe top padding (`Math.max(insets.top, 24)`) to eliminate punch-hole camera clipping.
    * Replaced disparate `borderLeftWidth: 6` on rounded cards with `overflow: 'hidden'` and 6px inner `accentStrip` across `TaskCard`, `NoteCard`, `GoalCard`, `HabitCard` to prevent Android canvas corner clipping.
    * Registered `FunctionScreen`, `Profile`, and `Settings` in root `Stack.Navigator` (`navigation.js`) for crash-free bottom bar transitions.
    * FAB elevated to `bottom: 78` to cleanly hover above `ElevateTabBar`.
    * All scroll views padded to `paddingBottom: 150`.

---

## 3. Product Phases Implementation Status (As of 2026-11-04)

| Phase | Description | Status | Evidence Verified |
|---|---|---|---|
| **Phase 0** | Baseline Repository & Harness Audit | `DONE` | Bare React Native 0.71.4, Node.js REST API, clean Git tree. |
| **Phase 1** | Core Task Management (CRUD, Subtasks, Priorities) | `DONE` | `TaskContext.js`, `TaskCard.js`, cascade completion, undo stack. |
| **Phase 2** | Design System & UI Foundation | `DONE` | Theme tokens, dark/light modes, accessibility font scaling. |
| **Phase 3** | Notes & Personal Knowledge | `DONE` | `NoteContext.js`, `NoteCard.js`, `NoteModal.js`, `NotesScreen.js`. |
| **Phase 4** | Goals, Milestones, and Progress | `DONE` | `GoalContext.js`, `GoalCard.js`, `GoalsScreen.js`, progress tracking. |
| **Phase 5** | Habits, Routines, and Reminders | `DONE` | `HabitContext.js`, `HabitCard.js`, 7-day timeline, streak engine. |
| **Phase 6** | Planning, Time Management & Focus Mode | `DONE` | `PlanningContext.js`, `PlanningScreen.js`, `FocusScreen.js`, `FocusTimer.js`. |
| **Phase 7** | Intelligent Features & AI Assistance | `DONE` | `aiService.js`, NLP task parsing, `AIReviewModal.js`, goal decomposition. |
| **Phase 8** | Analytics & Motivation Dashboard | `DONE` | `analyticsService.js`, `motivationService.js`, `AnalyticsScreen.js`. |
| **Phase 9** | Data Reliability, Backup, and Synchronization | `DONE` | `migrationService.js`, `backupService.js`, `syncEngine.js` (LWW conflict resolution). |
| **Phase 10** | Production Readiness & Release Engineering | `DONE` | `CriticalUserJourneys-test.tsx`, CI pipeline (`ci.yml`), `ReleaseReadiness.md`. |
| **Phase 11** | Elevate-Grade Tactile 3D Redesign & Gamification | `DONE` | `ElevateTabBar`, `ElevateQuests`, `ElevateLeagueLeaderboard`, `ElevateRecommendedPath`, bevels, insets. |
| **Phase 30** | Create Task Modal 1:1 Stitch Alignment | `DONE` | `TaskModal.js` with natural language AI parsing, mic input, subtask checklist, priority matrix, due dates. |
| **Phase 31** | Universal Context Hook Aliases & Drawer Runtime Fix | `DONE` | Dual singular/plural exports across all contexts (`useGoal`/`useGoals`, etc.), resolved all `TypeError` exceptions. |
| **Phase 32** | Create Master Goal Modal 1:1 Stitch Alignment | `DONE` | `GoalModal.js` with emoji squircle, motivation, 3-tier metrics, checkpoint node path tree, velocity multipliers. |
| **Phase 33** | Landing / Welcome Screen 1:1 Stitch Alignment | `DONE` | `welcomeScreen.js` with Monogram squircle header, Sprint Engine v2.4, live sprint preview card stack, 3 value badges, tour modal. |
| **Phase 34** | Hamburger Drawer Button, Sprints Modal & Profile in Drawer | `DONE` | `FunctionScreen.js` (hamburger icon), `StatsOverview.js` (sprint streams modal with `+ Add Sprint`, focus session launcher), `DrawerComponent.js` (Profile in Core Spaces & tappable hero), locked `ElevateTabBar.js`. |

---

## 4. TypeSafe & Jev Decision Models Integration

* **Concept:** TypeSafe's **Jev** is a System One Decision Model designed for calibrated, typed judgments on application state.
* **Architecture in GoTASK:** "Judgments from Jev, Decisions in Code" via Decision Truth Tables:
  1. **Focus Session State Transitions (`PlanningContext.js`):**
     * `evaluateFocusTransition(currentState, action, elapsedSeconds)`: Uses deterministic decision tables mapping `IDLE`, `RUNNING`, `PAUSED`, `BREAK`, `COMPLETED` actions to valid next states.
     * Prevents invalid timer state corruption during deep focus sprint sessions.
  2. **Daily Workload Capacity Engine (`PlanningContext.js`):**
     * `evaluateDayWorkload(estimatedMinutes, capacityMinutes)`: Calculates capacity ratios and assigns categorical status:
       * `ratio <= 0.8` -> `OPTIMAL` (safe workload)
       * `ratio <= 1.0` -> `HEAVY` (target reached)
       * `ratio > 1.0` -> `OVERLOAD` (triggers batch overdue rescheduling)
  3. **Habit Streak & Decay Model (`HabitContext.js`):**
     * `evaluateHabitMomentum()`: Evaluates consistency rates and determines automatic streak freeze protection eligibility.
* **Execution Mode:**
  * Currently operating as high-performance, offline-deterministic System One decision truth tables directly inside the React Native JavaScript runtime.
  * Compatible with TypeSafe live cloud client (`api.typesafe.ai`) via `.agents/skills/typesafe-ai` when live network credentials are provided.

---

## 5. Verified Automated Test Baselines (100% Green)

* **Jest Mobile Test Suite (`cmd.exe /c "npm test -- --watchAll=false"`):**
  * **Result: 11/11 Test Suites Passed, 113/113 Tests Passed (100%)**
  * Test suites verified:
    1. `CriticalUserJourneys-test.tsx` (CUJ A, B, C, D complete user flows)
    2. `PlanningContext-test.tsx` (workload calculation, duration estimates, session logs)
    3. `TaskContext-test.tsx` (CRUD, subtask toggling, priority filters, search)
    4. `IntelligentFeatures-test.tsx` (NLP parsing, goal decomposition, AI suggestions)
    5. `DataReliability-test.tsx` (schema migrations, JSON backup export/import, LWW sync)
    6. `Analytics-test.tsx` (metrics, consistency rates, activity bars, review summaries)
    7. `Theme-test.tsx` (system, light, and dark mode transitions)
    8. `HabitContext-test.tsx` (recurrence, streaks, skipped sessions, 7-day timeline)
    9. `NoteContext-test.tsx` (CRUD, category filtering, search, pinning)
    10. `GoalContext-test.tsx` (milestones, progress updates, status classification)
    11. `App-test.tsx` (root rendering, provider tree mounting)
* **Backend REST API Suite (`node backend/test.js`):**
  * **Result: 21/21 REST Endpoints Passed (100%)**
  * Health check, NLP parsing, task CRUD, agent dispatch, audit logging, productivity stats, focus sessions, planning capacity, AI decomposition/subtasks/recovery, analytics overview, backup export/import, and LWW sync reconciliation.
* **Code Quality & Linter:**
  * **0 errors, 0 warnings** across all files.

---

## 6. Active Key Components Directory

```
src/
├── components/
│   ├── ElevateTabBar.js             # 5-tab core bottom navigation bar (Today, Tasks, Vault, Goals, Habits)
│   ├── ElevateQuests.js             # Elevate daily quests challenge system
│   ├── ElevateLeagueLeaderboard.js  # Elevate emerald league shield & contenders
│   ├── ElevateRecommendedPath.js    # Elevate sky-blue workout stepper path
│   ├── TaskCard.js                  # 3D tactile white task card with category strip
│   ├── NoteCard.js                  # 3D tactile note card with star medallion
│   ├── GoalCard.js                  # 3D tactile goal card with progress track
│   ├── HabitCard.js                 # 3D tactile habit card with 7-day tracker
│   ├── FocusTimer.js                # Tactile circular Pomodoro timer
│   └── EmptyState.js                # Editorial empty state illustration
├── design-system/
│   ├── ScreenContainer.js           # OnePlus 11R notch & punch-hole safe wrapper
│   ├── Header.js                    # Notch-safe editorial header with 3D buttons
│   ├── Card.js                      # Primitive 3D tactile card
│   └── Button.js                    # Primitive 3D tactile button
├── modules/
│   ├── StatsOverview.js             # High-Impact Sprint Hero, Active Sprint Streams modal with + New Sprint
│   ├── DrawerComponent.js           # Kinetic navigation drawer with Profile in Core Spaces & tappable hero
│   ├── TaskModal.js                 # 1:1 Create Task bottom sheet modal with NLP & subtasks
│   ├── GoalModal.js                 # 1:1 Create Master Goal bottom sheet modal with checkpoints tree
│   ├── HabitModal.js                # 1:1 Create Habit bottom sheet modal with push beads
│   └── YourTask.js                  # Today's Agenda & Backlog inventory
├── screens/
│   ├── welcomeScreen.js             # 1:1 Minimalist Modern Cadence landing screen
│   ├── FunctionScreen.js            # Today Dashboard with hamburger drawer button
│   ├── TasksScreen.js               # Tasks Backlog & Inventory
│   ├── NotesScreen.js               # Knowledge Vault with hashtag cloud & markdown
│   ├── GoalsScreen.js               # Goals & Targets with milestone tracks
│   ├── GoalDetailScreen.js          # Goals deep-dive milestone stepper
│   ├── HabitsScreen.js              # Habits & Rituals with 7-day circular tracker
│   ├── FocusScreen.js               # Distraction-free focus mode session
│   ├── Profile.js                   # Profile with Emerald League leaderboard & trophies
│   ├── Settings.js                  # Appearance Studio & Cloud sync manager
│   ├── AnalyticsScreen.js           # Productivity metrics & EPQ trends
│   └── UniversalSearchScreen.js     # Contextual search across all entities
```

---

## 7. Durable Session Guidelines

1. **Keep Progress.md & MEMORY.md Synchronized**: Whenever changes or phase completions occur, update `docs/Progress.md` and `docs/MEMORY.md` immediately in the same turn with exact test counts and verified evidence.
2. **Never Break Working Logic**: Maintain 100% test pass guarantee (113/113 Jest tests, 21/21 backend tests). Zero API regressions.
3. **Elevate Design Preservation**: Always preserve 3D bottom bevels (`borderBottomWidth: 4px`), clean white/sky-blue canvas, and the 5 core bottom tabs across all screens.
4. **Physical Device Compliance**: Always preserve `insets.top` in headers and `bottom: 78` for floating action buttons to protect OnePlus 11R punch-hole cameras and gesture bars.
