#!/bin/sh
# Ouvre (ou met à jour) dans gest-asso-deploiement la PR qui fixe les images d'un environnement.
# Usage : open-deployment-pr.sh <staging|production> <backend-ref> <frontend-ref> <libellé>
# Environnement : GH_TOKEN (écriture contenu et PR sur le seul dépôt de déploiement),
#                 DEPLOYMENT_REPOSITORY (défaut habdiallo/gest-asso-deploiement).
set -eu

ENVIRONMENT=${1:?environment required}
BACKEND_REF=${2:?backend image reference required}
FRONTEND_REF=${3:?frontend image reference required}
LABEL=${4:?label required}
REPOSITORY=${DEPLOYMENT_REPOSITORY:-habdiallo/gest-asso-deploiement}
SCRIPTS_DIR=$(CDPATH='' cd -- "$(dirname "$0")" && pwd)

case "$ENVIRONMENT" in
    staging|production) ;;
    *) printf 'open-deployment-pr: unknown environment %s\n' "$ENVIRONMENT" >&2; exit 2 ;;
esac
: "${GH_TOKEN:?GH_TOKEN is required}"

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM
BRANCH="deploy/$ENVIRONMENT-$(printf '%s' "$LABEL" | tr -c 'A-Za-z0-9.\n-' '-')"

git clone --quiet --depth 1 "https://x-access-token:${GH_TOKEN}@github.com/${REPOSITORY}.git" "$WORK_DIR/repo"
cd "$WORK_DIR/repo"
"$SCRIPTS_DIR/update-deployment-images.sh" "$ENVIRONMENT/compose.yaml" "$BACKEND_REF" "$FRONTEND_REF"

if git diff --quiet; then
    printf 'open-deployment-pr: %s already uses these images\n' "$ENVIRONMENT"
    exit 0
fi

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git switch --quiet -c "$BRANCH"
git commit --quiet -am "deploy($ENVIRONMENT): $LABEL"
git push --quiet --force origin "$BRANCH"

BODY=$(cat <<BODY_EOF
Mise à jour des images de **$ENVIRONMENT**.

- Source : ${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-habdiallo/gest-asso}/commit/${GITHUB_SHA:-inconnu}
- Run CI : ${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-habdiallo/gest-asso}/actions/runs/${GITHUB_RUN_ID:-inconnu}
- Backend : \`$BACKEND_REF\`
- Frontend : \`$FRONTEND_REF\`

Fusionner déploie la stack Portainer ; revert de cette PR pour revenir à la paire précédente.
Après déploiement : \`scripts/smoke-test.sh <url-$ENVIRONMENT>\` depuis le dépôt applicatif.
BODY_EOF
)

if gh pr view "$BRANCH" --repo "$REPOSITORY" --json state --jq .state 2>/dev/null | grep -qx OPEN; then
    gh pr edit "$BRANCH" --repo "$REPOSITORY" --body "$BODY" >/dev/null
    printf 'open-deployment-pr: updated %s\n' "$(gh pr view "$BRANCH" --repo "$REPOSITORY" --json url --jq .url)"
else
    gh pr create --repo "$REPOSITORY" --base main --head "$BRANCH" \
        --title "deploy($ENVIRONMENT): $LABEL" --body "$BODY"
fi
