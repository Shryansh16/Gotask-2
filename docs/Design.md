# GoTASK — Design System & UI/UX Specification

**Version:** 1.1  
**Status:** Proposed implementation specification  
**Scope:** Existing GoTASK React Native application  
**Source of truth:** The Product Requirements Document (PRD) defines feature scope and phase ordering. This document defines design behavior and implementation standards.

---

## 1. Design Vision

GoTASK should feel like a calm, dependable place to organize life, make progress, and focus on what matters.

**Product promise:** Open GoTASK. Know what matters. Focus on what comes next.

The experience should encourage regular use without overwhelming users with bright colors, unnecessary cards, excessive notifications, animations, or complicated navigation.

### Design principles

1. **Calm by default:** Neutral surfaces, restrained accent colors, and clear typography.
2. **Fast to use:** Common actions should require minimal navigation and interaction.
3. **Progress without pressure:** Present progress constructively; avoid guilt-based messaging.
4. **Accessible by design:** Support text scaling, screen readers, sufficient contrast, and reduced motion.
5. **Consistent across screens:** Components use shared tokens rather than individual styling decisions.
6. **Offline-aware:** Core interactions remain usable without an internet connection wherever the underlying feature supports offline operation.
7. **Honest UI:** Never show progress, synchronization, AI results, or success states that the system has not actually confirmed.

## 2. Implementation Order and Phase Alignment

The PRD remains authoritative. Do not create a second, conflicting roadmap in this document.

| Order | Work | Design responsibility |
|---|---|---|
| Phase 0 | Repository and architecture audit | Identify existing screens, navigation, dependencies, styling, and platform configuration. |
| Phase 1 | Reliable core tasks | Preserve existing behavior and identify UI defects without redesigning the entire application prematurely. |
| Phase 2 | Design system and UI foundation | Introduce verified theme integration, tokens, shared components, and consistent styling. |
| Phase 3 | Notes | Apply the shared design system to note-taking experiences. |
| Phase 4 | Goals and progress | Introduce goal cards, milestones, and progress visualization when supported by the feature implementation. |
| Phase 5 | Habits and reminders | Standardize habit controls, reminder settings, and streak presentation. |
| Phase 6 | Planning and Focus Mode | Implement the PRD's Focus Mode milestone, including P6.5, using the shared components and tokens. |
| Later phases | AI, analytics, data reliability, production readiness, and optional cloud features | Design only the interfaces needed when each capability is scheduled and supported. |

**Important:** Phase 1 is an audit and stabilization stage, not permission to replace existing architecture. Phase 2 must build on what the audit discovers.

## 3. Repository Audit Before Implementation

Do not assume the source directory, navigation library, theme implementation, or icon package.

Before changing the UI, inspect:

- `package.json` and the lockfile to establish the actual React Native version and installed dependencies.
- `app.json`, `app.config.*`, native project directories, and build scripts to determine whether the application uses Expo or bare React Native.
- Existing screens, reusable components, navigation configuration, and styling conventions.
- Current theme settings, persistent preferences, and any existing design tokens.
- Hardcoded color values, typography, spacing, border radii, and platform-specific styles.
- Current icon libraries and existing accessibility implementations.
- Test files, screenshot coverage, and current baseline behavior.

### Required audit output

Produce a short report containing:

1. Verified project structure and entry points.
2. Current navigation and screen inventory.
3. Existing theme and styling approach.
4. Hardcoded-style inventory and highest-impact inconsistencies.
5. Installed dependencies and any proposed additions.
6. Compatibility risks and recommended migration steps.

Only after this audit should the final token and component file locations be selected.

A directory such as `src/shared/design-system/` is a possible organization, **not an assumed existing path**. Follow the established project structure unless there is a documented reason to change it.

## 4. Visual Language

### 4.1 Color tokens

Use neutral backgrounds and surfaces with a muted teal accent. Accent colors should indicate interaction and meaningful status, not decorate every screen.

The following values are proposed starting tokens. Validate contrast and visual consistency before adoption.

| Token | Light | Dark |
|---|---|---|
| Background | `#F7F8FA` | `#121518` |
| Surface | `#FFFFFF` | `#1B2025` |
| Secondary surface | `#F0F2F5` | `#242B31` |
| Primary text | `#20262E` | `#EDF1F4` |
| Secondary text | `#626B78` | `#B0BAC4` |
| Tertiary text | `#7B8490` | `#9AA5B0` |
| Border | `#E1E5EA` | `#303940` |
| Accent | `#286B68` | `#78B8B0` |
| Subtle accent | `#E6F2F0` | `#223C3A` |
| Success | `#28734D` | `#86C9A1` |
| Warning | `#94651B` | `#E7BE78` |
| Danger | `#B83B40` | `#F08D91` |

