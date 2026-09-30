## ADDED Requirements

### Requirement: Configuration par environnement

Le déploiement SHALL séparer les paramètres de développement, d'intégration et de production, et SHALL injecter les valeurs d'environnement à l'exécution.

#### Scenario: Image construite sans secrets

- **WHEN** une image backend ou frontend est construite en CI
- **THEN** elle ne contient aucun secret, mot de passe réel, clé privée ou configuration propre à un environnement

### Requirement: Publication d'artefacts versionnés

Les images déployables SHALL être produites de manière reproductible, identifiées par une version immuable et associées aux validations de la branche livrée.

#### Scenario: Déploiement d'une version validée

- **WHEN** une version passe les contrôles backend, frontend, contrat et conteneurs
- **THEN** les images publiées peuvent être référencées par un tag immuable pour le déploiement

### Requirement: Routage unique de l'application

Le déploiement SHALL servir le frontend et router les appels `/api/v1` vers le backend sans exposer directement la base de données ni créer un second préfixe d'API.

#### Scenario: Appel frontend vers l'API

- **WHEN** le navigateur appelle une URL sous `/api/v1`
- **THEN** le reverse proxy transmet la requête au backend avec les headers nécessaires et sans réécriture incompatible

### Requirement: Santé et rollback

Chaque service déployé SHALL exposer un contrôle de santé adapté et la procédure de livraison SHALL permettre de revenir à la version précédente en cas de régression.

#### Scenario: Backend indisponible

- **WHEN** le contrôle de santé du backend échoue pendant le déploiement
- **THEN** la version n'est pas considérée comme prête et la version précédente reste sélectionnable

#### Scenario: Régression après déploiement

- **WHEN** une régression est détectée après publication
- **THEN** l'équipe peut restaurer l'image précédente et suivre la procédure de correction de schéma documentée

### Requirement: Réseaux et secrets minimaux

Le déploiement SHALL limiter l'exposition réseau aux flux nécessaires et SHALL fournir les secrets par un mécanisme d'exécution adapté à l'environnement cible.

#### Scenario: Accès à la base

- **WHEN** le backend doit accéder à PostgreSQL
- **THEN** la base n'est pas publiée sur le réseau public et les identifiants ne sont pas codés dans les manifests versionnés
