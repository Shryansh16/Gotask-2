# GoTASK — Feature Inventory & Design Mapping Specification

> **Status:** Phase 1 & Phase 2 Complete (READ-ONLY AUDIT)  
> **Source of Truth:** Live GoTASK Codebase (`d:\React Native\GOTask`)  
> **Target:** Zero Feature Regression Guarantee across all UI Redesigns  

---

## 1. Complete Feature Inventory (Phase 1)

Every feature below has been directly verified in the live React Native source code (`src/`), contexts, components, and backend endpoints.

### Module 1: Navigation & Global Shell
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-NAV-001` | Root Stack Navigator | Horizontal iOS card transitions, 13 registered routes (`home`, `Drawer`, `FunctionScreen`, `Profile`, `Settings`, `CategoryScreen`, `PlanningScreen`, `FocusScreen`, `NotesScreen`, `GoalsScreen`, `HabitsScreen`, `UniversalSearchScreen`, `AnalyticsScreen`). Dynamic theme background. | `src/navigation/navigation.js` |
| `FEAT-NAV-002` | Side Drawer Navigation | Custom drawer panel (`DrawerComponent.js`) with active screen pills, custom vector icons, user profile summary (avatar, name, role, streak), dark/light toggle, cloud sync status indicator, version label. | `src/navigation/drawer.js`, `DrawerComponent.js` |
| `FEAT-NAV-003` | Persistent 5-Tab Bottom Bar | Elevate-style 5-tab tactile bottom navigation bar (`ElevateTabBar.js`) with tabs: `Today` (FunctionScreen), `Quests` (PlanningScreen), `Focus` (FocusScreen), `Habits` (HabitsScreen), `Me` (Profile). Active pill highlight with smooth tab switching. | `src/components/ElevateTabBar.js` |
| `FEAT-NAV-004` | Notch & Punch-Hole Screen Container | Safe area wrapper (`ScreenContainer.js`) utilizing `useSafeAreaInsets` to compute dynamic top padding (`Math.max(insets.top, 24)`) protecting OnePlus 11R punch-hole camera and tablet max-width clamp (680dp). | `src/design-system/ScreenContainer.js` |
| `FEAT-NAV-005` | Floating Action Button (FAB) | High-contrast circular action button with `+` icon, anchored at `bottom: 78` to cleanly float above `ElevateTabBar` without colliding with card text or checkboxes. | All core screens |
| `FEAT-NAV-006` | Universal Header | Notch-safe top header (`Header.js`) with drawer open trigger (`leftIcon="menu"`), screen title, dynamic subtitle ("Offline Active" / "Cloud Synced" / "Syncing..."), theme toggle button, and context action slots. | `src/design-system/Header.js` |

---

### Module 2: Dashboard & Task Management
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-TSK-001` | Dashboard Hero Overview | `StatsOverview.js`: 3-chip top strip (`🔥 Streak`, `⭐ XP`, `🛡️ League`), Sky Blue 3D hero card ("RECOMMENDED", "Hi, {Name}", "Daily Focus Journey", completion rate %, "Start Daily Focus" CTA), and 3-tile progress breakdown (Completed, In Progress, Efficiency). | `src/modules/StatsOverview.js` |
| `FEAT-TSK-002` | Live Search & Filter Bar | `SearchBar.js`: Live query text input with clear button (`X`), horizontal filter chips for status (`All`, `Pending`, `Done`) and priority (`Urgent`). | `src/modules/SearchBar.js` |
| `FEAT-TSK-003` | Focus Category Carousel | `Categories.js` & `CategoryCard.js`: Horizontal scrollable category tiles (All, Work, Personal, Shopping, Health, Study, Finance, Ideas) showing task count, pending count, active highlight, and "View Category →" link to `CategoryScreen`. | `src/modules/Categories.js`, `CategoryCard.js` |
| `FEAT-TSK-004` | Daily Motivation Spark | `QuotesBanner.js`: Daily rotating motivational quote / words-of-the-day with cycle button (`↻`) and author attribution. | `src/modules/QuotesBanner.js` |
| `FEAT-TSK-005` | Category Drill-Down Screen | `CategoryScreen.js`: Dedicated view for a selected category with progress header, local search, status filters (`All`, `Pending`, `Completed`), and sorted task cards (pinned first, then incomplete first). | `src/screens/CategoryScreen.js` |
| `FEAT-TSK-006` | Task Card Presentation | `TaskCard.js`: 6px category accent strip, category medallion, priority badge (High/Medium/Low), 26px rounded checkbox, title/description with strikethrough on completion, due date badge, Edit pill, and Delete pill with confirmation. | `src/components/TaskCard.js` |
| `FEAT-TSK-007` | Favorite / Pin Toggle | `TaskCard.js` & `TaskContext.js`: Golden star icon with hitSlop toggle pinning task to top of list without altering completion status. | `src/components/TaskCard.js`, `TaskContext.js` |
| `FEAT-TSK-008` | Subtasks Cascade Engine | `TaskCard.js` & `TaskContext.js`: Subtask progress tracking (`Subtasks: X/Y (Z%)`) with dynamic progress bar. Checking parent auto-completes subtasks; completing all subtasks auto-completes parent. | `src/components/TaskCard.js`, `TaskContext.js` |
| `FEAT-TSK-009` | Clear Completed Tasks | `YourTask.js`: "Clear Done" button with red check-circle icon visible only when completed tasks exist; purges completed items from active list with undo capability. | `src/modules/YourTask.js` |
| `FEAT-TSK-010` | Task Creation & Edit Modal | `TaskModal.js`: Modal with title input, description input, category pills, priority pills (high/medium/low with color coding), due date picker (Today, Tomorrow, Custom), subtask manager (add, remove, reorder), and save action. | `src/modules/TaskModal.js` |
| `FEAT-TSK-011` | Smart Natural Language Parser | `TaskModal.js` & `aiService.js`: "Smart Parse" button automatically extracting title, priority, due date, category, and subtasks from unstructured natural language input. | `src/modules/TaskModal.js`, `aiService.js` |
| `FEAT-TSK-012` | AI Subtask Decomposition | `TaskModal.js` & `aiService.js`: "AI Decompose" button generating context-aware subtask suggestions based on task title and category. | `src/modules/TaskModal.js`, `aiService.js` |
| `FEAT-TSK-013` | AI Task Review Confirmation Modal | `AIReviewModal.js`: Modal allowing users to review, edit confidence scores, and confirm AI-extracted task drafts before insertion. | `src/modules/AIReviewModal.js` |
| `FEAT-TSK-014` | Offline-First Task Storage & LWW Sync | `TaskContext.js`, `syncEngine.js`, `apiService.js`: Local AsyncStorage persistence, offline queue, Last-Write-Wins conflict resolution with `/api/tasks` backend. | `src/context/TaskContext.js`, `syncEngine.js` |

