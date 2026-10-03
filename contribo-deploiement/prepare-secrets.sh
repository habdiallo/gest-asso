#!/bin/sh
set -eu

usage() {
    cat >&2 <<'EOF'
Usage: prepare-secrets.sh [options]

Options:
  --env-file FILE          Read the *_FILE_PATH values from a Compose env file.
  --secrets-dir DIRECTORY  Use DIRECTORY when no *_FILE_PATH value is supplied.
  --runtime-uid UID        Runtime owner, default: 10001.
  --runtime-gid GID        Runtime group, default: 10001.
  --require-bootstrap      Require bootstrap_admin_password to exist and be non-empty.
  --check-only             Do not change files, only validate the configuration.
  -h, --help               Show this help.
EOF
    exit 2
}

fail() {
    printf 'prepare-secrets: %s\n' "$1" >&2
    exit 1
}

ENV_FILE=''
SECRETS_DIR=${SECRETS_DIR:-/opt/contribo/secrets}
RUNTIME_UID=${RUNTIME_UID:-10001}
RUNTIME_GID=${RUNTIME_GID:-10001}
REQUIRE_BOOTSTRAP=false
CHECK_ONLY=false

while [ "$#" -gt 0 ]; do
    case "$1" in
        --env-file)
            [ "$#" -ge 2 ] || usage
            ENV_FILE=$2
            shift 2
            ;;
        --secrets-dir)
            [ "$#" -ge 2 ] || usage
            SECRETS_DIR=$2
            shift 2
            ;;
        --runtime-uid)
            [ "$#" -ge 2 ] || usage
            RUNTIME_UID=$2
            shift 2
            ;;
        --runtime-gid)
            [ "$#" -ge 2 ] || usage
            RUNTIME_GID=$2
            shift 2
            ;;
        --require-bootstrap)
            REQUIRE_BOOTSTRAP=true
            shift
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            usage
            ;;
    esac
done

[ "$(id -u)" -eq 0 ] || fail 'run this command as root'
[ -z "$ENV_FILE" ] || [ -f "$ENV_FILE" ] || fail "env file does not exist: $ENV_FILE"

read_env_value() {
    key=$1
    [ -n "$ENV_FILE" ] || return 0
    awk -v key="$key" '
        index($0, key "=") == 1 {
            value = substr($0, length(key) + 2)
            if (value ~ /^".*"$/) value = substr(value, 2, length(value) - 2)
            if (value ~ /^'"'"'.*'"'"'$/) value = substr(value, 2, length(value) - 2)
            print value
            exit
        }
    ' "$ENV_FILE"
}

configured_path() {
    variable=$1
    fallback=$2
    value=$(read_env_value "$variable")
    if [ -n "$value" ]; then
        printf '%s\n' "$value"
    else
        printf '%s\n' "$fallback"
    fi
}

DB_PASSWORD_PATH=$(configured_path DB_PASSWORD_FILE_PATH "$SECRETS_DIR/db_password")
RSA_PUBLIC_PATH=$(configured_path RSA_PUBLIC_KEY_FILE_PATH "$SECRETS_DIR/rsa_public.pem")
RSA_PRIVATE_PATH=$(configured_path RSA_PRIVATE_KEY_FILE_PATH "$SECRETS_DIR/rsa_private.pem")
BOOTSTRAP_PATH=$(configured_path BOOTSTRAP_ADMIN_PASSWORD_FILE_PATH "$SECRETS_DIR/bootstrap_admin_password")

for path in "$DB_PASSWORD_PATH" "$RSA_PUBLIC_PATH" "$RSA_PRIVATE_PATH" "$BOOTSTRAP_PATH"; do
    case "$path" in
        /*) ;;
        *) fail "secret path must be absolute: $path" ;;
    esac
done

prepare_parent() {
    parent=$(dirname "$1")
    if [ "$CHECK_ONLY" = false ]; then
        install -d -o "$RUNTIME_UID" -g "$RUNTIME_GID" -m 700 "$parent"
    else
        [ -d "$parent" ] || fail "secret directory is missing: $parent"
    fi
}

prepare_parent "$DB_PASSWORD_PATH"
prepare_parent "$RSA_PUBLIC_PATH"
prepare_parent "$RSA_PRIVATE_PATH"
prepare_parent "$BOOTSTRAP_PATH"

if [ "$CHECK_ONLY" = false ] && [ ! -e "$RSA_PRIVATE_PATH" ]; then
    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$RSA_PRIVATE_PATH" >/dev/null 2>&1
fi

if [ "$CHECK_ONLY" = false ] && [ -s "$RSA_PRIVATE_PATH" ] && [ ! -e "$RSA_PUBLIC_PATH" ]; then
    openssl rsa -pubout -in "$RSA_PRIVATE_PATH" -out "$RSA_PUBLIC_PATH" >/dev/null 2>&1
fi

require_non_empty() {
    label=$1
    path=$2
    [ -f "$path" ] || fail "$label secret is missing: $path"
    [ -s "$path" ] || fail "$label secret is empty: $path"
}

require_non_empty DB_PASSWORD "$DB_PASSWORD_PATH"
require_non_empty RSA_PRIVATE_KEY "$RSA_PRIVATE_PATH"
require_non_empty RSA_PUBLIC_KEY "$RSA_PUBLIC_PATH"

if [ "$REQUIRE_BOOTSTRAP" = true ] || [ -e "$BOOTSTRAP_PATH" ]; then
    require_non_empty BOOTSTRAP_ADMIN_PASSWORD "$BOOTSTRAP_PATH"
fi

for path in "$DB_PASSWORD_PATH" "$RSA_PUBLIC_PATH" "$RSA_PRIVATE_PATH"; do
    if [ "$CHECK_ONLY" = false ]; then
        chown "$RUNTIME_UID:$RUNTIME_GID" "$path"
        chmod 400 "$path"
    fi
done

if [ -e "$BOOTSTRAP_PATH" ]; then
    if [ "$CHECK_ONLY" = false ]; then
        chown "$RUNTIME_UID:$RUNTIME_GID" "$BOOTSTRAP_PATH"
        chmod 400 "$BOOTSTRAP_PATH"
    fi
fi

command -v setpriv >/dev/null 2>&1 || fail 'setpriv from util-linux is required for the UID readability check'

for path in "$DB_PASSWORD_PATH" "$RSA_PUBLIC_PATH" "$RSA_PRIVATE_PATH"; do
    setpriv --reuid="$RUNTIME_UID" --regid="$RUNTIME_GID" --clear-groups \
        sh -c 'test -r "$1" && test -s "$1"' sh "$path" \
        || fail "secret is not readable by UID $RUNTIME_UID: $path"
done

if [ "$REQUIRE_BOOTSTRAP" = true ] || [ -e "$BOOTSTRAP_PATH" ]; then
    setpriv --reuid="$RUNTIME_UID" --regid="$RUNTIME_GID" --clear-groups \
        sh -c 'test -r "$1" && test -s "$1"' sh "$BOOTSTRAP_PATH" \
        || fail "bootstrap secret is not readable by UID $RUNTIME_UID: $BOOTSTRAP_PATH"
fi

printf 'prepare-secrets: secrets are ready for UID %s, paths validated from %s\n' \
    "$RUNTIME_UID" "${ENV_FILE:-defaults}"
