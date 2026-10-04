#!/bin/sh
# Affiche le digest de l'image <image> déployée par un fichier compose
# d'environnement du dépôt gest-asso-deploiement (ex. staging/compose.yaml).
# Usage : staging-image-digest.sh <compose-file> <contribo-back|contribo-front>
set -eu

COMPOSE_FILE=${1:?usage: staging-image-digest.sh <compose-file> <image>}
IMAGE=${2:?image name required}

fail() { printf 'staging-image-digest: %s\n' "$1" >&2; exit 1; }

[ -f "$COMPOSE_FILE" ] || fail "compose file not found: $COMPOSE_FILE"
lines=$(grep -E "^[[:space:]]*image:[[:space:]]*[^[:space:]]*/${IMAGE}[:@]" "$COMPOSE_FILE" || true)
[ "$(printf '%s\n' "$lines" | grep -c .)" = 1 ] || fail "expected exactly one '$IMAGE' image line in $COMPOSE_FILE"
digest=$(printf '%s\n' "$lines" | sed -nE 's/.*@(sha256:[0-9a-f]{64})[[:space:]]*$/\1/p')
[ -n "$digest" ] || fail "'$IMAGE' image is not pinned by digest in $COMPOSE_FILE"
printf '%s\n' "$digest"
