# Feature Audit and Roadmap

_Audited and remediated: August 2, 2026_

## Scope and Status

This inventory is based on the Django models, serializers, views, URLs, settings, management commands, React routes and pages, Redux APIs, tests, Docker files, and recent Git history. It is a code audit, not a production acceptance test.

- **Implemented**: usable code exists across the relevant backend and frontend layers.
- **Incomplete**: code is missing, disconnected, or has a confirmed defect.
- **Possible future**: a product extension suggested by the current domain; no implementation is claimed.

## Implemented Features

| Area | Current capability |
| --- | --- |
| Authentication | Email/password login, JWT issuance/persistence/rotation, automatic token refresh, authenticated route guard, current-user lookup, logout, password-reset email requests, token-based password setup, and authenticated password changes. |
| Users and roles | Custom users with admin, admin staff, organization admin/staff, student, teacher, and guardian roles. A shared capability matrix controls employee API access, navigation, direct routes, and action visibility. Self-profile editing exposes only safe fields. |
| Organization tenancy | Organization and membership models, explicit platform tenant selection, tenant ownership for operational records, tenant-scoped querysets/statistics/searches, cross-tenant relationship validation, and staged legacy backfill migrations. |
| Academic catalog | Tenant-scoped subject, class, teacher, and batch list/create/update/delete APIs and management screens. Lists support pagination, search, ordering, and status filters. |
| Batch management | Batch dates, fee, class association, detail page, and a paginated list of enrolled students. |
| Student management | Student creation, generated student ID, list/search/filter/order, detail view, personal data, active status, and enrollment summary. |
| Exams and outcomes | Exam setup and scheduling plus frozen candidate rosters, decimal mark entry, absent/exempt states, staff submission, admin verification, organization-defined grade scales, atomic versioned publication, correction reopening, rankings, printable report cards, and tenant-safe student/guardian portals. |
| Enrollment and payments | Active/cancelled enrollment lifecycle, duplicate-active-enrollment enforcement, discount-aware net payable/paid/balance calculations, positive decimal payments, immutable reversals and corrections, printable receipts, and enrollment CSV export. |
| Finance | Automatically issued enrollment invoices, manual payment methods and references, installment schedules, traceable scholarship awards, immutable expense/void records, close-time cash reconciliation snapshots, overdue email/manual reminders, printable invoices, and tenant-scoped finance summaries. No payment gateway, checkout, webhook, or provider dependency is used. |
| Scheduling | Schedule list, search, filters, bulk draft creation, editing, deletion, explicit exam selection, month/week/day calendar views, and a backend batch/teacher interval-conflict engine with atomic bulk creation. |
| Dashboard | Tenant-scoped active batch/class/teacher counters, student and enrollment charts, and reversal-aware yearly monthly-transaction chart. |
| Backend utilities | Django admin, clean Swagger/ReDoc schema generation, seed and data-audit commands, initial super-admin creation, status-code logging, Redis/Celery worker, and configurable console/SMTP email delivery. |
| UI foundation | Reusable forms, tables, pagination, drawers, modals, error/loading states, responsive navigation, Storybook stories, and Material UI theming. |
| Engineering and deployment | PostgreSQL-backed production settings, non-root multi-stage API/web images, Gunicorn/Nginx runtime, health/readiness probes, PostgreSQL backup and guarded restore tooling, immutable release images, and full backend/frontend/container CI gates. |

## Completed High-Priority Remediation

The high-priority findings from the original audit were implemented on July 26, 2026:

1. The frontend production build was restored by adding the maintained `react-big-calendar` declarations.
2. A backend refresh endpoint, correctly shaped refresh request, rotated-token storage, retry deduplication, and expired-session logout handling were added.
3. Password request, set, and change flows now have backend validation, Redux mutations, routes, forms, feedback, and regression tests.
4. Student detail, update, delete, and batch-enrollment links now consistently use `student_id`; partial student updates and ID generation were also repaired.
5. The Celery worker is enabled in Compose. Email backend credentials and frontend reset-link origin are environment-driven, with safe console-email development defaults and SMTP support.

## Completed Medium-Priority Remediation

The medium-priority remediation plan was implemented on August 1, 2026:

1. Role behavior is enforced consistently through backend permissions, tenant-aware employee querysets, serializer validation, JWT claims, navigation metadata, direct-route guards, and action visibility.
2. Organization tenancy now covers academic, student, enrollment, payment, exam, schedule, user-membership, and statistics data. Platform writes require an explicit target organization and cross-organization references fail validation.
3. Integrity constraints cover case-insensitive uniqueness, date ordering, positive monetary values/durations, discounts, and exam marks. Compound student/teacher creation is atomic and registration email is queued after commit.
4. Exam types and exams have complete backend and frontend CRUD workflows and can explicitly prefill a schedule request.
5. Enrollment updates exclude the current row, one active enrollment per student/batch is enforced, cancellation preserves history, and financially relevant enrollment deletion is not exposed.
6. Payments use an immutable positive-decimal payment/reversal ledger. Nested enrollment IDs are authoritative, overpayments and cancelled-enrollment payments are rejected, and correction, receipt, and CSV export workflows are available.
7. Schedule writes reject batch and teacher interval overlaps both within bulk requests and against stored schedules. Bulk creation locks affected resources and rolls back atomically; the calendar includes an empty state.
8. Self-profile editing is implemented with security-sensitive fields read-only, and placeholder message/notification controls were removed.

Staged migrations and the strict integrity audit passed against a copy of the existing repository database. Automated tests exercise two-organization isolation, but the external two-organization staging smoke test remains a release activity.