Rules:

- Use semantic token names rather than referencing raw colors throughout screen components.
- Do not rely on color alone to communicate status; add text, icons, or other meaningful indicators.
- Validate text and interactive-state contrast against their actual backgrounds.
- Do not introduce gradients or extra accent colors without a clear product requirement.
- Test subtle borders and muted text in both themes before release.

## 5. React Native Theme Architecture

### 5.1 Theme modes

Support three user preferences:

- **System:** Follow the device's appearance setting.
- **Light:** Keep GoTASK in light mode regardless of system appearance.
- **Dark:** Keep GoTASK in dark mode regardless of system appearance.

System mode should be the initial default unless an existing product requirement or saved preference dictates otherwise.

### 5.2 Theme provider

Implement a shared theme provider using the project's existing React Native conventions.

Responsibilities:

- Store the user's selected theme preference.
- Resolve the effective theme from the preference and system appearance.
- Expose semantic color tokens and other design tokens to descendants.
- Update the UI when the system appearance changes in System mode.
- Persist the user's explicit preference using the project's established settings-storage mechanism.
- Avoid duplicating theme-selection logic in individual screens.

Use React Native's `useColorScheme()` for reactive system appearance and `Appearance` where an explicit API operation is needed. Verify the installed React Native version and behavior before implementation.

Conceptual example:

```tsx
type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

function resolveTheme(
  preference: ThemePreference,
  systemScheme: ResolvedTheme | null
): ResolvedTheme {
  if (preference !== 'system') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}
```

This is an example of the resolution rule, not a claim about the project's existing code.

### 5.3 Styling contract

- Shared components receive their styles from semantic theme tokens.
- Screen-specific styling must not introduce a parallel theme system.
- Avoid scattered inline color literals.
- Do not make a global theme change that unintentionally alters business logic.
- Theme changes must not reset navigation state, task state, form input, or active focus sessions.
- Test appearance changes on both iOS and Android.

### 5.4 Reduced motion

Use React Native's `AccessibilityInfo` APIs to detect and respond to reduced-motion preferences where supported by the installed version and platform.

When reduced motion is enabled:

- Remove or shorten nonessential transitions.
- Avoid decorative pulsing, bouncing, and continuous animation.
- Preserve immediate visual feedback for actions.
- Do not make information understandable only through animation.

Respect system preferences and test on actual supported devices.

### 5.5 Text scaling and accessibility

Define a documented `maxFontSizeMultiplier` policy for text components.

- Prefer supporting the user's system text-size setting.
- Avoid globally disabling font scaling.
- Set component-specific maximum multipliers only when justified by layout constraints.
- Ensure labels, task titles, buttons, and navigation remain readable at large text sizes.
- Allow text to wrap instead of truncating essential task or note content.
- Test layouts with large accessibility text sizes and screen readers.

Use meaningful accessibility labels, roles, and state descriptions for custom interactive controls. Verify implementation against the installed React Native APIs.

### 5.6 Platform-specific elevation

iOS and Android do not render shadows identically. Define shared elevation levels by intent, with platform-specific implementations where needed.

| Level | Use | iOS | Android |
|---|---|---|---|
| None | Flat surfaces, list rows | No shadow | No elevation |
| Subtle | Raised controls or small menus | Low-opacity shadow | Low elevation |
| Raised | Dialogs and floating surfaces | More visible shadow | Higher elevation |
| Overlay | Modal surfaces when appropriate | Platform-appropriate shadow | Platform-appropriate elevation |

Do not copy iOS shadow properties to Android and assume they will behave identically. Use `Platform.select()` or the project's existing platform-style abstraction where appropriate.

Keep elevation restrained; use surface contrast and borders before adding shadows.

## 6. Typography and Spacing

### Typography

**Decision (Adopted):** The repository includes bundled, licensed **Poppins** geometric fonts (`src/common/fonts.js`). Poppins is retained as GoTASK's primary typeface to provide a modern, calm, and readable aesthetic with system sans-serif as fallback.

