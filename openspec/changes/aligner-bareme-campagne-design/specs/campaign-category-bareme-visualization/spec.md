## ADDED Requirements

### Requirement: Présentation du barème de campagne

L'onglet des montants par catégorie MUST afficher une zone d'en-tête intitulée « Barème de la campagne », sa description et un tableau présentant exactement les colonnes `Catégorie`, `Montant de cette campagne`, `Membres concernés` et `Total attendu`, dans cet ordre.

#### Scenario: Affichage nominal du barème

- **WHEN** une campagne chargée contient des montants par catégorie et que l'utilisateur ouvre l'onglet des catégories
- **THEN** la zone d'en-tête et les quatre colonnes du tableau sont visibles dans l'ordre défini
- **AND** chaque ligne affiche les données correspondantes de `Campaign.categoryAmounts`

#### Scenario: Campagne sans montant de catégorie

- **WHEN** la campagne chargée ne contient aucun montant par catégorie
- **THEN** l'interface affiche l'état vide explicite du barème
- **AND** elle n'affiche pas de ligne ou de total inventé

### Requirement: Identification et formatage des catégories

Chaque ligne MUST identifier visuellement la catégorie par une pastille cohérente avec son libellé, afficher le libellé métier renvoyé par l'API, formater les montants en GNF avec les séparateurs français et afficher le nombre de membres avec son unité.

#### Scenario: Ligne de catégorie configurée

- **WHEN** une catégorie possède un montant, un effectif et un total attendu
- **THEN** la ligne affiche la pastille, le libellé, le montant de la campagne, le nombre de membres suivi de « membres » et le total attendu
- **AND** les valeurs affichées correspondent aux champs API sans recalcul local de substitution

#### Scenario: Catégorie sans montant configuré

- **WHEN** le montant de la catégorie vaut zéro selon le contrat
- **THEN** la ligne conserve la catégorie et ses autres informations
- **AND** l'état « Montant non configuré » est visible sans confondre cette absence avec un montant configuré positif

### Requirement: Action d'édition du barème

L'action « Modifier les montants » MUST être visible pour un Administrateur ou un Trésorier lorsque la campagne n'est pas clôturée et MUST ouvrir un dialogue réutilisant le formulaire et la mutation existants.

#### Scenario: Utilisateur autorisé sur une campagne à venir

- **WHEN** un Administrateur ou un Trésorier consulte une campagne `UPCOMING` ou `OPEN`
- **THEN** l'action « Modifier les montants » est visible dans l'en-tête du barème
- **AND** son activation ouvre le dialogue « Montants de campagne » avec les montants courants préremplis
- **AND** le dialogue affiche le nom de la campagne, le nombre de membres concernés et son statut

#### Scenario: Utilisateur ou campagne non autorisé

- **WHEN** un Membre ou un Opérateur consulte une campagne, ou lorsqu'un utilisateur autorisé consulte une campagne `CLOSED`
- **THEN** l'action d'édition du barème n'est pas visible
- **AND** aucune mutation de montant n'est déclenchée par l'interface

#### Scenario: Erreur de sauvegarde du barème

- **WHEN** la sauvegarde des montants échoue
- **THEN** l'erreur traduite est visible dans le formulaire
- **AND** le formulaire reste ouvert avec la saisie conservée pour permettre une nouvelle tentative

### Requirement: Rendu responsive et états accessibles

La présentation MUST rester lisible sur desktop et mobile, conserver les informations métier dans la version empilée et distinguer les états de chargement, d'erreur, vide et contenu disponible.

#### Scenario: Consultation sur petit écran

- **WHEN** l'onglet est affiché dans une largeur mobile
- **THEN** les quatre informations métier de chaque catégorie restent accessibles sans débordement horizontal involontaire
- **AND** l'ordre de lecture reste cohérent avec les en-têtes desktop

#### Scenario: Chargement ou erreur de la campagne

- **WHEN** les données de la campagne sont en cours de chargement ou que leur chargement échoue
- **THEN** l'interface affiche l'état correspondant avec un libellé compréhensible
- **AND** elle ne présente pas de barème partiel comme s'il était complet
