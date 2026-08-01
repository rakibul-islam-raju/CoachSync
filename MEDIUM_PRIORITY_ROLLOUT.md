# Medium-Priority Remediation Rollout

## Tenant selection

Organization users are scoped to an active membership. Platform admins and admin
staff can read across organizations, but every platform-level write must select a
tenant with the `X-Organization-ID` header, the `organization` query parameter,
or an `organization` field. The frontend stores the selected tenant in
`cms_organization_id` and sends the header automatically.

## Staged database rollout

Take a verified database backup before starting. Stop after the foundation and
backfill boundary so production data can be audited before constraints are added:

```bash
uv run python manage.py migrate organization 0008
uv run python manage.py audit_data_integrity --fail-on-error
uv run python manage.py migrate
```

`organization.0007` and `student.0010` add nullable tenant and ledger fields.
`organization.0008` creates the Legacy Organization, backfills ownership, and
creates memberships for legacy organization users. `organization.0009` and
`student.0011` require ownership and enable uniqueness/check constraints.

The final ledger migration removes legacy zero-value transactions because they
have no financial effect and cannot be valid immutable payment/reversal entries.
It deliberately stops on negative legacy transactions; those must be mapped to
an original payment and represented as a reversal before retrying.

## Verification performed

The staged migrations were applied to a copy of the repository database. Its one
legacy zero-value transaction was repaired by the migration and the strict audit
then passed. Automated tests cover two-organization list/detail/reference
isolation, explicit platform tenant writes, schedule overlap and rollback,
enrollment/payment/reversal behavior, profile field containment, exam management,
and the calendar empty state.

Before production release, run the repository verification commands and complete
a staging smoke test as organization A, organization B, and a platform admin.
Confirm that each tenant cannot list, retrieve, mutate, reference, or infer the
other tenant's records, and that switching the platform tenant changes all lists
and dashboard statistics.
