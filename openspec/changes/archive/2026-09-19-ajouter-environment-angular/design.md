## Context

`contribo-front/` a trois configurations Angular (`development`, `mock`, `production`,
`architect.build.configurations` dans `angular.json`). Seule la configuration `mock` a un
`fileReplacement` (sur `src/main.ts` → `src/main.mock.ts`), posé par le change
`mocks-msw-client-api`. Aucune configuration n'a de point central pour des valeurs qui doivent
varier selon l'environnement (URL de base de l'API notamment) : le client API généré
(`typescript-angular`, `src/app/core/api/generated/`) a besoin d'une `basePath`/`BASE_PATH` au
démarrage de l'application, et rien ne fournit aujourd'hui cette valeur de façon typée et
différenciée par configuration.

## Goals / Non-Goals

**Goals:**
- Fournir un fichier par configuration de build (`development`, `mock`, `production`) exposant un
  objet `environment` typé, via le mécanisme standard `fileReplacements` d'Angular.
- Garantir un seul contrat TypeScript (`Environment`) partagé par les trois fichiers, pour éviter
  une dérive de forme entre configurations.
- Rester purement additif : ne modifier ni le comportement de la configuration `mock` existante
  (`main.mock.ts`), ni le contrat API, ni les services générés.

**Non-Goals:**
- Ne pas migrer la logique de démarrage mock (`main.mock.ts`) vers les fichiers d'environnement :
  ce change ne fait que poser le socle `environments/`, l'intégration du client API avec
  `environment.apiBaseUrl` (`provideApi`/`BASE_PATH` ou équivalent) est laissée à un ticket
  applicatif ultérieur qui consommera ce socle.
- Ne pas introduire de secrets ou de valeurs sensibles dans ces fichiers : ils sont committés et
  publics dans le bundle ; toute valeur sensible reste hors de ce socle.
- Ne pas créer de mécanisme de configuration runtime (fichier JSON chargé au démarrage) : le choix
  ici est un remplacement statique au build, conforme aux conventions Angular existantes.

## Decisions

- **`fileReplacements` Angular plutôt qu'un service de configuration runtime** : le projet utilise
  déjà ce mécanisme pour `main.mock.ts`. Rester cohérent avec l'existant plutôt que d'introduire un
  second mécanisme de configuration (ex. fichier `assets/config.json` chargé via `APP_INITIALIZER`)
  évite de dupliquer la notion de "configuration par environnement" sous deux formes différentes
  dans le même projet.
- **Un fichier par configuration (`environment.ts`, `environment.mock.ts`,
  `environment.production.ts`)** plutôt qu'un seul fichier avec détection runtime (`isDevMode()`,
  `location.hostname`) : conforme au schéma généré par défaut par Angular CLI
  (`ng generate environments`) et gardé simple, chaque configuration important explicitement son
  fichier sans logique conditionnelle à maintenir.
- **`environment.ts` (sans suffixe) sert de valeur par défaut pour `development`** : c'est le
  fichier résolu par TypeScript en l'absence de remplacement (ex. exécution de tests unitaires
  hors builder Angular), donc il doit contenir des valeurs de développement sûres (ex.
  `apiBaseUrl` pointant vers le proxy local `proxy.conf.json`), jamais des valeurs de production.
- **Ajout d'un `environment.mock.ts` dédié plutôt que la réutilisation de `environment.ts`** :
  le mode mock ne doit pas dépendre implicitement des valeurs de développement (ex. URL d'API
  réelle) alors que MSW intercepte les requêtes ; un fichier dédié documente explicitement quelles
  valeurs sont pertinentes en mode mock (ex. `apiBaseUrl` factice, `mockEnabled: true`).
- **Interface `Environment` minimale au périmètre de ce change** (`production: boolean`,
  `apiBaseUrl: string`) : les besoins précis (flags de fonctionnalité additionnels) seront ajoutés
  par les tickets applicatifs qui en ont besoin, pour éviter de spéculer sur des champs non encore
  utilisés.

## Risks / Trade-offs

- [Un développeur ajoute un champ à `environment.ts` sans le répercuter dans les deux autres
  fichiers, cassant la substitution de type au build d'une autre configuration] → Documenter dans
  `contribo-front/README.md` que les trois fichiers doivent rester alignés sur `Environment`, et
  recommander de vérifier `ng build --configuration <config>` pour chaque configuration touchée
  lors de la revue.
- [Confusion entre `environment.mock.ts` (build Angular) et la logique de démarrage mock existante
  dans `main.mock.ts`] → Documenter clairement dans le README que `environments/` ne remplace pas
  `main.mock.ts` et que l'intégration (lecture de `environment.apiBaseUrl` par les services) est
  hors périmètre de ce change.
- [Valeur sensible ajoutée par erreur dans un fichier d'environnement committé] → Rappeler dans le
  README que ces fichiers sont publics (bundle client) et ne doivent contenir aucun secret.

## Migration Plan

- Purement additif, sans données à migrer ni service existant à modifier : aucune étape de
  rollback spécifique au-delà de retirer les fichiers ajoutés et les entrées `fileReplacements`
  correspondantes dans `angular.json` si nécessaire.
