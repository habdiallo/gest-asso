Chaque groupe correspond à un ticket réel enregistré dans `openspec/tickets.json`, une branche et une PR indépendantes vers `main`. Traiter les groupes dans l'ordre (1 à 8) : ne pas démarrer un groupe avant que le précédent soit terminé et sa PR ouverte, conformément à `design.md` (Decisions : un ticket par écran/composant, dans l'ordre de navigation). Toutes les comparaisons se font en desktop (1440 px puis 1024 px), dans les deux thèmes (sombre puis clair), avec un compte de démonstration adapté au rôle testé. Ne cocher une tâche que si l'action a réellement été effectuée.

## 0. Proposition du change [T-125]

Scope/type : `docs/chore`. Branche : `docs/chore-125-proposer-alignement-visuel-desktop-design`. Périmètre : rédaction de `proposal.md`, `design.md`, `specs/**/*.md` et du présent `tasks.md`, et enregistrement des tickets T-117 à T-124 (et de ce ticket T-125) dans `openspec/tickets.json`. Aucune implémentation applicative.

- [x] 0.1 [T-125] Rédiger les artefacts OpenSpec du change (`proposal.md`, `design.md`, `specs/desktop-visual-parity/spec.md`, `specs/desktop-sidebar-visual/spec.md`, `tasks.md`) et enregistrer les tickets T-117 à T-125 dans `openspec/tickets.json`.

## 1. Tableau de bord et lien de navigation [T-117]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-117 --json` (`front/fix-117-alignement-visuel-tableau-de-bord`). Prérequis : T-111 (sidebar desktop). Périmètre : écran de tableau de bord (`features/dashboard`) + exception ciblée de `desktop-sidebar-visual` pour le lien « Tableau de bord ». Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle du tableau de bord ») et `specs/desktop-sidebar-visual/spec.md` (Requirement « Lien de navigation vers le tableau de bord » et sa version modifiée de « Présentation des liens et de leur état actif »).

- [x] 1.1 [T-117] Résoudre et vérifier T-117 (`resolve`/`verify`), créer/réutiliser sa branche depuis `origin/main`.
- [x] 1.2 [T-117] Se connecter avec un compte de chaque rôle authentifié, capturer l'écran atteint après connexion à 1440 px (thème sombre puis clair) et lister précisément ses écarts avec l'équivalent dans `design/` (mise en page, espacements, typographies, composants des cartes/campagnes récentes/bilan financier).
- [x] 1.3 [T-117] Corriger les écarts listés en 1.2 sans changer les indicateurs affichés ni leur source de données.
- [x] 1.4 [T-117] Ajouter le lien « Tableau de bord » en tête de `navigationItemsForRole` pour chaque rôle authentifié, vérifier son état actif sur l'écran de tableau de bord et l'absence de régression des gardes de routage (`authenticatedMatch`, `roleGuard`) et de la redirection post-connexion existante.
- [x] 1.5 [T-117] Exécuter les validations pertinentes (`npm run build`, `npm test -- --watch=false`, `npm run lint`) et vérifier à 1440 px et 1024 px, deux thèmes, l'absence de régression sur les écrans déjà conformes (dashboard, connexion) et sur le rendu mobile existant (821 px et en dessous inchangés).
- [ ] 1.6 [T-117] Committer le périmètre du ticket, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 2. Membres [T-118]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-118 --json` (`front/fix-118-alignement-visuel-membres`). Prérequis : T-117. Périmètre : `features/members` (liste + fiche détail, onglets inclus). Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle des écrans Membres »).

- [ ] 2.1 [T-118] Résoudre et vérifier T-118, créer/réutiliser sa branche depuis `origin/main` en incluant T-117.
- [ ] 2.2 [T-118] Capturer la liste des membres puis une fiche membre (chaque onglet) à 1440 px, deux thèmes, et lister les écarts avec `design/`.
- [ ] 2.3 [T-118] Corriger les écarts listés, sans changer les données affichées, les droits par rôle ni le comportement des actions existantes.
- [ ] 2.4 [T-118] Exécuter les validations pertinentes et vérifier à 1440 px et 1024 px, deux thèmes, l'absence de régression sur les écrans déjà traités (groupe 1).
- [ ] 2.5 [T-118] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 3. Catégories de revenu [T-119]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-119 --json` (`front/fix-119-alignement-visuel-categories-revenu`). Prérequis : T-118. Périmètre : `features/income-categories` (liste + dialogues de création/modification). Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle de l'écran Catégories de revenu »).

