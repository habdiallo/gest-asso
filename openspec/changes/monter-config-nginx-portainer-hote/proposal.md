## Why

La stack Portainer monte actuellement `nginx.portainer.conf` avec un chemin
relatif. Dans un Portainer exécuté en conteneur, ce chemin est résolu dans le
contexte de Portainer alors que le montage est effectué par le démon Docker de
l'hôte. Le frontend échoue donc lorsque Docker ne trouve pas le fichier source.

## What Changes

- Remplacer le montage relatif par un chemin absolu configurable de l'hôte
  Docker via `FRONTEND_NGINX_CONFIG_FILE_PATH`.
- Documenter le provisionnement du fichier Nginx sur l'hôte, en dehors du
  volume interne `portainer_data`.
- Ajouter les vérifications et la procédure de migration pour une stack
  Portainer existante.
- Rendre le chargement de la feuille CSS de production compatible avec la CSP
  Nginx, sans autoriser de script inline supplémentaire.
- Maintenir la synchronisation entre le dépôt applicatif et
  `gest-asso-deploiement`.

## Capabilities

### New Capabilities

- `portainer-host-config-mount`: montage fiable d'une configuration Nginx
  frontend depuis le système de fichiers de l'hôte Docker.

### Modified Capabilities

- Aucun.

## Impact

Le fichier `compose.portainer.yaml`, les exemples d'environnement, la
configuration de build frontend et la documentation des deux dépôts Portainer
sont concernés. Aucun changement de l'API ou des données PostgreSQL n'est
prévu. Le déploiement nécessite la création préalable du fichier sur l'hôte
Docker.