| Style | Proposed size | Weight / Font Family | Use Case |
|---|---:|---|---|
| Display | 32 | `Poppins-Bold` | Hero banners, focus timer |
| Heading 1 | 28 | `Poppins-Bold` | Primary screen titles |
| Heading 2 | 23 | `Poppins-Bold` | Modal headers, card section titles |
| Heading 3 | 19 | `Poppins-Regular` (Semibold feel) | Task card titles, group headers |
| Body large | 17 | `Poppins-Regular` | Task descriptions, notes body |
| Body | 16 | `Poppins-Regular` | Default inputs, row content |
| Small | 14 | `Poppins-Regular` | Subtasks, metadata badges |
| Label | 13 | `Poppins-Bold` | Button labels, chip text |
| Caption | 12 | `Poppins-Light` | Timestamp, secondary metadata |

Sizes are in React Native logical units scaled responsively via `textScale()` / `RFValue()`.

Rules:

- Establish a consistent hierarchy rather than using arbitrary point sizes.
- Use `Poppins-Bold` for prominent headings and `Poppins-Regular` for high readability in body content.
- Keep body text comfortable to read with proper line-height (`1.4` to `1.5` ratio).
- Avoid using small caption text for essential interactive controls.
- Check wrapping and clipping at increased accessibility text sizes (`maxFontSizeMultiplier`).

### Spacing

Use a 4-unit spacing base.

| Token | Value |
|---|---:|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 20 |
| `space-6` | 24 |
| `space-8` | 32 |
| `space-10` | 40 |
| `space-12` | 48 |

Use these tokens consistently for padding, gaps, and layout. Avoid arbitrary values unless a specific platform or accessibility requirement warrants them.

### Shape

- Small controls: 8-unit radius.
- Standard controls: 12-unit radius.
- Larger surfaces: 16-unit radius.
- Prominent containers: 20-unit radius where appropriate.
- Pills: fully rounded ends.

Do not wrap every section in a card. Prefer clean screen layouts and separators when they provide enough structure.

## 7. Navigation

### Initial bottom navigation

Start with four primary destinations:

1. **Today** — today's tasks and quick-add.
2. **Tasks** — the full task list, filters, and task management.
3. **Goals** — goals and milestones when implemented.
4. **Notes** — notes when implemented.

Place secondary features, settings, archived items, and other less-frequent destinations behind an appropriate menu or secondary navigation surface.

Implementation rules:

- Audit the existing navigation library before changing routes.
- Preserve working routes and deep links where applicable.
- Provide clear active-tab states.
- Use consistent icon sizing and labels.
- Respect device safe areas.
- Ensure the navigation remains usable with larger text.
- Do not add a fifth bottom tab simply because another feature exists.

If Goals or Notes are not yet implemented, do not create nonfunctional tabs that imply otherwise. Phase the navigation changes alongside the relevant feature releases.

## 8. Dashboard: Today + Quick-Add

The initial dashboard must not depend on AI recommendations, goal analytics, or other future functionality.

### Initial layout

1. A calm greeting or date heading.
2. A concise summary of today's tasks, based on actual task data.
3. A list of relevant tasks for today.
4. A prominent quick-add action.
5. A clear empty state when no tasks are scheduled.

### Quick-add behavior

- Allow the user to create a task without navigating through a complex form.
- Make the task title the primary input.
- Offer optional details through a secondary interaction.
- Show a clear saved or failed state.
- Preserve input when a recoverable failure occurs.
- Respect offline capabilities supported by the current data layer.

### Future enhancements

Only introduce the following when the underlying features and data are implemented:

- Next recommended task.
- Active goal progress.
- AI-generated daily plans.
- Cross-feature progress summaries.

Do not display fabricated progress, placeholder recommendations, or empty widgets presented as completed functionality.

## 9. Shared Component Specifications

These are initial contracts for the shared design system. Confirm existing components and dependencies during the repository audit before creating replacements.

### 9.1 Button

| Property | Specification |
|---|---|
| Variants | `primary`, `secondary`, `tertiary`, `danger` |
| Sizes | `small`, `medium`, `large` |
| Core props | `label`, `variant`, `size`, `disabled`, `loading`, `onPress`, `accessibilityLabel` |
| States | Default, pressed, disabled, loading, focused where applicable |
| Behavior | Prevent duplicate submission while loading; expose loading status accessibly |
| Constraints | Adequate touch target; label remains readable at larger text sizes |

Use primary buttons sparingly. A screen should have a clear primary action rather than multiple competing primary buttons.

### 9.2 Task Row

| Property | Specification |
|---|---|
| Variants | `default`, `compact`, `selected` |
| Sizes | `comfortable`, `compact` |
| Core props | `task`, `onToggleComplete`, `onPress`, `onLongPress`, `disabled`, `accessibilityLabel` |
| States | Incomplete, completed, selected, disabled, pressed |
| Optional content | Due date, priority, category, subtask count |
| Behavior | Completion changes must reflect the confirmed application state |

