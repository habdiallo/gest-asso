## Context

Décider et documenter la dépendance Java ou fournir une chaîne reproductible sans dépendance inutile. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

- Conserver `@openapitools/openapi-generator-cli` et le générateur
  `typescript-angular` déjà utilisés par le frontend. Leur remplacement changerait
  le client généré et chevaucherait les corrections de contrat de T-166.
- Centraliser `check:api`, `validate:api` et `generate:api` dans un script Node local.
  Le script vérifie Node.js, Java, le wrapper présent dans `node_modules`, les
  versions exactes de `package.json`, `package-lock.json` et `openapitools.json`,
  puis lance le wrapper avec le binaire Node courant.
- Garder Java comme dépendance explicite du seul outillage de génération. Le
  contrôle impose Java 11 ou plus récent, tandis que le workflow CI utilise Java
  21. Le shell Angular, ses tests et son build restent indépendants de Java.
- Ne pas versionner ni modifier `src/app/core/api/generated/`. Le contrat, la
  configuration, le lockfile, le script et la documentation sont les sources
  reproductibles de la chaîne.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Depuis `contribo-front/`, exécuter `npm ci`, puis `npm run check:api`,
`npm run validate:api`, `npm run generate:api` et la compilation TypeScript. Si
Java est absent, le contrôle arrête la chaîne avant l'appel au générateur et
indique la version minimale attendue.
