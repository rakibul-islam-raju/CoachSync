# Medium-Priority Feature TODO

This tracker accompanies `MEDIUM_PRIORITY_REMEDIATION_PLAN.md`.

## 1. Authorization and UI Containment

- [x] Document the role capability matrix in backend and frontend code.
- [x] Fix employee queryset filtering for organization roles.
- [x] Add backend list/create/update/delete permission enforcement.
- [x] Prevent role and Django privilege-flag escalation.
- [x] Include the current role in JWT user claims.
- [x] Add role metadata to frontend navigation.
- [x] Add direct-route authorization guards.
- [x] Hide employee create, edit, and delete controls when forbidden.
- [x] Add backend role-matrix regression tests.
- [x] Add frontend navigation and action-visibility tests.
- [x] Run backend and frontend verification.

## 2. Organization Tenancy Foundation

- [x] Add organization and membership models.
- [x] Add organization ownership to tenant data.
- [x] Backfill a legacy organization using staged migrations.
- [x] Scope all querysets, relationships, and statistics.
- [x] Add tenant-isolation tests.

## 3. Data-Integrity Baseline

- [x] Add same-row database constraints.
- [x] Add cross-model serializer validation.
- [x] Make student and teacher creation atomic.
- [x] Queue registration email only after commit.
- [x] Add a pre-migration data-audit command.

## 4. Exam Management and Schedule Integration

- [x] Add dedicated exam write serializers and API filters.
- [x] Add exam and exam-type Redux APIs.
- [x] Add exam and exam-type management screens.
- [x] Connect explicit exam scheduling.
- [x] Add backend and frontend exam tests.

## 5. Enrollment Lifecycle and Financial Ledger

- [x] Repair enrollment update validation.
- [x] Add active/cancelled enrollment lifecycle.
- [x] Centralize net payable, paid, and balance calculations.
- [x] Enforce nested transaction enrollment IDs.
- [x] Add payment and reversal ledger entries.
- [x] Add correction, receipt, and CSV export workflows.
- [x] Add enrollment and finance tests.

## 6. Backend Schedule Conflict Engine

- [x] Add backend batch and teacher overlap checks.
- [x] Validate conflicts within bulk requests.
- [x] Make bulk creation atomic and concurrency-aware.
- [x] Connect exam selection in the schedule form.
- [x] Render an empty calendar state.
- [x] Add conflict and rollback tests.

## 7. Profile and Placeholder Cleanup

- [x] Add self-profile update API.
- [x] Add the profile page and routes.
- [x] Remove placeholder message and notification controls.
- [x] Add profile authorization and UI tests.

## 8. Regression Suite and Rollout

- [x] Run the data audit and repair legacy violations.
- [x] Run backend checks, migrations, tests, and schema validation.
- [x] Run frontend formatting, lint, tests, and build.
- [ ] Complete two-organization staging smoke tests.
- [x] Record migration and rollout notes.