---

### Module 3: Notes & Personal Knowledge
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-NOT-001` | Knowledge Vault Metric Banner | `NotesScreen.js`: 3-stat metric banner displaying Total Notes count, Pinned Notes count, and Linked Tasks count. | `src/screens/NotesScreen.js` |
| `FEAT-NOT-002` | Notes Search & Filter System | `NotesScreen.js`: Live search input, segmented filter tabs (`All Notes`, `⭐ Pinned`, `📦 Archived`), and horizontal category chips. | `src/screens/NotesScreen.js` |
| `FEAT-NOT-003` | Note Card Presentation | `NoteCard.js`: 6px category accent strip, category medallion, gold star pin badge, title, preview excerpt, hashtag pills (`#tag`), formatted date (`🕒 31 Oct`), and action buttons (Archive/Unarchive, Edit, Delete). | `src/components/NoteCard.js` |
| `FEAT-NOT-004` | Task-to-Note Linking | `NoteCard.js` & `NoteModal.js`: Ability to link a note to any active task; displays "🔗 Linked: {Task Title}" on note card. | `src/components/NoteCard.js`, `NoteModal.js` |
| `FEAT-NOT-005` | Note Creation & Editor Modal | `NoteModal.js`: Title input, content multiline editor, category selector, hashtag manager (add/remove tags), task linker picker, pin checkbox, archive toggle, and delete action. | `src/modules/NoteModal.js` |
| `FEAT-NOT-006` | Undo Note Deletion | `NotesScreen.js` & `NoteContext.js`: Floating undo banner appearing immediately after deleting a note with "rotate-ccw" one-tap restore. | `src/screens/NotesScreen.js`, `NoteContext.js` |
| `FEAT-NOT-007` | Notes Persistence & Sync | `NoteContext.js`: Offline AsyncStorage persistence, REST endpoints `/api/notes`, optimistic state updates. | `src/context/NoteContext.js` |

---

