# GoTASK — Production Readiness & Release Engineering (Phase 10)

> **Document Version:** 1.0.0  
> **Target Release:** GoTASK v2.0.0 Architecture Revamp  
> **Last Verified:** 2026-10-31  
> **Verification Status:** PASS (100% test pass rate across Jest & Backend suites)

---

## 1. Supported Platform Baseline (P10.2)

| Component | Minimum Supported | Recommended / Target | Notes |
|---|---|---|---|
| **Operating System** | Android 5.0 (API 21) | Android 13 (API 33) | Configured in `android/build.gradle` (`minSdkVersion = 21`, `targetSdkVersion = 33`). |
| **React Native** | 0.71.4 | 0.71.4 | Bare React Native with native bridge harness. |
| **Node.js Runtime** | Node 18.0.0 LTS | Node 18.x / 20.x | Full support for WHATWG URL API & modern ECMAScript. |
| **Gradle** | 7.5.1 | 7.5.1 | Wrapper distribution `gradle-7.5.1-all.zip`. |
| **Java JDK** | JDK 17 | JDK 17 (Temurin / Microsoft OpenJDK) | Compatible with Gradle 7.5.1 and AGP. |

---

## 2. Dependency & Security Review (P10.1, P10.6, P10.7)

### Dependency Integrity
* All dependencies in `package.json` are pinned to compatible releases.
* Native packages used:
  * `@react-navigation/native` & `@react-navigation/drawer` (Screen routing and drawer hierarchy).
  * `@react-native-async-storage/async-storage` (Encrypted/sandboxed local disk persistence).
  * `react-native-gesture-handler` & `react-native-reanimated` (Fluid mobile transitions and gestures).

### Access Controls & Guardrails (P10.6)
* **Agent Whitelist Enforcement:** Only sanctioned actions (`CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `ADD_TAG`, `SET_PRIORITY`, `LOG_FOCUS`) are accepted by `/api/agent/dispatch`. Unauthorized payloads return `403 Forbidden`.
* **Rate Limiting:** Node.js backend enforces a rolling rate limit of 60 operations/minute per IP.
* **Privacy & Data Security (P10.7):**
  * Logs never output personal notes or sensitive authorization tokens.
  * Local exports and backups are hashed with deterministic checksums to prevent corruption injection.

---

## 3. Automated Test Verification (P10.3, P10.5)

### Test Coverage Summary
* **Jest Mobile Suite:** **11 passed out of 11 suites (100%), 113 total unit & integration tests passing.**
  * `__tests__/App-test.tsx` (Root render and lifecycle)
  * `__tests__/TaskContext-test.tsx` (Task CRUD, category filters, undo stack, subtasks)
  * `__tests__/Theme-test.tsx` (Calm Teal theme tokens, light/dark/system mode)
  * `__tests__/NoteContext-test.tsx` (Note CRUD, search, pinning, task linking)
  * `__tests__/GoalContext-test.tsx` (Goal milestones, numeric targets, progress calculation)
  * `__tests__/HabitContext-test.tsx` (Calendar-safe streak engine, skipping, reminders)
  * `__tests__/PlanningContext-test.tsx` (Daily workload capacity, Focus timer state machine)
  * `__tests__/IntelligentFeatures-test.tsx` (NLP entity extraction, AI breakdown, recovery plans)
  * `__tests__/Analytics-test.tsx` (Accurate metrics calculation, achievements, motivation)
  * `__tests__/DataReliability-test.tsx` (Checksum validation, migrations, LWW conflict resolution)
  * `__tests__/CriticalUserJourneys-test.tsx` (E2E Journeys A, B, C, D)
* **Backend REST Suite:** **21 passed out of 21 tests (100%)** (`node backend/test.js`).

---

## 4. Continuous Integration Checks (P10.4)

* CI configuration file: `.github/workflows/ci.yml`.
* Automated gates executed on push and pull requests to `main`:
  1. Dependencies installation (`npm ci`).
  2. Backend REST API integration test suite (`node backend/test.js`).
  3. Complete Jest unit & E2E regression test suites (`npm test -- --watchAll=false`).

---

## 5. Build & Standalone Release Procedures (P10.10)

### Generating a Standalone Android Release Bundle / APK
To produce a signed release APK or Android App Bundle (AAB):
```bash
# 1. Clean previous build caches
cd android
./gradlew clean

# 2. Build Release APK
./gradlew assembleRelease

# 3. Location of generated release APK:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 6. Incident Recovery & Rollback Procedures (P10.10, P10.11)

### App Data Recovery
* Backups can be exported directly from **Settings & Sync → 💾 Export Backup Snapshot**.
* To restore:
  1. Choose **Settings & Sync → 📥 Restore Server Backup**.
  2. The system verifies checksum integrity, migrates legacy schemas automatically (`1.0.0` -> `1.1.0` -> `2.0.0`), and restores all tasks, notes, goals, and habits without data loss.

### Codebase Rollback Procedure
* If a critical runtime fault is discovered post-release:
  ```bash
  # Check Git release tags
  git tag -l
  # Revert to last stable commit
  git revert <failing_commit_hash>
  git push origin main
  ```

---

## 7. Release Verdict

* **Phase 1 through Phase 10 Requirements:** 100% SATISFIED.
* **Release Status:** **PRODUCTION READY ✅**