- [ ] 3.1 [T-119] Résoudre et vérifier T-119, créer/réutiliser sa branche depuis `origin/main` en incluant les groupes précédents.
- [ ] 3.2 [T-119] Capturer la liste des catégories de revenu puis ses dialogues de création et de modification à 1440 px, deux thèmes, et lister les écarts avec `design/`.
- [ ] 3.3 [T-119] Corriger les écarts listés, sans changer la validation ni l'enregistrement existants.
- [ ] 3.4 [T-119] Exécuter les validations pertinentes et vérifier l'absence de régression sur les groupes précédents.
- [ ] 3.5 [T-119] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 4. Campagnes [T-120]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-120 --json` (`front/fix-120-alignement-visuel-campagnes`). Prérequis : T-119. Périmètre : `features/campaigns` (liste + détail : onglets Barème, Cotisations, Bilan, dialogues associés). Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle des écrans Campagnes »).

- [ ] 4.1 [T-120] Résoudre et vérifier T-120, créer/réutiliser sa branche depuis `origin/main` en incluant les groupes précédents.
- [ ] 4.2 [T-120] Capturer la liste des campagnes puis le détail d'une campagne (chaque onglet successivement) et ses dialogues à 1440 px, deux thèmes, et lister les écarts avec `design/`.
- [ ] 4.3 [T-120] Corriger les écarts listés, sans changer les actions ni les droits par rôle existants.
- [ ] 4.4 [T-120] Exécuter les validations pertinentes et vérifier l'absence de régression sur les groupes précédents.
- [ ] 4.5 [T-120] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 5. Cagnottes [T-121]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-121 --json` (`front/fix-121-alignement-visuel-cagnottes`). Prérequis : T-120. Périmètre : `features/social-funds` (liste + détail, dialogues associés). Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle des écrans Cagnottes »).

- [ ] 5.1 [T-121] Résoudre et vérifier T-121, créer/réutiliser sa branche depuis `origin/main` en incluant les groupes précédents.
- [ ] 5.2 [T-121] Capturer la liste des cagnottes puis le détail d'une cagnotte à 1440 px, deux thèmes, et lister les écarts avec `design/`.
- [ ] 5.3 [T-121] Corriger les écarts listés, sans changer les actions ni les droits par rôle existants.
- [ ] 5.4 [T-121] Exécuter les validations pertinentes et vérifier l'absence de régression sur les groupes précédents.
- [ ] 5.5 [T-121] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 6. Rôles et utilisateurs [T-122]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-122 --json` (`front/fix-122-alignement-visuel-roles-utilisateurs`). Prérequis : T-121. Périmètre : `features/roles-users` (liste). Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle de l'écran Rôles et utilisateurs »).

- [ ] 6.1 [T-122] Résoudre et vérifier T-122, créer/réutiliser sa branche depuis `origin/main` en incluant les groupes précédents.
- [ ] 6.2 [T-122] Capturer l'écran Rôles et utilisateurs à 1440 px, deux thèmes, et lister les écarts avec `design/`.
- [ ] 6.3 [T-122] Corriger les écarts listés.
- [ ] 6.4 [T-122] Exécuter les validations pertinentes et vérifier l'absence de régression sur les groupes précédents.
- [ ] 6.5 [T-122] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 7. Mon espace [T-123]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-123 --json` (`front/fix-123-alignement-visuel-mon-espace`). Prérequis : T-122. Périmètre : `features/member-space` (profil, cotisations, contributions). Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle de l'espace personnel du membre »).

- [ ] 7.1 [T-123] Résoudre et vérifier T-123, créer/réutiliser sa branche depuis `origin/main` en incluant les groupes précédents.
- [ ] 7.2 [T-123] Capturer chaque onglet de l'espace personnel à 1440 px, deux thèmes, et lister les écarts avec `design/`.
- [ ] 7.3 [T-123] Corriger les écarts listés.
- [ ] 7.4 [T-123] Exécuter les validations pertinentes et vérifier l'absence de régression sur les groupes précédents.
- [ ] 7.5 [T-123] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.

## 8. Dialogues de formulaire transverses [T-124]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-124 --json` (`front/fix-124-alignement-visuel-dialogues-formulaire`). Prérequis : T-123 (tous les écrans propriétaires traités). Périmètre : `shared/form-dialog`, pour les écarts de présentation restant une fois tous les écrans ci-dessus corrigés. Critères d'acceptation : `specs/desktop-visual-parity/spec.md` (Requirement « Fidélité visuelle des dialogues de formulaire transverses »).

- [ ] 8.1 [T-124] Résoudre et vérifier T-124, créer/réutiliser sa branche depuis `origin/main` en incluant les groupes précédents.
- [ ] 8.2 [T-124] Capturer un dialogue de formulaire existant de chaque écran corrigé (groupes 2 à 7) à 1440 px, deux thèmes, et lister les écarts de présentation communs restants avec `design/` (superposition, largeur, rayon, arrière-plan).
- [ ] 8.3 [T-124] Corriger les écarts listés dans le composant partagé, sans changer le piège de focus ni la fermeture par Échap déjà vérifiés (T-103).
- [ ] 8.4 [T-124] Exécuter les validations pertinentes et vérifier chaque dialogue impacté sur les écrans des groupes 1 à 7, à 1440 px et 1024 px, deux thèmes.
- [ ] 8.5 [T-124] Committer, pousser la branche et ouvrir une PR en brouillon vers `main` avec captures avant/après ; ne pas fusionner.
