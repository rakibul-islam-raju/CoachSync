# Finance Operations

CoachSync finance is an internal, organization-scoped accounting workflow. It
does not integrate with a payment gateway and contains no checkout session,
provider token, webhook, settlement, or refund-provider state. Staff record
payments that were received outside CoachSync, such as cash, bank transfers,
and mobile banking payments.

## Access and tenancy

The Finance navigation item and `/finance` route are available to operational
roles: platform admin, platform admin staff, organization admin, and
organization staff. Backend finance endpoints use the same role checks and
organization resolution as students, enrollments, and schedules.

Organization users can only read and write records belonging to one of their
memberships. Platform-level users must select an organization before any
finance write. Relationships such as an invoice, scholarship, payment method,
expense category, and enrollment must belong to the same organization.

## Staff workflow

### Invoices and installments

Creating an enrollment automatically issues one invoice. The invoice uses the
enrollment's discount-aware net payable amount and receives a due date 30 days
after issue by default. Staff can change the due date and notes, print the
invoice, and divide it into installments.

Installment amounts must be positive and their combined value cannot exceed
the invoice total. An installment cannot be due before the invoice issue date.
Payments may be assigned to an installment, but the enrollment remains the
authoritative account balance.

Invoice statuses are calculated from the enrollment ledger:

- `unpaid`: no payment has been recorded and the due date has not passed.
- `partial`: some money has been received and a balance remains before the due
  date.
- `overdue`: a collectible balance remains after the due date.
- `paid`: the balance is zero.
- `cancelled`: the associated enrollment was cancelled.

Invoices preserve financial history and cannot be deleted or moved to another
enrollment after issue.

### Recording payments

Payments are entered from the student's enrollment transaction history. Staff
record:

- a positive amount;
- a manual payment method;
- an optional installment;
- an optional receipt, bank, or mobile transaction reference; and
- an optional remark.

Cash, Bank transfer, and Mobile banking methods are created automatically for
each organization. If an older client omits the payment method, the backend
uses the organization's active Cash method. Additional offline methods can be
created under **Finance → Payment methods**.

Payments cannot exceed either the enrollment balance or the selected
installment balance. They cannot be added to cancelled enrollments. Posted
payments are immutable; mistakes are corrected through the existing reversal
or replacement-payment action, preserving the original record.

### Scholarships

Scholarship programs support fixed amounts and percentages. Optional validity
dates control when a program can be awarded. Awarding a scholarship calculates
and stores the discount on the enrollment.

An award cannot exceed the enrollment total or reduce the payable amount below
payments already recorded. Each enrollment can have one scholarship award, and
awards cannot be deleted because they form part of the financial history.

### Expenses

Create expense categories before recording expenses. Every expense records a
date, positive amount, payment method, description, and optional vendor.

Posted expenses cannot be edited or deleted. Use **Void expense** with a reason
for corrections, then enter a replacement expense if necessary. Voided
expenses remain visible but are excluded from finance totals and future
reconciliations.

### Cash reconciliation

Use **Finance → Reconciliation → Close day** to reconcile one payment method
for a business date. The close records:

- opening balance;
- reversal-aware collections recorded on that date;
- posted expenses recorded on that date;
- expected closing balance;
- staff-counted balance; and
- the resulting variance.

Only one reconciliation is allowed per organization, payment method, and
business date. Values are stored as a close-time snapshot, so later payment
reversals or expense voids do not rewrite a completed reconciliation.

### Overdue reminders

The reminder action is shown for overdue invoices with a collectible balance.
Staff can either queue an email to the student's address or record a manual
contact note. Reminder records retain their channel, message, status, and send
time.

Email reminders use the existing Celery worker and configured Django email
backend. Development defaults to console email; production SMTP variables are
documented in `.env.example`. A reminder records `failed` if it cannot be
queued. Paying the invoice prevents additional reminders.

## Finance API

All endpoints are below `/api/v1/finance/` and require authentication.
Collection endpoints are paginated and support the search, filter, and ordering
fields declared by their views.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `summary` | `GET` | Invoiced, collected, outstanding, expense, net-cash, and overdue totals |
| `invoices` | `GET`, `POST` | List invoices or repair a missing historical invoice |
| `invoices/{id}` | `GET`, `PATCH` | Review or update invoice dates and notes |
| `installments` | `GET`, `POST` | List and create invoice installments |
| `payment-methods` | `GET`, `POST` | List and create offline payment methods |
| `scholarships` | `GET`, `POST` | List and define scholarship programs |
| `scholarship-awards` | `GET`, `POST` | List and award enrollment scholarships |
| `expense-categories` | `GET`, `POST` | List and create expense categories |
| `expenses` | `GET`, `POST` | List and post expenses |
| `expenses/{id}/void` | `POST` | Void a posted expense with a reason |
| `reconciliations` | `GET`, `POST` | List and close daily reconciliations |
| `reminders` | `GET`, `POST` | List and create overdue reminder records |
| `reminders/{id}/send` | `POST` | Queue email or record manual contact completion |

Payment entry remains nested under the authoritative enrollment endpoint:

```text
POST /api/v1/students/enrolls/{enrollment_id}/transactions
POST /api/v1/students/enrolls/{enrollment_id}/transactions/{transaction_id}/reverse
```

The generated Swagger UI at the API root and ReDoc at `/redoc/` contain the
complete request and response schemas.

## Migration and release notes

Apply migrations before deploying the updated API:

```bash
cd backend
uv run python manage.py migrate
```

The finance migrations:

1. create finance tables and constraints;
2. add payment method, installment, and reference fields to transactions;
3. create the three default payment methods for existing organizations;
4. backfill one invoice for every existing enrollment; and
5. add immutable reconciliation snapshot fields.

The backfill does not modify enrollment amounts or existing transaction
amounts. Existing transactions remain valid even though their newly added
classification fields are nullable.

Before production rollout, back up the database and follow the migration and
rollback sequence in [DEPLOYMENT.md](DEPLOYMENT.md). After migration, verify an
invoice, manual payment, expense void, reconciliation, and reminder in two
separate organizations.

## Verification

The finance implementation is covered by tenant, invoice/default-method,
scholarship, installment-payment, expense-void, reconciliation, and reminder
tests.

```bash
cd backend
uv run python manage.py test finance student
uv run python manage.py makemigrations --check --dry-run
uv run python manage.py spectacular --file /tmp/openapi.yaml --validate

cd ../frontend
pnpm test:run
pnpm lint
pnpm format:check
pnpm build
```

