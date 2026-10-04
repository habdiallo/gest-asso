#!/bin/sh
# Remplace les références d'images backend et frontend dans le compose d'un
# environnement du dépôt gest-asso-deploiement (ex. staging/compose.yaml).
# Les références sont écrites en dur : Portainer >= 2.27 n'interpole plus le
# .env d'une stack Git (portainer/portainer#12546).
# Usage : update-deployment-images.sh <compose-file> <backend-ref> <frontend-ref>
set -eu

COMPOSE_FILE=${1:?usage: update-deployment-images.sh <compose-file> <backend-ref> <frontend-ref>}
BACKEND_REF=${2:?backend image reference required}
FRONTEND_REF=${3:?frontend image reference required}

fail() { printf 'update-deployment-images: %s\n' "$1" >&2; exit 1; }

[ -f "$COMPOSE_FILE" ] || fail "compose file not found: $COMPOSE_FILE"
for ref in "$BACKEND_REF" "$FRONTEND_REF"; do
    case "$ref" in
        *@sha256:*) ;;
        *) fail "image reference must be pinned by digest: $ref" ;;
    esac
    case "$ref" in
        *[!A-Za-z0-9./:@_-]*) fail "invalid characters in image reference: $ref" ;;
    esac
done

replace() {
    image=$1
    ref=$2
    pattern="^([[:space:]]*image:[[:space:]]*)[^[:space:]]*/${image}[:@][^[:space:]]*[[:space:]]*\$"
    count=$(grep -Ec "$pattern" "$COMPOSE_FILE" || true)
    [ "$count" = 1 ] || fail "expected exactly one '$image' image line in $COMPOSE_FILE, found $count"
    sed -E "s#$pattern#\\1$ref#" "$COMPOSE_FILE" > "$COMPOSE_FILE.tmp" && mv "$COMPOSE_FILE.tmp" "$COMPOSE_FILE"
}

replace contribo-back "$BACKEND_REF"
replace contribo-front "$FRONTEND_REF"
printf 'update-deployment-images: %s updated\n' "$COMPOSE_FILE"
