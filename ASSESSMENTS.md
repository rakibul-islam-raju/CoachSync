# Exams and Outcomes

## Workflow

1. Organization staff create an exam period and its subject exams.
2. Staff generate a frozen candidate roster from active enrollments in the
   exam period's batch.
3. Staff enter decimal marks or mark candidates absent/exempt, save drafts, and
   submit each complete subject sheet.
4. An organization admin verifies every subject sheet.
5. The admin reviews completion, selects an organization-owned grade scale,
   chooses whether rank is visible, and publishes.
6. Publication creates immutable per-student outcome and subject-line snapshots.
   Student and opted-in guardian email deliveries are queued after commit.
7. Students see only their own published outcomes. Guardians see only students
   linked through an active `StudentGuardian` record.

Published marks are locked. An admin must reopen the current publication before
correcting marks; the old snapshot is retained as superseded and the next
publication receives a new version.

## Permissions

- Organization staff and above can generate rosters, enter marks, and submit.
- Organization admins and platform roles can verify, publish, and reopen.
- Students and guardians cannot access operational assessment endpoints.
- Rank is hidden from self-service responses unless enabled at publication.
- Every operational query and relationship is organization-scoped.

## Core APIs

- `assessments/grade-scales`
- `assessments/exam-types/{id}/candidates/generate`
- `assessments/exams/{id}/marks`
- `assessments/exams/{id}/marks/submit`
- `assessments/exams/{id}/marks/verify`
- `assessments/exam-types/{id}/review`
- `assessments/exam-types/{id}/publish`
- `assessments/publications/{id}/reopen`
- `assessments/my-outcomes`
- `assessments/my-children`
- `assessments/my-children/{student_id}/outcomes`

## Release notes

Apply the `user`, `organization`, `student`, and `assessment` migrations before
starting the API or worker. Existing students remain valid, but staff should
resend/setup invitations when those legacy users do not yet have passwords.
Configure SMTP and run Celery for publication email delivery; portal results do
not depend on email availability. Print-friendly browser report cards are the
current download path. Fixed-layout PDF and CSV mark import/export remain future
extensions.
