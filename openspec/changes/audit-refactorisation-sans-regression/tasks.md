## 1. Cartographie et audit global

- [x] 1.1 [T-140] Depuis `front/refactor-140-audit-refactorisation-sans-regression`, vérifier `node scripts/tickets.mjs resolve T-140 --json`, les prérequis, `node scripts/tickets.mjs verify T-140` et l'état de référence `origin/main` avant toute modification applicative. Scope `front`, type `refactor`, slug `audit-refactorisation-sans-regression`. Critère : la branche et le périmètre sont validés sans embarquer les modifications T-138 existantes.
- [x] 1.2 [T-140] Cartographier `contribo-front/`, les routes lazy, features, `core/`, `shared/`, services, état, appels API, types, formulaires, permissions, styles, tests, scripts, dépendances et configurations. Critère : chaque zone est reliée à ses responsabilités, consommateurs et validations disponibles dans le rapport d'audit.
- [x] 1.3 [T-140] Rechercher les duplications, responsabilités mélangées, complexités, incohérences de typage, imports indésirables, dépendances inutilisées, code mort potentiel et risques de performance sans modifier le comportement. Critère : une matrice documente pour chaque constat la preuve, la fréquence, le risque, les alternatives et la validation prévue.

## 2. Direction et refactorisations démontrées

- [x] 2.1 [T-140] Prioriser les opportunités selon le bénéfice, la fréquence et le risque, puis sélectionner les groupes livrables compatibles avec `front/refactor-140-audit-refactorisation-sans-regression`. Critère : les changements fonctionnels, visuels, contractuels, de navigation, de permissions, de dépendances majeures et d'état global sont exclus ou proposés comme tickets séparés.
- [x] 2.2 [T-140] Consolider uniquement les duplications prouvées, constantes, helpers purs, types ou mappings dont l'abstraction réduit la complexité sur plusieurs usages réels. Critère : les interfaces publiques et les résultats observables restent inchangés, avec tests ciblés pour chaque groupe.
- [x] 2.3 [T-140] Simplifier les responsabilités de composants ou services uniquement après identification de tous les consommateurs et sans franchir les frontières `features/`, `core/` et `shared/`. Critère : aucune architecture parallèle, dépendance entre features ou abstraction spéculative n'est introduite.
- [x] 2.4 [T-140] Déclarer les alias stables nécessaires, notamment `@assets/*` et `@mocks/*`, puis migrer uniquement les imports profonds éligibles en réutilisant `@core/*`, `@shared/*`, `@features/*` et `@api` selon leurs frontières. Critère : les chemins résolvent dans Angular, TypeScript, Vitest, lint et build, les imports locaux restent lisibles et aucune dépendance entre features n'est masquée.

## 3. Code mort, comportement et validations

- [x] 3.1 [T-140] Vérifier les imports statiques et dynamiques, routes, configurations, scripts, tests et conventions Angular avant toute suppression de code mort. Critère : chaque suppression est démontrée, documentée dans l'audit et couverte par une validation pertinente.
- [x] 3.2 [T-140] Ajouter ou ajuster uniquement les tests nécessaires pour verrouiller les comportements nominal, erreur, autorisation, loading, absence de données, formulaires, API et navigation concernés. Critère : les tests vérifient le comportement observable et ne masquent pas une erreur par des mocks ou schémas permissifs.
- [x] 3.3 [T-140] Comparer les parcours et le rendu des zones modifiées sur mobile, tablette et desktop, dans les deux thèmes disponibles. Critère : aucun changement visuel ou fonctionnel involontaire n'est conservé ; les limites de vérification manuelle sont consignées.

## 4. Contrôle et publication

- [x] 4.1 [T-140] Exécuter les tests ciblés puis `npm test -- --watch=false`, `npm run lint`, `npm run format:check`, `npm run build`, `npm run test:tooling`, `node scripts/tickets.mjs check`, `node scripts/tickets.mjs verify T-140`, `openspec validate audit-refactorisation-sans-regression --strict` et les contrôles de diff pertinents. Critère : les résultats réels et les écarts préexistants sont consignés sans corriger du hors périmètre.
- [ ] 4.2 [T-140] Relire le diff, vérifier l'identité du ticket et de la branche, mettre à jour le rapport d'audit et préparer une PR vers `main` avec le modèle du dépôt. Critère : les fichiers T-138 et les skills `source-command-opsx-*` ne sont pas embarqués, la PR reste non fusionnée et le retour arrière par commit est explicable.
