#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
    echo "Usage: RESTORE_CONFIRM=restore <script> /backups/coachsync-TIMESTAMP.dump" >&2
    exit 1
fi
if [ "${RESTORE_CONFIRM:-}" != "restore" ]; then
    echo "Set RESTORE_CONFIRM=restore to acknowledge that the target database will be overwritten." >&2
    exit 1
fi
if [ -z "${DATABASE_URL:-}" ] && [ -z "${PGHOST:-}" ]; then
    echo "Set DATABASE_URL or the standard PGHOST/PGPORT/PGDATABASE/PGUSER variables." >&2
    exit 1
fi

backup_file="$1"
if [ ! -f "${backup_file}" ]; then
    echo "Backup not found: ${backup_file}" >&2
    exit 1
fi
if [ -f "${backup_file}.sha256" ]; then
    expected_checksum="$(awk 'NR == 1 { print $1 }' "${backup_file}.sha256")"
    actual_checksum="$(sha256sum "${backup_file}" | awk '{ print $1 }')"
    if [ "${expected_checksum}" != "${actual_checksum}" ]; then
        echo "Checksum verification failed for: ${backup_file}" >&2
        exit 1
    fi
    echo "Checksum verified: ${backup_file}"
fi

if [ -n "${DATABASE_URL:-}" ]; then
    pg_restore \
        --dbname="${DATABASE_URL}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-acl \
        "${backup_file}"
else
    pg_restore \
        --clean \
        --if-exists \
        --no-owner \
        --no-acl \
        --dbname="${PGDATABASE}" \
        "${backup_file}"
fi

echo "Restore completed from: ${backup_file}"
