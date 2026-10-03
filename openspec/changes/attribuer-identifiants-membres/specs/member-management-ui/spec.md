## ADDED Requirements

### Requirement: Affichage de l'identifiant dans le détail utilisateur

Le frontend SHALL afficher l'identifiant de connexion dans le dialogue de détail du compte utilisateur. Il SHALL NOT afficher cet identifiant dans la liste des membres, la liste des utilisateurs ou la fiche membre.

#### Scenario: Détail utilisateur accessible

- **WHEN** un Administrateur ouvre le détail d'un compte depuis la page Utilisateurs et rôles
- **THEN** le dialogue affiche l'identifiant de connexion
- **AND** l'identifiant n'est pas ajouté aux colonnes ou cartes de liste

#### Scenario: Compte sans exposition du mot de passe

- **WHEN** le détail utilisateur est affiché
- **THEN** aucun mot de passe temporaire ni hash n'est affiché
