## MODIFIED Requirements

### Requirement: Connexion à l application
Le frontend SHALL proposer un écran de connexion unique (identifiant + mot de passe) sans aucun lien ni formulaire d inscription libre, conformément à RG-003 et à l Annexe A (pas de provisioning automatique des identifiants). Après une authentification valide, il SHALL diriger les comptes qui exigent un changement de mot de passe vers le parcours obligatoire de changement au lieu du tableau de bord.

#### Scenario: Connexion réussie sans changement requis
- **WHEN** un utilisateur saisit un identifiant et un mot de passe valides et que son compte ne requiert pas de changement
- **THEN** le frontend appelle `POST /auth/login`, conserve l état de session retourné et redirige vers le tableau de bord correspondant au rôle de l utilisateur

#### Scenario: Connexion réussie avec changement requis
- **WHEN** un utilisateur saisit un identifiant et un mot de passe valides et que l API indique `mustChangePassword`
- **THEN** le frontend conserve uniquement l état de session nécessaire au parcours limité et redirige vers l écran obligatoire de changement de mot de passe

#### Scenario: Connexion refusée
- **WHEN** l API retourne une erreur d authentification pour les identifiants saisis
- **THEN** le frontend affiche un message d erreur explicite sur le formulaire sans révéler si c est l identifiant ou le mot de passe qui est invalide, et ne redirige pas l utilisateur

#### Scenario: Absence d inscription libre
- **WHEN** un visiteur non authentifié consulte l écran de connexion
- **THEN** aucun lien ni bouton "créer un compte" ou "s inscrire" n est proposé
