# GoTASK — Complete UI/UX Redesign & Responsive Design System Specification

## Source: User Prompts Received 2026-10-31

---

### Part 1: Core Redesign & Responsive Design System

#### Project context
- **Existing application:** GoTASK  
- **Framework:** React Native CLI 0.71.4  
- **Platform priority:** Android first, maintain iOS compatibility  
- **Primary physical test device:** OnePlus 11R  
- **Design direction:** Editorial-modern  
- **Themes:** Light, Dark and System  
- **Scope:** Entire application

#### Objective
Transform GoTASK into a polished, distinctive, production-quality productivity application.

The current interface is not visually acceptable. The redesign must eliminate generic AI-generated visual patterns and establish a consistent, intentional product identity.

The application must adapt to modern mobile devices, different screen sizes, orientations, display densities, accessibility font scales and tablet layouts.

#### Non-negotiable constraints
1. Preserve existing application functionality.
2. Preserve business logic, API contracts, backend integrations, navigation behaviour and data structures.
3. Do not delete existing features simply to simplify the redesign.
4. Do not upgrade React Native or change the native build architecture without explicit approval.
5. Do not install multiple overlapping UI frameworks.
6. Do not modify unrelated projects or personal files.
7. Do not perform destructive Git operations.
8. Do not claim a screen is responsive or production-ready without testing it.
9. Do not modify files during the initial audit.
10. Obtain owner approval before beginning implementation.

#### Preferred technical direction
Evaluate Shopify Restyle 2.4.x for the design system, verifying dependency compatibility with the existing React Native version before installation.

Use:
- React Native useWindowDimensions for responsive layout.
- A shared theme provider for Light, Dark and System modes.
- Centralized design tokens for color, typography, spacing and radii.
- Reusable UI components.
- Existing animation and icon libraries where suitable.

Do not introduce NativeWind or Tamagui unless there is a demonstrated technical reason and approval.

#### Visual identity
Create an editorial-modern design language.

Requirements:
- Strong typography hierarchy.
- Restrained and intentional color palette.
- Distinctive accent color.
- Balanced whitespace.
- Minimal unnecessary cards and borders.
- Consistent icon family.
- Purposeful interaction and animation.
- Proper light and dark color contrast.
- Avoid excessive gradients, giant rounded cards, decorative statistics and repetitive layouts.

Each screen should have its own appropriate visual composition while sharing the same design system.

#### Responsive requirements
Proposed breakpoints in density-independent pixels:
- Below 360: compact phone.
- 360–599: standard phone.
- 600–839: expanded layout.
- 840+: large tablet layout.

These are initial design thresholds, not assumptions about specific device models.

Support:
- Small and large Android phones.
- OnePlus 11R.
- Different aspect ratios.
- Portrait and landscape.
- Split-screen and resizable windows.
- Foldable window changes.
- System display scaling.
- Accessibility font scaling.
- Keyboard visibility and form scrolling.
- Status/navigation bar insets.
- Safe areas.
- No clipped content or horizontal overflow.
- Minimum comfortable touch targets.

#### Screen coverage
Audit and redesign every existing screen, including:
- Dashboard
- Tasks
- Notes
- Goals
- Habits
- Planning
- Focus Mode
- Analytics
- Profile
- Settings
- Onboarding
- Modals, dialogs, forms and navigation elements

First verify which screens and components actually exist in the repository.

#### Required workflow
- **Phase A — Read-only audit:** Inspect repository, screen inventory, styling, dimensions, and responsiveness defects.
- **Phase B — Design specification:** Design principles, color tokens, typography, spacing, component specs, and compatibility report.
- **Phase C — Implementation:** Shared design system, theme support, incremental screen redesigns preserving all business logic.
- **Phase D — Device validation:** Physical OnePlus 11R and emulator validation across themes, orientations, and font scaling.
- **Phase E — Regression:** Run all Jest, backend, and linting checks to guarantee zero regressions.

---

### Part 2: Additional Requirements — Design Quality, Architecture and Device Validation

#### 1. Dependency and package management
- Inspect package.json and the existing lockfile before proposing installations.
- Check exact compatibility with React Native 0.71.4.
- Do not upgrade React Native, Gradle, Android Gradle Plugin or other native dependencies without approval.
- Prefer existing dependencies when they can fulfil the requirement.
- Provide the reason, version and compatibility evidence for every proposed new dependency.
- Do not install packages during the audit.

#### 2. Responsive implementation quality
- Avoid fixed widths and heights unless technically necessary.
- Avoid using device-specific dimensions as the foundation of layouts.
- Use useWindowDimensions and adaptive Flexbox layouts.
- Handle font scaling without clipping or overlapping content.
- Support dynamic window resizing and orientation changes.
- Keep content readable on both narrow and wide screens.
- Use maximum content widths where appropriate on tablets.
- Do not stretch phone layouts across large displays.

#### 3. Real product design quality
- Do not use repetitive dashboard-style cards on every screen.
- Do not use gradients as a substitute for visual design.
- Do not create unnecessary statistics or decorative charts.
- Do not use emoji as replacement icons.
- Avoid excessive rounded corners, shadows and floating elements.
- Use typography, hierarchy, spacing and meaningful content to create visual distinction.
- Each screen must have a layout appropriate to its purpose.
- Review real-world, professionally designed productivity applications for inspiration without copying their interfaces.

#### 4. Component architecture
- Create reusable, documented components.
- Maintain a single source of truth for design tokens.
- Separate visual components from business logic.
- Avoid duplicating styles across screens.
- Make shared components responsive and theme-aware.
- Avoid unnecessary abstraction and overengineering.

#### 5. Accessibility and interaction
- Provide accessible labels and roles.
- Maintain readable contrast in both themes.
- Support Android font scaling.
- Ensure touch targets are comfortable.
- Provide visible pressed, disabled, loading, success and error states.
- Ensure forms remain usable when the keyboard is open.
- Respect reduced-motion preferences where practical.

#### 6. Visual quality assurance
- Capture baseline screenshots before implementation.
- Capture screenshots after each redesigned screen.
- Compare before and after screenshots.
- Check clipping, overlapping elements, alignment, spacing and typography.
- Validate on physical devices instead of relying exclusively on emulator screenshots.
- Record the tested device, Android version, screen size and font scale.
- Do not mark a screen complete until its visual and functional tests pass.

#### 7. Git safety and implementation control
- Record the current Git branch and working-tree status before implementation.
- Never overwrite or discard existing uncommitted user changes.
- Keep redesign changes logically separated and reviewable.
- Do not commit, push or merge without explicit approval.
- Report every modified file and the reason for modification.

#### 8. Final acceptance criteria
The redesign is complete only when:
- All existing screens have been reviewed and redesigned.
- All existing critical workflows still function.
- Light, dark and system themes work.
- No critical layout clipping or horizontal overflow remains in tested configurations.
- Accessibility font scaling has been validated.
- Physical-device testing has been completed.
- Existing automated tests and relevant UI journeys pass.
- Before/after screenshots and remaining known issues are documented.

Do not claim universal device compatibility based on a limited test matrix. Clearly document the devices and configurations actually tested.

