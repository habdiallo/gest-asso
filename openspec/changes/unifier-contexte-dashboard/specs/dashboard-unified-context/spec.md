## ADDED Requirements

### Requirement: Sélection unique du contexte du tableau de bord

Le dashboard de gestion SHALL proposer un seul contexte actif parmi
« Cotisations » et « Cagnottes », avec un seul sélecteur de périmètre dépendant
du type choisi. L'état actif SHALL être explicite et ne SHALL jamais conserver
simultanément une campagne et une cagnotte sélectionnées.

#### Scenario: Ouverture du dashboard de gestion

- **WHEN** un utilisateur autorisé ouvre le dashboard de gestion
- **THEN** l'interface affiche un type de contexte actif et un seul sélecteur
  correspondant, avec une sélection cohérente pour toutes les données affichées

#### Scenario: Changement de type de contexte

- **WHEN** l'utilisateur passe de « Cotisations » à « Cagnottes », ou inversement
- **THEN** le périmètre de l'ancien type est désélectionné, le sélecteur affiché
  change de source et les données du dashboard sont rechargées pour le nouveau
  contexte

#### Scenario: Changement rapide de sélection

- **WHEN** l'utilisateur change plusieurs fois de type ou de périmètre avant la
  fin d'une requête
- **THEN** seule la réponse correspondant à la dernière sélection est affichée
  et aucune donnée d'un ancien contexte ne reste visible

### Requirement: Indicateurs cohérents avec les cotisations

Lorsque le contexte actif est « Cotisations », le dashboard SHALL afficher les
indicateurs du périmètre de campagne sélectionné : membres concernés,
cotisations encaissées, reste à encaisser et paiements. Les données SHALL
provenir du bilan financier retourné par le dashboard pour cette campagne ou
pour l'agrégat des campagnes ouvertes.

#### Scenario: Toutes les campagnes ouvertes

- **WHEN** l'utilisateur sélectionne « Toutes les campagnes ouvertes »
- **THEN** les quatre indicateurs affichent l'agrégat des campagnes ouvertes et
  les activités affichées sont les campagnes et règlements de ce contexte

#### Scenario: Campagne précise

- **WHEN** l'utilisateur sélectionne une campagne ouverte précise
- **THEN** les indicateurs et les règlements affichés correspondent à cette
  campagne, sans afficher de données de cagnotte

### Requirement: Indicateurs cohérents avec les cagnottes

Lorsque le contexte actif est « Cagnottes », le dashboard SHALL afficher les
indicateurs du périmètre de cagnotte sélectionné : contributeurs, objectif,
contributions encaissées et reste à collecter. Les contributions récentes
SHALL provenir de l'endpoint existant de liste des contributions, filtré par
la cagnotte précise ou agrégé sur les cagnottes ouvertes.

#### Scenario: Toutes les cagnottes ouvertes

- **WHEN** l'utilisateur sélectionne « Toutes les cagnottes ouvertes »
- **THEN** les indicateurs affichent l'agrégat des cagnottes ouvertes et le flux
  d'activité affiche les contributions récentes de ce même périmètre

#### Scenario: Cagnotte précise

- **WHEN** l'utilisateur sélectionne une cagnotte ouverte précise
- **THEN** les indicateurs et les contributions affichés correspondent à cette
  cagnotte, sans afficher de règlements de cotisation

#### Scenario: Cagnotte sans objectif

- **WHEN** la cagnotte sélectionnée ne possède pas d'objectif
- **THEN** l'objectif et le reste à collecter affichent un état explicite sans
  calcul de pourcentage trompeur

### Requirement: Actions et activités alignées sur le contexte

Les actions rapides, les titres, les sous-titres, les états vides et les liens
du dashboard SHALL correspondre au contexte actif. Les règles d'autorisation
existantes SHALL rester appliquées, et les panneaux de synthèse supprimés par
T-135 SHALL rester absents.

#### Scenario: Actions en contexte cotisations

- **WHEN** le contexte actif est « Cotisations »
- **THEN** les actions et activités proposent les opérations de campagne et de
  règlement autorisées au rôle courant

#### Scenario: Actions en contexte cagnottes

- **WHEN** le contexte actif est « Cagnottes »
- **THEN** les actions et activités proposent les opérations de cagnotte et de
  contribution autorisées au rôle courant

#### Scenario: Rôle sans autorisation de gestion

- **WHEN** un rôle ne peut pas créer une campagne ou une cagnotte
- **THEN** l'action de création correspondante reste masquée ou remplacée par
  l'action de consultation déjà prévue par les règles du dashboard

#### Scenario: Synthèses redondantes

- **WHEN** l'utilisateur consulte le dashboard dans l'un ou l'autre contexte
- **THEN** aucun panneau séparé « Synthèse des cotisations » ou « Synthèse de
  la cagnotte » n'est rendu en complément des indicateurs principaux

### Requirement: Résilience et responsive du sélecteur unique

Le sélecteur unique SHALL conserver les états de chargement, d'erreur et vide
existants, être utilisable au clavier et rester lisible en thème clair, thème
sombre, desktop et mobile.

#### Scenario: Erreur de chargement du nouveau contexte

- **WHEN** le chargement du périmètre ou de son activité échoue
- **THEN** le dashboard conserve le dernier état cohérent ou affiche l'erreur
  prévue, sans mélanger les données des deux contextes

#### Scenario: Affichage mobile et desktop

- **WHEN** l'utilisateur consulte le dashboard sur mobile ou desktop, en thème
  clair ou sombre
- **THEN** le type actif, le sélecteur unique, les indicateurs et les activités
  restent visibles, alignés et sans débordement horizontal
