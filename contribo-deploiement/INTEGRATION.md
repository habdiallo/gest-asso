# Environnement d'intégration

Le fichier `compose.integration.yaml` déploie uniquement des images taguées,
sans build local. `BACKEND_IMAGE` et `FRONTEND_IMAGE` doivent donc contenir des
références complètes vers des tags de release immuables publiés par la CI, ou
vers des digests d'image. Les tags `latest`, les tags de branche et toute autre
référence mutable sont interdits.

Les secrets `db_password`, `rsa_public_key` et `rsa_private_key` sont fournis par
des fichiers externes au dépôt. Le gestionnaire de secrets de l'environnement
doit créer ces fichiers avant le démarrage de la stack, puis leurs chemins
absolus doivent être indiqués par `DB_PASSWORD_FILE_PATH`,
`RSA_PUBLIC_KEY_FILE_PATH` et `RSA_PRIVATE_KEY_FILE_PATH` dans
`contribo-deploiement/integration.env`. Aucun secret réel ne doit être ajouté au
dépôt. Cette configuration est compatible avec `docker compose up` et ne dépend
pas des secrets Docker Swarm.

## Déployer une version

```bash
docker compose --env-file contribo-deploiement/integration.env \
  -f contribo-deploiement/compose.integration.yaml pull
docker compose --env-file contribo-deploiement/integration.env \
  -f contribo-deploiement/compose.integration.yaml up -d
```

Les fichiers référencés par `DB_PASSWORD_FILE_PATH`,
`RSA_PUBLIC_KEY_FILE_PATH` et `RSA_PRIVATE_KEY_FILE_PATH` restent hors du dépôt.
Le mot de passe PostgreSQL est lu par le script d'entrée et les clés RSA sont
consommées directement comme ressources `file:` par Spring Security.

Sur un hôte Linux, préparer et contrôler ces fichiers avec le script partagé
avant de lancer Compose. Le script lit les chemins réellement configurés dans
`integration.env`, il ne dépend donc pas d'un chemin `/opt` ou `/etc` codé en
dur :

```bash
sudo ./contribo-deploiement/prepare-secrets.sh \
  --env-file contribo-deploiement/integration.env
sudo ./contribo-deploiement/prepare-secrets.sh \
  --env-file contribo-deploiement/integration.env \
  --check-only
```

## Rollback

Conserver le tag actuellement déployé et le tag précédent dans le suivi de
release. Pour revenir en arrière, remplacer les deux images dans l'environnement
par le tag précédent, puis exécuter `pull` et `up -d` avec le même Compose.
Le volume PostgreSQL est conservé. Une migration corrective doit être livrée
avant tout rollback de schéma incompatible.
