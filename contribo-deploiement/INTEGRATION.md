# Environnement d'intégration

Le fichier `compose.integration.yaml` déploie uniquement des images taguées,
sans build local. `BACKEND_IMAGE` et `FRONTEND_IMAGE` doivent donc contenir des
références complètes vers des tags immuables publiés par la CI.

Les secrets `db_password` et `jwt_secret` sont déclarés comme secrets externes.
Ils doivent être créés par le gestionnaire de secrets de l'environnement avant
le démarrage de la stack. Aucun secret réel ne doit être ajouté au dépôt.

## Déployer une version

```bash
docker secret create db_password ./secrets/db_password
docker secret create jwt_secret ./secrets/jwt_secret
docker compose --env-file contribo-deploiement/integration.env \
  -f contribo-deploiement/compose.integration.yaml pull
docker compose --env-file contribo-deploiement/integration.env \
  -f contribo-deploiement/compose.integration.yaml up -d
```

La commande de création des secrets est fournie comme exemple opérateur. Les
fichiers locaux de secrets restent hors du dépôt.

## Rollback

Conserver le tag actuellement déployé et le tag précédent dans le suivi de
release. Pour revenir en arrière, remplacer les deux images dans l'environnement
par le tag précédent, puis exécuter `pull` et `up -d` avec le même Compose.
Le volume PostgreSQL est conservé. Une migration corrective doit être livrée
avant tout rollback de schéma incompatible.
