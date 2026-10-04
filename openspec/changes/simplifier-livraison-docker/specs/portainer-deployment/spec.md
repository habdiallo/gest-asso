## MODIFIED Requirements

### Requirement: La stack Portainer utilise les secrets fichiers et les réseaux attendus

La stack SHALL déployer uniquement le backend et le frontend, utiliser les images GHCR épinglées par digest dans le fichier Compose de l'environnement, monter en lecture seule un répertoire de secrets de l'hôte dans le backend, joindre les réseaux externes PostgreSQL et proxy, et conserver un réseau interne privé entre backend et frontend. Les fichiers de ce répertoire SHALL être lisibles par l'UID runtime 10001 sans être publics. Le secret bootstrap administrateur SHALL être optionnel : son absence MUST NOT empêcher le démarrage lorsque le bootstrap est désactivé. La stack MUST NOT exiger de fichier de configuration Nginx sur l'hôte ni d'adresse IP fixe pour le frontend ; le backend SHALL faire confiance à la plage configurable du réseau interne.

#### Scenario: Déploiement nominal

- **WHEN** les réseaux externes, les images et le répertoire de secrets sont disponibles
- **THEN** le backend et le frontend démarrent, le frontend peut joindre le backend sur le réseau interne et aucun port backend n'est publié sur le réseau public

#### Scenario: Bootstrap désactivé sans fichier

- **WHEN** le répertoire de secrets ne contient pas de mot de passe bootstrap et que le bootstrap est désactivé
- **THEN** la stack démarre normalement

#### Scenario: Aucun fichier hôte hors secrets

- **WHEN** la stack est déployée sur un hôte qui ne contient que le répertoire de secrets
- **THEN** le frontend démarre avec la configuration Nginx embarquée dans son image

### Requirement: Le déploiement permet un rollback par paire d'images

Les références d'images de chaque environnement SHALL être versionnées en dur dans le fichier Compose de cet environnement, dans le dépôt de déploiement, sous forme de digests issus du même run CI. Le rollback SHALL consister à revenir à la paire précédente par un revert Git, sans modifier les secrets ni les données.

#### Scenario: Retour à une version précédente

- **WHEN** l'administrateur revert la PR de déploiement de la version fautive et que Portainer redéploie la stack
- **THEN** Portainer utilise les deux images de la version précédente et la procédure ne nécessite pas de reconstruire l'image localement

## ADDED Requirements

### Requirement: Source de vérité unique de la composition de déploiement

La composition déployée par Portainer et les références d'images par environnement SHALL exister uniquement dans le dépôt `gest-asso-deploiement`. Le dépôt applicatif MUST NOT en conserver de copie ni de contrôle de parité.

#### Scenario: Modification de la composition

- **WHEN** la composition de déploiement doit évoluer
- **THEN** une seule PR dans `gest-asso-deploiement` suffit et aucune PR synchronisée n'est requise dans le dépôt applicatif

#### Scenario: Recherche d'une copie dans le dépôt applicatif

- **WHEN** le dépôt applicatif est inspecté
- **THEN** il ne contient ni `compose.portainer.yaml`, ni workflow de parité, et sa documentation renvoie vers le dépôt de déploiement
