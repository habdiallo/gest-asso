# portainer-deployment Specification

## Purpose
TBD - created by archiving change auth-rsa-portainer. Update Purpose after archive.
## Requirements
### Requirement: La stack Portainer utilise les secrets fichiers et les réseaux attendus

La stack SHALL déployer uniquement le backend et le frontend, utiliser les images GHCR désignées par `BACKEND_IMAGE` et `FRONTEND_IMAGE`, monter les clés RSA depuis des secrets fichiers, joindre les réseaux externes PostgreSQL et proxy, et conserver un réseau interne privé entre backend et frontend. Les secrets référencés par `file:` SHALL être lisibles par l'UID runtime 10001 sans être publics.

#### Scenario: Déploiement nominal

- **WHEN** les réseaux externes, les images et les fichiers secrets sont disponibles
- **THEN** le backend et le frontend démarrent, le frontend peut joindre le backend sur le réseau interne et aucun port backend n'est publié sur le réseau public

### Requirement: Le déploiement permet un rollback par paire d'images

La documentation SHALL recommander deux références versionnées ou digests issus du même run CI et SHALL décrire leur remplacement comme procédure de rollback sans modifier les secrets ni les données.

#### Scenario: Retour à une version précédente

- **WHEN** l'administrateur remplace `BACKEND_IMAGE` et `FRONTEND_IMAGE` par la paire publiée précédente et redéploie la stack
- **THEN** Portainer utilise les deux images de cette version et la procédure ne nécessite pas de reconstruire l'image localement
