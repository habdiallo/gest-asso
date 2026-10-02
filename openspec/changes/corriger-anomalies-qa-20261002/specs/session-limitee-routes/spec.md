## ADDED Requirements

### Requirement: Une session limitée ne peut atteindre une route métier

Le frontend SHALL rediriger vers `/changer-mot-de-passe` lorsqu'une session authentifiée porte `mustChangePassword=true` et qu'elle tente d'accéder à une route métier, notamment `/mon-espace`.

#### Scenario: Accès direct à l'espace personnel avec session limitée

- **WHEN** un utilisateur authentifié avec changement obligatoire du mot de passe ouvre `/mon-espace`
- **THEN** la page de profil membre ne se charge pas
- **THEN** le frontend redirige vers `/changer-mot-de-passe`

#### Scenario: Accès normal après changement du mot de passe

- **WHEN** la session authentifiée porte `mustChangePassword=false`
- **THEN** l'utilisateur peut ouvrir `/mon-espace`
