## ADDED Requirements

### Requirement: Structure de détail membre

La fiche membre SHALL utiliser la structure de détail partagée avec un lien de retour vers la liste des membres, un hero d'identité, une carte principale et une colonne latérale sur desktop. La structure SHALL rester lisible et complète lorsque les colonnes sont empilées sur un écran étroit.

#### Scenario: Affichage desktop de la fiche

- **WHEN** un utilisateur autorisé ouvre la fiche d'un membre à une largeur desktop
- **THEN** la page affiche le retour vers les membres au-dessus d'une composition à deux colonnes
- **AND** la colonne principale contient l'identité, les actions et les onglets
- **AND** la colonne secondaire contient la situation financière et le compte associé

#### Scenario: Affichage responsive de la fiche

- **WHEN** un utilisateur autorisé ouvre la fiche à une largeur inférieure au seuil desktop
- **THEN** les zones principales et secondaires sont empilées dans un ordre lisible
- **AND** aucune information, action ou colonne de tableau n'est rendue inaccessible par débordement horizontal non prévu

### Requirement: Identité et informations du membre

La carte principale SHALL afficher le nom d'affichage, les initiales, le statut, la catégorie de revenu et la fonction associative lorsqu'elle est fournie. Elle SHALL afficher les informations personnelles et associatives avec les libellés Nom, Prénom, Nom d'usage, Téléphone, Pays, Ville, Catégorie de revenu et Fonction associative. Une donnée facultative absente SHALL utiliser le remplacement français existant au lieu d'afficher une chaîne vide ou la valeur `undefined`.

#### Scenario: Membre avec informations complètes

- **WHEN** `GET /api/v1/members/{memberId}` renvoie un membre avec ses informations de contact et associatives
- **THEN** la carte affiche chaque libellé dans la section correspondante
- **AND** les valeurs affichées correspondent aux données de la réponse

#### Scenario: Membre avec informations facultatives absentes

- **WHEN** le membre ne possède pas de nom d'usage, de téléphone, de pays, de ville ou de fonction associative
- **THEN** chaque champ absent affiche le remplacement français prévu
- **AND** la page reste valide sans afficher de valeur technique

### Requirement: Situation financière et compte associé

La colonne secondaire SHALL afficher une carte `Situation actuelle` avec le montant restant à payer comme valeur principale, puis le total dû et le total payé. Les montants SHALL utiliser le formateur GNF partagé et SHALL provenir de `MemberDetails.financialSummary` sans recalcul depuis un tableau paginé. Une seconde carte SHALL afficher l'état du compte associé, le rôle applicatif et l'information distinguant ce rôle de la fonction associative lorsqu'elle est pertinente.

#### Scenario: Situation financière disponible

- **WHEN** la réponse membre contient une synthèse financière avec un reste, un total dû et un total payé
- **THEN** la colonne secondaire affiche ces trois montants avec leur devise et leurs libellés
- **AND** le montant restant est présenté comme la valeur principale de la carte

#### Scenario: Compte associé actif

- **WHEN** `member.account.active` vaut `true`
- **THEN** la carte de compte affiche `Accès actif` et le rôle applicatif traduit
- **AND** elle conserve l'identité du membre sous forme d'avatar et de nom

#### Scenario: Données financières nulles

- **WHEN** la synthèse financière contient des montants égaux à zéro
- **THEN** la page affiche `0 GNF` pour les montants concernés
- **AND** elle ne remplace pas ces zéros par le libellé de donnée absente

### Requirement: Actions contextualisées et autorisations

La fiche SHALL afficher les actions avec les composants partagés et des états hover, focus-visible, désactivé, chargement et erreur cohérents avec le reste de l'application. L'action Modifier SHALL respecter les droits existants. Les actions Désactiver et Réactiver SHALL rester réservées à l'Administrateur et mutuellement exclusives selon le statut. L'action financière SHALL soit ouvrir un parcours d'enregistrement réel, soit annoncer explicitement une navigation vers l'onglet des cotisations si aucun sélecteur global n'est disponible.

#### Scenario: Administrateur sur un membre actif

- **WHEN** un Administrateur ouvre la fiche d'un membre actif
- **THEN** l'action Modifier et l'action Désactiver sont visibles
- **AND** l'action Réactiver est absente

