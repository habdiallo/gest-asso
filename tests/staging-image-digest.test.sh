#!/bin/sh
set -eu

SCRIPT="$(CDPATH='' cd -- "$(dirname "$0")/.." && pwd)/scripts/staging-image-digest.sh"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT INT TERM
BACK=sha256:1111111111111111111111111111111111111111111111111111111111111111
FRONT=sha256:2222222222222222222222222222222222222222222222222222222222222222

cat > "$TEMP_DIR/staging.yaml" <<YAML
services:
  backend:
    image: ghcr.io/habdiallo/contribo-back@$BACK
  frontend:
    image: ghcr.io/habdiallo/contribo-front:v1.2.0@$FRONT
YAML

expect_failure() {
    expected=$1
    shift
    if "$@" >"$TEMP_DIR/out" 2>&1; then
        printf 'expected failure: %s\n' "$*" >&2
        exit 1
    fi
    grep -F "$expected" "$TEMP_DIR/out" >/dev/null || { cat "$TEMP_DIR/out" >&2; exit 1; }
}

[ "$("$SCRIPT" "$TEMP_DIR/staging.yaml" contribo-back)" = "$BACK" ]
[ "$("$SCRIPT" "$TEMP_DIR/staging.yaml" contribo-front)" = "$FRONT" ]

sed 's#@sha256:2*#:latest#' "$TEMP_DIR/staging.yaml" > "$TEMP_DIR/mutable.yaml"
expect_failure 'is not pinned by digest' "$SCRIPT" "$TEMP_DIR/mutable.yaml" contribo-front
expect_failure 'expected exactly one' "$SCRIPT" "$TEMP_DIR/staging.yaml" contribo-worker
expect_failure 'compose file not found' "$SCRIPT" "$TEMP_DIR/missing.yaml" contribo-back

printf 'staging-image-digest tests passed\n'
