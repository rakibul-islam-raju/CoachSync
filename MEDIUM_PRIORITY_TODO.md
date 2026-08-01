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

- [ ] Add organization and membership models.
- [ ] Add organization ownership to tenant data.
- [ ] Backfill a legacy organization using staged migrations.
- [ ] Scope all querysets, relationships, and statistics.
- [ ] Add tenant-isolation tests.

## 3. Data-Integrity Baseline

- [ ] Add same-row database constraints.
- [ ] Add cross-model serializer validation.
- [ ] Make student and teacher creation atomic.
- [ ] Queue registration email only after commit.
- [ ] Add a pre-migration data-audit command.

## 4. Exam Management and Schedule Integration

- [ ] Add dedicated exam write serializers and API filters.
- [ ] Add exam and exam-type Redux APIs.
- [ ] Add exam and exam-type management screens.
- [ ] Connect explicit exam scheduling.
- [ ] Add backend and frontend exam tests.

## 5. Enrollment Lifecycle and Financial Ledger

- [ ] Repair enrollment update validation.
- [ ] Add active/cancelled enrollment lifecycle.
- [ ] Centralize net payable, paid, and balance calculations.
- [ ] Enforce nested transaction enrollment IDs.
- [ ] Add payment and reversal ledger entries.
- [ ] Add correction, receipt, and CSV export workflows.
- [ ] Add enrollment and finance tests.

## 6. Backend Schedule Conflict Engine

- [ ] Add backend batch and teacher overlap checks.
- [ ] Validate conflicts within bulk requests.
- [ ] Make bulk creation atomic and concurrency-aware.
- [ ] Connect exam selection in the schedule form.
- [ ] Render an empty calendar state.
- [ ] Add conflict and rollback tests.

## 7. Profile and Placeholder Cleanup

- [ ] Add self-profile update API.
- [ ] Add the profile page and routes.
- [ ] Remove placeholder message and notification controls.
- [ ] Add profile authorization and UI tests.

## 8. Regression Suite and Rollout

- [ ] Run the data audit and repair legacy violations.
- [ ] Run backend checks, migrations, tests, and schema validation.
- [ ] Run frontend formatting, lint, tests, and build.
- [ ] Complete two-organization staging smoke tests.
- [ ] Record migration and rollout notes.
