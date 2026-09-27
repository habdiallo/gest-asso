## 1. Préparation et structure du ticket T-135

- [ ] 1.1 [T-135] Résoudre T-135 avec `node scripts/tickets.mjs resolve T-135 --json`, vérifier que T-126 et T-127 sont terminés, puis vérifier/créer la branche `front/fix-135-refonte-agencement-tableau-de-bord` avant toute modification frontend.
- [ ] 1.2 [T-135] Comparer le dashboard de gestion courant au prototype `design/`, en conservant la charte graphique, les données, les droits, les liens et les paramètres de navigation ; documenter les écarts de hiérarchie à 1440 px et 1024 px dans les deux thèmes.

## 2. Réorganisation du dashboard de gestion

- [ ] 2.1 [T-135] Dans `features/dashboard/pages/dashboard-page.html`, supprimer uniquement le rendu des deux blocs « Synthèse des cotisations » et « Synthèse de la cagnotte », conserver les quatre KPI et ne supprimer aucun calcul encore consommé par un KPI, un filtre ou les règlements.
- [ ] 2.2 [T-135] Réorganiser les sections de gestion en flux vertical pleine largeur dans l'ordre KPI, « Actions rapides », « Campagnes récentes », « Derniers règlements », avec quatre cartes d'action homogènes pour l'administrateur et les conditions de rôle existantes pour les autres profils.
- [ ] 2.3 [T-135] Adapter les tests du dashboard pour couvrir l'absence des synthèses, l'ordre des sections, les quatre actions administrateur, le filtrage par rôle et la conservation des routes, paramètres, états vides et données affichées.

## 3. Validation et livraison

- [ ] 3.1 [T-135] Exécuter les validations frontend pertinentes depuis `contribo-front/` : tests ciblés et suite `npm test -- --watch=false`, `npm run build`, `npm run lint`, ainsi que les contrôles OpenSpec et tickets depuis la racine.
- [ ] 3.2 [T-135] Vérifier visuellement le rendu à 1440 px puis 1024 px, en thème sombre puis clair, avec un compte administrateur et un rôle non administrateur ; capturer les résultats avant/après et contrôler l'absence de régression du dashboard membre.
- [ ] 3.3 [T-135] Mettre à jour uniquement les tâches T-135 réellement réalisées, relire le diff, committer avec un titre `fix(front): T-135 ...`, pousser la branche et ouvrir une PR dédiée vers `main` avec les validations et limites constatées ; ne pas fusionner.
