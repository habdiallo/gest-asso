## ADDED Requirements

### Requirement: Cycle de vie à trois états d'une campagne

Une campagne MUST suivre trois états exclusifs et ordonnés, sans retour en arrière : Brouillon (`UPCOMING`, avant son ouverture explicite), Ouverte (`OPEN`, après son ouverture explicite et jusqu'à la clôture) et Clôturée (`CLOSED`, après clôture explicite par un Administrateur ou un Trésorier). La date de début est une condition minimale d'ouverture, pas une transition automatique. Chaque action de modification de la campagne MUST être disponible dans un seul de ces trois états, conformément à RG-COT-017.

#### Scenario: Progression des états

- **WHEN** une campagne est créée
- **THEN** son statut initial est `UPCOMING` (Brouillon)
- **AND** elle reste `UPCOMING` tant qu'un Administrateur ou un Trésorier ne l'a pas ouverte explicitement
- **AND** elle ne peut pas être ouverte avant sa date de début
- **AND** elle ne passe à `CLOSED` (Clôturée) que par la clôture explicite décrite dans US-COT-008

#### Scenario: Date atteinte sans ouverture explicite

- **WHEN** la date de début est atteinte mais que personne n'a exécuté l'ouverture
- **THEN** la campagne reste `UPCOMING`
- **AND** aucun règlement n'est accepté
- **AND** l'interface signale que l'ouverture doit encore être confirmée

### Requirement: Préparation contrôlée avant l'ouverture

La fiche campagne MUST exposer une checklist calculée par le serveur avant l'ouverture. Elle MUST distinguer au minimum `baremeComplete`, `datesValid`, `startDateReached`, `duesReady` et `ready`, ainsi que les raisons bloquantes lorsque `ready` vaut `false`. `ready` MUST être vrai uniquement si chaque catégorie concernée possède un montant strictement positif, si les dates sont cohérentes, si la date de début est atteinte et si les cotisations peuvent être établies.

#### Scenario: Barème incomplet

- **WHEN** une catégorie concernée n'a pas de montant strictement positif
- **THEN** `baremeComplete` et `ready` valent `false`
- **AND** la raison bloquante est visible dans la checklist
- **AND** l'action d'ouverture est absente ou désactivée

#### Scenario: Campagne prête

- **WHEN** le barème, les dates et les cotisations satisfont toutes les vérifications
- **THEN** `ready` vaut `true`
- **AND** l'action « Ouvrir la campagne » est proposée aux Administrateurs et Trésoriers
- **AND** aucune action d'ouverture n'est proposée aux autres rôles

### Requirement: Ouverture explicite et traçable

L'opération `POST /campaigns/{campaignId}/open` MUST être la seule transition applicative de `UPCOMING` vers `OPEN`. Le serveur MUST recalculer la checklist, vérifier la date de début et le statut courant dans la même opération, puis renseigner `openedAt` et `openedBy` de manière immuable.

#### Scenario: Ouverture réussie

- **WHEN** un Administrateur ou un Trésorier ouvre une campagne `UPCOMING` prête dont la date de début est atteinte
- **THEN** l'API répond `200` avec la campagne à l'état `OPEN`
- **AND** `openedAt` et `openedBy` sont renseignés
- **AND** le barème devient non modifiable et l'enregistrement des règlements devient possible

#### Scenario: Ouverture avant la date de début

- **WHEN** un utilisateur habilité tente d'ouvrir une campagne prête avant sa date de début
- **THEN** l'API répond `409` avec le code `CAMPAIGN_START_DATE_NOT_REACHED`
- **AND** la campagne reste `UPCOMING`

#### Scenario: Ouverture avec une préparation incomplète

- **WHEN** un utilisateur habilité tente d'ouvrir une campagne dont la checklist n'est pas prête
- **THEN** l'API répond `409` avec le code `CAMPAIGN_NOT_READY`
- **AND** la campagne reste `UPCOMING`

#### Scenario: Ouverture d'une campagne déjà ouverte ou clôturée

- **WHEN** un utilisateur tente d'ouvrir une campagne `OPEN` ou `CLOSED`
- **THEN** l'API répond `409` avec respectivement `CAMPAIGN_ALREADY_OPEN` ou `CAMPAIGN_CLOSED`
- **AND** aucune métadonnée d'audit ni aucun montant n'est modifié

### Requirement: Édition du barème réservée au Brouillon

L'édition des montants par catégorie MUST être proposée uniquement lorsque la campagne est en Brouillon (`UPCOMING`), conformément au contrat `updateCampaignCategoryAmounts` (édition uniquement avant la date de début, tant qu'aucun règlement n'existe) et à RG-COT-018.

#### Scenario: Campagne Ouverte ou Clôturée

- **WHEN** un Administrateur ou un Trésorier consulte une campagne `OPEN` ou `CLOSED`
- **THEN** l'action d'édition du barème n'est pas proposée
- **AND** les montants par catégorie restent affichés en lecture, inchangés

#### Scenario: Course rare entre chargement et enregistrement

- **WHEN** une campagne passe de `UPCOMING` à `OPEN` entre l'ouverture du dialogue d'édition et la soumission
- **THEN** le backend refuse l'enregistrement avec `CAMPAIGN_NOT_EDITABLE` (409)
- **AND** l'interface affiche l'erreur traduite correspondante sans perdre la saisie

### Requirement: Enregistrement d'un règlement réservé à l'état Ouvert

L'enregistrement d'un règlement MUST être proposé uniquement lorsque la campagne est à l'état Ouverte (`OPEN`), pour les rôles habilités (RG-ROLE-007 à RG-ROLE-009), conformément à RG-PAY-010. L'opération `createPayment` MUST refuser une cotisation rattachée à une campagne `UPCOMING` ou `CLOSED` avec une réponse `409` et le code stable `CAMPAIGN_NOT_OPEN`.

#### Scenario: Campagne en Brouillon

- **WHEN** un Trésorier ou un Opérateur autorisé consulte les cotisations d'une campagne `UPCOMING`
- **THEN** l'action d'enregistrement d'un règlement n'est pas proposée
- **AND** aucune mutation de règlement n'est déclenchée par l'interface

#### Scenario: Campagne Clôturée

- **WHEN** un Trésorier ou un Opérateur autorisé consulte les cotisations d'une campagne `CLOSED`
- **THEN** l'action d'enregistrement d'un règlement n'est pas proposée

#### Scenario: Campagne Ouverte

- **WHEN** un Trésorier ou un Opérateur autorisé consulte les cotisations d'une campagne `OPEN`
- **THEN** l'action d'enregistrement d'un règlement reste proposée sur chaque cotisation dont le reste à payer est positif

#### Scenario: Appel API hors campagne Ouverte

- **WHEN** `createPayment` est appelé pour une cotisation rattachée à une campagne `UPCOMING` ou `CLOSED`
- **THEN** l'API répond avec le statut `409`
- **AND** le corps d'erreur contient le code `CAMPAIGN_NOT_OPEN`

### Requirement: Aucune modification sur une campagne Clôturée

Une campagne Clôturée (`CLOSED`) MUST n'autoriser aucune action de modification : ni l'édition du barème, ni l'enregistrement d'un règlement, ni une nouvelle clôture.

#### Scenario: Toutes les actions de modification sont absentes

- **WHEN** un Administrateur, un Trésorier ou un Opérateur autorisé consulte une campagne `CLOSED`
- **THEN** ni l'action d'édition du barème, ni l'action d'enregistrement d'un règlement, ni l'action de clôture ne sont visibles
- **AND** la consultation (bilan, historique, cotisations) reste disponible