Do not show every metadata field on every row. Prioritize the task title and completion action.

### 9.3 Task Editor

| Property | Specification |
|---|---|
| Variants | `create`, `edit` |
| Sizes | Responsive to available screen space; not a visual size variant |
| Core props | `initialTask`, `onSave`, `onCancel`, `saving`, `error` |
| States | Pristine, dirty, saving, validation error, save error |
| Fields | Title required; description and supported task metadata optional |
| Behavior | Prevent accidental data loss and avoid duplicate submissions |

Only expose fields supported by the existing domain model or the phase being implemented.

### 9.4 Goal Card

| Property | Specification |
|---|---|
| Variants | `default`, `compact` |
| Sizes | `comfortable`, `compact` |
| Core props | `goal`, `onPress`, `disabled` |
| States | Active, completed, paused where supported, disabled |
| Content | Goal title and actual progress data when available |
| Behavior | Never infer progress from incomplete or unrelated data |

Implement this component during the Goals phase, not as a dependency of the initial dashboard.

### 9.5 Progress Indicator

| Property | Specification |
|---|---|
| Variants | `linear`, `circular` if required |
| Sizes | `small`, `medium`, `large` |
| Core props | `value`, `maximum`, `label`, `status`, `accessibilityLabel` |
| States | Normal, complete, unavailable, loading where applicable |
| Behavior | Validate bounds and handle unavailable values explicitly |

Use meaningful accessible descriptions. Do not use color alone to convey completion.

### 9.6 Input and Search

| Property | Specification |
|---|---|
| Variants | `text`, `multiline`, `search` |
| Sizes | `small`, `medium`, `large` |
| Core props | `value`, `onChangeText`, `placeholder`, `label`, `error`, `disabled` |
| States | Default, focused, populated, disabled, error |
| Behavior | Support keyboard dismissal and appropriate keyboard types |

Keep labels accessible. Placeholder text must not be the only label for an essential input.

### 9.7 Chip

| Property | Specification |
|---|---|
| Variants | `filter`, `category`, `status` |
| Sizes | `small`, `medium` |
| Core props | `label`, `selected`, `disabled`, `onPress` |
| States | Selected, unselected, disabled, pressed |
| Behavior | Make selection state clear without relying on color alone |

Use chips for compact filters or metadata, not as a substitute for a clear navigation structure.

### 9.8 Dialog and Modal

| Property | Specification |
|---|---|
| Variants | `confirmation`, `form`, `information` |
| Sizes | Content-driven, bounded by the viewport |
| Core props | `visible`, `title`, `onDismiss`, `onConfirm`, `confirmLabel`, `cancelLabel`, `loading` |
| States | Open, closed, submitting, error |
| Behavior | Respect safe areas, focus, and platform back/dismiss behavior |

Use confirmation dialogs for destructive or difficult-to-reverse actions, not for every routine action.

### 9.9 Bottom Navigation Item

| Property | Specification |
|---|---|
| Variants | `active`, `inactive`, `disabled` |
| Sizes | One consistent navigation size |
| Core props | `label`, `icon`, `selected`, `onPress`, `accessibilityLabel` |
| States | Active, inactive, disabled, pressed |
| Behavior | Provide a clear selected state and accessible destination name |

Keep the four primary destinations consistent across the app.

### 9.10 Icon

| Property | Specification |
|---|---|
| Variants | Semantic icons for navigation, actions, status, and metadata |
| Sizes | 16, 20, 24, 32 logical units where appropriate |
| Core props | `name`, `size`, `color`, `accessibilityLabel` |
| States | Default, disabled, active where applicable |
| Behavior | Decorative icons should not create redundant screen-reader announcements |

**Icon library decision:** Do not install or migrate to a new library before auditing the existing dependencies. If no suitable library exists, evaluate a single maintained icon package compatible with the project's React Native setup. Standardize icon names and sizes, avoid mixing icon families, and document the final choice after verification.

## 10. Focus Mode

Focus Mode belongs to the PRD's Phase 6 milestone, including P6.5. It is a core product experience, but it is not a reason to move the design-system phase earlier or reorder the PRD.

### Design goals

- Reduce visual distraction.
- Make the current task immediately clear.
- Keep controls simple and predictable.
- Help users return to their task without unnecessary friction.

### Interface

Display:

- Current task title.
- Optional task description.
- Timer or session duration when enabled.
- Start, pause, resume, and end controls as applicable.
- Complete-task action.
- Exit action.

