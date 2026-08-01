#!/bin/sh
set -eu

if [ "${APPLY_MIGRATIONS:-true}" = "true" ]; then
    python manage.py migrate --noinput
fi

if [ "${COLLECT_STATIC:-true}" = "true" ]; then
    python manage.py collectstatic --noinput
fi

exec gunicorn backend.wsgi:application --config gunicorn.conf.py
