#!/bin/sh
set -eu

fail() {
    printf 'backend-entrypoint: %s\n' "$1" >&2
    exit 1
}

require_secret_file() {
    label=$1
    file=$2

    [ -n "$file" ] || fail "$label secret path is empty"
    [ -f "$file" ] || fail "$label secret file is missing"
    [ -r "$file" ] || fail "$label secret file is not readable by UID $(id -u)"
    [ -s "$file" ] || fail "$label secret file is empty"
}

require_file_reference() {
    label=$1
    reference=${2:-}

    case "$reference" in
        file:*) require_secret_file "$label" "${reference#file:}" ;;
    esac
}

if [ "${DB_PASSWORD_FILE+x}" = x ]; then
    require_secret_file DB_PASSWORD "$DB_PASSWORD_FILE"
    DB_PASSWORD="$(cat "$DB_PASSWORD_FILE")" || fail 'unable to read DB_PASSWORD secret'
    [ -n "$DB_PASSWORD" ] || fail 'DB_PASSWORD secret is empty'
    export DB_PASSWORD
fi

require_file_reference RSA_PUBLIC_KEY "${RSA_PUBLIC_KEY:-}"
require_file_reference RSA_PRIVATE_KEY "${RSA_PRIVATE_KEY:-}"

if [ "${BOOTSTRAP_ADMIN_ENABLED:-false}" = true ]; then
    require_secret_file BOOTSTRAP_ADMIN_PASSWORD "${BOOTSTRAP_ADMIN_PASSWORD_FILE:-}"
fi

exec java -jar /app/app.jar