### Module 4: Goals & Milestones
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-GOL-001` | Goal Mastery Metric Banner | `GoalsScreen.js`: Overall progress badge (`${avgProgress}% Avg Pace`), thick glowing progress bar, and 3-card metric strip: Total Goals, Achieved, At Risk. | `src/screens/GoalsScreen.js` |
| `FEAT-GOL-002` | Goal Status Filter Tabs | `GoalsScreen.js`: Segmented tabs filtering goals by `All`, `Active`, `Completed`, `At Risk`, `Archived`. | `src/screens/GoalsScreen.js` |
| `FEAT-GOL-003` | Goal Card Presentation | `GoalCard.js`: 6px category strip, category badge, status badge (`In Progress`, `Completed`, `Overdue`, `At Risk`, `Archived`), title, description, deadline pill (`📅 Due [Date]`), quantitative progress (`X / Y unit (Z%)`), and thick progress track. | `src/components/GoalCard.js` |
| `FEAT-GOL-004` | Interactive Milestone Checklist | `GoalCard.js` & `GoalContext.js`: Milestone checklist (`MILESTONES (X/Y)`) with tap-to-toggle checkmark (`toggleMilestone`), milestone deadlines, and strikethrough completion formatting. | `src/components/GoalCard.js`, `GoalContext.js` |
| `FEAT-GOL-005` | Quick Progress Logging Modal | `ProgressModal.js`: Dedicated modal allowing users to log numerical progress (e.g. `+5 km`), add progress notes, and view past entry history logs. | `src/modules/ProgressModal.js` |
| `FEAT-GOL-006` | Goal Creation & Edit Modal | `GoalModal.js`: Goal title, description, category selector, target numeric value & unit (e.g. `50 km`), deadline date picker, milestone builder (add/remove milestones), and AI Decompose trigger. | `src/modules/GoalModal.js` |
| `FEAT-GOL-007` | AI Goal Decomposition | `GoalModal.js` & `aiService.js`: "AI Decompose" button automatically generating actionable milestones with target dates. | `src/modules/GoalModal.js`, `aiService.js` |
| `FEAT-GOL-008` | Undo Goal Deletion | `GoalsScreen.js` & `GoalContext.js`: Undo banner restoring deleted goal and all associated milestones. | `src/screens/GoalsScreen.js`, `GoalContext.js` |

---

### Module 5: Habits & Routines
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-HAB-001` | Habit Momentum Header | `HabitsScreen.js`: Overall consistency header showing Total Habits, Completed Today count, and Weekly Consistency % (`${stats.consistencyRate}%`) with progress track. | `src/screens/HabitsScreen.js` |
| `FEAT-HAB-002` | Habit Filter Tabs & Categories | `HabitsScreen.js`: Filter tabs (`All Habits`, `Due Today`, `Done Today`, `Archived`) and horizontal category chips (`Health`, `Work`, `Personal`, `Learning`, `Fitness`, `Mindfulness`, `Finance`). | `src/screens/HabitsScreen.js` |
| `FEAT-HAB-003` | Habit Card Presentation | `HabitCard.js`: 6px category accent strip, category badge, flame streak badge (`🔥 Xd Streak`), title, description, recurrence schedule label (`Every Day`, `Weekdays`, `Custom`). | `src/components/HabitCard.js` |
| `FEAT-HAB-004` | 7-Day Circular Tracker Beads | `HabitCard.js`: 7 circular day indicators (Mon–Sun) showing completed checkmarks, skipped pause icons, future/unfilled states, and active pulsing ring on today's bead with tap-to-toggle. | `src/components/HabitCard.js` |
| `FEAT-HAB-005` | Streak Freeze / Skip Protection | `HabitCard.js` & `HabitContext.js`: "Skip Today" button allowing users to mark a session as skipped without breaking or resetting their consecutive streak count. | `src/components/HabitCard.js`, `HabitContext.js` |
| `FEAT-HAB-006` | Habit Creation & Edit Modal | `HabitModal.js`: Title, description, category, frequency selector (Daily, Weekdays, Weekends, Custom Days), target completion count, reminder time, and archive switch. | `src/modules/HabitModal.js` |
| `FEAT-HAB-007` | Undo Habit Deletion | `HabitsScreen.js` & `HabitContext.js`: Undo banner restoring deleted habit, streak count, and full 7-day history matrix. | `src/screens/HabitsScreen.js`, `HabitContext.js` |

---

