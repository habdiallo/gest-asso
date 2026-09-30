## MODIFIED Requirements

### Requirement: Connexion à l'application
Le frontend SHALL proposer un écran de connexion unique (identifiant + mot de passe) sans aucun lien ni formulaire d'inscription libre, conformément à RG-003 et à l'Annexe A (pas de provisioning automatique des identifiants). Après une authentification valide, il SHALL diriger les comptes qui exigent un changement de mot de passe vers le parcours obligatoire de changement au lieu du tableau de bord.

#### Scenario: Connexion réussie sans changement requis
- **WHEN** un utilisateur saisit un identifiant et un mot de passe valides et que son compte ne requiert pas de changement
- **THEN** le frontend appelle `POST /auth/login`, conserve l'état de session retourné et redirige vers le tableau de bord correspondant au rôle de l'utilisateur

#### Scenario: Connexion réussie avec changement requis
- **WHEN** un utilisateur saisit un identifiant et un mot de passe valides et que l'API indique `mustChangePassword`
- **THEN** le frontend conserve uniquement l'état de session nécessaire au parcours limité et redirige vers l'écran obligatoire de changement de mot de passe

#### Scenario: Changement de mot de passe obligatoire
- **WHEN** un utilisateur en session limitée ouvre ou recharge l'application
- **THEN** le frontend l'empêche d'accéder aux routes métier et affiche le formulaire avec deux saisies de nouveau mot de passe

#### Scenario: Changement réussi
- **WHEN** les deux saisies sont identiques et que l'API confirme le changement
- **THEN** le frontend remplace la session limitée par la session normale et redirige vers le tableau de bord autorisé

#### Scenario: Confirmation différente
- **WHEN** les deux saisies de nouveau mot de passe sont différentes
- **THEN** le frontend bloque l'envoi et affiche une erreur sur la confirmation sans appeler l'API

#### Scenario: Connexion refusée
- **WHEN** l'API retourne une erreur d'authentification pour les identifiants saisis
- **THEN** le frontend affiche un message d'erreur explicite sur le formulaire sans révéler si c'est l'identifiant ou le mot de passe qui est invalide, et ne redirige pas l'utilisateur

#### Scenario: Absence d'inscription libre
- **WHEN** un visiteur non authentifié consulte l'écran de connexion
- **THEN** aucun lien ni bouton "créer un compte" ou "s'inscrire" n'est proposé

### Requirement: Session et déconnexion
Le frontend SHALL maintenir l'état de session de l'utilisateur connecté et permettre une déconnexion explicite à tout moment, y compris depuis la session limitée de changement de mot de passe.

#### Scenario: Expiration de session
- **WHEN** une requête API retourne une erreur d'authentification (session expirée ou jeton invalide)
- **THEN** le frontend invalide la session locale et redirige l'utilisateur vers l'écran de connexion

#### Scenario: Déconnexion manuelle
- **WHEN** l'utilisateur connecté déclenche l'action de déconnexion
- **THEN** le frontend supprime la session locale et affiche l'écran de connexion

#### Scenario: Déconnexion pendant le changement
- **WHEN** l'utilisateur en session limitée déclenche la déconnexion
- **THEN** le frontend invalide l'état local, appelle la déconnexion et affiche l'écran de connexion

## ADDED Requirements

### Requirement: Session limitée de changement de mot de passe
Le frontend SHALL traiter le code `PASSWORD_CHANGE_REQUIRED` comme un état d'activation et non comme une session expirée.

#### Scenario: API métier refusée pendant l'activation
- **WHEN** une requête métier retourne `PASSWORD_CHANGE_REQUIRED`
- **THEN** le frontend conserve la session limitée et navigue vers le changement obligatoire sans boucle vers la page de connexion
