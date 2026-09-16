---
paths:
  - "contribo-front/src/**/*.ts"
  - "contribo-front/tsconfig*.json"
  - "contribo-front/.prettierrc"
---

# TypeScript — Contribo

## Typage

- Respecter `contribo-front/tsconfig.json` : TypeScript strict et templates Angular stricts.
- Ne pas utiliser `any`, `$any()` ou une assertion non-null pour masquer une incertitude.
- Utiliser `unknown` et une validation explicite aux frontières non typées ; préférer l'inférence quand le type est évident.
- Expliciter les types de retour des API publiques et des fonctions dont le contrat serait ambigu.
- Utiliser `import` ESM et `import type` pour les imports uniquement utilisés comme types.
- Préférer `const` et `readonly` lorsque la valeur ou la référence ne doit pas être réassignée.
- Employer des comparaisons strictes et des blocs avec accolades.
- Ne pas utiliser `eval()` ou `new Function()` avec des données.

## Absence de valeur et contrat

- Ne pas transformer arbitrairement `null` en `undefined` ni l'inverse : ces valeurs n'ont pas toujours le même sens.
- Respecter les propriétés optionnelles et nullables générées depuis `besoins/openapi.yaml`.
- `preferredName: null` dans une mise à jour efface le nom d'usage ; une propriété omise ne le modifie pas.
- Accepter les valeurs nullables prévues par Angular (formulaires, bindings ARIA, pipe `async`).
- Ne pas écrire de DTO API concurrents du contrat ; voir `api-client.md`.

## Imports et formatage

- Alias déclarés : `@core/*`, `@shared/*`, `@features/*` et `@api` pour le client généré.
- Utiliser des imports relatifs à l'intérieur d'une feature ; `@features/*` sert à composer ses routes au niveau applicatif, pas à importer une autre feature.
- Générer le client avant d'importer `@api` ; ne pas inventer d'alias ou de fichiers générés manquants.
- Regrouper lisiblement les imports externes et locaux, sans tri artificiel par longueur.
- Suivre `contribo-front/.prettierrc` : largeur 100, guillemets simples, parseur Angular pour les templates.
- Laisser Prettier décider des retours à la ligne et virgules finales, sans règles concurrentes.
- Aucun hook de formatage automatique n'est déclaré : ne pas supposer qu'il s'exécute après une modification.
