GoTASK — System Architecture

Project: GoTASK-2
Document: docs/ARCHITECTURE.md
Version: 1.0
Status: Proposed architecture — pending repository verification
Application: React Native productivity and goal-management app
Architecture style: Modular monolith, offline-first mobile application
Initial deployment: Single-user testing environment with authentication
Future direction: Multi-device synchronization and optional cloud services

1. Architecture Objectives

The purpose of this document is to define how GoTASK should be structured, how its components communicate, how data is stored, and how the application can evolve without requiring a complete rewrite.

The architecture must support:

Reliable task, goal, note, and progress management.

Offline access to core productivity features.

Authentication before entering the application.

Consistent and recoverable local data storage.

A maintainable React Native codebase.

A backend for operations that require server-side execution.

Intelligent task parsing and controlled AI-agent capabilities.

Automated testing and repeatable releases.

Future multi-device synchronization without compromising data integrity.

Secure handling of user information and private credentials.

Architectural principles

Local-first: Core productivity operations must work without network connectivity.

Modular monolith: Keep the application organized into independent feature modules without introducing unnecessary distributed services.

Separation of concerns: UI, business logic, persistence, and external services must have clear responsibilities.

Single source of truth: Avoid maintaining conflicting copies of the same business data.

Secure by default: Enforce appropriate authorization, validate inputs, and protect sensitive information.

Incremental modernization: Preserve working functionality and migrate existing data safely.

Testability: Important business rules must be testable independently of the UI.

Evolutionary architecture: Design clear extension points for future cloud synchronization and additional capabilities.

2. Current Architecture vs. Target Architecture

2.1 Verified current-state information (Repository Audit Completed)

The repository audit confirmed the following verified technical baseline:

- Framework: Bare React Native v0.71.4 (native `android/` and `ios/` projects, zero Expo runtime dependencies).
- Mobile Local Persistence: Active offline-first persistence using `@react-native-async-storage/async-storage` (`@gotask_tasks_v2`, `@gotask_profile`, `@gotask_custom_categories`).
- Backend Server: Zero-dependency Node.js REST API in `backend/server.js` running locally on port 5000.
- Server Persistence: Crash-resilient atomic file writes implemented via `.tmp` file staging and `fs.renameSync` on `backend/data/db.json`.
- API Contract: Defined schemas for `/health`, `/api/tasks`, `/api/sync`, `/api/stats`, `/api/tasks/parse`, and `/api/agent/dispatch`.
- Test Suites: 100% Jest mobile tests passing; 10/10 backend endpoint tests passing (`node backend/test.js`).
- Authentication Decision: Option A (Local App Lock / PIN / Onboarding Gate) selected for Phase 1 to guarantee 100% offline startup reliability, with interfaces prepared for Option B (Server Accounts) in Phase F.

2.2 Proposed target architecture

The target architecture separates the application into four main areas:

Mobile application: UI, navigation, local interactions, and offline data access.

Application and domain logic: Use cases, validation, business rules, and progress calculations.

Data and integration layer: Local persistence, API communication, authentication, and synchronization interfaces.

Backend services: Authentication verification, protected operations, AI integrations, and future cloud capabilities.

The architecture must not assume that all four areas require separate deployable services. Initially, the backend can remain a single Node.js application.

3. High-Level System Architecture

flowchart TB
    U[User]

    subgraph MOBILE["React Native Mobile Application"]
        UI[Presentation Layer]
        NAV[Navigation and Authentication Gates]
        APP[Application Use Cases]
        DOMAIN[Domain Rules and Models]
        REPO[Repository Interfaces]
        LOCAL[Local Persistence Adapter]
        SYNC[Future Sync Adapter]
        API[API Client]
    end

    subgraph DEVICE["Device Storage"]
        DB[(Local Database)]
        SEC[Secure Credential Storage]
    end

    subgraph SERVER["Node.js Backend"]
        ROUTES[REST API Routes]
        VALIDATE[Validation and Authorization]
        AUTH[Authentication Service]
        TASKS[Task Parsing Service]
        AGENTS[Agent Dispatch Service]
        STORE[Server Data Adapter]
    end

    subgraph EXTERNAL["Optional External Services"]
        AI[AI Provider]
        CLOUD[(Future Cloud Database)]
    end

    U --> UI
    UI --> NAV
    NAV --> APP
    APP --> DOMAIN
    DOMAIN --> REPO

    REPO --> LOCAL
    LOCAL --> DB
    NAV --> SEC

    APP --> API
    API --> ROUTES
    ROUTES --> VALIDATE
    VALIDATE --> AUTH
    VALIDATE --> TASKS
    VALIDATE --> AGENTS

    TASKS --> AI
    AGENTS --> AI
    ROUTES --> STORE
    STORE -. Future cloud capabilities .-> CLOUD

    SYNC -. Introduced when approved .-> API

