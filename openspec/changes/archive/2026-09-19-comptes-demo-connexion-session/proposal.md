## Why

Le mode `start:mock` fournit un tableau de bord de démonstration mais ne simule ni
la connexion ni l'hydratation du compte : aucun identifiant ne permet aujourd'hui
de tester une session dans le navigateur sans backend. Il faut des comptes
fictifs couvrant les quatre rôles pour tester les parcours frontend déjà livrés.

## What Changes

- Fournir cinq comptes de démonstration documentés : Administrateur, Trésorier,
  Membre et deux Opérateurs, avec et sans autorisation d'enregistrer des paiements.
- Simuler `POST /api/v1/auth/login` et `GET /api/v1/me` en mode MSW, avec des réponses
  typées depuis `@api`, des jetons de démonstration et des erreurs conformes au contrat.
- Retrouver le même compte depuis son jeton après un rechargement du navigateur.
- Documenter la commande de démarrage, l'URL de connexion, les identifiants et la
  remise à zéro de la session de démonstration.
- Réutiliser le formulaire de connexion, le client généré et `SessionService` de
  T-5, sans ajouter de mécanisme d'authentification parallèle dans l'application.

## Capabilities

### New Capabilities

- `demo-auth-session`: comptes fictifs, connexion et restauration de session en
  développement mocké, couvrant les quatre rôles et les deux états Opérateur.

### Modified Capabilities

Aucune. Le dispositif `mocks-api-msw` de T-105 est réutilisé sans changer ses
exigences ; aucune spec principale n'est encore présente dans `openspec/specs/`.

## Impact

- Ticket local **T-107**, scope `front`, type `chore`, branche
  `front/chore-107-mocks-connexion-session` ; une seule PR vers `main`.
- Dépendances : T-105 (socle MSW) et T-5 (session et hydratation, PR 13 fusionnée
  avec sa correction dans `63f78c7`). Ces prérequis sont présents dans la base
  `origin/main` récupérée (`42f530b`) ; revérifier leur présence avant l'implémentation.
- Fichiers concernés : handlers de développement de la feature `auth`, fixtures
  communes au mode mock sous `src/mocks/`, agrégateur MSW et documentation frontend.
- Aucun nouveau package requis, aucune modification de `besoins/openapi.yaml`,
  du client généré ou du backend ; pas de migration.
- Critères de succès : les cinq comptes se connectent via le formulaire existant,
  le profil et son rôle sont restaurés après rechargement, un mauvais mot de passe
  ou un jeton inconnu produit un refus conforme, et le démarrage/build normaux
  restent indépendants des handlers de démonstration.
- Les menus et écrans métier restent ceux des tickets correspondants : ce change
  ne fusionne pas les variantes de navigation ni ne crée les écrans encore absents.
