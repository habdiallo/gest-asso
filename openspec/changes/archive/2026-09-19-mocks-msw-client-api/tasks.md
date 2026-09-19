## 1. Ticket T-105 — Préparation (front, chore)

Ticket : T-105. Scope `front`, type `chore`. Branche pendant l'initialisation
(`initializationActive: true`) : `front/chore-000-mocks-msw-client-api`. Branche après la fin de
l'initialisation : `front/chore-105-mocks-msw-client-api`. Périmètre : poser le socle MSW pour mocker
le client API généré en développement, sans modifier le contrat ni le client généré. Critères
d'acceptation : `npm start` (sans mode mock) et `npm run build` restent inchangés et ne référencent
pas MSW ; un mode mock dédié démarre le service worker et sert des réponses conformes au contrat sur
au moins un endpoint de démonstration ; la documentation distingue explicitement mock dev et tests
`HttpTestingController`.

- [x] 1.1 [T-105] Vérifier `git status --short` et la branche courante, puis créer/réutiliser
      `front/chore-000-mocks-msw-client-api` à partir de `origin/main`.
- [x] 1.2 [T-105] Vérifier que le client API est généré (`npm run validate:api` puis
      `npm run generate:api` si `src/app/core/api/generated/` est absent).

## 2. Ticket T-105 — Dépendance et service worker

- [x] 2.1 [T-105] Ajouter `msw` en devDependency de `contribo-front/` (`npm install --save-dev msw`).
- [x] 2.2 [T-105] Initialiser le service worker (`npx msw init public --save`) et vérifier qu'il est
      servi par le serveur de dev Angular.

## 3. Ticket T-105 — Convention de handlers et point d'entrée mock

- [x] 3.1 [T-105] Définir la convention `features/<feature>/mocks/handlers.ts` (chemins/`operationId`
      du contrat, types issus de `@api`, sans DTO concurrent) et un point d'agrégation des handlers
      actifs.
- [x] 3.2 [T-105] Ajouter un point d'entrée de démarrage dédié au mode mock (`main.mock.ts` +
      configuration Angular `fileReplacements`, ou variable d'environnement lue dans `main.ts`) et le
      script npm associé (ex. `start:mock`), sans hook automatique sur `start`/`build`/`test`.
- [x] 3.3 [T-105] Ajouter un handler de démonstration sur une feature existante pour valider le
      dispositif de bout en bout (chargement, succès, erreur), respectant enums/nullable/droits du
      contrat.

## 4. Ticket T-105 — Documentation

- [x] 4.1 [T-105] Mettre à jour `contribo-front/src/app/core/api/README.md` (ou un document dédié)
      pour documenter l'activation du mode mock et rappeler que les tests Vitest utilisent
      `HttpTestingController`/`provideHttpClientTesting`, jamais MSW.

## 5. Ticket T-105 — Validations locales

- [x] 5.1 [T-105] Exécuter `npm run build` (mode normal, sans mock) et vérifier l'absence de
      référence au point d'entrée/handlers de mock dans le bundle.
- [x] 5.2 [T-105] Exécuter le mode mock localement et vérifier au moins un écran en chargement,
      succès et erreur simulés.
- [x] 5.3 [T-105] Exécuter `npm test -- --watch=false` et `npm run lint` sur les fichiers modifiés.

## 6. Ticket T-105 — Publication (PR vers main)

- [x] 6.1 [T-105] Committer les fichiers du ticket avec le message `chore(front): T-105 ...` (ou
      `#000 ...` si publié avant la fin de l'initialisation), sans embarquer d'autres changements.
- [x] 6.2 [T-105] Pousser uniquement `front/chore-000-mocks-msw-client-api` (ou son équivalent
      renommé après l'initialisation) et ouvrir une PR en brouillon vers `main` avec le modèle du
      dépôt, en référençant T-105 et ce change OpenSpec.
- [x] 6.3 [T-105] Ne pas fusionner ni activer l'auto-merge sans demande explicite de l'utilisateur.

## 7. Ticket T-105 — Corrections de revue (PR #6)

- [x] 7.1 [T-105] [P1] Isoler `src/main.mock.ts` et les dossiers `mocks/` de `tsconfig.app.json`
      (compilation normale indépendante du client généré) et ajouter `tsconfig.mock.json`
      utilisé par la configuration Angular `mock`. Vérifié en supprimant temporairement
      `src/app/core/api/generated/` : `tsc -p tsconfig.app.json` reste sans erreur.
- [x] 7.2 [T-105] [P2] Remplacer les identifiants de la fixture de démonstration
      (`features/home/mocks/handlers.ts`) par des UUID valides conformes au `format: uuid` du
      contrat.
- [x] 7.3 [T-105] Rejouer les validations (`npm run build`, `ng build --configuration mock`,
      `npm test -- --watch=false`, `npm run lint`, `npm run format:check`) après correction.
