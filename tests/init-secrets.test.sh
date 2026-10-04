#!/bin/sh
# Tests sans root du mode --local de init-secrets.sh.
set -eu

SCRIPT="$(CDPATH='' cd -- "$(dirname "$0")/.." && pwd)/contribo-deploiement/init-secrets.sh"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT INT TERM

expect_failure() {
    expected=$1
    shift
    if "$@" >"$TEMP_DIR/out" 2>&1; then
        printf 'expected failure: %s\n' "$*" >&2
        exit 1
    fi
    grep -F "$expected" "$TEMP_DIR/out" >/dev/null || { cat "$TEMP_DIR/out" >&2; exit 1; }
}

DIR="$TEMP_DIR/secrets"
expect_failure 'missing or empty secret' "$SCRIPT" --local --dir "$DIR"

"$SCRIPT" --local --dir "$DIR" --generate-db-password >/dev/null
"$SCRIPT" --local --dir "$DIR" --check-only >/dev/null
test -s "$DIR/db_password"
test ! -e "$DIR/bootstrap_admin_password"
PASSWORD=$(cat "$DIR/db_password")
"$SCRIPT" --local --dir "$DIR" --generate-db-password >/dev/null
[ "$PASSWORD" = "$(cat "$DIR/db_password")" ] || { printf 'db_password must not be regenerated\n' >&2; exit 1; }

: > "$DIR/bootstrap_admin_password"
expect_failure 'bootstrap_admin_password exists but is empty' "$SCRIPT" --local --dir "$DIR" --check-only
rm "$DIR/bootstrap_admin_password"

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$DIR/rsa_private.pem" 2>/dev/null
expect_failure 'RSA private and public keys do not match' "$SCRIPT" --local --dir "$DIR" --check-only

if [ "$(id -u)" -ne 0 ]; then
    expect_failure 'run as root' "$SCRIPT" --dir "$DIR" --check-only
fi

printf 'init-secrets tests passed\n'
