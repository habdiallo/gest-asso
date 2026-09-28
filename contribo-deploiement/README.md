# Déploiement local Contribo

La stack locale démarre PostgreSQL, le backend et le frontend derrière Nginx.
Le frontend est accessible sur `http://localhost:8081` et les appels
`/api/v1` sont routés vers le backend. PostgreSQL n'est pas exposé par défaut.

## Démarrer

Depuis la racine du dépôt :

```bash
docker compose -f contribo-deploiement/compose.yaml up --build
```

Les valeurs par défaut servent uniquement au développement local. Le mot de
passe PostgreSQL doit être fourni explicitement et aucune clé RSA ne doit être
versionnée. Générer une paire RSA locale, puis injecter
`RSA_PUBLIC_KEY_FILE_PATH` et `RSA_PRIVATE_KEY_FILE_PATH` avec `POSTGRES_DB`,
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `BACKEND_PORT` et `FRONTEND_PORT` sans
les versionner.

```bash
mkdir -p .local-secrets
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out .local-secrets/rsa_private.pem
openssl rsa -pubout -in .local-secrets/rsa_private.pem \
  -out .local-secrets/rsa_public.pem
RSA_PUBLIC_KEY_FILE_PATH="$PWD/.local-secrets/rsa_public.pem" \
RSA_PRIVATE_KEY_FILE_PATH="$PWD/.local-secrets/rsa_private.pem" \
POSTGRES_PASSWORD='change-me-locally' \
docker compose -f contribo-deploiement/compose.yaml up --build
```

## Arrêter

```bash
docker compose -f contribo-deploiement/compose.yaml down
```

Le volume `contribo-db-data` est conservé par défaut. La suppression des
données doit être demandée explicitement avec `docker compose down --volumes`.
