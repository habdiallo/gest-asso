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

### Requirement: Formulaire de modification du membre

Le clic sur l'action Modifier SHALL ouvrir un modal intitulé `Modifier un membre`, avec le kicker `Fiche membre`, un bouton de fermeture, un texte d'introduction et les sections `Identité` et `Localisation et association`. Le formulaire SHALL préremplir les valeurs du membre et afficher les champs Nom, Prénom, Nom d'usage, Téléphone, Pays, Ville, Catégorie de revenu et Fonction associative. Le statut du membre SHALL rester géré depuis la fiche et ne SHALL NOT être éditable dans ce formulaire.

Le modal SHALL afficher les actions `Annuler` et `Enregistrer`. `Enregistrer` SHALL déclencher la mutation existante avec les valeurs validées, tandis que `Annuler`, la fermeture et Échap SHALL fermer le modal sans mutation. Le modal SHALL gérer le focus initial, le confinement du focus, le retour du focus au bouton Modifier et une erreur de mutation réessayable sans effacer la saisie. Le rendu SHALL utiliser les primitives d'input et de sélection partagées, avec un état `focus-visible` accessible sans double bordure.

#### Scenario: Ouverture du formulaire de modification

- **WHEN** un utilisateur autorisé clique sur `Modifier` depuis la fiche membre
- **THEN** un modal intitulé `Modifier un membre` s'ouvre au-dessus de la fiche
- **AND** les champs sont préremplis avec les valeurs actuelles du membre
- **AND** le focus initial est placé dans le modal

#### Scenario: Organisation du formulaire sur desktop

- **WHEN** le modal est affiché à une largeur desktop
- **THEN** la section `Identité` affiche Nom et Prénom sur une ligne, puis Nom d'usage et Téléphone sur une ligne
- **AND** la section `Localisation et association` affiche Pays et Ville sur une ligne, puis Catégorie de revenu et Fonction associative sur une ligne
- **AND** les actions `Annuler` et `Enregistrer` sont alignées dans le footer du modal

#### Scenario: Sélections et champs modifiables

- **WHEN** l'utilisateur ouvre Pays ou Catégorie de revenu
- **THEN** le champ utilise le sélecteur partagé et expose son état actif de manière visible
- **AND** les autres champs acceptent la modification sans ajouter de bordure ring externe

#### Scenario: Annulation ou fermeture du formulaire

- **WHEN** l'utilisateur clique sur `Annuler`, sur le bouton de fermeture ou appuie sur Échap
- **THEN** le modal se ferme sans appeler l'API de mise à jour
- **AND** le focus revient au bouton `Modifier`

#### Scenario: Enregistrement réussi du formulaire

- **WHEN** l'utilisateur modifie des valeurs valides puis clique sur `Enregistrer`
- **THEN** la mutation de mise à jour est appelée une seule fois avec les valeurs du formulaire
- **AND** le modal se ferme après succès
- **AND** la fiche affiche les valeurs mises à jour

#### Scenario: Erreur lors de l'enregistrement

- **WHEN** la mutation de mise à jour échoue
- **THEN** le modal reste ouvert avec les valeurs saisies
- **AND** une erreur accessible est affichée avec la possibilité de réessayer

### Requirement: Formulaire d'enregistrement d'un règlement

Le clic sur l'action `Enregistrer un règlement` SHALL ouvrir un modal intitulé `Nouveau règlement` avec le kicker `Fiche membre`, une fermeture explicite et un texte indiquant qu'il s'agit d'une opération déjà constatée. Le modal SHALL afficher une synthèse composée de `Montant dû`, `Déjà payé` et `Reste à payer`, puis les champs `Membre`, `Campagne`, `Montant`, `Date` et `Mode de règlement`. Le membre courant SHALL être présélectionné lorsque le modal est ouvert depuis sa fiche.

