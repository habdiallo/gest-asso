# actuator-and-secret-hardening Specification

## Purpose
TBD - created by archiving change durcissement-securite-production. Update Purpose after archive.
## Requirements
### Requirement: Actuator public minimal

Le backend SHALL rendre publics uniquement `/actuator/health`, `/actuator/health/liveness` et `/actuator/health/readiness`. `info`, les métriques et les autres endpoints Actuator SHALL être désactivés ou protégés par une autorisation d'administration et ne SHALL pas être accessibles anonymement.

#### Scenario: Probe readiness publique
- **WHEN** le healthcheck appelle `/actuator/health/readiness` sans authentification
- **THEN** le backend répond avec l'état de readiness sans exposer de détail sensible

#### Scenario: Endpoint d'information anonyme
- **WHEN** un client non authentifié appelle `/actuator/info` ou un endpoint de métriques exposé
- **THEN** le backend répond `401`, `403` ou `404` selon la politique retenue

#### Scenario: Accès d'administration
- **WHEN** un administrateur autorisé appelle un endpoint Actuator réservé
- **THEN** l'accès est accordé uniquement si l'endpoint est explicitement activé et protégé

### Requirement: Secrets obligatoires sans valeur connue

Les profils d'intégration et de production SHALL exiger les secrets PostgreSQL et JWT par injection externe. L'application SHALL échouer au démarrage avec une erreur de configuration explicite si un secret obligatoire est absent ou vide.

#### Scenario: Secret de production absent
- **WHEN** le backend démarre avec un profil d'intégration ou de production sans mot de passe PostgreSQL ou clé JWT
- **THEN** le démarrage échoue avant l'acceptation de trafic
- **THEN** aucune valeur `contribo` ou autre valeur connue n'est utilisée comme repli

#### Scenario: Secret local explicite
- **WHEN** le Compose de développement est démarré avec son fichier d'environnement local explicitement choisi
- **THEN** le service fonctionne avec des valeurs de développement documentées
- **THEN** ces valeurs ne sont pas utilisées par les manifests d'intégration ou de production

