# Medium-Priority Feature Remediation Plan

Source: `FEATURE_AUDIT.md`, section **Medium priority: feature exists but is incomplete or unsafe**.

## Delivery Principles

- Make authorization and business rules authoritative on the backend.
- Keep frontend navigation and controls aligned with backend capabilities.
- Introduce organization tenancy before expanding tenant-owned features.
- Preserve financial history through cancellation and reversal instead of deletion.
- Deliver each phase as a focused, independently verifiable change.

## Scope Decisions

- Implement organization-level tenancy first; defer branches until organization isolation is proven.
- Treat payments as an immutable ledger. Corrections use reversals and replacement entries.
- Schedule exams explicitly because an exam does not currently contain time, duration, or teacher.
- Implement a real profile workflow, but remove messages and notifications until those products exist.

## Implementation Order

### 1. Authorization and UI Containment

Define a shared role capability matrix. Platform admins can manage operational users; admin staff can manage organization admins and staff; organization admins can manage organization staff; organization staff have read-only employee access; students and teachers cannot access the administration interface.

Enforce the matrix through backend permissions, queryset filtering, serializer validation, frontend navigation metadata, route guards, and action visibility. Include `role` in authentication claims so authorization-aware UI works immediately after login.

Exit criteria:

- Every role receives the expected API response for list, create, update, and delete operations.
- Lower roles cannot see platform-admin users.
- Forbidden routes cannot be opened directly.
- The frontend never displays an employee action that the API will reject.

### 2. Organization Tenancy Foundation

Add an `Organization` model, organization membership for users, and organization ownership for academic, student, enrollment, payment, exam, schedule, and statistics data.

Use staged migrations: add nullable ownership, create and backfill a legacy organization, validate relationships, then require ownership. Scope querysets, related-field choices, uniqueness constraints, searches, and statistics to the active organization.

Exit criteria:

- Organization A cannot list, retrieve, mutate, reference, or infer organization B data.
- Platform-level writes require an explicit target organization.
- Cross-organization relationships fail validation.

### 3. Data-Integrity Baseline

Add database constraints for case-insensitive class names, date ordering, positive monetary values and durations, discounts, and exam marks. Add serializer validation for cross-model rules.

Wrap student and teacher account/profile creation in `transaction.atomic()` and enqueue registration email with `transaction.on_commit()`. Add a data-audit command to report records that would violate new constraints.

Exit criteria:

- Invalid records are rejected consistently.
- Failed compound creation leaves no orphan user or profile.
- Existing data passes the audit before constraints are enabled.

### 4. Exam Management and Schedule Integration

Add dedicated exam and exam-type write serializers, filters, search, ordering, Redux APIs, management pages, forms, routes, and navigation.

Provide a “Schedule exam” action that pre-fills exam, batch, subject, date, and title while requesting time, duration, and optional teacher.

Exit criteria:

- Exam types and exams support complete CRUD workflows.
- Updates accept relationship identifiers correctly.
- Exams can be selected and scheduled without duplicating academic data manually.

### 5. Enrollment Lifecycle and Financial Ledger

Fix duplicate enrollment validation by excluding the current instance and enforce one active enrollment per student and batch. Add cancellation metadata and prevent destructive deletion of financially relevant enrollments.

Define net payable, paid, and balance centrally. Use positive decimal amounts with explicit payment and reversal transaction types. Enforce the enrollment identifier from nested URLs, reject overpayments, and prevent payments against cancelled enrollments.

Add reversal/correction UI, printable receipts, and CSV export.

Exit criteria:

- Discounts affect balances and statistics everywhere.
- Enrollment URL and transaction payload cannot disagree.
- Corrections remain auditable and cancellation preserves history.

### 6. Backend Schedule Conflict Engine

Validate interval overlap for batches and teachers, both within a bulk request and against persisted schedules. Lock affected resources and create the bulk request atomically.

Validate schedule relationships, connect exam selection, and always render the calendar with a clear empty state.

Exit criteria:

- Exact and partial overlaps are rejected.
- Adjacent non-overlapping events succeed.
- A failed bulk request creates no schedules.

### 7. Profile and Placeholder Cleanup

Add a self-profile update endpoint and profile page with security-sensitive fields read-only. Route desktop and mobile account actions to it.

Remove hard-coded message and notification controls until real routes, APIs, and unread counts exist.

Exit criteria:

- Profile editing is functional and limited to the current user.
- No visible account, message, or notification control is a placeholder.

### 8. Regression Suite and Rollout

Expand Django tests around authorization, tenant isolation, constraints, exams, enrollments, finance, schedules, and statistics. Add frontend integration tests for role-aware routing and controls, exams, finance, profile editing, and calendar empty states.

Roll out through a database backup, data audit, staged migrations, backend deployment, frontend deployment, and two-organization smoke testing.

Required verification:

- `uv run python manage.py check`
- `uv run python manage.py makemigrations --check --dry-run`
- `uv run python manage.py test`
- `uv run python manage.py spectacular --validate`
- `pnpm lint`
- `pnpm test -- --run`
- `pnpm build`

## Estimated Effort

The complete medium-priority roadmap is approximately 27-40 engineering days for one developer. Organization tenancy and finance carry the greatest migration and regression risk.
