# Déploiement local Contribo

La stack locale démarre PostgreSQL, le backend et le frontend derrière Nginx.
Le frontend est accessible sur `http://localhost:8081` et les appels
`/api/v1` sont routés vers le backend. PostgreSQL n'est pas exposé par défaut.

## Démarrer

Depuis la racine du dépôt :

```bash
docker compose -f contribo-deploiement/compose.yaml up --build
```

Les valeurs par défaut servent uniquement au développement local. Pour un autre
contexte, injecter `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`JWT_SECRET`, `BACKEND_PORT` et `FRONTEND_PORT` sans les versionner.

## Arrêter

```bash
docker compose -f contribo-deploiement/compose.yaml down
```

Le volume `contribo-db-data` est conservé par défaut. La suppression des
données doit être demandée explicitement avec `docker compose down --volumes`.
