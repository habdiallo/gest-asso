## ADDED Requirements

### Requirement: Parité entre les dépôts de déploiement

La composition Portainer du dépôt applicatif SHALL rester identique à celle du
dépôt `gest-asso-deploiement` sur sa branche `main`, qui est la source utilisée
par Portainer.

#### Scenario: Dépôts synchronisés

- **WHEN** le contrôle de parité s'exécute sur `develop` ou `main`
- **THEN** la comparaison des deux fichiers `compose.portainer.yaml` réussit

#### Scenario: Divergence détectée

- **WHEN** les deux compositions diffèrent
- **THEN** le contrôle échoue avec les chemins des fichiers concernés

### Requirement: Source de vérité documentée

La documentation SHALL indiquer le dépôt et la branche consommés par Portainer,
ainsi que l'ordre de livraison des PR synchronisées et le secret de lecture
nécessaire au contrôle CI.
