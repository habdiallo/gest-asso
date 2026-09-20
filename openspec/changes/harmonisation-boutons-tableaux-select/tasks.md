Ce groupe correspond à un ticket réel enregistré dans `openspec/tickets.json`, une branche et une
PR vers `main`. Toutes les vérifications visuelles se font en desktop (1440 px puis 1024 px), dans
les deux thèmes (sombre puis clair). Ne cocher une tâche que si l'action a réellement été effectuée.

## 1. Harmonisation boutons, tableaux et select [T-126]

Scope/type : `front/fix`. Branche : résoudre avec `node scripts/tickets.mjs resolve T-126 --json`
(`front/fix-126-harmonisation-boutons-tableaux-select`). Prérequis : aucun, indépendant du change
`alignement-visuel-desktop-design`. Périmètre : boutons d'action, wrappers de tableau et composants
select de `contribo-front/src/app/features/*` et `contribo-front/src/app/shared/custom-select`,
`contribo-front/src/app/shared/payment-method-select`. Critères d'acceptation :
`specs/composants-interaction-visual/spec.md` (les trois exigences : taille/rayon des boutons,
rayon des conteneurs de tableau, taille/rayon des champs select).

- [x] 1.1 [T-126] Résoudre et vérifier T-126 (`resolve`/`verify`), créer/réutiliser sa branche
      depuis `origin/main`.
- [ ] 1.2 [T-126] Corriger le rayon d'angle des boutons d'action vers le token `rounded` (8px) là où
      il utilise aujourd'hui `rounded-card` ou `rounded-lg` (dont, sans s'y limiter, le bouton
      « Nouvelle campagne » du tableau de bord, le bouton principal et les boutons de pagination de
      `members-list-page.html`), en conservant leur hauteur déjà correcte (`min-h-11`, 44px) ou en
      l'alignant si elle diverge.
- [ ] 1.3 [T-126] Corriger le rayon d'angle de chaque wrapper de tableau (`overflow-x-auto` autour
      d'un `<table>`) vers le token `rounded-card` (14px), y compris ceux sans classe de rayon
      aujourd'hui (`campaign-detail-page.html`, `member-payments-tab.html`,
      `social-fund-detail-page.html`) et ceux avec un rayon incorrect (`member-dues-tab.html`,
      `member-contributions-tab.html`, `campaign-dues-tab.html`).
- [ ] 1.4 [T-126] Corriger le déclencheur de `shared/custom-select` vers le rayon `rounded` (8px) en
      conservant sa hauteur déjà correcte (`min-h-[48px]`), et corriger `shared/payment-method-select`
      vers une hauteur minimale de 48px et un rayon `rounded` (8px).
- [ ] 1.5 [T-126] Exécuter les validations pertinentes (`npm run build`, `npm test -- --watch=false`,
      `npm run lint`) et vérifier à 1440 px et 1024 px, deux thèmes, l'absence de régression sur les
      écrans modifiés et sur le rendu mobile existant (821 px et en dessous inchangés).
- [ ] 1.6 [T-126] Committer le périmètre du ticket, pousser la branche et ouvrir une PR en brouillon
      vers `main` avec captures avant/après ; ne pas fusionner.
