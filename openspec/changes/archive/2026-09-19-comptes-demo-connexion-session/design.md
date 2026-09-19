## Context

T-105 fournit MSW, `main.mock.ts`, `start:mock`, un agrégateur de handlers et les
tsconfigs séparant le mode mock de l'application normale. Seul
`GET /api/v1/dashboard` possède actuellement un handler. Le formulaire `/login`
utilise `AuthentificationService.login()` ; T-5 ajoute le stockage du jeton dans
`contribo-session-token`, son envoi par intercepteur et l'hydratation via
`EspacePersonnelService.getCurrentUser()` au démarrage.

La proposition couvre T-107 sur `front/chore-107-mocks-connexion-session`.
La branche de planification part de `origin/main` (`42f530b`), qui contient T-5
corrigé (PR 13 fusionnée dans `63f78c7`, conservation du jeton sur erreur transitoire),
T-6 (interception des erreurs de session), T-7 (bouton de déconnexion) et T-8.
L'apply devra revérifier la présence effective des prérequis, pas seulement les cases OpenSpec.

## Goals / Non-Goals

**Goals:**

- Tester une connexion et une restauration de session sans backend pour chaque rôle.
- Couvrir les deux valeurs de `operatorCanRecordPayments` pour Opérateur.
- Faire correspondre le compte retourné par `/me` au jeton obtenu lors de la connexion.
- Fournir un mode d'emploi utilisable sans modifier les composants ni le stockage à la main
  pour réussir une connexion.

**Non-Goals:**

- Construire un backend, un JWT réel, une inscription ou un sélecteur de rôle applicatif.
- Créer les écrans métier, fusionner les variantes de navigation T-9 à T-12 ou modifier
  la déconnexion T-7 et la gestion générale de l'expiration T-6 déjà disponibles.
- Fournir des données financières complètes pour tous les rôles ou changer le mock
  de tableau de bord de T-105, actuellement indépendant de la connexion.
- Ajouter une bibliothèque, modifier le contrat ou éditer le client généré.

## Decisions

### 1. Un catalogue de comptes fictifs partagé par les deux handlers

Créer des fixtures exclusivement de développement sous `src/mocks/`, par exemple
`demo-accounts.ts`. Elles contiennent des `CurrentUser` typés depuis `@api`, une
association commune, des identifiants UUID fictifs et un membre distinct par compte.
Les rôles utilisent les enums générés ; la fonction associative ne détermine aucun droit.

Le mot de passe commun prévu est `demo-contribo`. Les comptes sont :

| Identifiant | Rôle | `operatorCanRecordPayments` |
| --- | --- | --- |
| `admin.demo` | `ADMINISTRATOR` | `false` |
| `tresorier.demo` | `TREASURER` | `false` |
| `operateur.demo` | `OPERATOR` | `true` |
| `operateur.consultation.demo` | `OPERATOR` | `false` |
| `membre.demo` | `MEMBER` | `false` |

Une petite structure interne de fixture peut associer identifiant, mot de passe,
jeton et DTO utilisateur ; elle ne remplace aucun modèle de requête ou de réponse
API. Préférer ce catalogue à des objets utilisateur dupliqués entre `/login` et `/me`.

### 2. Handlers de connexion et de compte courant dans les mocks de la feature auth

Ajouter `features/auth/mocks/handlers.ts`, agrégé dans `src/mocks/handlers.ts`.
L'endpoint `/me` représente ici le compte associé à la session ; les endpoints
de cotisations/contributions personnelles restent à leurs tickets métier.
Les fixtures transverses dans `src/mocks/` évitent les imports directs entre features
si de futurs handlers doivent retrouver le même acteur.