Important: This is the proposed logical architecture. The exact adapters, storage engine, authentication mechanism, and network boundaries will be finalized after inspecting the existing code.

The local database is the source of truth for core offline operations during the initial local-first phase. A future synchronized system will require an explicit ownership and conflict-resolution policy.

4. Application Architecture Layers

4.1 Presentation layer

Responsibility: Display information and collect user input.

Contains:

Screens and navigation.

Reusable UI components.

Form controls and validation feedback.

Loading, empty, success, and error states.

Theme and design-system integration.

User interaction state.

Examples:

Dashboard screen.

Task list and task editor.

Goal details and progress screen.

Notes and habits screens.

Login and authentication screens.

Settings and preferences.

Rules:

Screens must not directly manipulate database files.

Screens must not implement complex business rules.

Components must not contain private API credentials.

Navigation must enforce the appropriate authentication gate.

UI state must be distinguishable from persisted business data.

4.2 Application layer

Responsibility: Coordinate user operations.

Example use cases:

CreateTask

CompleteTask

UpdateTask

CreateGoal

RecordGoalProgress

CreateNote

CompleteHabit

RestoreArchivedItem

ParseTaskInput

DispatchAgentAction

Each use case should:

Accept a defined input.

Validate the operation.

Apply the required business rules.

Use repository interfaces to read or write data.

Return a predictable result.

Expose errors that the UI can handle.

A use case should not depend directly on a particular screen or database library.

4.3 Domain layer

Responsibility: Define the business rules that make GoTASK work correctly.

Core concepts include:

Task and subtask relationships.

Goal and milestone relationships.

Goal measurement rules.

Progress calculation.

Habit recurrence and streak rules.

Archive and restore behavior.

Valid task state transitions.

Rules for linking notes and other records.

Domain logic should remain independent of React Native components and network requests.

For example, completing a task linked to a goal must update goal progress according to an explicit calculation rule. The calculation must not be duplicated across several screens.

4.4 Data layer

Responsibility: Read and write application data.

Contains:

Repository interfaces.

Local database implementation.

Database schema and migrations.

Data mapping and validation.

API client and remote adapters.

Backup and restore logic.

Future synchronization implementation.

The UI and domain layers should interact with repository interfaces rather than knowing whether data comes from SQLite, a local JSON store, or a future remote service.

This separation allows storage to evolve without rewriting every feature.

4.5 Infrastructure layer

Responsibility: Connect the application to technical services.

Examples:

Network requests.

Secure credential storage.

Logging and diagnostics.

Local notifications.

Date and time utilities.

AI provider integrations.

Environment configuration.

Future cloud synchronization.

Infrastructure code must be replaceable where practical and must not silently become the owner of product business rules.

5. Mobile Application Flow

5.1 Startup and authentication

flowchart TD
    A[Launch Application] --> B[Initialize App]
    B --> C[Initialize Local Storage]
    C --> D{Valid Authenticated Session?}

    D -->|No| E[Login Screen]
    E --> F[Submit Credentials]
    F --> G{Authentication Successful?}
    G -->|No| E
    G -->|Yes| H[Store Session Securely]
    H --> I[Open Main Application]

    D -->|Yes| I
    I --> J[Load Local Productivity Data]
    J --> K[Dashboard]

    K --> L[Tasks]
    K --> M[Goals]
    K --> N[Notes]
    K --> O[Habits and Planning]

Authentication requirements

The initial testing version requires a login flow, but the authentication model must be clarified before implementation.

Two possible designs are:

Option A — Local-only application lock

A PIN or device biometric gate protects access to the app on a device. This is not equivalent to a server-backed account or authentication system.

Option B — Real account authentication

A backend or trusted identity provider verifies credentials and issues a session. This is the appropriate foundation if users must sign in with an account and later synchronize data across devices.

The default recommendation is to define an authentication interface now and select the real provider after inspecting the existing backend and deciding how user identity should work.

If server-backed login is required in the first release, implement that flow explicitly. Do not represent a locally stored username or PIN as secure server authentication.

Session behavior

Store sensitive session credentials in platform-appropriate secure storage.

Never hardcode passwords, tokens, or API keys.

