## ADDED Requirements

### Requirement: Séparer les responsabilités de persistance des campagnes

Le backend SHALL exposer trois ports applicatifs distincts pour les opérations
de campagnes, d'échéances et de règlements. Le service de campagnes SHALL
injecter ces ports séparément et ne SHALL plus dépendre directement du dépôt
JDBC monolithique.

Chaque responsabilité SHALL disposer d'un adaptateur JDBC dédié. Ces
adaptateurs MAY partager temporairement l'implémentation SQL existante afin de
préserver le comportement, les transactions et les validations PostgreSQL du
périmètre.

#### Scenario: Opérations de campagne

- **WHEN** le service liste, crée, modifie, ouvre ou clôt une campagne
- **THEN** il utilise le port et l'adaptateur dédiés au catalogue des campagnes

#### Scenario: Opérations d'échéance

- **WHEN** le service consulte les échéances d'une campagne ou d'un membre
- **THEN** il utilise le port et l'adaptateur dédiés aux échéances

#### Scenario: Opérations de règlement

- **WHEN** le service enregistre ou liste un règlement
- **THEN** il utilise le port et l'adaptateur dédiés aux règlements

#### Scenario: Contrôle de non-régression

- **WHEN** les tests de campagnes, échéances et règlements sont exécutés
- **THEN** les contrats HTTP, les règles d'accès et les transactions existants
  restent inchangés
