## Context

`contribo-front/src/styles.css` déclare déjà l'échelle de rayons du prototype comme tokens
Tailwind : `--radius: 0.5rem` (8px, DEFAULT, documenté « boutons/champs ») et `--radius-card: 14px`
(documenté « cartes/panneaux »). `design/styles.css` (prototype de référence) confirme ces valeurs
avec des classes concrètes : `.btn { min-height: 44px; border-radius: 8px; }`,
`.field input { min-height: 48px; border-radius: 8px; }`, `.select-trigger { min-height: 48px;
border-radius: 8px; }`, et les conteneurs (`--radius`, `.panel`, `.data-panel`, `.stat-card`) à
`14px`. Les jetons existent donc déjà côté frontend ; le problème est un usage incohérent de ces
jetons (et d'autres valeurs `rounded-*` non prévues par l'échelle) dans les templates.

Audit ciblé (grep sur `contribo-front/src/app/features` et `shared/`) :

- **Boutons** : le bouton « Nouvelle campagne » du tableau de bord (`dashboard-page.html`) utilise
  `min-h-11` (44px, correct) mais `rounded-lg` (16px, incorrect : attendu `rounded` = 8px). Le
  bouton principal et les boutons de pagination de `members-list-page.html` utilisent `rounded-card`
  (14px, pensé pour les conteneurs, incorrect pour un bouton). 21 fichiers de `features/` utilisent
  `rounded-lg` sur des boutons, champs ou dialogues.
- **Tableaux** (wrapper `overflow-x-auto` autour de chaque `<table>`) : `members-list-page.html`,
  `roles-users-page.html` et `income-categories-page.html` utilisent déjà `rounded-card` (14px,
  correct). `member-dues-tab.html`, `member-contributions-tab.html` et `campaign-dues-tab.html`
  utilisent `rounded-xl` (24px, incorrect). `social-fund-detail-page.html`,
  `member-payments-tab.html` et `campaign-detail-page.html` (deux tableaux) n'ont aucune classe de
  rayon sur leur wrapper.
- **Select** : `shared/custom-select/custom-select.html` (déclencheur du listbox personnalisé) a
  déjà la bonne hauteur (`min-h-[48px]`) mais un rayon `rounded-lg` (16px, incorrect : attendu
  `rounded` = 8px comme `.select-trigger`) ; son menu déroulant utilise `rounded-[10px]`, proche du
  `.select-menu` du prototype (10px), donc laissé inchangé. `shared/payment-method-select` est un
  `<select>` natif à `h-11` (44px) et `rounded-lg` (16px), alors que le prototype traite les
  contrôles de saisie (champs et select) de façon uniforme à 48px / 8px.

## Goals / Non-Goals

**Goals:**
- Faire converger tous les boutons d'action de `features/*` vers la même hauteur que « Nouvelle
  campagne » (`min-h-11`, 44px) et vers le token de rayon `rounded` (8px).
- Faire converger tous les wrappers de tableau (`overflow-x-auto` autour d'un `<table>`) vers le
  token `rounded-card` (14px), y compris ceux qui n'ont aujourd'hui aucun rayon.
- Faire converger `shared/custom-select` (déclencheur) et `shared/payment-method-select` vers le
  token `rounded` (8px), et aligner la hauteur de `payment-method-select` sur `min-h-[48px]` comme
  `custom-select` et `.field input` du prototype.
- Ne changer aucun comportement, libellé, donnée affichée ou droit par rôle : uniquement des
  classes Tailwind de présentation (rayon, hauteur, espacement).

**Non-Goals:**
- Ne pas retraiter l'ensemble de la fidélité visuelle écran par écran : ce périmètre reste celui du
  change `alignement-visuel-desktop-design` (T-117 à T-124), non modifié ici.
- Ne pas introduire de composant de bouton ou de tableau partagé (`ds-button`, `ds-table`, etc.) :
  `.claude/rules/frontend/angular.md` n'impose aucune convention de composant `ds-*` et le MVP ne
  justifie pas cette abstraction pour une simple correction de classes.
- Ne pas modifier le menu déroulant de `custom-select` (`rounded-[10px]`, déjà proche du prototype)
  ni les rayons des cartes, modales, badges ou pilules, hors périmètre de cette proposition.
- Ne pas toucher au rendu mobile/tablette existant : les classes corrigées sont indépendantes des
  breakpoints (`sm:`, `lg:`) déjà en place sur ces éléments.

## Decisions

- **Corriger en place plutôt qu'introduire un composant partagé** : remplacer les classes `rounded-*`
  incorrectes (`rounded-lg`, `rounded-xl`, `rounded-card` sur un bouton, absence de classe) par les
  jetons déjà définis (`rounded` = 8px pour boutons/champs/select, `rounded-card` = 14px pour les
  wrappers de tableau), sans créer de composant `shared/` supplémentaire. Alternative envisagée :
  extraire un composant `Button`/`Table` partagé ; écartée car hors périmètre MVP et parce que les
  jetons existent déjà, seul leur usage est fautif.
- **Référence de taille = bouton « Nouvelle campagne »** : conserver `min-h-11` (44px) comme hauteur
  cible de tous les boutons d'action, car déjà conforme à `.btn` du prototype ; ne pas réintroduire
  une valeur différente (ex. `h-11` à 44px déjà correct côté hauteur mais pas de rayon).
- **Un seul ticket, une seule PR** : périmètre transverse mais limité à des corrections de classes
  Tailwind sur des fichiers déjà identifiés ci-dessus ; pas de découpage en plusieurs tickets, à la
  différence du change `alignement-visuel-desktop-design` dont le découpage par écran répond à un
  besoin de revue approfondie plus large.
- **Indépendance vis-à-vis de `alignement-visuel-desktop-design`** : ce ticket ne dépend d'aucun des
  tickets T-118 à T-124 et ne les bloque pas ; il corrige des classes déjà présentes sur des écrans
  aussi bien traités (T-117) que non encore traités par ce change.

## Risks / Trade-offs

- [Risque de régression visuelle sur des écrans non listés dans l'audit] → Mitigation : grep
  exhaustif sur `rounded-lg`, `rounded-xl` et wrappers `overflow-x-auto` dans `features/` et
  `shared/` avant implémentation ; vérification visuelle à 1440 px et 1024 px, deux thèmes, sur
  chaque écran modifié.
- [Un remplacement mécanique de `rounded-lg` par `rounded` pourrait toucher un élément qui n'est ni
  un bouton, ni un champ, ni un select, ni un tableau (ex. une carte)] → Mitigation : corriger
  élément par élément après relecture du template, pas par remplacement global (`sed`) non vérifié.
- [`payment-method-select` est un `<select>` natif ; changer sa hauteur à 48px peut décaler son
  alignement avec des libellés ou icônes voisins] → Mitigation : vérifier visuellement l'alignement
  du champ dans son formulaire après correction.

## Migration Plan

Aucune migration de données. Déploiement standard : une branche, une PR, revue du diff, fusion sur
GitHub. Retour arrière possible par revert de la PR, sans dépendance externe.