Handle expired sessions and failed authentication.

Provide a logout operation.

Define what happens to locally stored data after logout.

Ensure login failure does not corrupt local productivity data.

Avoid requiring network connectivity for every local task operation once the user has an authorized local session.

6. Core Feature Flow

6.1 Task creation and completion

sequenceDiagram
    actor User
    participant UI as Task Screen
    participant UC as Application Use Case
    participant Domain as Domain Rules
    participant Repo as Task Repository
    participant DB as Local Database

    User->>UI: Create or complete task
    UI->>UC: Submit operation
    UC->>Domain: Validate operation
    Domain-->>UC: Validated result
    UC->>Repo: Save changes
    Repo->>DB: Persist transaction
    DB-->>Repo: Commit result
    Repo-->>UC: Updated task
    UC-->>UI: Success result
    UI-->>User: Display updated state

For a simple task operation, local persistence must not depend on a successful network request.

If a task update requires multiple related writes, use a database transaction when supported by the selected storage engine.

6.2 Goal progress

A goal can be progressed through one or more defined methods:

Manual measurement.

Completed milestones.

Completion of linked tasks.

A combination of explicitly defined measurements.

Each goal must have a documented progress calculation method.

Do not automatically add percentages from unrelated tasks or treat every task as having equal weight unless the goal's rules specify that behavior.

For data integrity, the system should preserve progress history and ensure that restoring or editing related records does not create contradictory results.

6.3 Notes and relationships

Notes may be independent or associated with tasks, goals, or projects.

A note must not require a task relationship to exist. Deleting or archiving a linked task must follow documented relationship and retention rules rather than unexpectedly deleting the note.

6.4 Intelligent task capture

sequenceDiagram
    actor User
    participant UI as Mobile App
    participant API as Node.js API
    participant Parser as Task Parser
    participant UC as Local Application Use Case
    participant DB as Local Database

    User->>UI: Enter natural-language task
    UI->>API: POST /api/tasks/parse
    API->>Parser: Parse and validate input
    Parser-->>API: Structured task proposal
    API-->>UI: Return proposed fields
    UI-->>User: Review and edit proposal
    User->>UI: Confirm creation
    UI->>UC: Create approved task
    UC->>DB: Persist locally
    DB-->>UC: Commit result
    UC-->>UI: Show saved task

The parser should propose task details, not silently create arbitrary records. Saving should go through the same validated application operation as manual task creation.

If parsing requires an external AI provider, the backend should protect the provider's private credentials. Network-dependent parsing may be unavailable offline; ordinary task creation must remain available.

7. Technology Stack

The stack below is the proposed direction. Existing dependencies should be inspected before changes are made.

Component

Proposed choice

Decision

Mobile framework

React Native

Retain

JavaScript or TypeScript

Existing language initially; evaluate TypeScript incrementally

Verify repository

Navigation

Existing navigation library if suitable

Verify repository

State management

Existing Context/hooks initially

Verify complexity

UI

Shared design system and reusable components

Implement incrementally

Local persistence

SQLite for structured data, subject to compatibility and migration review

Proposed

Backend

Node.js REST API

Audit and retain if appropriate

API validation

Schema-based request validation

Required

Authentication

Defined auth interface with a real provider if account login is required

Decide provider

Secure credentials

Platform-appropriate secure storage

Required

AI integration

Server-side adapters

Required for private provider credentials

Unit testing

Existing Jest setup if suitable

Verify baseline

Mobile end-to-end testing

Select a tool compatible with the actual React Native setup

Decide after audit

CI/CD

GitHub Actions if suitable

Proposed

Cloud database

PostgreSQL if centralized multi-user data becomes necessary

Future option

Expo vs. bare React Native

The project setup is currently unknown.

Before selecting SQLite, secure-storage, notification, or E2E testing packages, inspect:

package.json and lockfiles.

app.json or app.config.js, if present.

android/ and ios/ native projects.

Existing Expo dependencies and configuration.

Build scripts and native module configuration.

Do not convert the project to Expo or bare React Native solely to match this document. First determine whether the existing setup meets product requirements.

8. Database and Persistence Architecture

8.1 Do we need a database?

GoTASK contains interconnected tasks, subtasks, goals, milestones, progress records, notes, and habits. A structured database is appropriate for reliable relationships, filtering, querying, and data integrity.

A database does not have to be a cloud service.

Initial recommendation: use a device-local relational database for core productivity data if the audit confirms it is compatible with the existing application.

SQLite is the preferred candidate because it supports durable, structured, local data without requiring a database server.

