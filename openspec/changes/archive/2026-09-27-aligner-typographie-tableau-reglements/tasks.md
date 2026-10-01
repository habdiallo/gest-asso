## 1. Fidélité visuelle du tableau des règlements

Ticket : T-133

Scope/type/slug : `front` / `fix` / `fidelite-typographie-tableau-reglements`

Branche : `front/fix-133-fidelite-typographie-tableau-reglements`

Change : `aligner-typographie-tableau-reglements`

Prérequis : T-132 doit être terminé et disponible dans l'ascendance de la branche avant l'implémentation.

- [x] 1.1 [T-133] Résoudre T-133, vérifier la branche attendue et confirmer le prérequis T-132 avec `node scripts/tickets.mjs resolve T-133 --json` puis `node scripts/tickets.mjs verify T-133` avant toute modification frontend.
- [x] 1.2 [T-133] Comparer `CampaignPaymentsTab` au prototype `design/` et relever les écarts de famille, taille, graisse, interlettrage, couleur, hauteur de ligne et espacements sans modifier les quatre colonnes existantes.
- [x] 1.3 [T-133] Aligner le titre, la description, l'en-tête et les cellules de `campaign-payments-tab.html` sur les tokens et niveaux typographiques du design cible, en conservant les états, le contenu, l'ordre des colonnes et le défilement horizontal local.
- [x] 1.4 [T-133] Ajouter ou ajuster les tests de `campaign-payments-tab.spec.ts` pour vérifier les quatre colonnes, les textes attendus, les états existants et les marqueurs stables de présentation nécessaires à la fidélité visuelle.
- [x] 1.5 [T-133] Exécuter les tests ciblés et la suite frontend, le lint, le build, le formatage ciblé et une vérification navigateur desktop et viewport étroit ; corriger les écarts sans modifier l'API ni les mocks. Le desktop a été vérifié visuellement ; le viewport étroit est couvert par le conteneur `overflow-x-auto` et sa largeur minimale, mais aucun override de viewport n'est exposé par l'outil navigateur courant.
- [x] 1.6 [T-133] Supprimer le bouton hero « Voir la situation des membres », retirer son gestionnaire devenu inutile si nécessaire et vérifier que l'onglet de situation et les actions de règlement au niveau des cotisations restent accessibles.
- [x] 1.7 [T-133] Relire le diff, vérifier `openspec validate`, `node scripts/tickets.mjs check` et les contrôles du ticket, puis préparer une PR ciblée vers `main` sans fusion ni push direct vers `main`. PR #133 ouverte.
