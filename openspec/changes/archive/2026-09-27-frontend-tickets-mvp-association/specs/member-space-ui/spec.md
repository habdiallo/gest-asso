## ADDED Requirements

### Requirement: Consultation du profil personnel
Le frontend SHALL permettre à tout utilisateur connecté avec le rôle Membre de consulter ses propres informations personnelles (US-MBR-001, RG-DATA-001).

#### Scenario: Consultation du profil
- **WHEN** un utilisateur Membre ouvre son espace personnel
- **THEN** le frontend affiche ses informations personnelles (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction, Statut) en lecture seule

#### Scenario: Accès limité à ses propres données
- **WHEN** un utilisateur Membre est connecté
- **THEN** le frontend ne permet la consultation d'aucune donnée personnelle appartenant à un autre membre

### Requirement: Consultation de ses cotisations
Le frontend SHALL permettre à un utilisateur Membre de consulter la liste de ses cotisations, avec Campagne, Période, Montant dû, Montant payé, Reste, Statut (US-MBR-002).

#### Scenario: Consultation de la liste de cotisations
- **WHEN** un utilisateur Membre ouvre l'onglet "Mes cotisations" de son espace personnel
- **THEN** le frontend affiche, pour chaque campagne le concernant, le montant dû, le montant payé, le reste à payer et le statut

#### Scenario: Aucune action de paiement en ligne
- **WHEN** un utilisateur Membre consulte une cotisation avec un reste à payer
- **THEN** le frontend n'affiche aucune action de paiement déclenché par le membre lui-même (Annexe A)

### Requirement: Consultation de ses contributions aux cagnottes
Le frontend SHALL permettre à un utilisateur Membre de consulter l'historique de ses contributions aux cagnottes (US-MBR-003).

#### Scenario: Consultation de l'historique de contributions
- **WHEN** un utilisateur Membre ouvre l'onglet "Mes contributions" de son espace personnel
- **THEN** le frontend affiche la liste des cagnottes auxquelles il a contribué, avec le montant et la date de chaque contribution
