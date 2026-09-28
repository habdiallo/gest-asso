#!/bin/sh
set -eu

if [ -n "${DB_PASSWORD_FILE:-}" ] && [ -r "$DB_PASSWORD_FILE" ]; then
    export DB_PASSWORD="$(cat "$DB_PASSWORD_FILE")"
fi

exec java -jar /app/app.jar