#### Scenario: Administrateur sur un membre inactif

- **WHEN** un Administrateur ouvre la fiche d'un membre inactif
- **THEN** l'action Réactiver est visible
- **AND** l'action Désactiver est absente

#### Scenario: Opérateur sans autorisation financière

- **WHEN** un Opérateur dont `operatorCanRecordPayments` vaut `false` ouvre la fiche
- **THEN** les actions financières non autorisées ne sont pas présentées comme disponibles
- **AND** la page conserve l'accès en lecture aux informations et historiques autorisés

#### Scenario: Échec d'une mutation

- **WHEN** une modification, une désactivation ou une réactivation échoue
- **THEN** le dialogue reste cohérent avec l'état de saisie ou de confirmation
- **AND** une erreur accessible et une nouvelle tentative sont proposées sans double appel automatique

### Requirement: Onglets et historiques du membre

La fiche SHALL conserver les onglets Informations, Cotisations, Règlements et Contributions avec une sémantique ARIA complète, l'activation au clic et la navigation clavier. Les tableaux SHALL conserver leurs données, leurs formatages, leur pagination et leurs états de chargement, d'erreur et vide, avec uniquement les colonnes métier suivantes et dans cet ordre : `Campagne`, `Dû`, `Payé`, `Reste`, `Statut` pour les cotisations ; `Date`, `Campagne`, `Montant`, `Mode` pour les règlements ; `Cagnotte`, `Montant`, `Mode`, `Date` pour les contributions. Les tableaux de la fiche membre MUST NOT afficher une colonne de journalisation telle que `Enregistré par`, `Enregistrée par`, `Horodatage`, ou toute autre colonne équivalente. Les champs d'audit éventuellement renvoyés par l'API peuvent rester disponibles dans les données consommées, mais SHALL NOT être rendus dans ces tableaux. La pagination SHALL rester masquée lorsque le nombre d'éléments ne dépasse pas la taille de page configurée.

#### Scenario: Activation d'un onglet

- **WHEN** l'utilisateur clique sur un onglet ou l'active avec Entrée ou Espace
- **THEN** l'onglet devient sélectionné
- **AND** seul son panneau associé est affiché avec des relations `aria-controls` et `aria-labelledby` cohérentes

#### Scenario: Navigation clavier entre onglets

- **WHEN** le focus est placé sur un onglet et que l'utilisateur appuie sur une flèche gauche ou droite
- **THEN** l'onglet suivant ou précédent devient actif selon la direction
- **AND** le focus est déplacé sur le nouvel onglet sans rechargement de page

#### Scenario: Colonnes minimales des règlements

- **WHEN** l'utilisateur active l'onglet Règlements
- **THEN** le tableau affiche exactement les colonnes `Date`, `Campagne`, `Montant` et `Mode`
- **AND** aucune colonne `Enregistré par`, `Enregistrée par` ou `Horodatage` n'est affichée

#### Scenario: Colonnes minimales des contributions

- **WHEN** l'utilisateur active l'onglet Contributions
- **THEN** le tableau affiche exactement les colonnes `Cagnotte`, `Montant`, `Mode` et `Date`
- **AND** aucune colonne `Enregistré par`, `Enregistrée par` ou `Horodatage` n'est affichée

#### Scenario: Métadonnées d'audit non rendues

- **WHEN** une réponse API contient `recordedBy` ou `recordedAt` pour un règlement ou une contribution
- **THEN** ces propriétés restent disponibles pour le modèle de données sans être affichées dans la fiche membre
- **AND** aucune cellule ni aucun en-tête du tableau ne présente ces métadonnées

#### Scenario: Historique paginé

- **WHEN** un historique contient plus d'une page
- **THEN** les contrôles Précédent et Suivant affichent la page courante et le nombre total de pages
- **AND** une erreur de chargement d'une page ultérieure reste visible tout en conservant la page précédente affichée

#### Scenario: Historique vide ou en chargement

- **WHEN** un historique est en cours de chargement ou ne contient aucun élément
- **THEN** la page affiche respectivement un état de chargement ou un état vide accessible
- **AND** aucun tableau vide sans contexte n'est présenté
