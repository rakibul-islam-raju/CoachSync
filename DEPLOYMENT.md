# Deployment and Operations

## Production prerequisites

- A TLS-terminating ingress or reverse proxy.
- Persistent PostgreSQL, Redis, backup, and media storage.
- A deployment-specific `.env` created from `.env.example` and stored outside
  version control.
- Unique, randomly generated `SECRET_KEY` and `POSTGRES_PASSWORD` values.
- SMTP credentials when console email is not appropriate.

For HTTPS deployments set `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`,
`CSRF_COOKIE_SECURE`, and `TRUST_PROXY_HEADERS` to `True`. Set
`ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`,
`FRONTEND_BASE_URL`, and both Vite URLs to the public origins. Enable HSTS only
after HTTPS is confirmed across every relevant host.

## Release procedure

1. Back up PostgreSQL and verify the generated checksum.
2. Pull the versioned API and web images published by the release workflow.
3. Review the migration history in `FEATURE_AUDIT.md`, finance backfill notes in
   `FINANCE.md`, and assessment rollout notes in `ASSESSMENTS.md` before
   upgrading an older database.
4. Apply migrations once from the API image.
5. Start API and worker containers, then wait for `/health/ready`.
6. Start the web container and verify its `/health/live` endpoint.
7. Complete organization A, organization B, and platform-admin smoke tests.
8. In each selected organization, verify an invoice and manual payment. In a
   non-production test organization, also verify an expense void, daily
   reconciliation, and overdue-reminder delivery through Celery.
9. In a non-production organization, generate an exam roster, enter and verify
   marks, publish a result, and confirm both student and guardian access plus
   Celery email delivery.

The API container runs migrations by default. Set `APPLY_MIGRATIONS=false` when
the deployment platform runs migrations as a separate release job. Celery never
runs migrations in the provided Compose configuration.

## Backups

Create a compressed, checksummed PostgreSQL backup:

```bash
docker compose --profile tools run --rm backup
```

Create `backups/` as the deployment user before the first run. If that user is
not UID/GID `1000:1000`, set `BACKUP_UID` and `BACKUP_GID` accordingly.

Backups are written to `./backups` and retained for 14 days by default. Copy
them to encrypted off-host storage; a local directory is not a disaster-recovery
strategy. Regularly test restoration into a separate database.

Restore is intentionally guarded and destructive:

```bash
docker compose --profile tools run --rm \
  -e RESTORE_CONFIRM=restore \
  backup /scripts/restore_database.sh /backups/coachsync-TIMESTAMP.dump
```

Stop application writers before restoring. Never test a restore against the
production database.

## Health and monitoring

- `/health/live` confirms that the API process can answer HTTP requests.
- `/health/ready` checks PostgreSQL and Redis, returning HTTP 503 if either is
  unavailable.
- The web container exposes its own `/health/live` response.
- Application, Gunicorn, and status logs are written to stdout for collection by
  the container platform.

Alert on repeated readiness failures, restart loops, Celery health failures,
database capacity, backup age, and HTTP 5xx rates.

## Rollback

Roll back application containers to the previous immutable image tag. Database
migrations in this release include data transformations and should not be
blindly reversed. Restore the pre-release backup when a database rollback is
required, then verify tenant isolation and ledger totals before reopening writes.
