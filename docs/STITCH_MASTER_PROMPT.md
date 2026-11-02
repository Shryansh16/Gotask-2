# GoTASK — Google Stitch Master Redesign Prompt

> **Tool Target:** Google Stitch (`stitch.withgoogle.com`)  
> **Output Standard:** Standalone HTML5 with Tailwind CSS and an explicit `<script>tailwind.config = { ... }</script>` block in `<head>`.  
> **Conversion Pipeline:** Direct compilation into React Native 0.71.4 components via `.agents/skills/stitch-react-native`.  
> **Target Device Viewport:** OnePlus 11R (`390 × 844 dp`, 20.1:9 aspect ratio, 120Hz AMOLED, punch-hole camera top inset, bottom gesture bar clearance).  

---

## 📋 How to Use This Master Prompt in Google Stitch

1. Open **[stitch.withgoogle.com](https://stitch.withgoogle.com)**.
2. Create a new mobile project named **GoTASK Mobile UI**.
3. Set the device canvas to **Mobile (390 × 844 dp)**.
4. Copy and paste the Master Prompt below (either the complete prompt or the specific Direction & Screen block you want to generate).
5. Once Stitch generates the HTML designs, download or link them to this project. Our installed `stitch::react-native` skill will automatically parse the `tailwind.config` tokens into `src/theme.ts` and compile the screens into production React Native components!

---

```markdown
# MASTER PROMPT: GoTASK Mobile App UI Redesign

## 1. PROJECT IDENTITY & CONTEXT
You are designing the complete mobile interface for **GoTASK**, an offline-first personal productivity and task execution application built on React Native CLI 0.71.4 for Android (primary target: OnePlus 11R, 390 × 844 dp viewport) and iOS.

Product Promise: "Capture anything, turn it into a plan, take action, and see measurable progress."

### Technical & Viewport Constraints:
- Viewport: Exact mobile canvas `390px × 844px`.
- Safe Areas: Punch-hole camera status bar at top (minimum `pt-10` / 44px top padding). Bottom system gesture bar (minimum `pb-6` / 24px bottom clearance).
- Touch Targets: Every interactive button, checkbox, and tab has a minimum touch target of 44 × 44 dp.
- Offline-First Status: The app operates locally. Display an unobtrusive "Offline Active" or "Synced" subtle indicator in the top app bar.
- Code Output Standard: Clean, semantic HTML5 with Tailwind CSS. In the `<head>`, include `<script src="https://cdn.tailwindcss.com"></script>` followed by an explicit `<script>tailwind.config = { theme: { extend: { ... } } }</script>` defining every custom color, font family, border-radius, and tactile shadow bevel.

---

## 2. THE THREE DISTINCT DESIGN DIRECTIONS

You must generate screens for one or all of the following three design directions:

### DIRECTION A: PLAYFUL EDITORIAL (Elevate & Duolingo Inspired)
- **Personality:** Engaging, tactile, energetic, friendly, and structured.
- **Canvas & Surfaces:**
  - Light Mode: Luminous pure white (`#FFFFFF`) cards on a warm, soft slate-50 (`#F8FAFC`) background. Hero banners in vibrant Sky Blue (`#00A3FF`).
  - Dark Mode: Rich charcoal-slate canvas (`#0F172A`) with midnight elevated surfaces (`#1E293B`).
- **Signature 3D Tactile Bevels:**
  - Cards and action buttons have physical depth via a solid `border-b-4` bevel:
    - Light Mode cards: `border border-slate-200 border-b-4 border-b-slate-300 rounded-2xl`
    - Hero Sky Blue cards: `bg-[#00A3FF] border-b-4 border-b-[#0082CC] text-white rounded-2xl`
    - Dark Mode cards: `border border-slate-800 border-b-4 border-b-slate-900 rounded-2xl`
- **Typography:** Rounded, friendly, high-legibility sans-serif (`Poppins` / `Plus Jakarta Sans`), weights 500, 600, 700.
- **Badges & Gamification:** Playful streak chips (`🔥 7 Days`), XP stars (`⭐ 240 XP`), and League shields (`🛡️ Emerald League`). No neon outlines; pinned items use a warm amber star badge with subtle tint.

### DIRECTION B: PREMIUM PRODUCTIVITY (Linear & Things 3 Inspired)
- **Personality:** Confident, sleek, minimal, hyper-focused, and editorial.
- **Canvas & Surfaces:**
  - Light Mode: Pure white (`#FFFFFF`) with ultra-subtle off-white zinc borders (`#F4F4F5` / `#E4E4E7`).
  - Dark Mode: Deep true ink (`#090D16` / `#0D1117`) with rich graphite panels (`#161B22`).
- **Signature Styling:**
  - Restrained cards: Information is separated by generous whitespace, subtle hairline dividers (`border-t border-slate-100 dark:border-slate-800`), and crisp typographic weights instead of heavy boxed borders.
  - Accent Color: Single high-contrast electric cobalt accent (`#2563EB` light / `#3B82F6` dark).
- **Typography:** Crisp editorial geometry (`Inter` / `SF Pro Display`), strict hierarchical sizing, high line heights for comfortable reading.
- **Interaction Elements:** Thin 1.5px circular checkboxes, micro progress pills, subtle monochrome icons.

### DIRECTION C: MODERN CREATIVE (Craft & Raycast Inspired)
- **Personality:** Bold, contemporary, expressive, and visually dynamic.
- **Canvas & Surfaces:**
  - Light Mode: Cream-tinted paper background (`#FBFBFA`) with crisp elevated cards (`#FFFFFF`) and floating soft shadows.
  - Dark Mode: Obsidian black (`#050505`) with deep smoky quartz card layers (`#121214`).
- **Signature Styling:**
  - Vibrant Dual-Tone Accents: Cyber Violet (`#8B5CF6`) + Sunset Amber (`#F59E0B`) + Mint Energy (`#10B981`).
  - Visual Depth: Layered floating cards with subtle colored glow borders (`border border-violet-500/20 shadow-lg shadow-violet-500/5`).
  - Creative Progress Elements: Radial segmented progress rings, gradient-fill horizontal tracks, and asymmetric category pills.
- **Typography:** Bold expressive headings (`Cabinet Grotesk` or `Outfit`) paired with functional mono metadata (`JetBrains Mono`).

---

## 3. CORE COMPONENT ARCHITECTURE (Present on All Screens)

1. **Persistent Top App Bar:**
   - Left: Menu/Drawer icon (3 horizontal lines) or Back arrow.
   - Center: App title "GoTASK" with subtle status dot ("Offline Active" or subtitle).
   - Right: Quick Theme toggle button (Sun/Moon icon) + Cloud sync icon.
2. **Elevate-Style 5-Tab Tactile Bottom Navigation Bar:**
   - Fixed at bottom of screen (`h-[72px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800`).
   - 5 Navigation Items:
     - 1. **Today** (Calendar check icon) -> Dashboard & Daily Agenda
     - 2. **Quests** (Compass/Scroll icon) -> Daily Planning & Workload Quests
     - 3. **Focus** (Timer / Target icon) -> Pomodoro & Deep Work Session
     - 4. **Habits** (Flame / Repeat icon) -> Habits & 7-Day Consistency Beads
     - 5. **Me** (User avatar / Trophy icon) -> Profile, League & Achievements
   - Active Tab Indicator: Rounded pill highlight (`bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-semibold`).
3. **Floating Action Button (FAB):**
   - Circle button (`w-14 h-14 rounded-full shadow-xl flex items-center justify-center font-bold text-2xl text-white`).
   - Anchored at bottom-right (`bottom-[86px] right-5`) so it floats cleanly above the bottom navigation bar without overlapping card content or checkboxes.

---

## 4. DETAILED SPECIFICATIONS FOR THE 5 CORE SCREENS

### SCREEN 1: DASHBOARD (Home & Today's Agenda)
- **Top Motivational Stat Strip:**
  - 3 tactile stat chips side-by-side:
    - `🔥 7 Days Streak` (Orange badge)
    - `⭐ 340 XP` (Amber badge)
    - `🛡️ Emerald League` (Mint badge)
- **Hero Daily Recommendation Card:**
  - Direction A: Sky Blue `#00A3FF` 3D card: "Today's Focus: Sprint Architecture" + 25m estimate pill + White tactile "Start Daily Focus →" button.
  - Direction B: Refined slate card with micro progress ring (65% daily velocity) + minimalist action link.
  - Direction C: Gradient violet-to-cyan card with dynamic workload progress track.
- **Section Header:** "Today's Agenda" with counter pill badge `(5)` + "Clear Done" action button.
- **Interactive Task Cards:**
  - Card 1 (In Progress): Category strip "Work" (Purple pill `#8B5CF6`) + Priority "High" (Rose pill `#F43F5E`) + Pin Star.
    - Title: "Complete Mobile App Architecture Revamp"
    - Subtitle: "Ensure offline-first sync, clean Poppins typography, and modern cards."
    - Subtasks: `Subtasks: 3/4` with a 75% filled progress bar.
    - Footer: "📅 Today" pill, "✏️ Edit" button, "🗑️ Delete" button.
  - Card 2 (Unchecked): Category "Shopping" (Orange `#F97316`) + Priority "Low" (Teal `#14B8A6`).
    - Title: "Organic groceries for week meal prep"
    - Description: "Buy fresh veggies, Greek yogurt, berries, and chia seeds."
    - Subtasks: `0/2 (0%)` with empty progress bar.
    - Footer: "📅 Tomorrow" pill.
  - Card 3 (Completed): Category "Health" (Emerald `#10B981`) + Priority "Medium" (Amber `#F59E0B`).
    - Title: "Daily 30-min HIIT & Stretches" (Strikethrough text with green checkmark box).
    - Subtasks: `2/2 (100%)` with full emerald progress bar.

---

### SCREEN 2: TASKS SCREEN (Full Task Inventory & Filters)
- **Search & Filter Header:**
  - Search input with magnifying glass: "Search tasks, subtasks, tags..."
  - Horizontal scrollable Category Filter Chips:
    - `[All (12)]` (Active filled pill)
    - `[Work (5)]`
    - `[Personal (3)]`
    - `[Shopping (2)]`
    - `[Health (2)]`
    - `[Study (1)]`
- **Priority Filter Row:** Quick segmented tabs: `[All Priorities]`, `[High 🔴]`, `[Medium 🟡]`, `[Low 🟢]`.
- **Task List Presentation:**
  - Tactile task tiles with 26 × 26 dp rounded checkboxes on the left.
  - Pinned tasks highlighted with a warm golden star and subtle amber tint (never harsh neon borders).
  - Multi-level subtask progress checklist visible on expand.
  - Swipe or card action row (Edit, Delete, Set Reminder).
  - Empty state fallback: Friendly vector illustration of a clean desk with "All caught up! Tap + to plan your next victory."

---

### SCREEN 3: NOTES & KNOWLEDGE VAULT
- **Knowledge Vault Summary Card:**
  - 3-column metric banner:
    - `Total Notes: 14`
    - `Pinned: 3`
    - `Linked Tasks: 5`
- **Search & Tag Filter Bar:**
  - Search input: "Search notes, tags, content..."
  - Filter segmented tabs: `[All Notes]`, `[⭐ Pinned]`, `[📦 Archived]`.
  - Category tag pills: `#work`, `#sprint`, `#guide`, `#retro`, `#ideas`.
- **Note Cards Grid / List:**
  - Card 1 (Pinned): Category "Work" pill + Gold star icon.
    - Title: "Welcome to GoTASK Notes 📝"
    - Excerpt: "Capture fleeting thoughts, project ideas, and documentation. You can link notes directly to your tasks, organize them by category, or pin critical guides to the top."
    - Tag chips: `#guide`, `#overview`
    - Footer: "🕒 31 Oct" • "📦 Archive" • "✏️ Edit" • "🗑️ Delete"
  - Card 2: Category "Work" pill.
    - Title: "Sprint Retrospective & Action Items"
    - Excerpt: "Key takeaways: 1. Complete Phase 3 Notes implementation. 2. Keep accessibility labels on all interactive buttons. 3. Audit battery consumption on OnePlus 11R."
    - Tag chips: `#sprint`, `#retro`
    - Footer: "🕒 31 Oct" • "📦 Archive" • "✏️ Edit" • "🗑️ Delete"

---

### SCREEN 4: GOALS & TARGETS (Milestones & Long-term Vision)
- **Goal Mastery Hero Banner:**
  - Header: "🎯 GOAL MASTERY" with progress pill: `60% Avg Pace`.
  - Metrics row: `Total: 4` | `In Progress: 3` | `Achieved: 1` | `At Risk: 0`.
  - Thick glowing multi-segment progress bar.
- **Status Filter Tabs:** `[All]`, `[Active]`, `[Completed]`, `[At Risk]`.
- **Goal Cards:**
  - Card 1 (Health):
    - Category "Health" pill + Status pill "In Progress" (Indigo).
    - Title: "Complete 50km Running Challenge 🏃"
    - Description: "Build aerobic endurance and cardiovascular health with weekly 10km runs."
    - Target Deadline: "📅 Due 22 Nov 2026"
    - Quantitative Progress: `22 km / 50 km (44%)` with a thick rounded progress track.
    - Milestones Checklist section:
      - `[✓] First 10km baseline run` (Checked, strikethrough)
      - `[ ] 25km half-way checkpoint` (Unchecked)
      - `[ ] Final 50km endurance run` (Unchecked)
  - Card 2 (Career / Study):
    - Category "Study" pill + Status pill "Active".
    - Title: "Master System Design & Microservices"
    - Target: `4 / 6 Modules (67%)` with progress bar.

---

### SCREEN 5: HABITS & RITUALS (Daily Streaks & Consistency)
- **Habit Momentum Header:**
  - "🔥 HABIT CONSISTENCY" • `85% This Week` • 5 Active Habits.
- **Frequency Selector:** `[Daily Habits]`, `[Weekly Rituals]`.
- **Habit Cards:**
  - Card 1: Category "Health" pill + Streak flame badge `🔥 14 Days`.
    - Title: "Morning 15-min Meditation"
    - Recurrence: "Every Day • Morning Routine"
    - 7-Day Tracker Beads (Circular day indicators Mon - Sun):
      - Mon: `[✓]` (Green filled)
      - Tue: `[✓]` (Green filled)
      - Wed: `[✓]` (Green filled)
      - Thu: `[✓]` (Green filled)
      - Fri: `[✓]` (Green filled)
      - Sat: `[✓]` (Green filled)
      - Sun: `[ Today ]` (Active pulsing ring, tap to complete)
  - Card 2: Category "Study" pill + Streak badge `🔥 5 Days`.
    - Title: "Read 20 pages of technical book"
    - Recurrence: "Mon, Wed, Fri, Sat • Evening"
    - 7-Day Tracker Beads showing completed, rest day, and active states.

---

## 5. COMPLETE TAILWIND CONFIG & CODE REQUIREMENTS

To guarantee that `.agents/skills/stitch-react-native` can parse and translate your designs into native React Native code, each output file MUST follow this exact structure:

```html
<!DOCTYPE html>
<html lang="en" class="light"> <!-- or class="dark" -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoTASK - Screen Name</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              primary: '#00A3FF',    // Elevate Sky Blue
              primaryDark: '#0082CC',
              accent: '#8B5CF6',     // Creative Violet
              amber: '#F59E0B',      // Streak flame
              emerald: '#10B981',    // Completed green
              rose: '#F43F5E',       // High priority
            },
            surface: {
              canvasLight: '#F8FAFC',
              cardLight: '#FFFFFF',
              canvasDark: '#0F172A',
              cardDark: '#1E293B',
              borderLight: '#E2E8F0',
              borderDark: '#334155',
            }
          },
          boxShadow: {
            'tactile': '0 4px 0 0 #CBD5E1',
            'tactile-dark': '0 4px 0 0 #0F172A',
            'tactile-primary': '0 4px 0 0 #0082CC',
          },
          borderRadius: {
            '2xl': '18px',
            '3xl': '24px',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-100 dark:bg-slate-950 flex justify-center items-center min-h-screen p-0 m-0">

  <!-- Mobile Viewport Container: OnePlus 11R (390 x 844 dp) -->
  <div class="w-[390px] h-[844px] bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 relative overflow-hidden flex flex-col font-sans shadow-2xl">
    
    <!-- Status Bar & Top Safe Area (pt-10) -->
    <!-- Top App Bar with Offline Active & Theme Toggle -->
    <!-- Screen Scrollable Content (overflow-y-auto pb-36 px-4) -->
    <!-- Floating Action Button (+ at bottom-24 right-5) -->
    <!-- Persistent 5-Tab Bottom Navigation Bar (fixed bottom-0) -->

  </div>
</body>
</html>
```

---

## 6. GENERATION CHECKLIST FOR GOOGLE STITCH

When creating each screen:
1. **Ensure exact dimensions:** `390px × 844px` canvas.
2. **Never generate generic placeholder text:** Use the realistic GoTASK task names, descriptions, categories, and metrics provided above.
3. **Implement tactile 3D depth:** Use solid bottom borders/bevels (`border-b-4`) on cards and buttons.
4. **Preserve safe clearances:** `pt-10` top padding for camera notch; `pb-36` on scroll views so bottom navigation and FAB never obscure content or action buttons.
5. **Color coherence:** Light theme uses clean white cards with crisp slate borders; Dark theme uses rich navy/slate backgrounds (`#0F172A`) with high-contrast text and luminous badges.
```

