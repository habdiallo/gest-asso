## 1. Préparation et intégration i18n

- [x] 1.1 [T-141] Sur `front/feat-141-pluriels-interface`, résoudre le ticket avec `node scripts/tickets.mjs resolve T-141 --json`, vérifier les prérequis et inventorier dans `fr.json` toutes les clés pluralisables ainsi que leurs usages et paramètres numériques.
- [x] 1.2 [T-141] Vérifier la compatibilité de `@jsverse/transloco-messageformat` avec Angular 21 et Transloco 8, ajouter la dépendance alignée et son lockfile, puis configurer le provider dans `contribo-front/src/app/app.config.ts` sans modifier les langues disponibles.

## 2. Migration des traductions et des tests

- [x] 2.1 [T-141] Migrer les clés de `contribo-front/src/assets/i18n/fr.json` qui contiennent `(s)` vers des messages pluralisables couvrant zéro, un et plusieurs, puis contrôler que chaque template transmet les paramètres numériques attendus sans logique grammaticale locale.
- [x] 2.2 [T-141] Mettre à jour et compléter les tests des features dashboard, cagnottes et membres, ainsi que les autres usages découverts, avec des assertions de rendu pour 0, 1 et plusieurs et une vérification de l'absence de `(s)`.

## 3. Validation et livraison

- [x] 3.1 [T-141] Exécuter depuis `contribo-front/` les tests non interactifs, le lint, le contrôle de format et le build, relire le diff ciblé et préparer la PR vers `main` avec le change `gerer-pluriels-interface`, les validations réelles et les éventuelles limites.
