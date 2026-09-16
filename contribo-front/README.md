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

## Tester les comptes de démonstration

Sans backend, lancer `npm run start:mock` depuis `contribo-front/`, puis ouvrir
`http://localhost:4200/login`. Le client API doit avoir été généré comme indiqué
plus bas. Le mot de passe commun est **`demo-contribo`**.

| Identifiant                   | Rôle           | Autorisation Opérateur de saisie des paiements |
| ----------------------------- | -------------- | ---------------------------------------------- |
| `admin.demo`                  | Administrateur | Non applicable                                 |
| `tresorier.demo`              | Trésorier      | Non applicable                                 |
| `operateur.demo`              | Opérateur      | Oui                                            |
| `operateur.consultation.demo` | Opérateur      | Non                                            |
| `membre.demo`                 | Membre         | Non applicable                                 |

Utiliser **Se déconnecter**, puis se connecter avec un autre identifiant. Le
rechargement et le redémarrage du serveur mock restaurent le même profil via
`GET /api/v1/me`. Pour remettre seulement la session à zéro, exécuter dans la
console navigateur `localStorage.removeItem('contribo-session-token')`, puis
recharger la page ; la préférence de thème est conservée.

Ces identités sont fictives et réservées au mode mock. Les jetons sont fixes et
leur expiration temporelle n'est pas simulée. Le formulaire et le tableau de bord
actuels sont accessibles ; ces comptes ne créent pas les futurs écrans métier.
Le mock du tableau de bord conserve ses propres données Membre de démonstration,
indépendantes du compte connecté. Les mocks ne vérifient donc pas les droits ni
les données métier côté serveur. `npm start` et le build normal n'activent pas
les comptes ni les handlers MSW.

## Architecture par fonctionnalités

```text
src/app/
  app.*                         shell et configuration applicative
  features/
    home/                       première fonctionnalité, chargée paresseusement
      home.routes.ts
      pages/home-page.*
    <feature>/                  à créer avec son ticket métier
      <feature>.routes.ts
      pages/                    pages de cette fonctionnalité
      components/               composants internes, si nécessaires
      services/                 API/orchestration/état de la feature, si nécessaires
      models/                   modèles IHM distincts, si nécessaires
  core/                         responsabilités applicatives globales
    api/generated/              client OpenAPI, généré et ignoré par Git
  shared/                       UI/pipes/utilitaires neutres effectivement réutilisés
```

Les tests sont colocalisés. Ne pas créer tous les sous-dossiers ni un store/service
pour une fonctionnalité qui n'existe pas encore. Utiliser les DTO générés ; un
modèle/mapping local se justifie seulement par un besoin IHM distinct.

Les features peuvent utiliser `core`, `shared` et le client API. Elles ne
s'importent pas directement entre elles. `core` et `shared` ne dépendent jamais
des features ; ces imports sont interdits par ESLint. Les routes applicatives
chargent chaque fonctionnalité par `loadChildren`/`loadComponent`.

Alias : `@core/*`, `@shared/*`, `@features/*` et `@api`. Les imports internes à une
feature restent relatifs ; `@features/*` sert à composer les routes applicatives.
Le frontend ne possède pas de couches hexagonales, ports ou adapters obligatoires.
**L'architecture hexagonale est réservée au backend.**

Pour créer une page :

```bash
npx --no-install ng generate component features/members/pages/member-list
```

Cette commande est un exemple pour un futur ticket : les pages métier ne sont pas
créées à l'initialisation. Les composants générés utilisent OnPush et CSS.

## API Design First et proxy

Le contrat unique est [besoins/openapi.yaml](../besoins/openapi.yaml), OpenAPI 3.1,
avec une base relative `/api/v1`. Il n'existe pas encore de backend dans ce dépôt.

```bash
npm run validate:api
npm run generate:api
npx --no-install tsc --noEmit -p tsconfig.app.json
```

Le générateur `typescript-angular` est fixé dans `openapitools.json`. Java 11+ est
requis ; la première génération télécharge son JAR. La sortie
`src/app/core/api/generated/` est ignorée par Git, ESLint et Prettier ; le contrat,
la configuration et le lockfile sont versionnés. Ne pas modifier le généré à la
main. Générer avant build/tests des fonctionnalités qui importent `@api`.
La génération est explicite, sans `prestart`, `prebuild` ni `pretest` ; le shell
actuel peut être développé sans Java ou client généré.

`provideHttpClient()` est installé. Relier les credentials Bearer à la session
réelle dans le ticket d'authentification, sans faux jeton ni hôte dans les features.

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
  environment.ts             development (par défaut, sans build explicite)
  environment.mock.ts        configuration Angular "mock"
  environment.production.ts  configuration Angular "production"
```

Chaque fichier exporte une constante `environment` implémentant `Environment`
(`production: boolean`, `apiBaseUrl: string`), sans champ manquant ni supplémentaire.
`angular.json` déclare, pour les configurations `development`, `mock` et
`production` de la cible `architect.build`, un `fileReplacements` substituant
`src/environments/environment.ts` par le fichier correspondant. `environment.ts`
reste la valeur lue en dehors d'un build Angular (ex. Vitest).

Ce socle ne modifie pas la configuration `mock` existante : `main.mock.ts` reste
seul responsable de l'activation de MSW ; `environment.mock.ts` fournit uniquement
un point de lecture typé supplémentaire (l'intégration du client API avec
`environment.apiBaseUrl` est laissée à un ticket applicatif ultérieur).

Ces fichiers sont committés et publics dans le bundle client : n'y placer aucun
secret ni valeur sensible. Après tout ajout de champ à `Environment`, vérifier que
les trois fichiers restent alignés et que `ng build --configuration <config>`
réussit pour chaque configuration touchée.

## Adaptation de l'ancien projet

- Conserver les tsconfigs stricts existants ; ajouter les alias, sans types Node
  dans le navigateur ni types Vitest dans l'application de production.
- Conserver `.prettierrc` et `.postcssrc.json` : ce dernier est déjà reconnu par le
  builder Angular, sans fichier `postcss.config.json` concurrent.
- Ajouter ESLint flat config, proxy et OpenAPI depuis le contrat partagé du dépôt.
- Ne pas reprendre SSR/Express, Transloco, PrimeIcons, exceptions CSS ou chemin de
  génération lié au backend ancien : aucun besoin MVP ne les justifie ici.

## Règles et livraison

Lire [AGENTS.md](../AGENTS.md), [CONTRIBUTING.md](../CONTRIBUTING.md) et les règles
[frontend](../.claude/rules/frontend/). Le change OpenSpec
[initialisation-front-features](../openspec/changes/initialisation-front-features/)
porte cette initialisation ; le backlog métier reste séparé.
Chaque évolution conserve sa branche et sa PR vers `main`. Pendant
l'initialisation, `000` est autorisé ; aucun push direct sur `main`.
