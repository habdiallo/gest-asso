## Context

Contribo est un frontend Angular 21 strictement typé, organisé par fonctionnalités avec `core/` pour le socle global et `shared/` pour les éléments neutres réellement réutilisés. Le client API généré vient de `besoins/openapi.yaml`, les tests utilisent Vitest et jsdom, et les contrôles disponibles comprennent lint, formatage, build et tests d'outillage.

Le changement part de `main`, qui contient déjà T-139. Le workspace principal porte aussi des modifications documentaires T-138 qui doivent rester hors du périmètre T-140. Les cinq skills `source-command-opsx-*` ne font pas partie de la livraison : `main` utilise les sources `.claude/skills`, les copies `.codex/skills` et les liens `.agents/skills`, et la parité IA est valide sans ces fichiers.

## Goals / Non-Goals

**Goals:**

- Produire une cartographie vérifiable des responsabilités, flux, dépendances, conventions et parcours critiques.
- Identifier les duplications accidentelles, responsabilités mélangées, incohérences de types, dépendances inutilisées et code mort avec des preuves traçables.
- Prioriser les refactorisations par bénéfice, portée et risque, puis les livrer par petits groupes réversibles.
- Préserver le comportement observable, le rendu visuel, les contrats API, les routes, les permissions, les données stockées et les formats existants.
- Renforcer les tests uniquement lorsque cela améliore la preuve de conservation du comportement.

**Non-Goals:**

- Ajouter une fonctionnalité, modifier un parcours, corriger une règle métier ou améliorer l'interface.
- Introduire une architecture hexagonale frontend, un store tiers, une bibliothèque UI ou une nouvelle dépendance sans ticket distinct.
- Remplacer massivement Angular, TypeScript, Tailwind, le client API ou le runner de tests.
- Appliquer `OnPush`, `computed`, `memoization` ou une abstraction partagée lorsque l'audit ne démontre pas un bénéfice concret.
- Supprimer un fichier sur la seule base d'une recherche locale ou modifier les cinq skills écartés.

## Decisions

### 1. Commencer par une cartographie et un état de référence

L'audit documentera les entrées de l'application, les routes lazy, les features, les composants `core/shared`, les services, les appels API, les formulaires, les états loading/empty/error, les permissions, les tests, les scripts et la configuration. Les parcours critiques seront reliés à leurs tests ou à une validation manuelle reproductible avant toute modification structurelle.

Alternative écartée : commencer par les fichiers les plus longs ou les premières duplications trouvées. Cette approche risquerait de refactoriser un symptôme sans comprendre ses consommateurs.

### 2. Utiliser une matrice de preuves pour décider

Chaque opportunité contiendra la localisation, la fréquence, la cause, le bénéfice attendu, les alternatives, le risque, les consommateurs concernés et la validation associée. Une abstraction ne sera retenue que si elle réduit la complexité sur plusieurs usages réels sans masquer le comportement spécifique.

Alternative écartée : imposer une couche commune à toutes les similarités visuelles ou syntaxiques.

### 3. Livrer par niveaux de risque

Les corrections de faible risque seront traitées en premier : constantes réellement dupliquées, helpers purs répétés, types locaux incohérents et simplifications sans effet observable. Les déplacements de responsabilités, extractions de services ou changements d'abstraction partagée seront isolés et traités uniquement si les consommateurs sont tous identifiés. Les changements d'état global, de contrat API, de navigation, de dépendances ou de design sortiront du périmètre T-140.

Alternative écartée : regrouper toutes les opportunités dans une réécriture unique, difficile à relire et à annuler.

### 4. Conserver les frontières frontend existantes

Les pages, routes, composants, services et tests resteront dans `features/<feature>/`. `core/` conservera les responsabilités transverses et `shared/` uniquement les éléments neutres réutilisés. Les features ne s'importeront pas entre elles et aucun port, adapter ou modèle parallèle ne sera créé pour contourner le client API généré.

### 5. Prouver le code mort avant suppression

