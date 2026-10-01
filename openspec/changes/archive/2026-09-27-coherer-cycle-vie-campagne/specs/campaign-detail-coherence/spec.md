## ADDED Requirements

### Requirement: Le statut de campagne est compréhensible dans la fiche et la liste

L'interface MUST afficher `UPCOMING` comme « Brouillon » dans la liste, le détail, les pastilles et les textes d'état. Elle MUST conserver la valeur technique `UPCOMING` pour les appels et filtres API, et MUST continuer à afficher les dates prévues séparément du statut.

#### Scenario: Une campagne upcoming est présentée comme un brouillon

- **WHEN** un utilisateur consulte une campagne dont le statut API vaut `UPCOMING`
- **THEN** la liste et le détail affichent « Brouillon » et non « À venir » comme statut métier

#### Scenario: Les dates prévues restent visibles

- **WHEN** la campagne `UPCOMING` possède une date de début et une date de fin
- **THEN** le détail affiche la période prévue en plus du libellé « Brouillon »

### Requirement: Les actions de campagne dépendent strictement de l'état

La fiche campagne MUST appliquer la matrice suivante : une campagne `UPCOMING` permet la configuration du barème aux rôles autorisés et l'ouverture explicite lorsqu'elle est prête, une campagne `OPEN` permet les règlements et la clôture aux rôles autorisés, et une campagne `CLOSED` est en consultation seule. L'action « Clôturer » MUST NOT être affichée sur `UPCOMING`.

#### Scenario: Un brouillon ne peut pas être clôturé

- **WHEN** un Administrateur ou un Trésorier consulte une campagne `UPCOMING`
- **THEN** l'action « Clôturer » est absente et l'enregistrement d'un règlement n'est pas proposé

#### Scenario: Une campagne ouverte peut être clôturée

- **WHEN** un Administrateur ou un Trésorier consulte une campagne `OPEN`
- **THEN** l'action « Clôturer » est disponible avec confirmation et l'enregistrement d'un règlement reste autorisé selon les règles de rôle

#### Scenario: Une campagne clôturée est consultable sans mutation

- **WHEN** un utilisateur consulte une campagne `CLOSED`
- **THEN** les actions de clôture, de modification du barème et d'enregistrement d'un règlement sont absentes

### Requirement: La préparation de l'ouverture est visible et bloquante

Pour une campagne `UPCOMING`, la fiche MUST afficher les conditions `openingReadiness` à proximité de l'action d'ouverture. L'action « Ouvrir la campagne » MUST être disponible uniquement pour les rôles habilités lorsque `ready` vaut vrai. Lorsque `ready` vaut faux, la fiche MUST présenter les raisons bloquantes et MUST NOT effectuer aucun appel d'ouverture.

#### Scenario: Un brouillon incomplet expose les blocages

- **WHEN** `openingReadiness.ready` vaut faux pour une campagne `UPCOMING`
- **THEN** la checklist affiche chaque condition non satisfaite, l'action d'ouverture est indisponible et l'utilisateur peut identifier la correction attendue

#### Scenario: Un brouillon prêt propose l'ouverture explicite

- **WHEN** `openingReadiness.ready` vaut vrai et que l'utilisateur est Administrateur ou Trésorier
- **THEN** l'action « Ouvrir la campagne » est l'action de cycle de vie principale, une confirmation rappelle le gel du barème, puis la page appelle l'opération d'ouverture après confirmation

#### Scenario: Une course est traitée par le contrat existant

- **WHEN** l'ouverture échoue avec un conflit renvoyé par `POST /campaigns/{campaignId}/open`
- **THEN** la page affiche l'erreur métier correspondante et ne présente pas la campagne comme ouverte sur la seule base de la checklist précédente

### Requirement: Les données de démonstration d'une campagne sont cohérentes

Les données MSW de la campagne « Rentrée associative » MUST utiliser 62 membres dans le résumé, le détail, les catégories et les cotisations. La somme des montants attendus par catégorie MUST être égale au montant attendu du résumé financier, et les compteurs de cotisations MUST former une partition du total.

#### Scenario: Le détail de la campagne 201 conserve une source cohérente

- **WHEN** le détail de la campagne 201 est chargé
- **THEN** `memberCount` vaut 62, le total attendu vaut 4 650 000 GNF et `dueCounts.total` vaut 62

#### Scenario: Une campagne brouillon ne présente pas de collecte fictive

- **WHEN** le mock de la campagne 201 est consulté avant ouverture
- **THEN** le montant encaissé vaut 0, le taux de collecte vaut 0, le reste à encaisser vaut 4 650 000 GNF et les 62 cotisations sont non réglées

#### Scenario: La liste et le détail affichent les mêmes agrégats

- **WHEN** le même utilisateur consulte la carte de liste puis le détail de la campagne 201
- **THEN** les membres, le montant attendu, le montant encaissé, le reste et les compteurs de cotisations sont identiques
