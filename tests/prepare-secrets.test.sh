#!/bin/sh
set -eu

REPOSITORY_ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
PREPARE_SECRETS="$REPOSITORY_ROOT/contribo-deploiement/prepare-secrets.sh"
TEMP_DIR=$(mktemp -d)

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT INT TERM

printf 'test-db-password\n' > "$TEMP_DIR/db_password"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
    -out "$TEMP_DIR/old-private.pem" >/dev/null 2>&1
openssl rsa -pubout -in "$TEMP_DIR/old-private.pem" \
    -out "$TEMP_DIR/rsa_public.pem" >/dev/null 2>&1
rm "$TEMP_DIR/old-private.pem"

"$PREPARE_SECRETS" --secrets-dir "$TEMP_DIR" >/dev/null
openssl rsa -pubout -in "$TEMP_DIR/rsa_private.pem" \
    -out "$TEMP_DIR/expected-public.pem" >/dev/null 2>&1
cmp -s "$TEMP_DIR/expected-public.pem" "$TEMP_DIR/rsa_public.pem"

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
    -out "$TEMP_DIR/rsa_private.pem" >/dev/null 2>&1
if "$PREPARE_SECRETS" --secrets-dir "$TEMP_DIR" >"$TEMP_DIR/mismatch.out" 2>&1; then
    printf 'expected mismatched RSA keys to fail\n' >&2
    exit 1
fi
grep -F 'RSA private and public keys do not match' "$TEMP_DIR/mismatch.out"

printf 'prepare-secrets tests passed\n'
