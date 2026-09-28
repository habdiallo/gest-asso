# Déploiement local Contribo

La stack locale démarre PostgreSQL, le backend et le frontend derrière Nginx.
Le frontend est accessible sur `http://localhost:8081` et les appels
`/api/v1` sont routés vers le backend. PostgreSQL n'est pas exposé par défaut.

## Démarrer

Depuis la racine du dépôt :

```bash
docker compose -f contribo-deploiement/compose.yaml up --build
```

Le Compose local exige `POSTGRES_PASSWORD` et `JWT_SECRET`, même en développement,
afin qu'aucune valeur secrète connue ne soit embarquée dans le manifest. Pour un
autre contexte, injecter `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`JWT_SECRET`, `BACKEND_PORT` et `FRONTEND_PORT` via un gestionnaire de secrets ou
un fichier d'environnement non versionné.

## Arrêter

```bash
docker compose -f contribo-deploiement/compose.yaml down
```

Le volume `contribo-db-data` est conservé par défaut. La suppression des
données doit être demandée explicitement avec `docker compose down --volumes`.
