## 1. Préparer T-107 et ses prérequis

Ticket **T-107**, priorité P1, scope `front`, type `chore`, slug
`mocks-connexion-session`, change `comptes-demo-connexion-session`.
Branche résolue : `front/chore-107-mocks-connexion-session`.
Dépendances : T-105 (MSW) et T-5 (session/hydratation, avec la correction de la PR 13).
Une seule livraison, une branche et une PR vers `main`.

Critères d'acceptation : cinq comptes couvrant les quatre rôles et les deux états
Opérateur ; connexion via le formulaire ; `/me` cohérent après rechargement et
redémarrage ; refus 400/401 conformes ; activation uniquement en mode mock et
documentation de démarrage/changement de compte/remise à zéro.

- [x] 1.1 [T-107] Lire les instructions et artefacts du change, vérifier l'état Git, résoudre T-107, vérifier les PR et la présence de T-105 et de T-5 corrigé dans l'ascendance ; créer/réutiliser la branche retournée et exécuter `node scripts/tickets.mjs verify T-107` avant toute génération ou modification de code. Signaler un prérequis absent sans implémenter son ticket.
- [x] 1.2 [T-107] Relire `LoginRequest`, `LoginResponse`, `CurrentUser`, `ErrorResponse` et les opérations `login`/`getCurrentUser` dans le contrat ; vérifier le client généré et les frontières des fichiers mock avant de construire les fixtures.

## 2. Implémenter les comptes et handlers de démonstration

- [x] 2.1 [T-107] Ajouter le catalogue de cinq comptes fictifs typés depuis `@api`, selon le tableau du design, avec association commune, membres/UUID fictifs distincts, jetons uniques et mot de passe `demo-contribo` ; fournir la résolution pure par identifiants et jeton.
- [x] 2.2 [T-107] Ajouter le handler `POST /api/v1/auth/login` : validation de `LoginRequest`, succès `LoginResponse` pour chaque compte, 400 pour un corps invalide, 401 générique pour de mauvais identifiants ; ne pas exiger de jeton à cette opération publique.
- [x] 2.3 [T-107] Ajouter le handler `GET /api/v1/me` : résoudre le compte depuis son seul Bearer, restituer son profil/rôle/autorisation, refuser en 401 les jetons absents, mal formés ou inconnus ; conserver la résolution après rechargement/redémarrage sans état mutable de connexion dans le worker.
- [x] 2.4 [T-107] Agréger les handlers auth dans l'entrée MSW existante et conserver leur isolation du démarrage/build normaux, sans modifier le formulaire, le client généré ni la session applicative pour injecter un compte de démonstration.

## 3. Vérifier et documenter le parcours de test

- [x] 3.1 [T-107] Tester les helpers purs de sélection/validation et les scénarios applicatifs pertinents : cinq profils/jetons, mauvais identifiants, corps invalides et restauration de session ; conserver `HttpTestingController` pour les tests client/formulaire/session, sans démarrer MSW dans Vitest.
- [x] 3.2 [T-107] Exécuter depuis `contribo-front/` les tests pertinents (`npm test -- --watch=false`), `npm run lint`, `npm run format:check`, `npm run test:tooling`, les compilations TypeScript normale/mock et les builds normal/mock ; tester dans le navigateur chaque connexion, rechargement, redémarrage du serveur, déconnexion/changement de compte, mauvais mot de passe et jeton inconnu avec `npm run start:mock`, puis vérifier le démarrage normal. Rapporter les résultats et limites réellement observés.
- [x] 3.3 [T-107] Documenter dans le README frontend et/ou le guide API la commande `start:mock`, l'URL `/login`, les cinq identifiants/mot de passe, leurs rôles/permissions, la déconnexion via le bouton existant et le changement de compte ; expliquer aussi la suppression de la seule clé `contribo-session-token` suivie d'un rechargement et préciser les écrans disponibles et les limites des mocks métier.

## 4. Préparer et livrer la PR de T-107

- [x] 4.1 [T-107] Relire le diff du seul ticket, vérifier `node scripts/tickets.mjs check --base-ref origin/main` et `openspec validate comptes-demo-connexion-session --strict`, mettre à jour seulement les tâches réalisées et préparer une description de PR selon `.github/pull_request_template.md` avec validations et limites.
- [x] 4.2 [T-107] Lorsque la livraison est demandée, ajouter explicitement les fichiers de T-107, committer avec un titre `chore(front): T-107 ...`, pousser uniquement `front/chore-107-mocks-connexion-session` et ouvrir une PR vers `main` ; ne pas fusionner ni activer l'auto-merge.
- [ ] 4.3 [T-107] Après revue, traiter les constats et vérifier les contrôles GitHub ; laisser la fusion au mainteneur ou à une demande explicite distincte, puis constater son résultat avant de cocher cette étape et d'archiver le change.
