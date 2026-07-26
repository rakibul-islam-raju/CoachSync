# Feature Audit and Roadmap

_Audited: July 26, 2026_

## Scope and Status

This inventory is based on the Django models, serializers, views, URLs, settings, management commands, React routes and pages, Redux APIs, tests, Docker files, and recent Git history. It is a code audit, not a production acceptance test.

- **Implemented**: usable code exists across the relevant backend and frontend layers.
- **Incomplete**: code is missing, disconnected, or has a confirmed defect.
- **Possible future**: a product extension suggested by the current domain; no implementation is claimed.

## Implemented Features

| Area | Current capability |
| --- | --- |
| Authentication | Email/password login, JWT issuance/persistence/rotation, automatic token refresh, authenticated route guard, current-user lookup, logout, password-reset email requests, token-based password setup, and authenticated password changes. |
| Users and roles | Custom users with admin, admin staff, organization admin/staff, student, and teacher roles. Employee listing, search, filters, creation, editing, deletion UI, and account activation fields exist. |
| Academic catalog | Subject, class, teacher, and batch list/create/update/delete APIs and management screens. Lists support pagination, search, ordering, and status filters. |
| Batch management | Batch dates, fee, class association, detail page, and a paginated list of enrolled students. |
| Student management | Student creation, generated student ID, list/search/filter/order, detail view, personal data, active status, and enrollment summary. |
| Enrollment and payments | Batch enrollment, duplicate-enrollment validation, discount/reference fields, payment entry, transaction history, and paid/due summary counts. |
| Scheduling | Schedule list, search, filters, bulk draft creation, editing, deletion, and month/week/day calendar views with event details. |
| Dashboard | Active batch/class/teacher counters, student and enrollment charts, and yearly monthly-transaction chart. |
| Backend utilities | Django admin, Swagger/ReDoc schema pages, seed commands, initial super-admin creation, status-code logging, Redis/Celery worker, and configurable console/SMTP email delivery. |
| UI foundation | Reusable forms, tables, pagination, drawers, modals, error/loading states, responsive navigation, Storybook stories, and Material UI theming. |

## Completed High-Priority Remediation

The high-priority findings from the original audit were implemented on July 26, 2026:

1. The frontend production build was restored by adding the maintained `react-big-calendar` declarations.
2. A backend refresh endpoint, correctly shaped refresh request, rotated-token storage, retry deduplication, and expired-session logout handling were added.
3. Password request, set, and change flows now have backend validation, Redux mutations, routes, forms, feedback, and regression tests.
4. Student detail, update, delete, and batch-enrollment links now consistently use `student_id`; partial student updates and ID generation were also repaired.
5. The Celery worker is enabled in Compose. Email backend credentials and frontend reset-link origin are environment-driven, with safe console-email development defaults and SMTP support.

## Remaining Incomplete or Defective Features

### Medium priority: feature exists but is incomplete or unsafe

1. **Role behavior is inconsistent.** All authenticated users see the same admin menu, while APIs require organization-staff privileges. Employee edit/delete APIs are superuser-only even though lower roles see the controls. The organization user filter calls `exclude()` without assigning its result, allowing admin-level rows to remain visible.
2. **Organization tenancy is only nominal.** There is no organization/branch model or row-level organization ownership; users, students, teachers, schedules, and statistics are global.
3. **Exam management is backend-only.** Exam type and exam models/APIs exist, but there are no frontend pages or Redux endpoints. The schedule form contains commented exam-selection logic, and the model TODO for automatically creating exam schedules is unresolved. Exam/exam-type update views also use nested read serializers instead of dedicated update serializers.
4. **Enrollment editing is unreliable.** Duplicate validation does not exclude the current enrollment, so an update retaining the same student and batch can reject itself. Enrollments have no delete/cancel lifecycle.
5. **Payment rules are incomplete.** Discounts do not reduce the paid/due calculation. The backend accepts negative or over-limit transactions, and the enrollment ID in a transaction URL is not enforced against the request body/queryset. Payments cannot be corrected, reversed, deleted, receipted, or exported.
6. **Schedule conflict protection is client-only.** Drafts reject duplicate batch/date/time entries in local state, but the backend does not prevent teacher or batch collisions. Exam selection is unavailable, and the calendar silently renders nothing when a month has no events.
7. **Profile, account, messages, and notifications are placeholders.** Profile/My Account menu items only close the menu. Mail and notification icons use hard-coded counts and have no routes or APIs.
8. **Data integrity needs hardening.** Class-name case-insensitive uniqueness remains a TODO. Student/teacher user creation is not wrapped in a database transaction and cleanup can reference variables that were never created. Date ranges, pass marks, total marks, discounts, and several cross-model relationships lack business validation.

### Engineering and deployment gaps

- Django is configured for SQLite even though Compose starts PostgreSQL and supplies unused `PG_*` variables. `ALLOWED_HOSTS`, email settings, and `FRONTEND_BASE_URL` also ignore their environment values.
- Frontend dependency workflows disagree: local guidance/lockfile use pnpm, the Dockerfile uses Yarn, and CI uses npm with old Node/Python versions. The README also advertises incorrect HTTPS URLs/ports.
- Automated coverage remains limited to **6 backend tests** and **13 frontend tests across 6 files**. Core catalog CRUD, payments, schedules, permissions, and broader API integration are still untested.
- OpenAPI generation completes with no errors but retains three warnings around user/enrollment schema fields. CI formats code but does not run builds, migrations, backend tests, or frontend tests.
- Generated `storybook-static/` output is tracked, while production/deployment automation, health checks, backups, and environment-specific settings are absent.

## Possible Future Features

| Product area | Potential additions |
| --- | --- |
| Learning operations | Attendance, rooms, recurring schedules, teacher availability, substitutions, homework, materials, and class announcements. |
| Exams and outcomes | Exam UI, marks entry, grade rules, report cards, rankings, promotion history, and downloadable results. |
| Finance | Invoices, receipts, payment methods, installments, discounts/scholarships, refunds, expense tracking, cash reconciliation, and overdue reminders. |
| Self-service portals | Role-specific student, teacher, and guardian dashboards with profile management, schedules, balances, attendance, and results. |
| Communication | Real notifications, in-app messaging, email/SMS templates, delivery tracking, and event/payment reminders. |
| Organization management | Multi-branch tenancy, academic sessions, permissions by branch, data isolation, and branch-level dashboards. |
| Reporting | CSV/PDF export, advanced filters, enrollment/revenue trends, audit history, and scheduled reports. |
| Platform maturity | API version lifecycle, background-job monitoring, observability, rate limiting, secure production settings, CI/CD, backups, and accessibility/end-to-end testing. |

## Verification Snapshot

- `pnpm lint`: passed.
- `pnpm test -- --run`: 6 files and 13 tests passed.
- `pnpm build`: passed.
- `python manage.py check`: passed.
- `python manage.py makemigrations --check --dry-run`: no changes detected.
- `python manage.py test`: 6 tests passed.
- `python manage.py spectacular --validate`: generated a schema with no errors and three warnings.

The next recommended implementation order is: align permissions and role-specific navigation; complete exam management; harden finance and schedule conflicts; switch deployment to the intended database; then expand automated tests and deployment safeguards.
