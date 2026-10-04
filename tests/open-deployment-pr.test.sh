#!/bin/sh
# Vérifie, sur un remote Git local, que la branche de déploiement n'est jamais écrasée.
set -eu

SCRIPT="$(CDPATH='' cd -- "$(dirname "$0")/.." && pwd)/scripts/open-deployment-pr.sh"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT INT TERM
BACK='ghcr.io/habdiallo/contribo-back@sha256:1111111111111111111111111111111111111111111111111111111111111111'
FRONT='ghcr.io/habdiallo/contribo-front@sha256:2222222222222222222222222222222222222222222222222222222222222222'
BRANCH=deploy/staging-release-v1.2.0-abc1234

git init --quiet --bare --initial-branch=main "$TEMP_DIR/remote.git"
git clone --quiet "$TEMP_DIR/remote.git" "$TEMP_DIR/seed" 2>/dev/null
mkdir -p "$TEMP_DIR/seed/staging"
cat > "$TEMP_DIR/seed/staging/compose.yaml" <<'YAML'
services:
  backend:
    image: ghcr.io/habdiallo/contribo-back@sha256:aaaa
  frontend:
    image: ghcr.io/habdiallo/contribo-front@sha256:bbbb
YAML
git -C "$TEMP_DIR/seed" add staging/compose.yaml
git -C "$TEMP_DIR/seed" -c user.name=t -c user.email=t@example.com commit --quiet -m seed
git -C "$TEMP_DIR/seed" push --quiet origin main

export GH_TOKEN=unused DEPLOYMENT_REPOSITORY_URL="file://$TEMP_DIR/remote.git" OPEN_DEPLOYMENT_PR_SKIP_PR=true
run() { "$SCRIPT" staging "$BACK" "$FRONT" release-v1.2.0-abc1234; }

run >/dev/null
git --git-dir="$TEMP_DIR/remote.git" show "$BRANCH:staging/compose.yaml" | grep -qF "image: $BACK"
FIRST=$(git --git-dir="$TEMP_DIR/remote.git" rev-parse "$BRANCH")

# Relance identique : la branche est réutilisée, pas réécrite.
run | grep -qF 'already carries these images'
[ "$FIRST" = "$(git --git-dir="$TEMP_DIR/remote.git" rev-parse "$BRANCH")" ]

# Modification manuelle sur la branche : le script s'arrête sans l'écraser.
git clone --quiet --branch "$BRANCH" "$TEMP_DIR/remote.git" "$TEMP_DIR/manual" 2>/dev/null
sed -i.bak 's#contribo-front@sha256:2*#contribo-front@sha256:9999#' "$TEMP_DIR/manual/staging/compose.yaml"
git -C "$TEMP_DIR/manual" -c user.name=t -c user.email=t@example.com commit --quiet -am manual
git -C "$TEMP_DIR/manual" push --quiet origin "$BRANCH"
MANUAL=$(git --git-dir="$TEMP_DIR/remote.git" rev-parse "$BRANCH")
if run >"$TEMP_DIR/out" 2>&1; then
    printf 'expected a diverged deployment branch to stop the script\n' >&2; exit 1
fi
grep -qF 'nothing was overwritten' "$TEMP_DIR/out"
[ "$MANUAL" = "$(git --git-dir="$TEMP_DIR/remote.git" rev-parse "$BRANCH")" ]

if grep -vE '^[[:space:]]*#' "$SCRIPT" | grep -nE 'x-access-token|--force|\$\{?GH_TOKEN\}?@'; then
    printf 'the token must not be embedded in a Git URL and pushes must not be forced\n' >&2; exit 1
fi

printf 'open-deployment-pr tests passed\n'
