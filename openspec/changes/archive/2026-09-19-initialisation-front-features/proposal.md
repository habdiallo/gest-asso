## Why

Le socle Angular existe, mais il manque le lint, les alias, le proxy et une génération API reproductible. L'ancien projet sert de référence d'outillage ; Contribo doit conserver son contrat partagé, son frontend navigateur et une architecture par fonctionnalités.

## What Changes

- Compléter les configurations Angular/TypeScript, ESLint, Prettier et proxy utiles au MVP.
- Configurer la génération Angular depuis `besoins/openapi.yaml`, avec version du générateur fixée et compilation vérifiée.
- Établir `features/`, `core/` et `shared/`, avec une première route chargée paresseusement et des règles de dépendance documentées.
- Aligner les instructions frontend et le contexte OpenSpec sur l'architecture par features ; réserver l'architecture hexagonale au futur backend.
- Préserver les outils déjà présents et ne pas importer SSR/Express, traduction multilingue, icônes ou exceptions de classes CSS de l'ancien projet.

## Capabilities

### New Capabilities

- `frontend-initialization`: socle de développement, architecture par features et génération API vérifiable.

### Modified Capabilities

Aucune spécification principale existante à modifier.

## Impact

- Scope `front`, type `chore`, marqueur d'initialisation `000`, branche `front/chore-000-initialisation-outillage-features`, PR prévue vers `main`.
- Fichiers concernés : `contribo-front/`, règles frontend et `openspec/config.yaml` ; aucune modification du contrat API, du prototype ou du backend.
- Une seule évolution livrable : initialisation technique ; aucune implémentation des écrans métier du backlog.
- Validations : lint TypeScript/templates, formatage, tests Angular, build de production, génération et compilation des types API.
