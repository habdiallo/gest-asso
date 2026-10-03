## MODIFIED Requirements

### Requirement: Affichage fiable de l'identifiant dans le détail utilisateur

Le frontend SHALL afficher l'identifiant de connexion dans le dialogue de détail uniquement après une lecture réussie du compte. En cas d'échec de `getUser`, il SHALL conserver le dialogue ouvert, afficher une erreur traduite et ne SHALL afficher aucune valeur d'identifiant inconnue ou périmée.

Le frontend SHALL préserver les brouillons de rôle et d'autorisation opérateur déjà saisis pendant le chargement ou après l'échec de la lecture. Il SHALL proposer une nouvelle tentative sans modifier les listes ni exposer de donnée sensible.

#### Scenario: Lecture du détail réussie

- **WHEN** un Administrateur ouvre le détail d'un compte et que `getUser` réussit
- **THEN** le dialogue affiche l'identifiant de connexion retourné par l'API
- **AND** les brouillons de rôle et d'autorisation restent ceux choisis dans le dialogue

#### Scenario: Lecture du détail en erreur

- **WHEN** `getUser` échoue après l'ouverture du dialogue
- **THEN** le dialogue reste ouvert
- **AND** un message traduit indique que le détail n'a pas pu être chargé
- **AND** aucun identifiant n'est affiché comme s'il était valide
- **AND** le rôle et l'autorisation déjà saisis restent inchangés

#### Scenario: Nouvelle tentative

- **WHEN** l'Administrateur active l'action de nouvelle tentative et que `getUser` réussit
- **THEN** l'erreur est retirée
- **AND** l'identifiant est affiché
- **AND** les brouillons de rôle et d'autorisation restent inchangés
