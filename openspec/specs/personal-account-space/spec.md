# personal-account-space Specification

## Purpose
TBD - created by archiving change aligner-espace-personnel. Update Purpose after archive.
## Requirements
### Requirement: Destination compte pour les roles applicatifs de gestion

Le frontend SHALL fournir une route de compte applicatif pour les utilisateurs authentifies ayant le role Administrateur, Tresorier ou Operateur. Cette route SHALL utiliser les donnees deja presentes dans la session et ne SHALL pas declencher de requete supplementaire pour afficher la carte du compte.

#### Scenario: Ouverture du compte depuis la sidebar

- **WHEN** un Administrateur, Tresorier ou Operateur active le bloc d'identite en bas de la sidebar desktop
- **THEN** le frontend ouvre la page « Mon acces » et affiche la carte du compte de l'utilisateur courant
- **AND** la page de profil personnel du membre n'est pas ouverte par cette action

#### Scenario: Acces direct protege

- **WHEN** un utilisateur non authentifie ouvre directement la route du compte
- **THEN** la garde existante redirige vers le parcours de connexion sans exposer de donnees de compte

#### Scenario: Role Membre

- **WHEN** un Membre active le bloc d'identite en bas de la sidebar ou ouvre son espace personnel
- **THEN** le frontend conserve la destination « Mon profil » et ses onglets existants

### Requirement: Carte Mon acces en lecture seule

La page « Mon acces » SHALL reprendre l'agencement cible avec une identite horizontale, un indicateur de statut du compte et une grille d'informations comprenant l'association, le role applicatif, le theme et la devise. Les informations d'identite SHALL provenir de `SessionService.user` et les champs SHALL etre non editables.

#### Scenario: Informations de session disponibles

- **WHEN** la page « Mon acces » est rendue avec une session hydratee
- **THEN** elle affiche le nom, les initiales, le statut actif ou inactif, le nom de l'association, le role applicatif, le theme courant et la devise de l'association
- **AND** la mise en page reprend les surfaces, espacements, bordures, typographies et couleurs du prototype sans ajouter de formulaire

#### Scenario: Donnees de session absentes

- **WHEN** la page « Mon acces » ne dispose pas d'un utilisateur de session
- **THEN** elle n'affiche aucune donnee fictive et rend un etat d'erreur ou de chargement accessible selon le comportement du shell

### Requirement: Devise GNF non modifiable

La page « Mon acces » SHALL afficher la devise de l'association comme une information en lecture seule. Dans le MVP guineen, la valeur affichee SHALL etre `GNF - Franc Guineen` lorsque la session indique `GNF`. Aucun selecteur, bouton d'edition, conversion ou appel de mise a jour ne SHALL etre propose.

#### Scenario: Session guineenne

- **WHEN** `CurrentUser.association.currency` vaut `GNF`
- **THEN** la carte affiche le libelle « Devise » et la valeur « GNF - Franc Guineen »
- **AND** cette valeur n'est pas rendue sous forme de champ editable ou de select

#### Scenario: Absence de mutation de devise

- **WHEN** l'utilisateur consulte ou recharge la page « Mon acces »
- **THEN** aucune requete de lecture ou d'ecriture dediee au compte ou a la devise n'est declenchee par cette page

### Requirement: Actions de compte preservees

La page « Mon acces » SHALL conserver une action accessible de changement de theme et une action accessible de deconnexion, en reutilisant les comportements existants du frontend.

#### Scenario: Changement de theme

- **WHEN** l'utilisateur active l'action de theme
- **THEN** le theme de l'application change avec le service existant sans quitter la page

#### Scenario: Deconnexion

- **WHEN** l'utilisateur active l'action de deconnexion
- **THEN** la session est effacee et le frontend navigue vers la page de connexion comme dans le parcours existant

### Requirement: Badges de statut harmonises

Le frontend SHALL utiliser un composant partage pour les badges de statut visibles dans les listes, cartes et fiches. Le composant SHALL conserver un rendu commun avec une typographie de controle, une hauteur, un espacement, un rayon et un indicateur visuel coherents, tout en exposant les tons succes, avertissement, erreur, information et neutre.

#### Scenario: Statuts de domaines differents

- **WHEN** un statut de compte, membre, cotisation, campagne ou autorisation est affiche
- **THEN** le frontend utilise le composant de badge partage avec le ton correspondant
- **AND** le libelle reste accessible et la couleur n'est pas l'unique information du statut

### Requirement: Controle de recherche et de filtre harmonise

Les controles de recherche et de filtre de l'ecran Utilisateurs et roles SHALL reprendre le controle cible sans cadran conteneur, avec un champ de recherche et un select de role de hauteur et de rayon coherents. Le mode pilule du select SHALL etre optionnel afin de conserver les autres usages compacts du composant partage.

#### Scenario: Filtre utilisateurs et roles

- **WHEN** un Administrateur consulte l'ecran Utilisateurs et roles
- **THEN** le champ de recherche et le select de role sont alignes sans bordure, fond ou ombre conteneur
- **AND** le select conserve son icone de filtre et son comportement clavier

