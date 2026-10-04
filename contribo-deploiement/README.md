# Déploiement local Contribo

`compose.yaml` démarre PostgreSQL, le backend et le frontend (Nginx non root,
port interne 8080). Le frontend est accessible sur `http://localhost:8081` et
les appels `/api/v1` sont routés vers le backend. PostgreSQL n'est pas exposé.

C'est la seule composition de ce dépôt : elle sert au développement local et
au smoke test de la CI. Le déploiement (staging, production) est défini dans
`habdiallo/gest-asso-deploiement`, voir [PORTAINER.md](PORTAINER.md).

Le backend local active `SESSION_COOKIE_SECURE=false` par défaut pour fonctionner
avec le frontend HTTP sur `http://localhost:8081`. Pour reproduire le comportement
des environnements HTTPS, lancer la composition avec `SESSION_COOKIE_SECURE=true`.

## Démarrer

Depuis la racine du dépôt, préparer une fois le répertoire de secrets local
(non versionné) : mot de passe PostgreSQL et paire RSA générés.

```bash
contribo-deploiement/init-secrets.sh --local --dir .local-secrets --generate-db-password
docker compose -f contribo-deploiement/compose.yaml up --build
scripts/smoke-test.sh http://localhost:8081
```

Le répertoire est monté en lecture seule sur `/run/secrets` : PostgreSQL lit
`db_password`, le backend lit tous les fichiers nativement. Pour un autre
répertoire, définir `SECRETS_DIR_PATH`.

Premier administrateur : écrire un mot de passe d'au moins 12 caractères dans
`.local-secrets/bootstrap_admin_password`, puis démarrer avec
`BOOTSTRAP_ADMIN_ENABLED=true`. Supprimer ensuite le fichier.

Pour tester des images déjà construites ou publiées sans rebuild :

```bash
BACKEND_IMAGE=ghcr.io/habdiallo/contribo-back@sha256:<digest> \
FRONTEND_IMAGE=ghcr.io/habdiallo/contribo-front@sha256:<digest> \
docker compose -f contribo-deploiement/compose.yaml up --no-build --wait
```

## Arrêter

```bash
docker compose -f contribo-deploiement/compose.yaml down
```

Le volume `contribo-db-data` est conservé par défaut. La suppression des
données doit être demandée explicitement avec `docker compose down --volumes`.
