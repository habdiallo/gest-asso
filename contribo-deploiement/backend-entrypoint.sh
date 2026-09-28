#!/bin/sh
set -eu

if [ -n "${DB_PASSWORD_FILE:-}" ] && [ -r "$DB_PASSWORD_FILE" ]; then
    export DB_PASSWORD="$(cat "$DB_PASSWORD_FILE")"
fi

if [ -n "${JWT_SECRET_FILE:-}" ] && [ -r "$JWT_SECRET_FILE" ]; then
    export JWT_SECRET="$(cat "$JWT_SECRET_FILE")"
fi

exec java -jar /app/app.jar
