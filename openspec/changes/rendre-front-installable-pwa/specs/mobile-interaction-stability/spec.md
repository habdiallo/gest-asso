## ADDED Requirements

### Requirement: Focus mobile sans zoom automatique

Le frontend SHALL éviter qu'un autofocus ou un focus programmatique sur mobile provoque un zoom de viewport ou un déplacement inattendu du contenu. Lorsqu'un champ doit recevoir le focus automatiquement, les inputs, selects et textareas concernés SHALL avoir une taille de texte calculée d'au moins `16px`, sans désactiver le zoom volontaire de la page avec `maximum-scale=1`.

#### Scenario: Ouverture d'un formulaire sur mobile

- **WHEN** un dialogue ou formulaire s'ouvre sur une largeur mobile
- **THEN** l'ouverture ne zoome pas la viewport et ne déplace pas l'action principale hors de la zone visible

#### Scenario: Champ nécessitant un focus initial

- **WHEN** un parcours exige qu'un champ reçoive le focus à l'ouverture
- **THEN** le focus est visible, le clavier peut être utilisé normalement, la taille de texte calculée du champ est d'au moins `16px` et le navigateur n'effectue pas de zoom automatique

### Requirement: Fermeture extérieure du dialogue ou menu de déconnexion

Le frontend SHALL fermer le dialogue ou menu de déconnexion lorsqu'une interaction tactile ou pointeur est effectuée en dehors de sa surface, tout en conservant l'état ouvert pour une interaction effectuée à l'intérieur.

#### Scenario: Appui à l'extérieur sur mobile

- **WHEN** le dialogue ou menu de déconnexion est ouvert sur mobile et que l'utilisateur touche une zone extérieure
- **THEN** le composant se ferme, le backdrop ou panneau disparaît et le focus de la cible touchée n'est pas remplacé par le contrôle qui l'a ouvert

#### Scenario: Appui à l'intérieur

- **WHEN** l'utilisateur touche un bouton, un lien ou une zone interactive à l'intérieur du dialogue ou menu
- **THEN** l'interaction interne est traitée normalement et le composant ne se ferme pas avant que l'action ne le demande

#### Scenario: Fermeture au clavier

- **WHEN** le dialogue ou menu est ouvert et que l'utilisateur appuie sur Escape
- **THEN** le composant se ferme sans modifier la session et le focus revient sur son déclencheur