However, the existing implementation must be audited before migration.

8.2 Local database responsibilities

The local persistence layer should manage:

Tasks and subtasks.

Goals and milestones.

Goal progress history.

Notes and record relationships.

Habits and completion history.

Categories and projects.

Local preferences.

Schema versioning and migrations.

Sensitive session credentials should not be stored as ordinary records in the productivity database.

8.3 Existing JSON storage

The current backend reportedly uses backend/data/db.json.

Before retaining or replacing this storage, verify:

Whether concurrent writes are possible.

Whether writes are atomic at the required failure boundaries.

Whether interrupted writes can corrupt data.

Whether data is validated before persistence.

Whether backup and restore are available.

Whether records have stable identifiers and schema versions.

Whether authentication and user ownership are enforced where needed.

JSON storage may be adequate for a small development prototype. It should not automatically become the long-term authoritative store for a multi-user production backend.

8.4 Future cloud database

A cloud database is not mandatory for the initial single-device testing phase.

If GoTASK later supports shared accounts and cross-device synchronization, evaluate PostgreSQL or an appropriate managed relational database for centralized data.

In that design:

The backend owns remote authorization and persistence.

The mobile app maintains a local copy for offline access.

Synchronization handles changes in both directions.

Conflicts are detected and resolved explicitly.

Each remote record has defined ownership.

Sensitive user data is isolated between accounts.

Do not add a cloud database merely because the application has a backend.

8.5 Data integrity

The persistence layer must define:

Stable record IDs.

Creation and update timestamps.

Valid state transitions.

Relationship constraints.

Deletion and restoration behavior.

Schema migrations.

Transaction boundaries.

Recovery from interrupted operations.

A database migration must preserve existing user data and be tested before release.

9. Conceptual Data Model

The following model describes the principal relationships. It is not the current verified database schema.

