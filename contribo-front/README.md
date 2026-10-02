# Contribo — frontend

Application navigateur Angular 21, TypeScript strict, Tailwind CSS 4/PostCSS,
ESLint Angular/TypeScript, Prettier et Vitest/jsdom. Le MVP est en français.

## Démarrer et vérifier

Depuis `contribo-front/`, avec une version Node compatible Angular 21 (Node 24
utilisé pour les validations) et npm :

```bash
npm ci
npm start
npm run lint
npm run format:check
npm test -- --watch=false
npm run test:tooling
npm run build
```

Le serveur écoute sur `http://localhost:4200`. Le build de production est dans
`dist/contribo-front/browser/`. `npm run format` applique Prettier uniquement au
frontend ; les caches, sorties, lockfile et client généré sont exclus.
`test:tooling` vérifie les interdictions d'import du socle, les règles OnPush/
accessibilité et l'exclusion du code généré à travers ESLint, sans backend.
Il vérifie également le routage des sous-chemins API après normalisation du proxy
par le builder Angular installé.
Aucun serveur SSR, outil E2E ni système de traduction multilingue n'est configuré.

Le démarrage manuel nécessite le backend et la base de développement actifs.
Depuis `contribo-front/`, lancer `npm start`, puis ouvrir
`http://localhost:4200/login`. Les requêtes `/api/**` sont transmises au backend
réel par `proxy.conf.json`.

## Architecture par fonctionnalités

```text
src/app/
  app.*                         shell et configuration applicative
  features/
    home/                       première fonctionnalité, chargée paresseusement
      home.routes.ts
      pages/home-page.*
    <feature>/                  à créer avec son périmètre métier
      <feature>.routes.ts
      pages/                    pages de cette fonctionnalité
      components/               composants internes, si nécessaires
      services/                 API/orchestration/état de la feature, si nécessaires
      models/                   modèles IHM distincts, si nécessaires
  core/                         responsabilités applicatives globales
    api/index.ts                frontière stable vers le client OpenAPI
    api/generated/              client OpenAPI, généré et ignoré par Git
  shared/                       UI/pipes/utilitaires neutres effectivement réutilisés
```

Les tests sont colocalisés. Ne pas créer tous les sous-dossiers ni un store/service
pour une fonctionnalité qui n'existe pas encore. Utiliser les DTO générés ; un
modèle/mapping local se justifie seulement par un besoin IHM distinct.

La stratégie d'état frontend est documentée dans
[`docs/state-management.md`](docs/state-management.md). Par défaut, l'état reste
local ou colocalisé dans sa feature ; `core/` ne reçoit que l'état réellement
transversal et dispose d'une stratégie d'invalidation explicite.

Les features peuvent utiliser `core`, `shared` et la frontière `core/api`. Elles ne
s'importent pas directement entre elles. `core` et `shared` ne dépendent jamais
des features ; ces imports sont interdits par ESLint. Aucun consommateur ne doit
importer `core/api/generated` ou utiliser un alias dédié au généré. Les routes applicatives
chargent chaque fonctionnalité par `loadChildren`/`loadComponent`.

Alias : `@core/*`, `@shared/*` et `@features/*`. Les imports internes à une
feature restent relatifs ; `@features/*` sert à composer les routes applicatives.
Le frontend ne possède pas de couches hexagonales, ports ou adapters obligatoires.
**L'architecture hexagonale est réservée au backend.**

Pour créer une page :

```bash
npx --no-install ng generate component features/members/pages/member-list
```

Cette commande est un exemple pour une future évolution : les pages métier ne sont pas
créées à l'initialisation. Les composants générés utilisent OnPush et CSS.

## API Design First et proxy

Le contrat HTTP partagé est [contribo-api.yml](../contribo-back/src/main/resources/contribo-api.yml), OpenAPI
3.1, avec une base relative `/api/v1`. Le besoin fonctionnel et les règles de
gestion restent dans le [cahier métier](../besoins/cahier-user-stories-mvp-association-v2.md).
La distinction et l'ordre de décision sont décrits dans
[`besoins/README.md`](../besoins/README.md). Le backend réel expose cette API
sur le port de développement configuré par le projet.

```bash
npm run check:api
npm run validate:api
npm run generate:api
npx --no-install tsc --noEmit -p tsconfig.app.json
```

`npm run check:api` vérifie Node.js 22+, Java 11+, le wrapper npm installé et les
versions exactes du wrapper et du générateur. `validate:api` et `generate:api`
réutilisent ce contrôle et invoquent uniquement le wrapper local, installé par
`npm ci`, sans dépendance à une commande globale.

