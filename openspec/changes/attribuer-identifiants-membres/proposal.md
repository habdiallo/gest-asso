## Why

Le numéro de téléphone est actuellement réutilisé comme identifiant de connexion lors de la création d'un membre. Cette donnée est optionnelle, peut être partagée ou modifiée, et sa réutilisation comme identité technique crée des collisions et des incohérences d'authentification.

Le changement introduit un identifiant stable, lisible et indépendant du téléphone, tout en conservant les comptes existants et leur historique.

## What Changes

- Générer pour chaque nouveau compte membre un identifiant au format `<initiales-prénom><nom>-<code>`, par exemple `jpdiallo-4821`.
- Normaliser les accents, séparateurs et caractères non alphanumériques, prendre une initiale par partie du prénom et garantir l'unicité par association.
- Ne plus utiliser le téléphone pour créer l'identifiant de connexion, ni modifier l'identifiant lorsqu'un téléphone est changé.
- Exposer l'identifiant dans les détails du compte utilisateur, sans l'ajouter aux listes de membres ou d'utilisateurs.
- Conserver la révélation unique de l'identifiant et du mot de passe temporaire après création.
- Prévoir une migration contrôlée des comptes existants en modifiant uniquement leur identifiant, sans supprimer de compte, de mot de passe hashé ou d'historique.
- **BREAKING** : les nouveaux comptes membres ne se connecteront plus avec leur numéro de téléphone.

## Capabilities

### New Capabilities

- `member-login-identifiers`: génération, unicité, migration et exposition des identifiants de connexion des membres.

### Modified Capabilities

- `account-password-lifecycle`: les comptes membres reçoivent un identifiant stable indépendant du téléphone.
- `member-management-ui`: les détails du compte utilisateur affichent l'identifiant, sans l'afficher dans les listes ni dans la fiche membre.

## Impact

- Backend : génération des identifiants, création des comptes, migration de données contrôlée et contrat OpenAPI.
- Frontend : modèle API généré, détails du compte utilisateur, confirmation de création et traductions.
- Base PostgreSQL : mise à jour ciblée de `user_accounts.identifier`; aucune suppression de compte ni de donnée métier.
- Déploiement : aucune variable d'environnement ni secret supplémentaire.
- Livraison : une PR fullstack vers `develop`, puis une migration contrôlée des comptes existants avant communication des nouveaux identifiants.
