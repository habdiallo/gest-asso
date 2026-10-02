## ADDED Requirements

### Requirement: Les libellés du profil membre sont traduits en français

Le frontend SHALL résoudre les clés `memberSpace.profile.role` et `memberSpace.profile.personalAccessTitle` en libellés français visibles dans l'espace personnel membre.

#### Scenario: Affichage du rôle et de l'accès personnel

- **WHEN** un membre ouvre son profil dans l'espace personnel
- **THEN** l'interface affiche un libellé français pour le rôle
- **THEN** l'interface affiche un titre français pour le panneau d'accès personnel
- **THEN** aucune clé Transloco brute n'est affichée à la place de ces libellés