`POST /api/v1/auth/login` valide le corps JSON selon `LoginRequest`. Il retourne
un `LoginResponse` en 200 pour un compte connu et son mot de passe, avec
`tokenType: Bearer`, `expiresIn` entier positif, `accessToken` et `user`.
Un corps mal formé produit 400 (`VALIDATION_ERROR`) ; des identifiants non reconnus
produisent 401 (`AUTHENTICATION_REQUIRED`), sans révéler le champ erroné.
Comme `login` n'impose pas d'authentification dans le contrat, un ancien en-tête
Authorization ne doit pas empêcher une connexion avec de nouveaux identifiants valides.

`GET /api/v1/me` lit uniquement l'en-tête Bearer et retrouve le DTO du compte
correspondant. Un jeton absent, mal formé ou inconnu retourne 401 avec un
`ErrorResponse` conforme ; aucune réponse ne retourne les mots de passe du catalogue.

### 3. Jetons de démonstration déterministes, restauration indépendante du worker

Associer un jeton opaque distinct à chaque compte. La résolution repose sur le
catalogue de fixtures, pas sur une session mutable en mémoire du service worker.
Ainsi, un rechargement ou un redémarrage du serveur conserve la correspondance
jeton/profil tant que le catalogue ne change pas. Un jeton inconnu permet de tester
un refus d'authentification ; la simulation temporelle complète de l'expiration
reste hors de ce ticket.

Conserver le stockage et les appels de `SessionService` de T-5. Aucun jeton par
défaut, utilisateur injecté dans un composant ou client API alternatif n'est nécessaire.
La documentation privilégie le bouton « Se déconnecter » existant, puis une
connexion avec un autre compte. Le retour direct à `/login` reste également possible.
Elle explique en complément la suppression de la seule clé `contribo-session-token`
suivie d'un rechargement pour remettre la démonstration à zéro.

### 4. Activation et vérification au niveau approprié

Les fixtures et handlers sont atteints uniquement par l'entrée `main.mock.ts`.
Conserver les exclusions `src/mocks/**` et `src/**/mocks/**` de `tsconfig.app.json`.
Le build normal n'inclut pas ces comptes/handlers ; le fichier MSW déjà copié dans
les assets par T-105 reste inerte sans enregistrement.

Les tests Vitest du formulaire/client/session continuent à utiliser
`HttpTestingController`, jamais un worker MSW. Les helpers purs de sélection de
compte/jeton et validation de requête peuvent être testés sans démarrer MSW.
Le fonctionnement réseau réel des handlers est vérifié dans le navigateur via
`npm run start:mock` : cinq connexions, rechargement, déconnexion/changement de compte,
mauvais mot de passe et jeton inconnu. Aucun outil E2E nouveau n'est imposé.

## Risks / Trade-offs

- [Des fixtures divergent de l'API] → Employer les DTO/enums générés et vérifier
  la compilation normale et mock, les erreurs 400/401 et les champs obligatoires.
- [Un jeton restaure le mauvais rôle après rechargement] → Un catalogue commun,
  des jetons uniques et une vérification de `/me` pour chacun des cinq comptes.
- [Des comptes de développement atteignent le bundle normal] → Vérifier les
  imports, les exclusions TypeScript et les sorties de build ; conserver
  l'activation explicite du mode mock.
- [Le testeur attend des écrans complets] → Documenter les écrans réellement
  disponibles et préciser que les handlers métier se livrent avec leurs tickets.
- [Une branche de travail perd les prérequis session/MSW] → Revérifier leur présence
  avant apply et signaler leur absence ; ne pas implémenter d'autres tickets dans T-107.

## Migration Plan

1. Vérifier T-105 et T-5 dans la branche, avec la correction de la PR 13, puis
   résoudre et vérifier T-107 avant le code.
2. Livrer fixtures, handlers et documentation dans une seule PR T-107 vers `main`,
   après validations normales/mock et tests manuels effectivement exécutés.
3. Revenir au mode normal avec `npm start`. Un retour arrière de la PR retire les
   nouveaux handlers et fixtures sans toucher au contrat ni aux données serveur.

## Open Questions

Aucune décision fonctionnelle en attente. Les prérequis sont présents dans la base
de planification et seront revérifiés lors de l'apply.
