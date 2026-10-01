## 1. Cadrage et audit [T-139]

- [x] 1.1 [T-139] Résoudre T-139 avec `node scripts/tickets.mjs resolve T-139 --json`, vérifier la branche `front/refactor-139-harmoniser-responsive-composants` et exécuter `node scripts/tickets.mjs verify T-139` avant toute modification applicative.
- [x] 1.2 [T-139] Parcourir le shell, les composants `shared/`, les composants locaux des features et les pages métier sur des largeurs mobiles, intermédiaires, tablettes et desktops, en relevant les conventions de navigation, cartes, formulaires, listes, tableaux, dialogues, filtres, états vides et scrolling.
- [x] 1.3 [T-139] Auditer le dashboard mobile et les captures de référence comme supports de composition, puis produire une matrice problème, composant, largeur, règle proposée, risque et exception éventuelle sans ajouter leur contenu fonctionnel.

## 2. Direction responsive [T-139]

- [x] 2.1 [T-139] Définir les règles de composition par conteneur, la hiérarchie mobile, la densité, la progressive disclosure et les largeurs de vérification pour tous les composants visuels.
- [x] 2.2 [T-139] Confirmer les usages des tokens T-138 et identifier les seules adaptations locales justifiées par le contenu, les montants longs, les tableaux, les dialogues ou les contraintes de conteneur.
- [x] 2.3 [T-139] Documenter les décisions de breakpoint, grille, empilement, défilement local et éventuelle container query, sans ajouter de seuil sans problème concret observé.

## 3. Harmonisation des composants [T-139]

- [x] 3.1 [T-139] Adapter le shell et les composants `shared/` concernés, notamment les headers, actions, selects, filtres, cartes, tableaux, formulaires, dialogues, pagination et états vides, sans changer leurs contrats.
- [x] 3.2 [T-139] Adapter les composants locaux et pages des features selon les règles retenues, en couvrant les écrans de liste, détail, dashboard, membres, campagnes, cagnottes, rôles et espace personnel.
- [x] 3.3 [T-139] Préserver la hiérarchie des données essentielles, les droits, les labels, les erreurs, le focus, les touch targets, les deux thèmes et les défilements locaux pendant les recompositions mobiles.

## 4. Validation et livraison [T-139]

- [x] 4.1 [T-139] Exécuter les tests ciblés, `npm test -- --watch=false`, `npm run lint`, `npm run format:check` et `npm run build` depuis `contribo-front/`, puis corriger uniquement les régressions du périmètre T-139.
- [x] 4.2 [T-139] Réaliser une vérification visuelle multi-largeur et multi-thème des composants partagés, locaux et pages principales, en consignant les débordements, troncatures, exceptions et limites restantes.
- [x] 4.3 [T-139] Relire le diff, exécuter `openspec validate harmoniser-responsive-composants --strict`, `node scripts/tickets.mjs check` et les contrôles frontend pertinents, puis préparer une PR vers `main` sans fusion ni auto-merge.

## 5. Corrections visuelles complémentaires [T-139]

- [x] 5.1 [T-139] Faire évoluer `NavigationMenu` comme composant partagé pour afficher Accueil et les destinations autorisées par le rôle, avec une composition mobile compacte et défilable lorsque toutes les destinations ne tiennent pas.
- [x] 5.2 [T-139] Harmoniser l'en-tête mobile avec la référence, en conservant les accès au profil, au thème et à la déconnexion sans dupliquer la navigation dans le shell.
- [x] 5.3 [T-139] Étendre les adaptations responsive aux pages, composants et sous-composants des features hors dashboard, notamment listes, détails, formulaires, filtres, dialogues, états vides, pagination et espace personnel.
- [x] 5.4 [T-139] Tester visuellement les navigations et les parcours principaux sur mobile, tablette et desktop, dans les deux thèmes lorsque disponible, puis documenter les corrections et limites dans l'audit du change.
