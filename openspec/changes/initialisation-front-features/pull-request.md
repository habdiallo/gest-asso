## Problème et résultat

Le socle Angular ne disposait ni du lint, ni d'alias, ni de proxy/génération API.
Cette évolution complète l'initialisation en adaptant l'outillage de l'ancien
projet au frontend navigateur Contribo et au contrat partagé du dépôt.

Le frontend suit désormais `features/<feature>/`, `core/` et `shared/`, avec une
première page d'accueil française chargée paresseusement. L'architecture hexagonale
est réservée au backend. Aucun écran métier du backlog n'est implémenté ici.

## Traçabilité et périmètre

- Ticket : `000`, marqueur temporaire d'initialisation, sans fermeture d'issue.
- Change OpenSpec : `initialisation-front-features`.
- Scope / type : `front` / `chore`.
- Branche : `front/chore-000-initialisation-outillage-features` ; cible `main`.
- Fichiers : configurations et shell frontend, feature d'accueil, documentation,
  règles agents/OpenSpec, backlog avec ses specs et intégrations OpenSpec Copilot.
- La livraison inclut aussi les conventions Git/OpenSpec déjà committées : modèle
  de PR, contrôle CI et hooks interdisant les pushes directs vers `main`.
- Critères : lint/format/tests/build réussis, client OpenAPI compilable, routes lazy,
  imports du socle vers les features interdits, chemins API imbriqués couverts.

## Validation

Commandes exécutées depuis `contribo-front/` :

- `npm install --no-audit --no-fund` : dépendances et lockfile mis à jour.
- `npm ls --depth=0` : arbre de dépendances valide.
- `npm run validate:api` : aucun problème de contrat signalé.
- `npm run generate:api` : OpenAPI Generator 7.25.0, services et DTO Angular générés.
- `npx --no-install tsc --noEmit -p tsconfig.app.json` : frontend et généré compilables ;
  compilation également vérifiée après retrait temporaire du généré, puis restauration.
- `npm test -- --watch=false` : 3 tests Angular réussis, dont navigation lazy et fallback.
- `npm run test:tooling` : 5 tests réussis, dont frontières d'import, OnPush,
  accessibilité, exclusion du généré et matching réel du proxy normalisé par Angular.
- `npm run lint` : aucune erreur.
- `npm run format:check` : tous les fichiers concernés conformes à Prettier.
- `npm run build` : production réussie, bundle initial ~212 kB ; accueil dans des chunks lazy.

Depuis la racine : `openspec validate initialisation-front-features --strict` et
`git diff --check` réussis.

La première génération a nécessité un téléchargement du JAR hors sandbox ; le
build de production a également été exécuté hors sandbox après l'arrêt natif
de la première tentative. Aucun backend réel, test E2E ou audit AXE exécuté.
Le test proxy vérifie les motifs et l'absence de réécriture via le builder installé,
pas une communication avec un serveur backend.

## Impacts et livraison

- Conserver `.postcssrc.json` et les types Vitest/navigateur existants ; ne pas créer
  une deuxième configuration PostCSS, ajouter SSR/Express, Transloco ou PrimeIcons.
- La génération lit `besoins/openapi.yaml`, sans dépendre d'un chemin backend ancien.
- Génération explicite, sans hook npm prestart/prebuild/pretest. Le shell n'importe
  pas le client. Le généré est ignoré par Git/lint/format ; le générer avant
  compilation des futures features qui le consomment.
- Java 11+ nécessaire pour la génération ; le support OpenAPI 3.1 est encore indiqué
  bêta par l'outil. Les propriétés vérifiées comprennent `/api/v1` et
  `preferredName?: string | null` ; vérifier à nouveau les évolutions du contrat.
- La cible proxy `localhost:8080` est une convention à confirmer au ticket backend.
  Le reverse proxy de production doit router `/api/v1`.
- Livraison de l'initialisation complète demandée par le mainteneur : cette PR
  inclut le commit des conventions `6f2db0b` et l'initialisation frontend/OpenSpec.
  Elle cible `main` sans push direct ni fusion automatique.
- Exceptions locales d'ignore ajoutées pour versionner les specs OpenSpec et les
  instructions Copilot/configurations VS Code frontend, même si elles sont ignorées globalement.
- Configuration VS Code adaptée à Vitest, sans ancien port Karma `9876` ; MCP
  Angular exécuté depuis le CLI local sans téléchargement d'une version différente.
- Aucune migration ou modification de contrat ; retour arrière via PR de correction.

## Avant revue

- [x] Branche conforme `000` ; cible de livraison prévue `main`.
- [x] Périmètre relu et aucun travail métier étranger ajouté.
- [x] Critères locaux validés et résultats réels documentés.
- [x] Artefacts/tâches OpenSpec et règles frontend alignés.
- [x] Impacts et limites documentés ; aucun secret ou fichier temporaire à livrer.

Ce document sert de contenu de revue pour la livraison par PR. La fusion reste
une étape de revue humaine distincte, sans auto-merge.
