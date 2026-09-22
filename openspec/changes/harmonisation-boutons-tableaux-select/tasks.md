Ce groupe correspond à un ticket réel enregistré dans `openspec/tickets.json`, une branche et une
PR vers `main`. Toutes les vérifications visuelles se font en desktop (1440 px puis 1024 px), dans
les deux thèmes (sombre puis clair). Ne cocher une tâche que si l'action a réellement été effectuée.

## 1. Harmonisation boutons, tableaux, champs et select [T-126]

Scope/type : `front/fix` (conservé tel quel à la demande du porteur produit, malgré l'ajout en
cours de route de deux composants partagés et d'une fonctionnalité de sélection de campagne/cagnotte
sur le tableau de bord ; à mentionner explicitement dans la description de la PR pour la revue).
Branche : résoudre avec `node scripts/tickets.mjs resolve T-126 --json`
(`front/fix-126-harmonisation-boutons-tableaux-select`). Prérequis : aucun, indépendant du change
`alignement-visuel-desktop-design`. Périmètre : boutons d'action, wrappers de tableau, champs de
saisie et composants select de `contribo-front/src/app/features/*`, nouveaux composants partagés
`contribo-front/src/app/shared/custom-select` et `contribo-front/src/app/shared/stat-card`, et
`contribo-front/src/app/shared/payment-method-select`. Critères d'acceptation :
`specs/composants-interaction-visual/spec.md`.

- [x] 1.1 [T-126] Résoudre et vérifier T-126 (`resolve`/`verify`), créer/réutiliser sa branche
      depuis `origin/main`.
- [x] 1.2 [T-126] Corriger le rayon d'angle des boutons d'action vers le token `rounded` (8px) là où
      il utilise aujourd'hui `rounded-card` ou `rounded-lg`, en conservant leur hauteur déjà correcte
      (`min-h-11`, 44px) ou en l'alignant si elle diverge.
- [x] 1.3 [T-126] Corriger le rayon d'angle de chaque wrapper de tableau (`overflow-x-auto` autour
      d'un `<table>`) vers le token `rounded-card` (14px), y compris ceux sans classe de rayon
      aujourd'hui et ceux avec un rayon incorrect.
- [x] 1.4 [T-126] Corriger `shared/payment-method-select` vers une hauteur minimale de 48px
      (`min-h-[48px]`) et un rayon `rounded` (8px). (Le rattachement à `shared/custom-select` est
      traité séparément par la tâche 1.7 : `shared/custom-select` n'existait pas dans la base
      `main` au moment de l'audit initial de ce change, voir tâche 1.6.)
- [x] 1.5 [T-126] Harmoniser les champs de saisie (`<input>` texte/date/nombre, `<textarea>`) de
      `contribo-front/src/app/features/*` et `contribo-front/src/app/shared/amount-input` vers le
      rayon `rounded` (8px) et une hauteur minimale de 48px (`min-h-[48px]`), cohérents avec
      `.field input` de `design/styles.css` et avec le select. Conserver inchangé l'anneau de focus
      doré déjà en place et cohérent sur tous ces champs (`focus:border-gold focus:ring-[3px]
      focus:ring-gold-wash`) : ne pas le modifier, seulement le rayon et la hauteur.
- [x] 1.6 [T-126] Créer `shared/custom-select` : composant Angular autonome (`ControlValueAccessor`)
      implémentant un listbox accessible (bouton déclencheur + menu avec rôles ARIA
      `listbox`/`option`, navigation clavier flèches/Home/End/Échap, coche sur l'option
      sélectionnée, surbrillance dorée sur l'option active), rendu conforme à `design/styles.css`
      (déclencheur `.select-trigger` : 48px/8px ; menu `.select-menu` : rayon ~10px, laissé
      inchangé comme décidé dans `design.md`). Après sélection d'une option (clavier ou souris), le
      menu se ferme, le focus revient au déclencheur, et l'anneau doré de focus visible ne doit pas
      rester affiché en dehors d'une navigation clavier active (comportement `:focus-visible`, pas
      `:focus`).
- [x] 1.7 [T-126] Remplacer les 11 `<select>` natifs identifiés par `shared/custom-select`, sans
      changer leur comportement métier (valeurs, validations de formulaire réactif, événements) :
      `social-funds/components/social-fund-create-form/social-fund-create-form.html`,
      `social-funds/pages/social-funds-list-page.html`,
      `social-funds/components/contribution-create-form/contribution-create-form.html`,
      `roles-users/pages/roles-users-page.html`,
      `members/components/member-create-form/member-create-form.html`,
      `members/components/member-edit-form/member-edit-form.html`,
      `members/pages/members-list-page.html`,
      `campaigns/components/campaign-dues-tab/campaign-dues-tab.html`,
      `campaigns/components/campaign-create-form/campaign-create-form.html`,
      `campaigns/pages/campaigns-list-page.html`, et
      `shared/payment-method-select/payment-method-select.html`.
- [x] 1.8 [T-126] Créer `shared/stat-card` (icône, liseré doré supérieur, libellé, valeur,
      sous-texte, conforme au motif de `design/app.js`) et l'utiliser pour les 4 indicateurs déjà
      affichés par `dashboard-page.html` (membres actifs, nouveaux membres, campagnes ouvertes,
      membres enregistrés), sans changer les données affichées.
- [x] 1.9 [T-126] Sur le tableau de bord, ajouter un sélecteur de campagne/cagnotte
      (`shared/custom-select`) relié aux paramètres `campaignId`/`socialFundId` de l'opération
      `getDashboard` (`GET /dashboard`), et afficher via `shared/stat-card` le bilan financier
      retourné par `financialOverview` : cotisations encaissées et reste à recouvrer depuis
      `selectedCampaign.financialSummary` (`collectedAmount`, `expectedAmount`, `remainingAmount`,
      `collectionRate`), contributions encaissées depuis `selectedSocialFund` (`collectedAmount`
      et, si un objectif existe, `progressRate`). N'afficher ces cartes que lorsque
      `financialOverview`/`selectedCampaign`/`selectedSocialFund` sont effectivement présents dans
      la réponse API ; leur absence (rôle non autorisé, ou aucune campagne/cagnotte sélectionnée)
      n'est jamais devinée ni compensée par une valeur par défaut côté frontend, conformément à
      `.claude/rules/frontend/api-client.md`.
- [ ] 1.10 [T-126] Exécuter les validations pertinentes (`npm run build`,
      `npm test -- --watch=false`, `npm run lint`) et vérifier à 1440 px et 1024 px, deux thèmes,
      l'absence de régression sur les écrans modifiés, le clavier/focus du nouveau select, et le
      rendu mobile existant (821 px et en dessous) inchangé.
- [ ] 1.11 [T-126] Committer le périmètre du ticket, pousser la branche et ouvrir une PR en
      brouillon vers `main` avec captures avant/après. Mentionner dans la description que
      l'infobulle en turc observée sur une capture d'écran fournie pendant la revue ne provient
      d'aucun fichier du dépôt (recherche exhaustive infructueuse sur le texte concerné dans
      `contribo-front/` et `design/`), donc probablement un artefact du navigateur ou du poste,
      hors périmètre de ce ticket. Ne pas fusionner.
