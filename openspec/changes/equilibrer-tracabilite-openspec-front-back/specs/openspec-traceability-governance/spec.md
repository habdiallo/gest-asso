## ADDED Requirements

### Requirement: Registre unique des tickets

Le dépôt SHALL utiliser `openspec/tickets.json` comme source de vérité pour
l'identité locale d'un ticket, son scope, son type, son change, ses étapes, ses
dépendances et sa branche résolue. Le compteur `nextTicketId` SHALL rester
global à tous les scopes et aucun numéro ne SHALL être réattribué.

#### Scenario: Création d'un ticket frontend ou backend

- **WHEN** une nouvelle évolution est planifiée
- **THEN** elle reçoit le prochain numéro global du registre
- **THEN** son change, ses étapes et sa branche correspondent au même numéro
- **THEN** `node scripts/tickets.mjs check` confirme la cohérence du registre

### Requirement: Artefacts OpenSpec équilibrés

Chaque change planifié SHALL fournir une proposition, un design, une ou plusieurs
specs et une liste de tâches avant son application, quelle que soit la partie
frontend ou backend concernée. Les fichiers générés, les sorties de build et les
clients API générés SHALL NOT être considérés comme les artefacts sources de la
traçabilité.

#### Scenario: Change frontend ou backend prêt à appliquer

- **WHEN** le change est déclaré prêt pour l'implémentation
- **THEN** ses artefacts de planification sont présents et cohérents
- **THEN** chaque tâche concernée porte le marqueur `[T-<numero>]` correspondant
- **THEN** le ticket résolu et la branche de travail sont vérifiables

### Requirement: Statut vérifiable et séparé

La traçabilité SHALL distinguer l'avancement local des tâches, la présence des
changements dans une branche et l'état de la PR. Une tâche cochée SHALL NOT être
présentée comme une preuve de fusion ou de publication.

#### Scenario: Rapport de statut

- **WHEN** l'état d'un ticket est communiqué
- **THEN** les cases OpenSpec réalisées sont rapportées séparément des validations
- **THEN** la branche et la PR sont vérifiées indépendamment
- **THEN** toute information non vérifiable est explicitement signalée
