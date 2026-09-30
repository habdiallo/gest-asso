# backend-and-deployment-delivery-plan Specification

## Purpose
TBD - created by archiving change implementer-backend-deploiement-mvp. Update Purpose after archive.
## Requirements
### Requirement: Livraisons ordonnées par ticket

Les travaux backend, contractuels et d'infrastructure SHALL être répartis entre les tickets `T-143` à `T-151`, chacun avec une branche, un worktree et une PR dédiés.

#### Scenario: Ticket dépendant

- **WHEN** un ticket possède un prérequis non intégré ou non terminé localement
- **THEN** son implémentation et sa PR ne démarrent pas et le blocage est signalé

### Requirement: Socle avant fonctionnalités métier

Le backend SHALL disposer de son socle de compilation, de son intégration contractuelle et de sa stratégie de persistance avant l'implémentation des domaines métier MVP.

#### Scenario: Première fonctionnalité métier

- **WHEN** un ticket de domaine métier est sélectionné
- **THEN** `T-143`, `T-144` et `T-145` sont terminés ou présents dans la base de travail conforme à leurs dépendances

### Requirement: Validation par PR

Chaque ticket SHALL fournir les validations adaptées à son périmètre et SHALL laisser `main` dans un état intégrable après fusion.

#### Scenario: PR backend

- **WHEN** une PR backend est préparée
- **THEN** elle documente le contrat concerné, les tests exécutés, les migrations éventuelles et les limites restantes

### Requirement: Worktrees isolés

Les worktrees SHALL être créés à partir de la branche résolue du ticket et ne SHALL contenir que les changements de ce ticket et de ses dépendances intégrées.

#### Scenario: Domaines parallélisables

- **WHEN** les prérequis communs des tickets `T-146`, `T-147` et `T-148` sont satisfaits
- **THEN** chaque domaine peut être travaillé dans un worktree distinct sans partager de modifications non committées

### Requirement: Contrat API prioritaire

Les tickets SHALL traiter `besoins/openapi.yaml` comme source canonique et SHALL aligner le backend, le client Angular et les mocks lors de toute modification.

#### Scenario: Contrat modifié

- **WHEN** un ticket ajoute ou modifie une opération API
- **THEN** la validation OpenAPI, la génération ou mise à jour des consommateurs et les tests de compatibilité sont inclus avant l'ouverture de la PR