Hide secondary navigation, unrelated recommendations, and unnecessary metadata while focus is active.

### Behavioral requirements

- A session ending must not automatically mark a task complete.
- Ending a session and completing a task are distinct actions.
- The timer must account for app backgrounding and resuming; it must not rely only on a continuously running UI interval.
- Store enough session information to recover the correct elapsed time after interruptions.
- Focus Mode must not require network connectivity if its required task data is available locally.
- Do not claim to block system notifications or other applications unless the implementation genuinely supports that capability.
- Reduced-motion preferences and accessibility settings continue to apply.

## 11. Interaction and Motion

Motion should explain a state change, not decorate the experience.

Recommended interactions:

- Brief feedback after completing a task.
- Subtle screen transitions.
- Clear pressed states for interactive controls.
- Simple progress transitions where they improve understanding.

Avoid:

- Continuous decorative animation.
- Large celebratory effects for routine actions.
- Long transitions that slow down common tasks.
- Animations that hide errors or delay confirmation.

Respect reduced-motion preferences and test interactions on lower-performance devices.

## 12. Empty, Loading, and Error States

Every implemented screen must define its relevant states.

- **Loading:** Show lightweight feedback only when work is actually in progress.
- **Empty:** Explain what the user can do next, with a relevant action.
- **Error:** State what failed in plain language and offer recovery when possible.
- **Offline:** Clearly distinguish locally available actions from features requiring a connection.
- **Success:** Confirm only after the operation succeeds.
- **Destructive action:** Explain consequences before irreversible changes.

Avoid generic error messages that leave users unable to recover.

## 13. Accessibility and Quality Gates

Before a shared component or screen is considered complete, verify:

- Text and interactive elements have sufficient contrast.
- Essential content supports larger text.
- Touch targets are comfortable to use.
- Interactive controls expose meaningful labels, roles, and states.
- Screen-reader navigation follows a sensible order.
- Focus and selection are visually identifiable.
- Reduced motion is respected.
- Light and dark themes both work.
- iOS and Android layouts are checked separately.
- Long task titles, empty lists, errors, and loading states do not break the layout.

Accessibility requirements are part of acceptance criteria, not optional polish.

## 14. Testing Requirements

Use the project's existing test framework and established patterns.

### Design-system tests

- Theme preference resolves correctly for System, Light, and Dark modes.
- System appearance changes update the theme when System mode is selected.
- Explicit Light and Dark preferences override the system appearance.
- Components render correctly in both themes.
- Disabled and loading states prevent invalid interactions.
- Large text does not hide essential actions.
- Reduced motion avoids nonessential animations.
- Semantic accessibility labels and selected states are present.

### Screen tests

- Today displays the correct task data.
- Quick-add creates a task through the existing supported data flow.
- Save errors preserve recoverable user input.
- Navigation leads to the intended screen.
- No future AI or Goals feature is required for the initial Today experience.

### Platform checks

Run the available test suite and verify representative flows on iOS and Android, or the project's supported platforms. Do not claim a platform is validated if it has not been tested.

## 15. Design Implementation Rules for Coding Agents

1. Read the PRD and this document before modifying UI code.
2. Audit the repository before selecting paths or adding dependencies.
3. Treat the PRD as the source of truth for phase order and product scope.
4. Inspect existing components before creating replacements.
5. Reuse the existing architecture unless a documented issue requires a change.
6. Use semantic tokens rather than hardcoded colors in shared UI.
7. Do not introduce a second theme provider or parallel styling system.
8. Do not add dashboard elements that rely on unimplemented features.
9. Do not change task business logic during a styling-only refactor without explicit justification.
10. Keep changes small enough to review and test.
11. Add or update tests for changed behavior.
12. Record assumptions and unresolved decisions rather than silently inventing them.

## 16. Acceptance Criteria

The design foundation is ready for broader rollout when:

- The repository audit is documented.
- The implementation paths are verified against the actual project.
- The theme provider follows system appearance and respects explicit preferences.
- Shared components use semantic tokens.
- The initial Today screen depends only on available task functionality and quick-add.
- Navigation follows the four-destination plan as features become available.
- Component props and interaction states are documented.
- An icon library decision is recorded after dependency inspection.
- Accessibility and reduced-motion requirements are tested.
- Light and dark appearances are checked on supported platforms.
- Existing core task behavior remains intact.
- Automated tests pass, with any outstanding failures explicitly documented.

---

**Final design principle:** GoTASK should feel quiet, clear, and reliable. The design system must make the product easier to use without forcing unnecessary complexity into the app or its codebase.