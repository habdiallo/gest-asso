## ADDED Requirements

### Requirement: Architecture backend indépendante du transport et de la persistance

Le futur backend SHALL isoler les invariants métier de Contribo des frameworks HTTP, de la base de données et des mécanismes de déploiement.

#### Scenario: Test d'un invariant métier

- **WHEN** un test vérifie un invariant du domaine
- **THEN** il peut l'exécuter sans démarrer Spring, un serveur HTTP ou une base de données

### Requirement: Adaptation du contrat OpenAPI vers les cas d'usage

L'adapter REST SHALL traduire les opérations définies dans `besoins/openapi.yaml` vers des cas d'usage applicatifs et SHALL mapper les erreurs vers les réponses d'erreur du contrat.

#### Scenario: Requête valide du MVP

- **WHEN** une requête respecte le schéma, l'authentification et l'autorisation du contrat
- **THEN** l'adapter appelle le cas d'usage correspondant et renvoie une représentation conforme au schéma OpenAPI

#### Scenario: Erreur métier ou d'autorisation

- **WHEN** le cas d'usage refuse l'action ou qu'une ressource n'est pas accessible
- **THEN** l'API renvoie le code HTTP et le modèle `ErrorResponse` prévus par le contrat, sans exposer une exception interne

### Requirement: Absence de reprise métier implicite

L'architecture SHALL introduire uniquement les règles, permissions, états et modèles nécessaires aux exigences Contribo validées.

#### Scenario: Fonctionnalité présente uniquement dans la référence

- **WHEN** une fonctionnalité du dépôt de référence n'est pas décrite dans le cahier ou le contrat Contribo
- **THEN** elle reste hors du backend jusqu'à un change fonctionnel explicitement approuvé

### Requirement: Persistance versionnée

Toute persistance retenue pour le MVP SHALL disposer d'un schéma versionné, de tests de compatibilité avec les modèles du domaine et d'une stratégie de migration documentée.

#### Scenario: Nouvelle migration

- **WHEN** une évolution nécessite une modification de schéma
- **THEN** la migration est versionnée, testée sur une base représentative et associée à une procédure de retour arrière ou de correction
