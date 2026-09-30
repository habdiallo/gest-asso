## ADDED Requirements

### Requirement: État local et état de feature par défaut

Le frontend SHALL conserver l'état local d'un composant et l'état métier partagé
d'une feature au plus près de cette feature, en utilisant les Signals et services
colocalisés lorsque c'est pertinent. Les données serveur SHALL rester sous
l'autorité de l'API et ne SHALL NOT être dupliquées dans un cache global implicite.

#### Scenario: État propre à une feature

- **WHEN** une page ou plusieurs composants d'une même feature doivent partager un état
- **THEN** cet état est détenu dans la feature concernée
- **THEN** aucune dépendance vers une autre feature n'est créée

#### Scenario: Mutation d'une donnée serveur

- **WHEN** une feature modifie une donnée provenant de l'API
- **THEN** elle recharge ou invalide explicitement la donnée concernée
- **THEN** elle ne considère pas une copie globale comme la source de vérité

### Requirement: Promotion contrôlée dans le socle global

Un état SHALL rejoindre `core/` uniquement si plusieurs features le consomment,
si sa durée de vie dépasse celle d'une feature et si sa cohérence exige un
contexte transversal. La décision SHALL documenter la source de vérité, les
transitions, l'invalidation et les tests.

#### Scenario: État réellement transversal

- **WHEN** un état est lu ou modifié par plusieurs features indépendantes et doit survivre à leur navigation
- **THEN** sa promotion vers `core/` est justifiée dans la documentation
- **THEN** ses transitions et son invalidation sont testées

#### Scenario: État partagé insuffisant pour une promotion

- **WHEN** un état n'est utilisé que par une feature ou doit uniquement être partagé entre ses composants
- **THEN** il reste dans la feature
- **THEN** aucun service global n'est ajouté dans `core/`

### Requirement: Traçabilité de la stratégie

La stratégie d'état SHALL être documentée dans le frontend et SHALL distinguer
l'état local, l'état métier de feature et l'état applicatif transversal. Les
validations pertinentes SHALL être exécutées avant la livraison.

#### Scenario: Contrôle de livraison

- **WHEN** une évolution introduit ou promeut un état frontend
- **THEN** la catégorie, la source de vérité, l'invalidation et les tests sont identifiés
- **THEN** le périmètre est traçable dans la documentation et les artefacts OpenSpec