Le montant SHALL être numérique, exprimé en GNF et limité au reste à payer de la campagne sélectionnée. Le formulaire SHALL afficher ce maximum, empêcher la confirmation d'une valeur supérieure et utiliser les options de mode de règlement existantes. Il SHALL afficher une information sur l'horodatage et l'association de l'opération au compte courant pour la traçabilité, sans transformer cette information en colonne des tableaux métier.

La confirmation SHALL déclencher une seule mutation avec le membre, la campagne, le montant, la date et le mode validés. Les actions `Annuler`, la fermeture et Échap SHALL fermer le modal sans mutation. Le modal SHALL gérer le focus initial, le confinement du focus, le retour du focus au déclencheur, les erreurs accessibles, la conservation de la saisie en cas d'échec et l'état de chargement de la confirmation.

#### Scenario: Ouverture depuis la fiche membre

- **WHEN** un utilisateur autorisé clique sur `Enregistrer un règlement` depuis la fiche d'un membre
- **THEN** le modal `Nouveau règlement` s'ouvre
- **AND** le membre courant est sélectionné
- **AND** le focus initial est placé dans le modal

#### Scenario: Synthèse de la cotisation

- **WHEN** une campagne est sélectionnée pour le règlement
- **THEN** le modal affiche `Montant dû`, `Déjà payé` et `Reste à payer`
- **AND** le montant restant est visuellement mis en évidence
- **AND** le maximum autorisé du champ Montant correspond au reste à payer

#### Scenario: Validation du montant

- **WHEN** l'utilisateur saisit un montant supérieur au reste à payer ou un montant invalide
- **THEN** le formulaire affiche une erreur accessible
- **AND** l'action `Confirmer l'enregistrement` ne déclenche pas de mutation

#### Scenario: Confirmation d'un règlement

- **WHEN** l'utilisateur saisit un montant valide, une date et un mode de règlement puis confirme
- **THEN** une seule mutation est appelée avec le membre, la campagne, le montant, la date et le mode
- **AND** le modal se ferme après succès
- **AND** les données de la fiche sont rafraîchies pour refléter le règlement

#### Scenario: Traçabilité présentée dans le formulaire

- **WHEN** le modal de règlement est ouvert
- **THEN** une information indique que l'opération sera horodatée et associée au compte courant
- **AND** cette information ne crée aucune colonne `Enregistré par`, `Enregistrée par` ou `Horodatage` dans les tableaux

#### Scenario: Erreur de confirmation d'un règlement

- **WHEN** la mutation du règlement échoue
- **THEN** le modal reste ouvert avec les valeurs saisies
- **AND** une erreur accessible est affichée avec la possibilité de réessayer

### Requirement: Onglets et historiques du membre

Les informations personnelles et associatives SHALL rester visibles en permanence dans la carte principale (voir Requirement "Identité et informations du membre"), sans onglet dédié séparé. La fiche SHALL conserver les onglets Cotisations, Règlements et Contributions avec une sémantique ARIA complète, l'activation au clic et la navigation clavier. Les tableaux SHALL conserver leurs données, leurs formatages, leur pagination et leurs états de chargement, d'erreur et vide, avec uniquement les colonnes métier suivantes et dans cet ordre : `Campagne`, `Dû`, `Payé`, `Reste`, `Statut` pour les cotisations ; `Date`, `Campagne`, `Montant`, `Mode` pour les règlements ; `Cagnotte`, `Montant`, `Mode`, `Date` pour les contributions. Les tableaux de la fiche membre MUST NOT afficher une colonne de journalisation telle que `Enregistré par`, `Enregistrée par`, `Horodatage`, ou toute autre colonne équivalente. Les champs d'audit éventuellement renvoyés par l'API peuvent rester disponibles dans les données consommées, mais SHALL NOT être rendus dans ces tableaux. La pagination SHALL rester masquée lorsque le nombre d'éléments ne dépasse pas la taille de page configurée.

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