erDiagram
    CATEGORY ||--o{ TASK : categorizes
    TASK ||--o{ TASK : contains
    GOAL ||--o{ MILESTONE : contains
    GOAL ||--o{ GOAL_PROGRESS : records
    GOAL o|--o{ TASK : relates_to
    HABIT ||--o{ HABIT_COMPLETION : records
    TASK o|--o{ NOTE : contextualizes
    GOAL o|--o{ NOTE : contextualizes
    PROJECT ||--o{ TASK : groups

Data model rules

Tasks can exist without a goal.

Goals can exist before tasks are created.

Notes can exist independently.

Habit history must not disappear when a streak ends.

Archived records should preserve relevant history.

Progress records must have defined ownership and timestamps.

Relationships must have explicit deletion behavior.

Future account support must introduce ownership and authorization rules appropriate to the actual multi-user design.

A task may need to link to more than one goal in a future version. If that requirement is approved, the model should use an explicit relationship entity rather than relying on a single goalId field.

10. Backend Architecture

The initial backend should remain a modular Node.js application unless the audit identifies a concrete reason to change it.

backend/
├── server.js
├── routes/
│   ├── auth.routes.js
│   ├── tasks.routes.js
│   ├── goals.routes.js
│   └── agent.routes.js
├── middleware/
│   ├── authentication.js
│   ├── authorization.js
│   └── error-handler.js
├── validators/
├── services/
│   ├── task-parser.js
│   └── goal-services.js
├── agents/
│   ├── dispatch.js
│   └── policies.js
├── repositories/
├── storage/
├── config/
└── tests/

This is a proposed structure, not a requirement to create every file immediately.

Backend responsibilities

Validate requests and responses.

Authenticate users where account authentication is supported.

Authorize access to protected operations and data.

Apply server-side business rules where necessary.

Protect external service credentials.

Enforce request limits and safe error handling.

Execute permitted AI and agent operations.

Provide consistent API contracts.

Log operational events without leaking sensitive data.

If the backend is exposed beyond a trusted local development environment, it must not rely on the assumption that all requests come from the legitimate mobile app.

API conventions

Use appropriate HTTP methods and status codes.

Validate request bodies and query parameters.

Return predictable error formats.

Version APIs when breaking changes are introduced.

Document endpoint schemas and authentication requirements.

Use idempotency controls where retries could otherwise duplicate important operations.

Do not return stack traces or private configuration in production errors.

11. Authentication and Future Accounts

Authentication is required for the initial testing experience, but account identity and local data ownership must be clearly defined.

Initial requirements

A clear login flow.

Secure handling of credentials and sessions.

Defined authentication failure behavior.

Logout and session expiration handling.

A documented relationship between an authenticated identity and local data.

Protection of private backend endpoints.

If the initial build uses a single test account, that must be treated as a controlled testing arrangement—not as a complete multi-user authorization system.

Future multi-device requirements

When multi-device synchronization is approved, authentication will need to support:

Unique user identities.

Server-side data ownership checks.

Session revocation and expiration.

Secure synchronization requests.

Account recovery where supported.

Isolation between users.

Data export and account deletion policies.

A local PIN or biometric lock can complement account authentication, but cannot replace server-side identity and authorization for cloud data.

12. Offline-First and Synchronization Strategy

The first phase should optimize the single-device experience.

Initial behavior

Read core data from local storage.

Persist supported task and goal operations locally.

Keep core workflows available without network connectivity.

Display errors clearly when a network-dependent feature is unavailable.

Avoid blocking local operations on remote AI or API requests.

Preserve user data when the backend cannot be reached.

Future synchronization

Synchronization should be a separate capability introduced only when multi-device use is approved.

It will require:

A stable remote identity for each record.

A synchronization cursor or equivalent change-tracking mechanism.

A strategy for detecting concurrent edits.

Conflict-resolution rules.

Retry and backoff behavior.

Duplicate-operation protection.

Handling for deletions and archived records.

Migration and recovery procedures.

Do not assume that the last write should always win. Conflicts involving goal progress, task completion, and note edits may require different policies.

13. AI and Agent Architecture

AI capabilities must remain isolated from core task-management logic.

Design requirements

Keep private AI provider keys on the server.

Use defined interfaces for providers and tools.

Validate model outputs before using them.

Treat generated content as untrusted input.

Define explicit permissions for each agent action.

Require confirmation for destructive or consequential operations.

Limit execution time, request size, and resource consumption.

Record appropriate execution outcomes without logging sensitive content unnecessarily.

Provide useful behavior when an AI provider is unavailable.

Agent execution flow

flowchart TD
    A[User Request] --> B[Validate Request]
    B --> C[Authenticate and Authorize]
    C --> D[Determine Allowed Action]
    D --> E[Generate Proposed Result]
    E --> F[Validate Output]
    F --> G{Requires User Approval?}
    G -->|Yes| H[Show Confirmation]
    G -->|No| I[Execute Permitted Action]
    H -->|Approved| I
    H -->|Rejected| J[Cancel]
    I --> K[Persist Through Authorized Service]
    K --> L[Return Result]

Agents must not receive unrestricted access to the filesystem, unrelated projects, private files, or arbitrary production resources. Tool access should be explicitly scoped to the required task.

14. Security Architecture

Security must be applied across the mobile app, backend, persistence layer, and AI integrations.

Requirements:

Never commit private API keys, passwords, or tokens.

Keep production secrets outside the mobile application bundle.

Use secure storage for sensitive session credentials.

Validate and normalize untrusted inputs.

Apply server-side authorization to protected operations.

Restrict filesystem and tool access for agents.

Avoid exposing private data in logs or error responses.

Apply appropriate network security and deployment configuration.

Protect backups and test restoration procedures.

Review dependencies and security advisories.

Define data retention, deletion, and export behavior.

Separate development, testing, and production environments.

The security design must be revisited before introducing accounts, cloud synchronization, collaboration, or external AI processing.

15. Testing Strategy

Each layer should have tests appropriate to its responsibilities.

Test layer

Purpose

Unit tests

Verify domain rules, validation, and progress calculations.

Repository tests

Verify persistence, queries, and data relationships.

API tests

Verify contracts, authorization, errors, and request validation.

Integration tests

Verify interactions between application services and persistence.

UI tests

Verify essential interactions and screen states.

End-to-end tests

Verify critical user journeys on supported devices.

Migration tests

Verify existing data survives schema changes.

Recovery tests

Verify backup, restore, and interrupted-operation behavior.

Security tests

Verify access controls, input handling, and credential protection.

Regression tests

Ensure approved changes do not break existing features.

Tests should cover, at minimum:

Creating and completing a task.

Updating subtasks and relationships.

Creating a goal and recording progress.

Editing and retrieving notes.

Restarting the app after local changes.

Handling network failure during AI requests.

Authentication failures and logout.

Restoring archived or recoverable records.

Handling invalid and conflicting operations.

16. Deployment and Environments

GoTASK should distinguish the following environments:

Development

Local development builds.

Test data.

Local or development API configuration.

Debug logging with secrets redacted.

Testing / staging

Release-like builds.

Isolated test accounts and data.

Automated API and mobile tests.

Validation of migrations and recovery procedures.

Production

Protected backend configuration.

Managed credentials and access controls.

Monitoring and appropriate error reporting.

Backup and recovery procedures where server-side data exists.

Controlled releases and rollback plans.

Network configuration

The application must not assume that localhost refers to the development computer. On a physical device, localhost normally refers to that device itself.

Development API addresses, emulator networking, staging endpoints, and production API URLs must be configured appropriately for the actual build environment.

Private credentials must never be embedded in the mobile app merely to simplify configuration.

17. Architecture Decision Records

Important architectural choices should be recorded in small decision documents as they are finalized.

Decision

Current direction

Status

Architecture style

Modular monolith

Proposed

Mobile framework

Existing React Native

Retain

Expo or bare React Native

Bare React Native v0.71.4

Decided (Retain)

Local persistence

AsyncStorage (current) + Repository Abstraction for future SQLite

Decided (Incremental)

Existing JSON storage

Retained with atomic .tmp write staging

Decided (Retain)

Initial user model

Option A (Local App Lock / Onboarding PIN Gate) for Phase 1

Decided

Future account model

Support unique identities if cloud sync is introduced

Future

Cloud database

PostgreSQL candidate

Not required initially

State management

Retain existing Context/hooks with modular stores

Decided

AI execution

Controlled backend services

Proposed

Synchronization

Separate future capability

Deferred

CI/CD

Automated validation and repeatable builds

Proposed

Any decision that changes persistence, authentication, data ownership, or synchronization should include its rationale, alternatives, migration requirements, and consequences.

18. Implementation Roadmap

Architecture changes should be implemented in small, reviewable phases.

Phase A — Discovery

Verify the current repository structure and dependencies.

Identify Expo versus bare React Native.

Trace local persistence and backend data flow.

Inspect existing authentication.

Establish the current build and test baseline.

Exit condition: Current architecture is documented and major unknowns are resolved.

Phase B — Core architecture foundations

Define module boundaries.

Document the domain entities and relationships.

Establish repository interfaces where justified.

Define error handling and validation conventions.

Establish the design system and testing conventions.

Exit condition: The core architecture is clear without unnecessary rewrites.

Phase C — Persistence and authentication

Select the local persistence implementation.

Define migrations and recovery rules.

Implement or refine the required login flow.

Define session storage and logout behavior.

Validate data persistence across restarts.

Exit condition: Core data operations and authentication meet their documented requirements.

Phase D — Backend and AI boundaries

Verify and document existing endpoints.

Strengthen request validation and access controls.

Isolate AI provider integrations.

Define agent permissions and approval behavior.

Test network failures and malformed outputs.

Exit condition: Backend and AI operations are controlled and do not compromise core offline workflows.

Phase E — Production readiness

Complete regression coverage.

Validate security and accessibility.

Establish CI checks and release builds.

Test migrations and recovery.

Document operational and release procedures.

Exit condition: Release-readiness criteria are satisfied.

Phase F — Future synchronization

Only after the product requires multi-device support:

Define account ownership and synchronization contracts.

Select a cloud persistence strategy.

Implement change tracking and conflict resolution.

Test retries, offline changes, and concurrent edits.

Introduce cloud deployment and monitoring.

Exit condition: Multi-device behavior is consistent, secure, and recoverable.

19. Definition of Done for Architecture Changes

An architecture change is complete only when:

Its purpose and trade-offs are documented.

Existing behavior has been reviewed.

Data migration and rollback requirements are defined where applicable.

Relevant tests pass.

Secrets and personal data are protected.

Module boundaries remain clear.

Failure and recovery behavior are considered.

Documentation reflects the actual implementation.

The change has been reviewed before merging.

No phase should authorize an agent to rewrite the entire application automatically.

20. Final Architecture Direction

GoTASK should begin as a modular, offline-first React Native application with a clear application/domain/data separation and a controlled Node.js backend.

The initial version can remain single-user while supporting a properly designed login experience. It does not require a cloud database solely to store local productivity data.

The local persistence strategy should be selected after inspecting the existing code. SQLite is the preferred candidate for structured offline data, but migrating away from JSON must be justified by verified requirements and a safe migration plan.

Future multi-device synchronization, centralized accounts, and additional AI capabilities should build on these boundaries rather than forcing an early move to microservices or an unnecessarily complex distributed architecture.

The objective is not to make GoTASK architecturally complicated. It is to make the product dependable today and straightforward to extend tomorrow.