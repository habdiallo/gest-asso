#!/bin/sh
# Ouvre (ou met à jour) dans gest-asso-deploiement la PR qui fixe les images d'un environnement.
# Usage : open-deployment-pr.sh <staging|production> <backend-ref> <frontend-ref> <libellé>
# Environnement : GH_TOKEN (écriture contenu et PR sur le seul dépôt de déploiement),
#                 DEPLOYMENT_REPOSITORY (défaut habdiallo/gest-asso-deploiement).
# Tests uniquement : DEPLOYMENT_REPOSITORY_URL (remote Git local) et
#                   OPEN_DEPLOYMENT_PR_SKIP_PR=true (ne pas appeler gh pour la PR).
set -eu

ENVIRONMENT=${1:?environment required}
BACKEND_REF=${2:?backend image reference required}
FRONTEND_REF=${3:?frontend image reference required}
LABEL=${4:?label required}
REPOSITORY=${DEPLOYMENT_REPOSITORY:-habdiallo/gest-asso-deploiement}
REPOSITORY_URL=${DEPLOYMENT_REPOSITORY_URL:-https://github.com/${REPOSITORY}.git}
SCRIPTS_DIR=$(CDPATH='' cd -- "$(dirname "$0")" && pwd)

case "$ENVIRONMENT" in
    staging|production) ;;
    *) printf 'open-deployment-pr: unknown environment %s\n' "$ENVIRONMENT" >&2; exit 2 ;;
esac
: "${GH_TOKEN:?GH_TOKEN is required}"

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT INT TERM
BRANCH="deploy/$ENVIRONMENT-$(printf '%s' "$LABEL" | tr -c 'A-Za-z0-9.\n-' '-')"

# Le jeton est fourni par l'assistant d'identification de gh (lu depuis GH_TOKEN) :
# il n'apparaît ni dans l'URL, ni dans les arguments, ni dans la configuration du clone.
git_auth() {
    git -c credential.helper= -c 'credential.helper=!gh auth git-credential' "$@"
}

git_auth clone --quiet --depth 1 "$REPOSITORY_URL" "$WORK_DIR/repo"
cd "$WORK_DIR/repo"
COMPOSE_FILE="$ENVIRONMENT/compose.yaml"
"$SCRIPTS_DIR/update-deployment-images.sh" "$COMPOSE_FILE" "$BACKEND_REF" "$FRONTEND_REF"

if git diff --quiet; then
    printf 'open-deployment-pr: %s already uses these images\n' "$ENVIRONMENT"
    exit 0
fi

if git_auth ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    # Branche déjà publiée (relance du job) : la réutiliser si elle porte exactement
    # ces images, sinon s'arrêter plutôt que d'écraser une modification présente.
    git_auth fetch --quiet --depth 1 origin "refs/heads/$BRANCH:refs/remotes/origin/$BRANCH"
    if ! git diff --quiet "origin/$BRANCH" -- "$COMPOSE_FILE"; then
        printf 'open-deployment-pr: branch %s already exists with different content; resolve it manually, nothing was overwritten\n' "$BRANCH" >&2
        exit 1
    fi
    printf 'open-deployment-pr: branch %s already carries these images\n' "$BRANCH"
else
    git config user.name 'github-actions[bot]'
    git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
    git switch --quiet -c "$BRANCH"
    git commit --quiet -am "deploy($ENVIRONMENT): $LABEL"
    # Sans --force : un push concurrent sur cette branche fait échouer le job au lieu d'être écrasé.
    git_auth push --quiet origin "refs/heads/$BRANCH:refs/heads/$BRANCH"
fi

if [ "${OPEN_DEPLOYMENT_PR_SKIP_PR:-false}" = true ]; then
    exit 0
fi

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
