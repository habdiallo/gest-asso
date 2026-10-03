#!/bin/sh
set -eu

REPOSITORY_ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
ENTRYPOINT="$REPOSITORY_ROOT/contribo-deploiement/backend-entrypoint.sh"
TEMP_DIR=$(mktemp -d)

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT INT TERM

mkdir -p "$TEMP_DIR/bin"
cat > "$TEMP_DIR/bin/java" <<'EOF'
#!/bin/sh
printf 'java-invoked\n'
EOF
chmod 755 "$TEMP_DIR/bin/java"

run_entrypoint() {
    mode=$1
    docker run --rm \
        --volume "$ENTRYPOINT:/usr/local/bin/backend-entrypoint.sh:ro" \
        --volume "$TEMP_DIR/bin:/test-bin:ro" \
        --tmpfs /run/secrets \
        --env TEST_MODE="$mode" \
        --entrypoint /bin/sh \
        alpine:3.20 -ec '
            adduser -D -u 10001 contribo >/dev/null
            printf "test-db-password\\n" > /run/secrets/db_password
            printf "test-private-key\\n" > /run/secrets/rsa_private.pem
            printf "test-public-key\\n" > /run/secrets/rsa_public.pem
            if [ "$TEST_MODE" = empty ]; then
                : > /run/secrets/db_password
            fi
            if [ "$TEST_MODE" = readable ] || [ "$TEST_MODE" = empty ]; then
                chown contribo:contribo /run/secrets/*
            fi
            chmod 400 /run/secrets/*
            su contribo -s /bin/sh -c "env PATH=/test-bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin DB_PASSWORD_FILE=/run/secrets/db_password RSA_PRIVATE_KEY=file:/run/secrets/rsa_private.pem RSA_PUBLIC_KEY=file:/run/secrets/rsa_public.pem sh /usr/local/bin/backend-entrypoint.sh"
        '
}

if ! output=$(run_entrypoint readable 2>&1); then
    printf 'readable case failed unexpectedly:\n%s\n' "$output" >&2
    exit 1
fi
if ! printf '%s\n' "$output" | grep -Fx 'java-invoked'; then
    printf 'readable case did not invoke Java:\n%s\n' "$output" >&2
    exit 1
fi

if run_entrypoint empty >"$TEMP_DIR/empty.out" 2>&1; then
    printf 'expected empty DB_PASSWORD_FILE to fail\n' >&2
    exit 1
fi
if ! grep -F 'DB_PASSWORD secret file is empty' "$TEMP_DIR/empty.out"; then
    printf 'empty case produced an unexpected diagnostic:\n' >&2
    cat "$TEMP_DIR/empty.out" >&2
    exit 1
fi
if grep -F 'test-db-password' "$TEMP_DIR/empty.out"; then
    printf 'secret value leaked in empty secret diagnostic\n' >&2
    exit 1
fi

if run_entrypoint unreadable >"$TEMP_DIR/unreadable.out" 2>&1; then
    printf 'expected unreadable DB_PASSWORD_FILE to fail\n' >&2
    exit 1
fi
if ! grep -F 'DB_PASSWORD secret file is not readable' "$TEMP_DIR/unreadable.out"; then
    printf 'unreadable case produced an unexpected diagnostic:\n' >&2
    cat "$TEMP_DIR/unreadable.out" >&2
    exit 1
fi

printf 'backend-entrypoint tests passed\n'
