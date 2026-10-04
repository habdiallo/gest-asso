## 1. Préparation et contrat

- [ ] 1.1 [T-210] Résoudre T-210 avec `node scripts/tickets.mjs resolve T-210 --json`, vérifier le prérequis T-135, créer ou réutiliser `front/feat-210-contexte-unifie-dashboard`, puis exécuter `node scripts/tickets.mjs verify T-210` avant toute modification frontend.
- [ ] 1.2 [T-210] Lire le dashboard Angular et ses tests, confirmer les champs de `GET /dashboard` et `GET /contributions`, puis documenter les limites de données sans modifier le contrat OpenAPI.
- [ ] 1.3 [T-210] Vérifier que la base d'implémentation conserve l'absence des panneaux de synthèse issue de T-135 et que le prototype desktop et le native design décrivent le même contexte unique.

## 2. État et sélecteur unique

- [ ] 2.1 [T-210] Remplacer les deux sélections indépendantes du dashboard par un discriminant de contexte et un seul identifiant de périmètre, avec remise à zéro de l'ancien contexte lors du changement de type.
- [ ] 2.2 [T-210] Adapter le chargement des options, les paramètres `campaignId`/`socialFundId`, les états de chargement et les erreurs afin qu'une seule requête correspondant à la dernière sélection alimente le dashboard.
- [ ] 2.3 [T-210] Rendre le contrôle de type et le sélecteur dépendant accessibles, traduits et utilisables dans les thèmes clair et sombre, sur desktop et mobile.

## 3. Indicateurs, activités et actions

- [ ] 3.1 [T-210] Rendre conditionnelles les cartes du dashboard : membres, cotisations, reste à encaisser et paiements pour les campagnes ; contributeurs, objectif, contributions encaissées et reste à collecter pour les cagnottes.
- [ ] 3.2 [T-210] Connecter l'activité au contexte actif : campagnes et règlements depuis le dashboard en mode cotisations, contributions depuis `GET /contributions` en mode cagnottes, avec états vides, erreurs et limites cohérents.
- [ ] 3.3 [T-210] Adapter les actions rapides, titres, sous-titres, liens et permissions au contexte actif sans réintroduire les panneaux « Synthèse des cotisations » ou « Synthèse de la cagnotte ».
- [ ] 3.4 [T-210] Aligner les prototypes `design/` et `design/native design/` sur le comportement Angular validé, puis vérifier le parcours de bascule Cotisations/Cagnottes.

## 4. Validation et livraison

- [ ] 4.1 [T-210] Ajouter ou adapter les tests du dashboard pour couvrir la sélection unique, les deux contextes, les changements rapides, les erreurs, les états vides, les rôles et l'absence des synthèses.
- [ ] 4.2 [T-210] Exécuter les validations frontend pertinentes depuis `contribo-front/` : tests ciblés et suite, build, lint, format check si configuré, ainsi que `node scripts/tickets.mjs check` depuis la racine.
- [ ] 4.3 [T-210] Vérifier visuellement le dashboard en desktop et mobile, dans les thèmes clair et sombre, avec les agrégats et les sélections précises ; relire le diff et préparer une PR ciblée vers `develop` sans fusionner.
