## ADDED Requirements

### Requirement: Liste des membres
Le frontend SHALL afficher, pour les rôles Administrateur, Trésorier et Opérateur, une liste des membres avec Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction et Statut (US-MEM-002).

#### Scenario: Affichage de la liste
- **WHEN** un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'écran des membres
- **THEN** le frontend liste les membres avec leurs informations et distingue visuellement les membres actifs des membres inactifs (RG-MEM-007)

#### Scenario: Vue restreinte pour l'Opérateur
- **WHEN** un utilisateur Opérateur consulte la liste des membres
- **THEN** le frontend n'affiche que les informations nécessaires à ses opérations, sans détail financier complet (RG-MEM-008)

### Requirement: Recherche et filtres sur la liste des membres
Le frontend SHALL permettre de rechercher et filtrer la liste des membres (par nom, statut, catégorie de revenu).

#### Scenario: Recherche par nom
- **WHEN** un utilisateur saisit un terme de recherche dans la liste des membres
- **THEN** le frontend filtre la liste affichée aux membres dont un champ nominatif correspond au terme saisi

#### Scenario: Filtre par statut
- **WHEN** un utilisateur sélectionne le filtre "Actif" ou "Inactif"
- **THEN** le frontend n'affiche que les membres correspondant au statut sélectionné

### Requirement: Fiche d'un membre
Le frontend SHALL afficher une fiche détaillée par membre : informations personnelles, catégorie de revenu, fonction, statut, situation des cotisations, historique des règlements, contributions aux cagnottes (US-MEM-003).

#### Scenario: Consultation de la fiche
- **WHEN** un utilisateur autorisé ouvre la fiche d'un membre
- **THEN** le frontend affiche ses informations personnelles, sa catégorie, sa fonction, son statut, sa situation de cotisations, son historique de règlements et ses contributions aux cagnottes

#### Scenario: Consultation par un Opérateur non autorisé aux paiements
- **WHEN** un utilisateur Opérateur dont `peut_enregistrer_paiements` vaut "non" ouvre la fiche d'un membre
- **THEN** le frontend affiche la fiche en lecture seule, sans action d'enregistrement de règlement ni de contribution

### Requirement: Création d'un membre
Le frontend SHALL permettre à l'Administrateur et au Trésorier de créer un membre via un formulaire (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction, Statut), et SHALL masquer cette action pour l'Opérateur et le Membre (US-MEM-001, RG-MEM-001).

#### Scenario: Création réussie
- **WHEN** un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec les champs obligatoires renseignés, dont une catégorie de revenu (RG-MEM-002)
- **THEN** le frontend appelle l'API de création du membre, affiche le nouveau membre avec le statut Actif par défaut (RG-MEM-003) et confirme qu'un compte utilisateur associé a été créé (RG-MEM-004)

#### Scenario: Catégorie de revenu manquante
- **WHEN** un utilisateur soumet le formulaire de création sans avoir sélectionné de catégorie de revenu
- **THEN** le frontend bloque la soumission et affiche une erreur de validation sur le champ catégorie

#### Scenario: Action masquée pour un rôle non autorisé
- **WHEN** un utilisateur Opérateur ou Membre consulte la liste des membres
- **THEN** le frontend n'affiche aucune action de création de membre

### Requirement: Modification des informations d'un membre
Le frontend SHALL permettre la modification des champs d'un membre selon le rôle : tous les champs non structurants et structurants pour Administrateur/Trésorier, uniquement les champs non structurants (téléphone, ville, pays, nom d'usage) pour l'Opérateur, quel que soit son attribut `peut_enregistrer_paiements` (US-MEM-004, RG-MEM-017).

#### Scenario: Modification complète par Administrateur/Trésorier
- **WHEN** un utilisateur Administrateur ou Trésorier ouvre le formulaire de modification d'un membre
- **THEN** le frontend affiche tous les champs modifiables, y compris catégorie de revenu et fonction

#### Scenario: Modification restreinte par un Opérateur
- **WHEN** un utilisateur Opérateur ouvre le formulaire de modification d'un membre
- **THEN** le frontend affiche uniquement les champs téléphone, ville, pays et nom d'usage en édition ; catégorie de revenu, fonction, rôle applicatif et statut sont affichés en lecture seule ou masqués

#### Scenario: Statut non modifiable via ce formulaire
- **WHEN** un utilisateur ouvre le formulaire général de modification d'un membre, quel que soit son rôle
- **THEN** le frontend n'expose aucun contrôle permettant de changer le statut Actif/Inactif dans ce formulaire (RG-MEM-018)

### Requirement: Désactivation d'un membre
Le frontend SHALL permettre uniquement à l'Administrateur de désactiver un membre actif, via une action dédiée distincte du formulaire de modification (US-MEM-005).

#### Scenario: Désactivation par l'Administrateur
- **WHEN** un utilisateur Administrateur déclenche l'action "Désactiver" sur un membre actif et confirme
- **THEN** le frontend appelle l'API de désactivation, met à jour le statut affiché à Inactif, et conserve visibles les cotisations, règlements et contributions historiques du membre (RG-MEM-012 à RG-MEM-015)

#### Scenario: Action absente pour les autres rôles
- **WHEN** un utilisateur Trésorier, Opérateur ou Membre consulte la fiche d'un membre
- **THEN** le frontend n'affiche aucune action de désactivation

#### Scenario: Confirmation requise
- **WHEN** l'Administrateur déclenche l'action "Désactiver" sur un membre
- **THEN** le frontend affiche une confirmation explicite avant d'envoyer la requête, rappelant que le membre ne sera pas inclus dans les futures campagnes (RG-MEM-016)

### Requirement: Réactivation d'un membre
Le frontend SHALL permettre uniquement à l'Administrateur de réactiver un membre inactif, symétriquement à la désactivation (US-MEM-006).

#### Scenario: Réactivation par l'Administrateur
- **WHEN** un utilisateur Administrateur déclenche l'action "Réactiver" sur un membre inactif et confirme
- **THEN** le frontend appelle l'API de réactivation et met à jour le statut affiché à Actif, sans modifier les données historiques (RG-MEM-020, RG-MEM-021)

#### Scenario: Action indisponible sur un membre déjà actif
- **WHEN** un utilisateur consulte la fiche d'un membre déjà actif
- **THEN** le frontend n'affiche pas d'action "Réactiver" (RG-MEM-022), seulement "Désactiver"

#### Scenario: Action indisponible sur un membre inactif pour les autres rôles
- **WHEN** un utilisateur Trésorier, Opérateur ou Membre consulte la fiche d'un membre inactif
- **THEN** le frontend n'affiche aucune action de réactivation
