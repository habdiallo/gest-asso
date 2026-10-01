## ADDED Requirements

### Requirement: Liste des cagnottes
Le frontend SHALL afficher une liste des cagnottes sociales, visuellement distincte des campagnes de cotisation, avec recherche et filtres (type d'événement, statut), pour l'Administrateur, le Trésorier et l'Opérateur.

#### Scenario: Consultation de la liste
- **WHEN** un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'écran des cagnottes
- **THEN** le frontend affiche la liste des cagnottes avec titre, type d'événement, période et statut, dans un espace visuellement séparé des campagnes de cotisation (RG-CAG-001)

#### Scenario: Filtrage par type d'événement
- **WHEN** un utilisateur filtre les cagnottes par type d'événement (Mariage, Baptême, Décès, Naissance, Autre)
- **THEN** le frontend n'affiche que les cagnottes correspondant au type sélectionné

### Requirement: Création d'une cagnotte
Le frontend SHALL permettre à l'Administrateur et au Trésorier de créer une cagnotte (Titre, Type d'événement, Description, Personne ou famille concernée, Date de début, Date de fin, Objectif éventuel) (US-CAG-001, RG-CAG-002, RG-CAG-003).

#### Scenario: Création réussie
- **WHEN** un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec un titre, un type d'événement et une période valides
- **THEN** le frontend appelle l'API de création et affiche la nouvelle cagnotte dans la liste

#### Scenario: Objectif facultatif
- **WHEN** un utilisateur crée une cagnotte sans renseigner d'objectif de montant
- **THEN** le frontend accepte la création et affiche la cagnotte sans barre de progression liée à un objectif

#### Scenario: Action masquée pour Opérateur et Membre
- **WHEN** un utilisateur Opérateur ou Membre consulte la liste des cagnottes
- **THEN** le frontend n'affiche aucune action de création de cagnotte

### Requirement: Enregistrement d'une contribution
Le frontend SHALL permettre au Trésorier et à l'Opérateur autorisé d'enregistrer la contribution d'un membre à une cagnotte, avec Membre, Cagnotte, Montant, Date, Mode de règlement (Espèces / Mobile Money / Virement bancaire), sans restriction de nombre ni de montant minimal entre deux contributions du même membre (US-CAG-002, RG-CAG-004 à RG-CAG-007).

#### Scenario: Première contribution
- **WHEN** un utilisateur Trésorier ou Opérateur autorisé enregistre la première contribution d'un membre à une cagnotte
- **THEN** le frontend appelle l'API d'enregistrement et ajoute la contribution à la liste des contributions de la cagnotte

#### Scenario: Contribution supplémentaire du même membre
- **WHEN** un utilisateur enregistre une nouvelle contribution pour un membre ayant déjà contribué à la même cagnotte
- **THEN** le frontend accepte l'enregistrement sans limite de nombre ni de montant minimal (RG-CAG-005)

#### Scenario: Aucun impact sur les cotisations
- **WHEN** une contribution à une cagnotte est enregistrée pour un membre
- **THEN** le frontend n'applique aucune modification au montant dû ou payé des cotisations de ce membre (RG-CAG-006)

#### Scenario: Action indisponible pour un Opérateur non autorisé
- **WHEN** un utilisateur Opérateur dont `peut_enregistrer_paiements` vaut "non" consulte une cagnotte
- **THEN** le frontend n'affiche aucune action d'enregistrement de contribution

#### Scenario: Traçabilité affichée
- **WHEN** un utilisateur consulte la liste des contributions d'une cagnotte
- **THEN** le frontend affiche, pour chaque contribution, l'utilisateur qui l'a enregistrée et l'horodatage de la saisie (RG-CAG-007)

### Requirement: Suivi d'une cagnotte
Le frontend SHALL afficher, pour l'Administrateur, le Trésorier et l'Opérateur autorisé, la situation d'une cagnotte : total collecté, nombre de contributeurs, objectif, reste éventuel, liste des contributions (US-CAG-003).

#### Scenario: Consultation du suivi
- **WHEN** un utilisateur autorisé ouvre le détail d'une cagnotte
- **THEN** le frontend affiche le total collecté, le nombre de contributeurs distincts et la liste des contributions

#### Scenario: Cagnotte avec objectif
- **WHEN** une cagnotte possède un objectif de montant
- **THEN** le frontend affiche une progression du total collecté par rapport à l'objectif et le reste à collecter

### Requirement: Clôture d'une cagnotte
Le frontend SHALL permettre à l'Administrateur et au Trésorier de clôturer une cagnotte, après quoi elle n'accepte plus de nouvelle contribution mais reste consultable (US-CAG-004).

#### Scenario: Clôture réussie
- **WHEN** un utilisateur Administrateur ou Trésorier déclenche l'action de clôture d'une cagnotte et confirme
- **THEN** le frontend appelle l'API de clôture et affiche la cagnotte comme clôturée, en conservant l'accès à l'historique des contributions et au montant final

#### Scenario: Contribution bloquée après clôture
- **WHEN** un utilisateur consulte une cagnotte clôturée
- **THEN** le frontend n'affiche aucune action d'enregistrement de nouvelle contribution
