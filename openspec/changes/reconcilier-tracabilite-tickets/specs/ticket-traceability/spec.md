## ADDED Requirements

### Requirement: Tâches de livraison cohérentes avec les fusions

Les tâches OpenSpec de livraison SHALL refléter la présence réelle des PR
fusionnées dans la branche d'intégration.

#### Scenario: Tickets fusionnés

- **WHEN** une PR de ticket est fusionnée dans `develop`
- **THEN** les tâches de livraison réellement effectuées sont cochées dans `develop`

#### Scenario: Ticket dépendant vérifié

- **WHEN** un ticket dépend d'un ticket fusionné et réconcilié
- **THEN** `node scripts/tickets.mjs verify` ne le bloque pas sur cette dépendance
