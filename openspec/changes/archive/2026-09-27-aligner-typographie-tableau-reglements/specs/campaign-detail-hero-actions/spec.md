## ADDED Requirements

### Requirement: Actions hero limitées aux parcours disponibles

Le hero du détail d'une campagne SHALL afficher uniquement des actions qui produisent un effet observable et correspondent à un parcours fonctionnel disponible.

#### Scenario: Campagne ouverte affichée dans le détail

- **WHEN** un utilisateur autorisé consulte une campagne `OPEN`
- **THEN** le hero n'affiche pas le bouton « Voir la situation des membres »
- **AND** l'onglet « Situation des membres » reste accessible dans la navigation du détail
- **AND** l'action de clôture conserve son comportement et ses règles d'autorisation

#### Scenario: Consultation de la situation des membres

- **WHEN** le détail de campagne est ouvert sans onglet initial explicite
- **THEN** la situation des membres reste l'onglet affiché par défaut
- **AND** la suppression du bouton hero ne retire ni le tableau ni les actions disponibles sur les cotisations

#### Scenario: Enregistrement d'un règlement

- **WHEN** un Administrateur, un Trésorier ou un Opérateur autorisé consulte une cotisation non soldée d'une campagne `OPEN`
- **THEN** l'action d'enregistrement reste proposée au niveau de la ligne de cotisation selon les règles existantes
- **AND** aucun bouton hero global d'enregistrement n'est ajouté sans parcours de sélection du membre et de la cotisation

#### Scenario: Campagne non ouverte ou cotisation soldée

- **WHEN** une campagne n'est pas `OPEN` ou qu'une cotisation est déjà soldée
- **THEN** aucune action de règlement supplémentaire n'est rendue disponible par cette correction
- **AND** les règles d'autorisation et de statut existantes restent inchangées
