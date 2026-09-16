---
paths:
  - "contribo-front/src/**"
  - "contribo-front/package.json"
  - "contribo-front/angular.json"
  - "contribo-front/.prettierrc"
  - "contribo-front/eslint.config.*"
---

# Lint et formatage — Contribo

## État de l'outillage

- Prettier est déclaré/configuré dans `contribo-front/.prettierrc`.
- TypeScript et les templates Angular sont vérifiés en mode strict.
- ESLint 10, angular-eslint 21 et typescript-eslint 8 sont configurés dans `eslint.config.js`, avec script `lint` et target Angular `ng lint`.
- La configuration vérifie TypeScript, templates/accessibilité, OnPush/standalone/signals, imports de types et dépendances `core/shared` vers les features.
- Aucun plugin de classes Tailwind n'est installé : les classes CSS métier ne sont pas des erreurs à ignorer artificiellement.
- Ne pas annoncer un plugin Tailwind, une règle ESLint ou des hooks comme déjà disponibles.

## Vérifications actuellement possibles

Depuis `contribo-front/` :

```sh
npm run build
npm test -- --watch=false
npm run lint
npm run format:check
```

- Vérifier seulement les fichiers pertinents si le socle comporte des écarts non liés à la tâche.
- Ne pas reformater tout le dépôt ni corriger des fichiers sans rapport avec la demande.
- Corriger les erreurs de compilation ; ne pas désactiver les vérifications pour les masquer.
- Ne pas imposer de formatage concurrent de Prettier.

## Faire évoluer la configuration

- Inspecter les versions installées ; utiliser une configuration moderne cohérente avec Angular, TypeScript et Prettier.
- Déclarer dépendances, configuration, script npm et target Angular si le workflow choisi le nécessite.
- Vérifier TypeScript, templates et accessibilité conformément aux règles de ce dossier.
- Ne pas reprendre versions, exceptions d'icônes ou noms de règles de l'ancien projet sans validation.
- Ne pas traiter les classes CSS de Contribo comme invalides parce qu'elles ne sont pas des utilities Tailwind.
- Garder les exclusions dépendances, caches, build, couverture et `src/app/core/api/generated/` ; le généré n'est pas édité ni reformaté à la main.
- Ne pas installer un outil simplement parce que ce fichier porte son nom.
