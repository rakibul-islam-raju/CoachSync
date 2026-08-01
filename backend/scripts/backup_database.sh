#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ] && [ -z "${PGHOST:-}" ]; then
    echo "Set DATABASE_URL or the standard PGHOST/PGPORT/PGDATABASE/PGUSER variables." >&2
    exit 1
fi

backup_dir="${BACKUP_DIR:-/backups}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/coachsync-${timestamp}.dump"

mkdir -p "${backup_dir}"
umask 077
if [ -n "${DATABASE_URL:-}" ]; then
    pg_dump --dbname="${DATABASE_URL}" --format=custom --no-owner --no-acl --file="${backup_file}"
else
    pg_dump --format=custom --no-owner --no-acl --file="${backup_file}"
fi
(
    cd "${backup_dir}"
    sha256sum "$(basename "${backup_file}")" > "$(basename "${backup_file}").sha256"
)
find "${backup_dir}" -type f -name 'coachsync-*.dump*' -mtime "+${retention_days}" -delete

echo "Backup created: ${backup_file}"
