## ADDED Requirements

### Requirement: Régénération d'un mot de passe temporaire
Le frontend SHALL permettre uniquement à l'Administrateur de régénérer le mot de passe temporaire d'un compte utilisateur et SHALL afficher le nouveau secret une seule fois dans une confirmation copiable.

#### Scenario: Régénération par un Administrateur
- **WHEN** un Administrateur demande la régénération d'un compte de son association
- **THEN** le frontend appelle l'API, affiche l'identifiant et le nouveau mot de passe temporaire, puis rappelle que l'ancien secret est invalide

#### Scenario: Régénération interdite aux autres rôles
- **WHEN** un Trésorier, Opérateur ou Membre consulte la gestion des utilisateurs
- **THEN** le frontend ne propose aucune action de régénération de mot de passe

#### Scenario: Copie et fermeture du secret régénéré
- **WHEN** l'Administrateur copie puis ferme la confirmation
- **THEN** le frontend affiche l'état de copie et ne conserve pas le mot de passe dans un stockage persistant
