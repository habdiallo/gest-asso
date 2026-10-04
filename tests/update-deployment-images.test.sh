#!/bin/sh
set -eu

SCRIPT="$(CDPATH='' cd -- "$(dirname "$0")/.." && pwd)/scripts/update-deployment-images.sh"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT INT TERM
COMPOSE="$TEMP_DIR/compose.yaml"
BACK='ghcr.io/habdiallo/contribo-back:v1.2.0@sha256:1111111111111111111111111111111111111111111111111111111111111111'
FRONT='ghcr.io/habdiallo/contribo-front:v1.2.0@sha256:2222222222222222222222222222222222222222222222222222222222222222'

cat > "$COMPOSE" <<'YAML'
services:
  backend:
    extends: { file: ../compose.base.yaml, service: backend }
    image: ghcr.io/habdiallo/contribo-back@sha256:aaaa
  frontend:
    extends: { file: ../compose.base.yaml, service: frontend }
    image: ghcr.io/habdiallo/contribo-front:v1.1.0@sha256:bbbb
YAML

"$SCRIPT" "$COMPOSE" "$BACK" "$FRONT" >/dev/null
grep -qxF "    image: $BACK" "$COMPOSE"
grep -qxF "    image: $FRONT" "$COMPOSE"
grep -qF 'extends: { file: ../compose.base.yaml, service: backend }' "$COMPOSE"

if "$SCRIPT" "$COMPOSE" 'ghcr.io/habdiallo/contribo-back:latest' "$FRONT" 2>/dev/null; then
    printf 'expected a mutable reference to be refused\n' >&2; exit 1
fi
if "$SCRIPT" "$COMPOSE" "$BACK;rm" "$FRONT" 2>/dev/null; then
    printf 'expected invalid characters to be refused\n' >&2; exit 1
fi
printf 'services:\n  backend:\n    build: .\n' > "$TEMP_DIR/no-image.yaml"
if "$SCRIPT" "$TEMP_DIR/no-image.yaml" "$BACK" "$FRONT" 2>/dev/null; then
    printf 'expected a compose file without image lines to be refused\n' >&2; exit 1
fi

printf 'update-deployment-images tests passed\n'