### Module 6: Daily Planning & Quests
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-PLN-001` | Elevate Daily Quests System | `PlanningScreen.js` & `ElevateQuests.js`: "DAILY QUESTS" section with `⏳ 4 HOURS LEFT` countdown pill, streak extension progress bar with 3D gift box reward 🎁, and tactile quest challenge cards. | `src/components/ElevateQuests.js` |
| `FEAT-PLN-002` | Planned Capacity Hero Banner | `PlanningScreen.js`: Planned workload meter (`${todayEstimatedMinutes}m / ${dailyCapacityMinutes}m`), overload alert badge when exceeding capacity, workload balance analysis text, and capacity progress bar. | `src/screens/PlanningScreen.js` |
| `FEAT-PLN-003` | Workload Schedule Tabs | `PlanningScreen.js`: Individual spaced pill tabs: `Today (X)`, `Overdue (Y)`, `Upcoming (Z)` with active highlight. | `src/screens/PlanningScreen.js` |
| `FEAT-PLN-004` | Task Duration Quick Estimator | `PlanningScreen.js`: Quick-select estimate duration pills (`15m`, `25m`, `45m`, `60m`) updating task duration in real-time. | `src/screens/PlanningScreen.js`, `PlanningContext.js` |
| `FEAT-PLN-005` | Task Rescheduling Controls | `PlanningScreen.js`: Quick reschedule pills (`Today`, `Tomorrow`, `Next Week`) moving tasks across dates. | `src/screens/PlanningScreen.js`, `PlanningContext.js` |
| `FEAT-PLN-006` | Batch Overdue Reschedule | `PlanningScreen.js`: One-tap batch recovery buttons: "Reschedule All to Today" and "Reschedule All to Tomorrow" preventing planning bottlenecks. | `src/screens/PlanningScreen.js`, `PlanningContext.js` |
| `FEAT-PLN-007` | Start Focus Directly from Plan | `PlanningScreen.js`: "Focus" button on planning cards linking the selected task directly to a Pomodoro session and transitioning to `FocusScreen`. | `src/screens/PlanningScreen.js` |

---

### Module 7: Focus Mode & Deep Work
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-FOC-001` | Deep Work Pulse Banner | `FocusScreen.js`: 2-tile metric banner showing `${todayFocusMinutes}m Focused Today` and `${todayFocusSessions} Sessions Done`. | `src/screens/FocusScreen.js` |
| `FEAT-FOC-002` | Pomodoro Interval Mode Selector | `FocusTimer.js`: Segmented mode selector pills: `Focus (25m)`, `Short Break (5m)`, `Long Break (15m)`, `Custom`. | `src/components/FocusTimer.js` |
| `FEAT-FOC-003` | Circular Countdown Timer & Controls | `FocusTimer.js`: Circular timer display with minutes:seconds countdown, status label (`Ready`, `Focusing`, `Paused`, `Break`), and tactile 3D action button ("Start Focus" / "Pause" / "Resume" / "Reset"). | `src/components/FocusTimer.js` |
| `FEAT-FOC-004` | Active Focus Task Card & Subtasks | `FocusScreen.js`: Card displaying the actively focused task title, priority badge, inline subtasks checklist (`toggleSubtask`), and "Mark Done" action button. | `src/screens/FocusScreen.js` |
| `FEAT-FOC-005` | Task Picker Modal | `FocusScreen.js`: Modal with searchable task list allowing user to link or switch the active focus task mid-session. | `src/screens/FocusScreen.js` |
| `FEAT-FOC-006` | Elevate Recommended Workout Stepper Path | `ElevateRecommendedPath.js`: Sky Blue `#00A3FF` canvas with vertical stepper line, completed checkmark nodes, play node indicator, and mystery question box `?`. | `src/components/ElevateRecommendedPath.js` |
| `FEAT-FOC-007` | Science-Backed Focus Benefits Card | `FocusScreen.js`: Informational card explaining cognitive benefits of 25-minute Pomodoro cycles and interval rest. | `src/screens/FocusScreen.js` |

---

### Module 8: Analytics, Profile & Settings
| Feature ID | Screen / Component | Feature Description & Behavior | Verification Source |
|---|---|---|---|
| `FEAT-ANL-001` | Analytics Time Window Selector | `AnalyticsScreen.js`: Segmented tabs filtering metrics by `7d` (Last 7 Days), `30d` (Last 30 Days), `all` (All Time). | `src/screens/AnalyticsScreen.js` |
| `FEAT-ANL-002` | Weekly Activity Chart | `AnalyticsScreen.js`: Mon–Sun vertical day bars displaying completed task counts with proportional bar heights. | `src/screens/AnalyticsScreen.js` |
| `FEAT-ANL-003` | Cross-Module Velocity Metrics | `AnalyticsScreen.js`: Completion rate %, tasks/day velocity, habit consistency %, goal milestone pace %, and planned vs actual focus minutes comparison. | `src/screens/AnalyticsScreen.js` |
| `FEAT-ANL-004` | Factual Review Summary | `AnalyticsScreen.js` & `analyticsService.js`: Bullet-pointed review summary generated from factual activity metrics. | `src/screens/AnalyticsScreen.js`, `analyticsService.js` |
| `FEAT-PRF-001` | User Profile & Edit Modal | `Profile.js`: User avatar, name, email, role, daily goal target, and edit modal with validation. | `src/screens/Profile.js` |
| `FEAT-PRF-002` | Elevate Emerald League & Leaderboard | `ElevateLeagueLeaderboard.js`: Crowned Emerald League shield, tier progress, ranked competitor list, promotion cutoff banner (`▲▲ MOVING TO NEXT LEAGUE ▲▲`), and mint green user highlight card. | `src/components/ElevateLeagueLeaderboard.js` |
| `FEAT-PRF-003` | Gamified Achievements Showcase | `Profile.js`: 6 achievement badges (`Streak Master`, `Goal Crusher`, `High Velocity`, `Task Veteran`, `Perfectionist`, `Focus Warrior`) with locked/unlocked visual states and requirement descriptions. | `src/screens/Profile.js` |
| `FEAT-SET-001` | Appearance Studio | `Settings.js`: Theme mode selector with 3 options: `System Default`, `Light Mode`, `Dark Mode` with persistent state. | `src/screens/Settings.js` |
| `FEAT-SET-002` | REST API Server Manager & Ping Test | `Settings.js`: Server URL input, quick presets (Emulator `10.0.2.2:5000`, Localhost, Wi-Fi LAN), live ping health check (`/health`), and online/offline status pill. | `src/screens/Settings.js`, `apiService.js` |
| `FEAT-SET-003` | App Preferences Toggles | `Settings.js`: Switches for Sound Effects, Haptic Feedback, and Auto-Sync on Launch. | `src/screens/Settings.js` |
| `FEAT-SET-004` | Data Backup & Restore Engine | `Settings.js` & `backupService.js`: Export full structured JSON snapshot with SHA-256 checksum; validate and restore backup data. | `src/screens/Settings.js`, `backupService.js` |
| `FEAT-SET-005` | Data Management & Danger Zone | `Settings.js`: "Clear Completed", "Seed Sample Data", and "Reset All Data" with double confirmation alerts. | `src/screens/Settings.js` |
| `FEAT-SRC-001` | Universal Contextual Search | `UniversalSearchScreen.js`: Unified search across Tasks, Notes, Goals, and Habits with entity filter tabs and one-tap navigation to source item. | `src/screens/UniversalSearchScreen.js` |
| `FEAT-ONB-001` | Welcome Tour & Onboarding | `welcomeScreen.js`: Brand header ("Elevate Your Daily Momentum"), hero illustration, feature benefit cards (Smart Tasks, Pomodoro, Daily Streaks), and "Get Started →" CTA navigating to app. | `src/screens/welcomeScreen.js` |