Une suppression nécessitera l'absence de consommateurs statiques et la vérification des routes, imports dynamiques, configurations, scripts, tests et conventions Angular concernées. En cas de doute, le code restera en place et sera documenté comme opportunité future.

### 6. Valider après chaque groupe significatif

Les groupes concernés relanceront les tests ciblés puis les contrôles proportionnés : `npm test -- --watch=false`, `npm run lint`, `npm run format:check`, `npm run build`, `npm run test:tooling`, les contrôles de tickets et OpenSpec. Les parcours et états visuels concernés seront comparés sur mobile, tablette et desktop, dans les deux thèmes lorsqu'ils existent.

### 7. Utiliser des alias limités aux racines stables

Les alias déjà déclarés (`@core/*`, `@shared/*`, `@features/*` et `@api`) seront réutilisés selon leurs frontières. L'audit pourra ajouter `@assets/*` vers `src/assets/*` et `@mocks/*` vers `src/mocks/*` afin de remplacer les traversées profondes observées dans les tests et handlers. Un import qui reste dans la même feature conservera un chemin relatif lorsque celui-ci exprime mieux la proximité locale. `@features/*` ne servira pas à créer ou dissimuler une dépendance entre features.

Alternative écartée : ajouter un alias global `@app/*` ou remplacer mécaniquement tous les imports relatifs. Cette solution raccourcirait les chemins mais masquerait les frontières et pourrait rendre les dépendances plus difficiles à contrôler.

## Risks / Trade-offs

- [Risque] Une extraction de logique modifie involontairement l'ordre d'exécution ou la gestion d'erreur. → Mitigation : préserver les signatures, conserver les tests de comportement et isoler chaque extraction dans un commit relisible.
- [Risque] Une abstraction partagée force des cas particuliers et augmente le couplage. → Mitigation : comparer explicitement avec deux implémentations locales et refuser l'abstraction si le gain n'est pas net.
- [Risque] Du code utilisé indirectement est déclaré mort à tort. → Mitigation : vérifier routes, imports dynamiques, scripts, configurations et tests avant suppression.
- [Risque] Le formatage ou la compilation révèle des écarts préexistants non liés. → Mitigation : enregistrer l'état de référence, ne corriger que les régressions T-140 et signaler les limites hors périmètre.
- [Risque] Un alias TypeScript résout dans le build mais pas dans les tests ou les outils. → Mitigation : valider les configurations Angular, TypeScript, Vitest et lint avec un import représentatif avant migration en volume.
- [Risque] Un alias raccourci masque une dépendance interdite entre features. → Mitigation : limiter les alias aux racines autorisées et conserver les contrôles d'architecture dans `test:tooling`.
- [Risque] Le périmètre global devient trop large pour une PR. → Mitigation : prioriser les groupes faible risque et créer un ticket ou une PR distincte pour les changements structurels, fonctionnels, visuels ou contractuels.

## Migration Plan

1. Résoudre T-140, vérifier `origin/main`, créer la branche `front/refactor-140-audit-refactorisation-sans-regression` et conserver les modifications préexistantes hors périmètre.
2. Produire la cartographie, la matrice de preuves et l'état de référence avant les changements de code.
3. Déclarer les alias stables nécessaires, migrer les imports profonds éligibles et vérifier leur résolution dans le build, les tests et les outils.
4. Implémenter un groupe de refactorisation, valider son comportement, puis relire son diff avant le groupe suivant.
5. Publier une PR T-140 vers `main` avec le rapport d'audit, les validations et les risques restants.
6. En cas de régression, revenir au dernier commit du groupe concerné ou revertir le commit ciblé. Aucun changement de migration de données ou de contrat externe n'est prévu.

## Open Questions

- Quelles opportunités démontrées resteront suffisamment petites pour T-140 après la cartographie complète ?
- Quels écarts de formatage, de tests ou de dépendances préexistent dans `main` et doivent être explicitement exclus ?
- Quels parcours nécessitent une vérification navigateur manuelle lorsque les tests jsdom ne suffisent pas ?
