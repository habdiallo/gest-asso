#!/bin/sh
# Smoke test d'une stack Contribo (locale, CI ou environnement déployé).
# Usage : scripts/smoke-test.sh <base-url>   ex. scripts/smoke-test.sh https://staging.example.com
set -eu

BASE_URL=${1:?usage: smoke-test.sh <base-url>}
BASE_URL=${BASE_URL%/}
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM
FAILURES=0

pass() { printf 'ok   %s\n' "$1"; }
fail() { printf 'FAIL %s\n' "$1" >&2; FAILURES=$((FAILURES + 1)); }

# fetch <nom> <chemin> [options curl...] : écrit les en-têtes et le corps, retourne le code HTTP.
fetch() {
    name=$1
    path=$2
    shift 2
    curl --silent --show-error --max-time 15 --dump-header "$WORK_DIR/$name.headers" \
        --output "$WORK_DIR/$name.body" --write-out '%{http_code}' "$@" "$BASE_URL$path" || printf '000'
}

header() { grep -i "^$2:" "$WORK_DIR/$1.headers" | tail -1 | cut -d: -f2- | tr -d '\r' | sed 's/^ *//'; }

code=$(fetch login /login)
[ "$code" = 200 ] && pass "/login répond 200" || fail "/login répond $code au lieu de 200"
csp=$(header login Content-Security-Policy)
case "$csp" in
    *"default-src 'self'"*) pass 'CSP présente' ;;
    *) fail 'CSP absente sur /login' ;;
esac
case "$csp" in
    *unsafe-eval*) fail "CSP contient unsafe-eval" ;;
    *) pass 'CSP sans unsafe-eval' ;;
esac
[ "$(header login X-Frame-Options)" = DENY ] && pass 'X-Frame-Options: DENY' || fail 'X-Frame-Options absent ou différent de DENY'
[ "$(header login X-Content-Type-Options)" = nosniff ] && pass 'X-Content-Type-Options: nosniff' || fail 'X-Content-Type-Options absent'

code=$(fetch i18n /assets/i18n/fr.json)
cache=$(header i18n Cache-Control)
if [ "$code" = 200 ] && [ "$cache" = no-cache ]; then
    pass 'traductions servies sans cache persistant'
else
    fail "traductions : code $code, Cache-Control '$cache'"
fi

bundle=$(grep -o 'main-[A-Za-z0-9]*\.js' "$WORK_DIR/login.body" | head -1 || true)
if [ -n "$bundle" ]; then
    code=$(fetch bundle "/$bundle")
    case "$(header bundle Cache-Control)" in
        *max-age=31536000*) [ "$code" = 200 ] && pass "bundle hashé $bundle en cache longue durée" || fail "bundle $bundle : code $code" ;;
        *) fail "bundle $bundle sans cache longue durée" ;;
    esac
else
    fail 'aucun bundle main-*.js référencé par /login'
fi

# Identifiants volontairement invalides : 401 prouve le routage jusqu'au backend (502/504 sinon).
code=$(fetch api /api/v1/auth/login --request POST --header 'Content-Type: application/json' \
    --data '{"identifier":"smoke-test-inconnu","password":"smoke-test-invalide"}')
[ "$code" = 401 ] && pass 'API joignable (401 sur identifiants invalides)' || fail "API : POST /api/v1/auth/login répond $code au lieu de 401"

if [ "$FAILURES" -gt 0 ]; then
    printf '%s vérification(s) en échec sur %s\n' "$FAILURES" "$BASE_URL" >&2
    exit 1
fi
printf 'smoke test réussi sur %s\n' "$BASE_URL"