---

## 2. Design Mapping & Coverage Matrix (Phase 2)

Below is the verification mapping between the existing features and the approved Stitch/Elevate visual design system:

| Feature ID | Feature Name | Current Implementation | Approved Stitch/Elevate Design Location | Preservation Plan (Skin vs. Engine) | Status in Stitch/Figma |
|---|---|---|---|---|---|
| `FEAT-NAV-001` | Root Stack Navigation | `navigation.js` | App Navigation Shell | Unchanged engine; card styles updated with theme background tokens. | `PRESERVED` |
| `FEAT-NAV-002` | Side Drawer Navigation | `drawer.js`, `DrawerComponent.js` | Side Drawer Panel | Styled with Elevate tactile pills and refined vector icons; all profile links intact. | `PRESERVED` |
| `FEAT-NAV-003` | 5-Tab Bottom Bar | `ElevateTabBar.js` | Bottom Navigation (`h-72px`) | Exact Elevate bottom bar styling with `#E0F2FE` active pill highlight; all 5 routes preserved. | `PRESERVED` |
| `FEAT-NAV-004` | Notch Safe Insets | `ScreenContainer.js` | Screen Container (`pt-10`) | Wrapped around every screen; preserves OnePlus 11R punch-hole camera margins. | `PRESERVED` |
| `FEAT-NAV-005` | Floating Action Button | All core screens | Bottom Right FAB (`bottom-78`) | Elevate 3D tactile button (`border-b-4 border-indigo-900`); anchored safely above tab bar. | `PRESERVED` |
| `FEAT-NAV-006` | Universal Header | `Header.js` | Top App Bar | Styled with Elevate 3D action buttons; sync status dot and theme toggle preserved. | `PRESERVED` |
| `FEAT-TSK-001` | Dashboard Hero Overview | `StatsOverview.js` | Dashboard Hero Banner | Sky Blue `#00A3FF` 3D card + 3-chip stat strip (`🔥 Streak`, `⭐ XP`, `🛡️ Emerald`). | `PRESERVED` |
| `FEAT-TSK-002` | Live Search & Filter Bar | `SearchBar.js` | Search & Filter Strip | Injected inside new 3D search box container; keeps status & priority chips. | `FLAGGED — Styled` |
| `FEAT-TSK-003` | Focus Category Carousel | `Categories.js` | Focus Categories Scroll | 3D tactile category cards with task counts and "View Category →" link preserved. | `PRESERVED` |
| `FEAT-TSK-004` | Daily Motivation Spark | `QuotesBanner.js` | Daily Spark Card | Elevate "Words of the day" ice-blue card with 3D cycle pill preserved. | `PRESERVED` |
| `FEAT-TSK-005` | Category Drill-Down | `CategoryScreen.js` | Category Detail Screen | Category hero card with progress bar, local search, and sorted task list preserved. | `PRESERVED` |
| `FEAT-TSK-006` | Task Card Presentation | `TaskCard.js` | Task List Item Tile | White/Midnight 3D card (`border-b-4`), 6px accent strip, 26px checkbox, due date badge. | `PRESERVED` |
| `FEAT-TSK-007` | Favorite / Pin Toggle | `TaskCard.js` | Star Medallion Badge | Warm amber star badge (`#FEF3C7`) replacing harsh orange borders; hitSlop preserved. | `PRESERVED` |
| `FEAT-TSK-008` | Subtasks Cascade Engine | `TaskCard.js` | Task Card Subtasks Row | **Stitch omitted subtask progress.** We explicitly preserve the `Subtasks: X/Y (Z%)` bar! | `FLAGGED — Reskinned` |
| `FEAT-TSK-009` | Clear Completed Tasks | `YourTask.js` | Agenda Section Header | Red "Clear Done" button beside task counter preserved in section header. | `PRESERVED` |
| `FEAT-TSK-010` | Task Create/Edit Modal | `TaskModal.js` | Task Sheet Modal | Full form with priority pills, due dates, subtasks manager preserved in 3D modal. | `PRESERVED` |
| `FEAT-TSK-011` | Smart Natural Language Parser | `TaskModal.js` | "Smart Parse" Button | Button styled with 3D bevel; parser logic in `aiService.js` completely preserved. | `PRESERVED` |
| `FEAT-TSK-012` | AI Subtask Decomposition | `TaskModal.js` | "AI Decompose" Button | Button styled with 3D bevel; subtask suggestion engine preserved. | `PRESERVED` |
| `FEAT-TSK-013` | AI Review Modal | `AIReviewModal.js` | AI Review Sheet | Full confidence scoring and editable draft card preserved. | `PRESERVED` |
| `FEAT-TSK-014` | Offline-First Task Sync | `TaskContext.js` | Backend Sync Pipeline | Zero changes to storage or sync logic; 100% preserved. | `PRESERVED` |
| `FEAT-NOT-001` | Knowledge Vault Banner | `NotesScreen.js` | Notes Metric Card | 3-column metric banner (`Total`, `Pinned`, `Linked`) reskinned into Elevate 3D tile. | `PRESERVED` |
| `FEAT-NOT-002` | Notes Search & Filters | `NotesScreen.js` | Search & Segmented Tabs | Search bar + tabs (`All Notes`, `Pinned`, `Archived`) + category chips preserved. | `PRESERVED` |
| `FEAT-NOT-003` | Note Card Presentation | `NoteCard.js` | Note Card Tile | 6px accent strip, title, excerpt, hashtags, formatted date, archive/edit/delete pills. | `PRESERVED` |
| `FEAT-NOT-004` | Task-to-Note Linking | `NoteCard.js`, `NoteModal.js` | Note Card Header | **Stitch omitted linked task pill.** We explicitly preserve `🔗 Linked: {Task}` badge! | `FLAGGED — Reskinned` |
| `FEAT-NOT-005` | Note Create/Edit Modal | `NoteModal.js` | Note Sheet Modal | Full editor with tag chips, linked task selector, and archive toggle preserved. | `PRESERVED` |
| `FEAT-NOT-006` | Undo Note Deletion | `NotesScreen.js` | Floating Undo Notice | Floating banner with "rotate-ccw" one-tap restore preserved. | `PRESERVED` |
| `FEAT-NOT-007` | Notes Persistence & Sync | `NoteContext.js` | Notes Storage Engine | Zero changes to storage engine; 100% preserved. | `PRESERVED` |
| `FEAT-GOL-001` | Goal Mastery Hero Banner | `GoalsScreen.js` | Goal Mastery Banner | Average Pace %, thick glowing progress track, and 3-stat metric tiles preserved. | `PRESERVED` |
| `FEAT-GOL-002` | Goal Status Filter Tabs | `GoalsScreen.js` | Status Filter Bar | Segmented tabs (`All`, `Active`, `Completed`, `At Risk`, `Archived`) preserved. | `PRESERVED` |
| `FEAT-GOL-003` | Goal Card Presentation | `GoalCard.js` | Goal Card Tile | 6px accent strip, status badge, quantitative progress (`X / Y unit`), progress track. | `PRESERVED` |
| `FEAT-GOL-004` | Milestone Checklist | `GoalCard.js` | Milestones Section | **Stitch omitted interactive milestone checklist.** We explicitly preserve it! | `FLAGGED — Reskinned` |
| `FEAT-GOL-005` | Quick Progress Modal | `ProgressModal.js` | Log Progress Sheet | Numeric value logger, progress notes, and history log preserved. | `PRESERVED` |
| `FEAT-GOL-006` | Goal Create/Edit Modal | `GoalModal.js` | Goal Sheet Modal | Full target value, unit, deadline date picker, and milestone builder preserved. | `PRESERVED` |
| `FEAT-GOL-007` | AI Goal Decomposition | `GoalModal.js` | "AI Decompose" Action | Milestone generation engine in `aiService.js` preserved. | `PRESERVED` |
| `FEAT-GOL-008` | Undo Goal Deletion | `GoalsScreen.js` | Floating Undo Banner | One-tap restore banner preserved. | `PRESERVED` |
| `FEAT-HAB-001` | Habit Momentum Header | `HabitsScreen.js` | Habit Momentum Card | Total Habits, Completed Today, and Weekly Consistency % bar preserved. | `PRESERVED` |
| `FEAT-HAB-002` | Habit Filter Tabs | `HabitsScreen.js` | Filter Segmented Row | Tabs (`All`, `Due Today`, `Done Today`, `Archived`) + category chips preserved. | `PRESERVED` |
| `FEAT-HAB-003` | Habit Card Presentation | `HabitCard.js` | Habit Card Tile | Category badge, flame streak badge (`🔥 Xd Streak`), recurrence schedule label. | `PRESERVED` |
| `FEAT-HAB-004` | 7-Day Tracker Beads | `HabitCard.js` | 7-Day Mini Timeline | **Stitch omitted 7-day circular beads.** We explicitly preserve Mon–Sun beads & tap-log! | `FLAGGED — Reskinned` |
| `FEAT-HAB-005` | Streak Freeze / Skip | `HabitCard.js` | "Skip Today" Action | Streak protection alert and freeze engine preserved. | `PRESERVED` |
| `FEAT-HAB-006` | Habit Create/Edit Modal | `HabitModal.js` | Habit Sheet Modal | Recurrence days selector, reminder time, and target count preserved. | `PRESERVED` |
| `FEAT-HAB-007` | Undo Habit Deletion | `HabitsScreen.js` | Floating Undo Banner | One-tap restore banner preserved. | `PRESERVED` |
| `FEAT-PLN-001` | Elevate Daily Quests | `PlanningScreen.js` | Daily Quests Section | Countdown pill, streak extension bar with 3D gift box 🎁, and challenge cards. | `PRESERVED` |
| `FEAT-PLN-002` | Planned Capacity Hero | `PlanningScreen.js` | Capacity Hero Card | Workload meter (`Xm / 480m`), overload warning, analysis text, progress bar. | `PRESERVED` |
| `FEAT-PLN-003` | Workload Schedule Tabs | `PlanningScreen.js` | Spaced Pill Tabs | Spaced 3D pill tabs (`Today`, `Overdue`, `Upcoming`) preserved. | `PRESERVED` |
| `FEAT-PLN-004` | Duration Estimator | `PlanningScreen.js` | Duration Quick Pills | Quick pills (`15m`, `25m`, `45m`, `60m`) updating task duration in real-time. | `PRESERVED` |
| `FEAT-PLN-005` | Task Rescheduling | `PlanningScreen.js` | Reschedule Action Row | Pills (`Today`, `Tomorrow`, `Next Week`) moving tasks across dates. | `PRESERVED` |
| `FEAT-PLN-006` | Batch Overdue Reschedule | `PlanningScreen.js` | Overdue Recovery Banner | "Reschedule All to Today / Tomorrow" batch action buttons preserved. | `PRESERVED` |
| `FEAT-PLN-007` | Start Focus from Plan | `PlanningScreen.js` | "Focus" Action Button | Starts session and navigates directly to `FocusScreen`. | `PRESERVED` |
| `FEAT-FOC-001` | Deep Work Pulse Banner | `FocusScreen.js` | Deep Work Pulse Card | 2-tile banner (`Focused Today` minutes and `Sessions Done`). | `PRESERVED` |
| `FEAT-FOC-002` | Pomodoro Mode Selector | `FocusTimer.js` | Mode Segmented Tabs | Mode pills (`Focus 25m`, `Short Break 5m`, `Long Break 15m`, `Custom`). | `PRESERVED` |
| `FEAT-FOC-003` | Countdown Timer & Actions | `FocusTimer.js` | Circular Pomodoro Timer | MM:SS countdown, tactile 3D action buttons ("Start Focus", "Pause", "Reset"). | `PRESERVED` |
| `FEAT-FOC-004` | Active Task Card & Subtasks | `FocusScreen.js` | Active Task Card | Active task title, priority, subtasks checklist, and "Mark Done" button. | `PRESERVED` |
| `FEAT-FOC-005` | Task Picker Modal | `FocusScreen.js` | Task Selector Modal | Searchable modal to link or switch tasks mid-session preserved. | `PRESERVED` |
| `FEAT-FOC-006` | Workout Stepper Path | `FocusScreen.js` | Elevate Stepper Path | Sky Blue `#00A3FF` path with checkmark nodes and mystery box preserved. | `PRESERVED` |
| `FEAT-FOC-007` | Focus Benefits Card | `FocusScreen.js` | Science Benefits Card | Cognitive interval benefits card preserved. | `PRESERVED` |
| `FEAT-ANL-001` | Analytics Time Selector | `AnalyticsScreen.js` | Time Window Tabs | Segmented pills (`7d`, `30d`, `all`) filtering all activity data. | `PRESERVED` |
| `FEAT-ANL-002` | Weekly Activity Chart | `AnalyticsScreen.js` | Day Activity Bars | Mon–Sun vertical chart bars showing task completions preserved. | `PRESERVED` |
| `FEAT-ANL-003` | Cross-Module Velocity | `AnalyticsScreen.js` | Velocity Metric Tiles | Completion rate, velocity, habit consistency, and goal pace preserved. | `PRESERVED` |
| `FEAT-ANL-004` | Factual Review Summary | `AnalyticsScreen.js` | Review Summary Card | Factual bullet-pointed review generated from metrics preserved. | `PRESERVED` |
| `FEAT-PRF-001` | Profile & Edit Modal | `Profile.js` | Profile Header & Sheet | Avatar, name, email, role, daily goal target, and edit modal preserved. | `PRESERVED` |
| `FEAT-PRF-002` | Emerald League Leaderboard | `Profile.js` | League Leaderboard Card | Crowned Emerald Shield, leaderboard contenders, promotion cutoff banner. | `PRESERVED` |
| `FEAT-PRF-003` | Achievements Showcase | `Profile.js` | Achievement Trophy Case | 6 gamified badges (`Streak Master`, `Goal Crusher`, etc.) with unlock states. | `PRESERVED` |
| `FEAT-SET-001` | Appearance Studio | `Settings.js` | Theme Option Buttons | `System Default`, `Light Mode`, `Dark Mode` options preserved. | `PRESERVED` |
| `FEAT-SET-002` | Server Manager & Ping | `Settings.js` | REST API Server Card | URL input, quick presets, live health ping (`/health`), and status pill. | `PRESERVED` |
| `FEAT-SET-003` | App Preferences | `Settings.js` | Preferences Card | Sound effects, haptics, and auto-sync switches preserved. | `PRESERVED` |
| `FEAT-SET-004` | Backup & Restore Engine | `Settings.js` | Backup & Restore Card | Export JSON snapshot with SHA-256; validate and restore backup data. | `PRESERVED` |
| `FEAT-SET-005` | Data Management | `Settings.js` | Danger Zone Card | "Clear Completed", "Seed Sample Data", and "Reset All Data" preserved. | `PRESERVED` |
| `FEAT-SRC-001` | Universal Search | `UniversalSearchScreen.js` | Search Screen | Cross-entity search with `All`, `Tasks`, `Notes`, `Goals`, `Habits` tabs. | `PRESERVED` |
| `FEAT-ONB-001` | Welcome Onboarding | `welcomeScreen.js` | Welcome Tour Screen | Brand header, hero illustration, 3 feature benefit tiles, "Get Started" CTA. | `PRESERVED` |