## Completed Engineering and Deployment Remediation

The engineering and deployment findings were implemented and live-tested on August 1, 2026:

1. Production uses environment-selected PostgreSQL with persistent connections, health checks, optional SSL mode, configurable hosts/origins/security headers, and deliberate SQLite-only local-development fallback.
2. The API runs as a non-root user under Gunicorn from a Python 3.14 multi-stage image. The frontend is built with Node 24 and pnpm 10.26.2, then served by an Nginx runtime with SPA fallback, cache/security headers, and a health endpoint.
3. Compose now coordinates PostgreSQL 17, Redis 7.4, API, Celery, and web services through dependency and runtime health checks, persistent volumes, required secrets, and image overrides for immutable releases.
4. Local, Docker, and CI dependency workflows consistently use locked `uv` and pnpm installs. The consolidated CI workflow runs system/security checks, migration drift and PostgreSQL migrations, the integrity audit, **35 backend tests**, OpenAPI validation, static collection, formatting, linting, **22 frontend tests across 12 files**, production builds, Storybook, Compose validation, both image builds, and a live all-service health/integrity smoke test.
5. Tagged releases publish versioned API and web images to GitHub Container Registry. Deployment prerequisites, migration sequencing, TLS settings, smoke tests, rollback, and off-host backup expectations are documented.
6. Liveness and readiness endpoints cover the API process, PostgreSQL, Redis, and Nginx; Compose also probes Celery. A local production-shaped deployment reached healthy status for all five long-running services.
7. PostgreSQL backup tooling creates restricted custom-format dumps, portable SHA-256 manifests, retention cleanup, and guarded restores. A real backup was checksum-verified, restored into the validation database, and followed by successful readiness and data-integrity checks.
8. Generated Storybook output was removed from version control and ignored. Obsolete Yarn/legacy CI paths and incorrect README URLs were removed.

## Completed Finance Roadmap

The finance roadmap was implemented on August 2, 2026 as an internal, payment-gateway-free workflow:

Operational behavior, accounting rules, API endpoints, and rollout notes are
documented in [FINANCE.md](FINANCE.md).

1. Every new enrollment receives a tenant-scoped invoice automatically; existing enrollments are backfilled during migration. Staff can update due dates, add installment schedules, review balances and statuses, and print invoices.
2. Payments remain in the existing immutable transaction ledger and now record an organization-owned manual payment method, optional installment allocation, and receipt/bank/mobile reference. Legacy clients safely default omitted methods to Cash.
3. Scholarship programs and enrollment awards calculate fixed or percentage discounts, validate dates and paid balances, and retain an audit record.
4. Expenses are categorized and posted against manual payment methods. Corrections use immutable void records rather than destructive edits or deletes.
5. Daily reconciliation stores opening balance, collections, posted expenses, expected balance, counted balance, and variance as a close-time snapshot.
6. Staff can queue overdue email reminders through the configured email worker or record manual guardian contact, with pending/sent/failed status history.
7. The protected Finance workspace follows the existing breadcrumb, page, table, modal, role, tenant-selection, loading, error, and notification patterns.

## Remaining Acceptance Work

- Run the documented organization A, organization B, and platform-admin smoke test in the actual staging environment before release.
- Add browser-level end-to-end tests and platform-specific deployment tests. These are coverage improvements, not confirmed feature defects.

Assessment behavior, role rules, APIs, publication semantics, and rollout notes
are documented in [ASSESSMENTS.md](ASSESSMENTS.md).

## Possible Future Features

| Product area | Potential additions |
| --- | --- |
| Learning operations | Attendance, rooms, recurring schedules, teacher availability, substitutions, homework, materials, and class announcements. |
| Exams and outcomes | Promotion history, transcript-style multi-session reporting, CSV mark import/export, and fixed-layout PDF generation. |
| Self-service portals | Teacher dashboards plus student/guardian schedules, balances, and attendance. Result portals are implemented. |
| Communication | Real notifications, in-app messaging, email/SMS templates, delivery tracking, and event/payment reminders. |
| Organization management | Multi-branch support within organizations, academic sessions, permissions by branch, and branch-level dashboards. |
| Reporting | PDF export, advanced filters, enrollment/revenue trends, audit history, and scheduled reports. |
| Platform maturity | API version lifecycle, background-job monitoring, centralized observability, rate limiting, automated staging promotion, and accessibility/end-to-end testing. |

## Verification Snapshot

- `pnpm lint`: passed.
- `pnpm format:check`: passed after repository-wide frontend normalization.
- `pnpm test:run`: 13 files and 23 tests passed.
- `pnpm build`: passed.
- `pnpm build-storybook`: passed; output remains untracked and ignored.
- `uv run python manage.py check`: passed.
- `uv run python manage.py makemigrations --check --dry-run`: no changes detected.
- `uv run python manage.py test`: 39 tests passed.
- `uv run python manage.py spectacular --validate`: generated and validated the schema without warnings or errors.
- Staged migrations plus `audit_data_integrity --fail-on-error`: passed against a copy of the existing database; the workspace database was not modified.
- `docker compose config --quiet` and production API/web image builds: passed.
- PostgreSQL, Redis, Gunicorn API, Celery, and Nginx web containers: all reached healthy status; API and web liveness plus API readiness returned HTTP 200.
- A custom-format PostgreSQL backup was created, checksum-verified, restored into the disposable validation database, and passed readiness plus the strict integrity audit afterward.

The engineering and deployment gaps listed in the original audit are resolved. The next release activities are the external two-organization staging smoke test, configuring encrypted off-host backup retention and monitoring in the target platform, and adding browser-level end-to-end coverage.
