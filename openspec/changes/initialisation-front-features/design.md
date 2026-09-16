## Context

Contribo possède un socle Angular 21.2, TypeScript 5.9 strict, Tailwind 4/PostCSS,
Prettier et Vitest/jsdom. Le frontend est une application navigateur. Le contrat
partagé OpenAPI 3.1 utilise une base relative `/api/v1` ; aucun backend n'existe ici.
Le projet ancien utilise aussi SSR, Express et une traduction multilingue : ces
responsabilités ne correspondent pas au MVP actuel.

## Goals / Non-Goals

**Goals:** compléter l'outillage réellement utile, rendre la génération API
reproductible et établir des limites claires entre fonctionnalités et socle.

**Non-Goals:** écrans métier, authentification complète, serveur backend, SSR,
store tiers, ports/adapters frontend, traduction multilingue, bibliothèque UI/icônes.

## Decisions

### Structure par fonctionnalités

`features/<feature>/` regroupe routes, pages, composants et services/état de la
fonctionnalité. Créer les sous-dossiers à mesure du besoin ; les tests sont
colocalisés. Une première page d'accueil et sa route lazy rendent cette organisation
effective sans implémenter les tickets métier. `core/` contient les préoccupations
globales, notamment l'API ; `shared/` les éléments neutres réellement réutilisés.
Les features dépendent du socle ; le socle ne dépend pas des features. Les features
ne s'importent pas directement entre elles. L'architecture hexagonale concerne
uniquement le futur backend, conformément à la demande du mainteneur.

### Configurations et vérifications

Conserver les réglages TypeScript stricts, les types Vitest limités aux tests et
l'absence de types Node dans l'application navigateur. Ajouter les alias `@core/*`,
`@shared/*`, `@features/*` et `@api`. ESLint flat config associe les versions
compatibles Angular 21, TypeScript et ESLint 10, validées par leurs peerDependencies.
Appliquer les règles TypeScript, Angular et accessibilité, avec des règles ciblées
OnPush/standalone/signals et de dépendance ; Prettier reste responsable du format.
Conserver `.postcssrc.json`, déjà reconnu par le builder, plutôt que créer une
configuration PostCSS concurrente. Ajouter scripts lint/format et target Angular.

### Proxy et API

Le proxy Vite utilise `/api/**` pour couvrir les sous-chemins `/api/v1/...`, sans
réécriture. `localhost:8080` est une convention de développement à ajuster au
serveur futur, pas un backend déclaré disponible. En production, le reverse proxy
doit router `/api/v1` ; le proxy Angular n'est pas livré au navigateur.

Le générateur `typescript-angular` lit `../besoins/openapi.yaml` et écrit dans
`src/app/core/api/generated/`. Fixer sa version dans `openapitools.json`, ne pas
créer un package npm indépendant ni copier le chemin du backend ancien. La
génération est explicite (`generate:api`) ; aucun prestart/prebuild/pretest ne
déclenche Java ou une génération inutile au développement du shell. Le code
généré est ignoré par Git, lint et Prettier, et n'est jamais modifié à la main.
Il est généré avant compilation des fonctionnalités qui le consomment. Vérifier
les propriétés nullables OpenAPI 3.1 et compiler le résultat avant de valider la
configuration ; ne pas considérer un téléchargement/génération réussi comme
une preuve de fidélité au contrat.

Version retenue : OpenAPI Generator 7.25.0. La génération réelle conserve la base
relative `/api/v1` et `preferredName?: string | null` ; la compilation stricte de
l'ensemble des services/modèles générés réussit. Le support 3.1 reste annoncé
bêta par l'outil : vérifier ces garanties après toute évolution du contrat.

## Risks / Trade-offs

- [Générateur nécessitant Java et un JAR téléchargé] → documenter Java 11+ et
  la première génération connectée ; garder le shell compilable indépendamment.
- [Support OpenAPI 3.1 variable selon versions] → vérifier enums, champs nullables
  et compilation ; ajuster l'outil sans dégrader le contrat partagé si nécessaire.
- [Features futures prématurées] → créer uniquement l'accueil et les dossiers
  de socle documentés, sans services/ports/DTO fictifs ni pages métier vides.
- [Règles frontend devenues obsolètes] → synchroniser leur état réel et injecter
  le choix d'architecture dans OpenSpec pour les futures évolutions.

## Migration Plan

Livrer l'évolution `000` sur sa branche et une PR vers `main`, indépendante du
backlog métier. Installer via le lockfile, vérifier génération, lint, format, tests
et build. Aucun déploiement ni migration de données. Un retour arrière rétablit
les configurations et le shell Angular précédents via une PR de correction.

## Open Questions

Le port/hôte du futur backend reste à confirmer lors de son intégration ; la
convention locale `8080` est documentée et modifiable dans le proxy.