---

## 3. Flagged Missing Mappings & Resolution Protocol

During the audit, the following critical features were identified as typically **omitted by generic Stitch/Figma prototypes**:

1. **Subtasks Cascade & Progress Indicator (`FEAT-TSK-008`):**  
   - *Omission Risk:* Mockups showed single checkable task titles without showing subtasks, percentages, or progress tracks.  
   - *Preservation Action:* We will embed the existing subtask progress bar (`completedSubtasks / subtasks.length`) directly within the new 3D task card body, maintaining the cascading completion logic.
2. **Interactive 7-Day Habit Tracker Beads (`FEAT-HAB-004`):**  
   - *Omission Risk:* Mockups reduced habits to a simple checkmark button, dropping the historical 7-day circular bead matrix (Mon–Sun).  
   - *Preservation Action:* We will retain the full 7-day circular bead timeline inside the new 3D tactile card, with green checkmark beads for completed days and amber pause beads for streak-frozen skipped days.
3. **Goal Milestone Checklists & Units (`FEAT-GOL-004`):**  
   - *Omission Risk:* Mockups omitted the interactive milestone checklist and quantitative units (e.g., `22 km / 50 km (44%)`).  
   - *Preservation Action:* The milestone checklist and custom target unit display will be preserved inside the new 3D goal card layout.
4. **Task-to-Note Linking (`FEAT-NOT-004`):**  
   - *Omission Risk:* Mockups showed notes as isolated text cards without task association.  
   - *Preservation Action:* The "🔗 Linked: {Task Title}" badge will be styled as a clean tactile pill on the note card.
5. **Planned Capacity Overload Alert (`FEAT-PLN-002`):**  
   - *Omission Risk:* Mockups displayed total minutes without the dynamic overload warning algorithm.  
   - *Preservation Action:* The planned capacity mathematical engine (`todayEstimatedMinutes > dailyCapacityMinutes`) and alert banner will remain 100% active.