Le générateur `typescript-angular` est fixé dans `openapitools.json`. Java reste
requis uniquement pour la validation et la génération ; la première génération
télécharge son JAR. La sortie
`src/app/core/api/generated/` est ignorée par Git, ESLint et Prettier ; le contrat,
la configuration et le lockfile sont versionnés. Ne pas modifier le généré à la
main. Générer avant build/tests des fonctionnalités qui importent `@core/api`.
La génération est explicite, sans `prestart`, `prebuild` ni `pretest` ; le shell
actuel peut être développé sans Java ou client généré. `npm start`, `npm test` et
`npm run build` ne déclenchent pas Java.

Avant de régénérer, valider le contrat et contrôler la version commune avec le
backend :

```bash
npm run validate:api
node ../scripts/check-openapi-generator-version.mjs
npm run generate:api
```

Après une modification du contrat, aligner les services et les tests concernés.
Le client généré reste une sortie reproductible de `contribo-back/src/main/resources/contribo-api.yml` et ne
devient jamais une source métier ou un contrat parallèle.

`provideHttpClient()` est installé. La session réelle repose sur le cookie
HttpOnly `__Host-contribo-session`, transmis avec `withCredentials: true` par
l'intercepteur d'authentification, sans faux jeton ni hôte dans les features.

`proxy.conf.json` redirige `/api/**` vers `http://localhost:8080` sans réécriture.
`8080` est une convention de développement à ajuster lorsque le backend existe.
Le motif couvre les sous-chemins `/api/v1/...` avec le
[serveur Angular/Vite](https://angular.dev/tools/cli/serve#proxying-to-a-backend-server).
Redémarrer `npm start` après modification du proxy. En production, configurer le
reverse proxy pour `/api/v1` ; le proxy de développement n'est pas livré.

## Configuration par environnement

```text
src/environments/
  environment.model.ts       interface Environment (contrat commun)
  environment.ts             development (valeur lue hors build Angular, ex. tests)
  environment.production.ts  configuration Angular "production"
```

Chaque fichier exporte une constante `environment` implémentant `Environment`
(`production: boolean`, `apiBaseUrl: string`), sans champ manquant ni supplémentaire.
`angular.json` déclare, pour les configurations `development` et `production`
de la cible `architect.build`, un `fileReplacements` substituant
`src/environments/environment.ts` par le fichier correspondant. `environment.ts`
reste la valeur lue en dehors d'un build Angular (ex. Vitest).

Ces fichiers sont committés et publics dans le bundle client : n'y placer aucun
secret ni valeur sensible. Après tout ajout de champ à `Environment`, vérifier que
les deux fichiers restent alignés et que `ng build --configuration <config>`
réussit pour chaque configuration touchée. `ng build` sans configuration explicite
utilise `production` (`defaultConfiguration` de la cible `architect.build`) ; `ng serve`
sans configuration explicite utilise `development` (`defaultConfiguration` de la cible
`architect.serve`).

## Adaptation de l'ancien projet

- Conserver les tsconfigs stricts existants ; ajouter les alias, sans types Node
  dans le navigateur ni types Vitest dans l'application de production.
- Conserver `.prettierrc` et `.postcssrc.json` : ce dernier est déjà reconnu par le
  builder Angular, sans fichier `postcss.config.json` concurrent.
- Ajouter ESLint flat config, proxy et OpenAPI depuis le contrat partagé du dépôt.
- Ne pas reprendre SSR/Express, Transloco, PrimeIcons, exceptions CSS ou chemin de
  génération lié au backend ancien : aucun besoin MVP ne les justifie ici.

## Règles et livraison

## Documentation stable du frontend

Les commentaires et documents du frontend décrivent les comportements observables,
les invariants métier et les frontières techniques. Ils ne prennent pas un numéro
de travail ou une user story comme nom de concept. La traçabilité des travaux reste
dans OpenSpec et dans les noms de tests, qui peuvent conserver les identifiants
nécessaires à l'audit.

Les règles détaillées sont dans
[docs/documentation.md](docs/documentation.md). Le contrôle
`npm run test:documentation` vérifie que les documents de référence ne réintroduisent
pas de références volatiles.

Lire [AGENTS.md](../AGENTS.md), [CONTRIBUTING.md](../CONTRIBUTING.md) et les règles
[frontend](../.claude/rules/frontend/). Le change OpenSpec
[initialisation-front-features](../openspec/changes/initialisation-front-features/)
porte cette initialisation ; le backlog métier reste séparé.
Chaque évolution conserve sa branche et sa PR vers `develop`. Aucun push direct
sur `develop` n'est autorisé.
