## ADDED Requirements

### Requirement: Introduire un modèle domaine backend indépendant

Le dépôt SHALL traiter ce sujet de façon explicite, testable lorsque possible, et documentée.

Les types du package domaine SHALL rester indépendants de Spring, JDBC et des
classes générées depuis le contrat OpenAPI. Les ports de comptes, membres et
catégories SHALL échanger les modèles domaine avec leurs adapters de persistance.

#### Scenario: Contrôle de livraison

- **WHEN** le ticket est validé
- **THEN** son périmètre est couvert par le code ou une décision documentée, ses validations sont tracées et ses dépendances sont respectées

#### Scenario: Test du modèle hors infrastructure

- **WHEN** un test vérifie un modèle ou une valeur du domaine
- **THEN** il s'exécute sans démarrer Spring, HTTP ou une base de données

#### Scenario: Mapping de persistance

- **WHEN** un repository JDBC retourne un compte, un membre ou une catégorie
- **THEN** il retourne un type domaine et ne dépend pas d'un DTO OpenAPI généré
