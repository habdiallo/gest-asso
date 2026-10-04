#!/bin/sh
# Prépare ou vérifie le répertoire de secrets lu par le backend (configtree).
# Fichiers : db_password, rsa_private.pem, rsa_public.pem, bootstrap_admin_password (optionnel).
set -eu

DIR=/opt/contribo/secrets
RUNTIME_UID=10001
LOCAL=false
CHECK_ONLY=false
GENERATE_DB_PASSWORD=false

usage() {
    printf 'Usage: %s [--dir DIR] [--uid UID] [--local] [--generate-db-password] [--check-only]\n' "$0" >&2
    exit 2
}
fail() { printf 'init-secrets: %s\n' "$1" >&2; exit 1; }

while [ "$#" -gt 0 ]; do
    case "$1" in
        --dir) [ "$#" -ge 2 ] || usage; DIR=$2; shift 2 ;;
        --uid) [ "$#" -ge 2 ] || usage; RUNTIME_UID=$2; shift 2 ;;
        --local) LOCAL=true; shift ;;
        --generate-db-password) GENERATE_DB_PASSWORD=true; shift ;;
        --check-only) CHECK_ONLY=true; shift ;;
        *) usage ;;
    esac
done

[ "$LOCAL" = true ] || [ "$(id -u)" -eq 0 ] || fail 'run as root on a server, or pass --local'

if [ "$CHECK_ONLY" = false ]; then
    mkdir -p "$DIR"
    [ -s "$DIR/db_password" ] || [ "$GENERATE_DB_PASSWORD" = false ] \
        || (umask 077; openssl rand -base64 32 > "$DIR/db_password")
    [ -e "$DIR/rsa_private.pem" ] \
        || openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$DIR/rsa_private.pem" 2>/dev/null
    [ -e "$DIR/rsa_public.pem" ] \
        || openssl rsa -pubout -in "$DIR/rsa_private.pem" -out "$DIR/rsa_public.pem" 2>/dev/null
fi

for name in db_password rsa_private.pem rsa_public.pem; do
    [ -s "$DIR/$name" ] || fail "missing or empty secret: $DIR/$name"
done
[ ! -e "$DIR/bootstrap_admin_password" ] || [ -s "$DIR/bootstrap_admin_password" ] \
    || fail "bootstrap_admin_password exists but is empty: remove it or fill it"
openssl rsa -pubout -in "$DIR/rsa_private.pem" 2>/dev/null | cmp -s - "$DIR/rsa_public.pem" \
    || fail "RSA private and public keys do not match in $DIR"

if [ "$CHECK_ONLY" = false ]; then
    if [ "$LOCAL" = true ]; then
        # Poste de développement : lisible par les UID des conteneurs, sans root.
        chmod 755 "$DIR" && chmod 644 "$DIR"/*
    else
        chown -R "$RUNTIME_UID:$RUNTIME_UID" "$DIR" && chmod 700 "$DIR" && chmod 400 "$DIR"/*
    fi
fi

if [ "$LOCAL" = false ] && command -v setpriv >/dev/null 2>&1; then
    for file in "$DIR"/*; do
        setpriv --reuid="$RUNTIME_UID" --regid="$RUNTIME_UID" --clear-groups test -r "$file" \
            || fail "secret not readable by UID $RUNTIME_UID: $file"
    done
fi

printf 'init-secrets: %s is ready\n' "$DIR"
