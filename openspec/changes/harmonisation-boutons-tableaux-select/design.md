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
- **Select** : `shared/custom-select` n'existe pas dans le code actuel (aucun fichier, aucune
  référence `app-custom-select` dans tout `contribo-front/src/app`), contrairement à ce que
  l'audit initial de ce change supposait. 11 écrans affichent en réalité un `<select>` natif du
  navigateur (`social-fund-create-form.html`, `social-funds-list-page.html`,
  `contribution-create-form.html`, `roles-users-page.html`, `member-create-form.html`,
  `member-edit-form.html`, `members-list-page.html`, `campaign-dues-tab.html`,
  `campaign-create-form.html`, `campaigns-list-page.html`, `shared/payment-method-select`), avec un
  rendu de menu déroulant imposé par le système d'exploitation, jamais celui du prototype (menu
  personnalisé avec coche et surbrillance dorée, `design/app.js`). `shared/payment-method-select`
  est un `<select>` natif à `h-11` (44px) et `rounded-lg` (16px), alors que le prototype traite les
  contrôles de saisie (champs et select) de façon uniforme à 48px / 8px.
- **Champs de saisie** : la quasi-totalité des `<input>` texte/date/nombre et `<textarea>` de
  `features/*` et `shared/amount-input` utilisent `h-11` (44px, `login-page.html` et les dialogues
  de catégories de revenus utilisent `h-12`, 48px, déjà correct) et `rounded-lg` (16px), au lieu de
  `min-h-[48px]` / `rounded` (8px) attendus par `.field input` du prototype. L'anneau de focus doré
  (`focus:border-gold focus:ring-[3px] focus:ring-gold-wash`) est déjà appliqué de façon cohérente
  sur la quasi-totalité de ces champs (audit : 50 occurrences de `focus:ring-[3px]` et
  `focus:ring-gold-wash`, 49 de `focus:border-gold` ; le seul écart concerne une case à cocher de
  rôle sur `roles-users-page.html`, hors périmètre car ce n'est pas un champ de saisie), donc à
  conserver sans modification.
- **Tableau de bord** : `dashboard-page.html` actuel n'a ni bouton (le bouton « Nouvelle campagne »
  cité par le porteur produit comme référence n'existe plus dans le code, cette page n'a aucun
  `<button>`/`<a>`) ni carte à icône/liseré doré : ses 4 cartes indicateurs
  (`rounded-card border border-line bg-surface-glass p-5`) sont dépourvues d'icône et de liseré,
  contrairement au motif `statCard(...)` de `design/app.js` (icône, liseré doré, libellé, valeur,
  sous-texte). Par ailleurs, `DashboardPage` (composant Angular) documente déjà dans son
  commentaire que `financialOverview` (bilan financier de gestion, `besoins/openapi.yaml`) et les
  paramètres `campaignId`/`socialFundId` de `getDashboard` existent au contrat mais ne sont pas
  exploités par l'écran actuel : ce bilan (`selectedCampaign.financialSummary`,
  `selectedSocialFund`) correspond exactement aux valeurs du prototype (`campaignScope`,
  `potScope`) et à leurs exemples chiffrés dans `besoins/openapi.yaml`
  (`collectedAmount: 12400000`, `collectionRate: 67.0`, `remainingAmount: 6100000`), confirmant
  qu'il s'agit d'une fonctionnalité déjà modélisée mais jamais construite, pas d'une simple
  correction de classes.
- **Infobulle hors périmètre** : une capture d'écran fournie pendant la revue de ce change montre
  une infobulle affichant un texte turc/gouvernemental sans rapport avec l'association
  (« T.C. Dışişleri Bakanlığı... konsolosluk.gov.tr/... »). Recherche exhaustive de ce texte dans
  `contribo-front/` et `design/` : aucune occurrence. Ce texte ne provient d'aucun fichier du dépôt ;
  il s'agit très probablement d'un artefact du navigateur ou du poste utilisé pour la capture
  (extension, aperçu de lien), sans lien avec le code de l'application. Aucune action de correction
  n'est donc prévue dans ce change pour ce point.

## Goals / Non-Goals

**Goals:**
- Faire converger tous les boutons d'action de `features/*` vers la même hauteur que « Nouvelle
  campagne » (`min-h-11`, 44px) et vers le token de rayon `rounded` (8px).
- Faire converger tous les wrappers de tableau (`overflow-x-auto` autour d'un `<table>`) vers le
  token `rounded-card` (14px), y compris ceux qui n'ont aujourd'hui aucun rayon.
- Faire converger tous les champs de saisie de `features/*` et `shared/amount-input` vers
  `rounded` (8px) et `min-h-[48px]`, sans toucher à leur anneau de focus doré déjà cohérent.
- Construire `shared/custom-select` (listbox accessible, `ControlValueAccessor`) au rayon `rounded`
  (8px) et à la hauteur `min-h-[48px]` pour son déclencheur (menu à `rounded-[10px]`, inchangé), et
  l'utiliser pour remplacer les 11 `<select>` natifs identifiés ainsi que `shared/payment-method-select`.
- Construire `shared/stat-card` (icône, liseré doré, libellé, valeur, sous-texte) conforme au motif
  du prototype, l'utiliser pour les 4 indicateurs déjà affichés par `dashboard-page.html`, puis
  ajouter un sélecteur de campagne/cagnotte (`shared/custom-select`) relié à `campaignId`/
  `socialFundId` de `getDashboard` pour afficher le bilan financier (`financialOverview`) déjà
  modélisé côté contrat, uniquement lorsque l'API le fournit.
- Ne changer aucune donnée affichée ou droit par rôle en dehors de l'ajout du bilan financier déjà
  prévu par le contrat : les corrections de boutons/tableaux/champs restent des classes Tailwind de
  présentation (rayon, hauteur, espacement).

**Non-Goals:**
- Ne pas retraiter l'ensemble de la fidélité visuelle écran par écran : ce périmètre reste celui du
  change `alignement-visuel-desktop-design` (T-117 à T-124), non modifié ici, en dehors des
  4 cartes indicateurs du tableau de bord explicitement demandées.
- Ne pas introduire de composant de bouton ou de tableau partagé (`ds-button`, `ds-table`, etc.) :
  `.claude/rules/frontend/angular.md` n'impose aucune convention de composant `ds-*` et le MVP ne
  justifie pas cette abstraction pour une simple correction de classes. Les deux composants
  partagés introduits ici (`custom-select`, `stat-card`) répondent à un besoin explicitement
  demandé par le porteur produit (rendu non natif du select, factorisation du motif de carte), pas
  à une généralisation systématique.
- Ne pas modifier le menu déroulant de `custom-select` (`rounded-[10px]`, déjà proche du prototype)
  ni les rayons des cartes, modales, badges ou pilules, hors périmètre de cette proposition.
- Ne pas calculer de bilan financier agrégé côté frontend à partir d'une liste partielle
  (`recentPayments`, plafonnée à 5 éléments) : uniquement les agrégats déjà fournis par
  `financialOverview` (`financialSummary`, `selectedSocialFund`).
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
- **Un seul ticket, une seule PR, périmètre élargi en cours de route** : l'audit initial de ce
  change citait un `shared/custom-select` et un bouton « Nouvelle campagne » qui n'existent pas
  dans le code (voir « Context » ci-dessus). Plutôt que de simplement retirer ces références, le
  porteur produit a demandé, lors de la revue de ce change, d'élargir T-126 pour : construire
  réellement `shared/custom-select` et l'appliquer à tous les `<select>` natifs de l'application,
  harmoniser les champs de saisie, et introduire `shared/stat-card` avec le sélecteur de
  campagne/cagnotte et le bilan financier du tableau de bord. Décision : garder un seul ticket
  `T-126` (type `fix` conservé tel quel) plutôt que d'ouvrir des tickets `feat` séparés, à la
  demande explicite du porteur produit, au prix d'un ticket dont le contenu réel dépasse largement
  une correction de classes CSS ; à signaler clairement dans la description de la PR pour la revue.
- **Indépendance vis-à-vis de `alignement-visuel-desktop-design`** : ce ticket ne dépend d'aucun des
  tickets T-118 à T-124 et ne les bloque pas ; il corrige des classes déjà présentes sur des écrans
  aussi bien traités (T-117) que non encore traités par ce change.
- **Sélecteur de campagne/cagnotte du tableau de bord sans nouveau paramètre côté contrat** :
  `campaignId`/`socialFundId` sont déjà des paramètres optionnels de `getDashboard` dans
  `besoins/openapi.yaml` ; construire ce sélecteur consiste à les exploiter côté frontend, pas à
  faire évoluer le contrat API.

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
- [Remplacer 11 `<select>` natifs par un composant maison risque de casser la validation de
  formulaire réactif, l'accessibilité clavier ou le comportement mobile déjà corrects nativement] →
  Mitigation : `shared/custom-select` implémente `ControlValueAccessor` pour rester un contrôle de
  formulaire réactif standard ; tests unitaires par écran migré ; vérification clavier (Tab, flèches,
  Échap) et lecteur d'écran de base sur au moins un écran par famille de formulaire.
- [Le bilan financier du tableau de bord dépend d'un rôle et de champs optionnels
  (`financialOverview`, `selectedCampaign`, `selectedSocialFund`) pouvant être absents] →
  Mitigation : chaque carte financière et le sélecteur associé ne s'affichent que si la donnée
  correspondante est présente dans la réponse API ; tests de composant couvrant la présence et
  l'absence de `financialOverview`.
- [Périmètre élargi en cours d'implémentation complique la revue d'un ticket `fix`] → Mitigation :
  description de PR détaillant explicitement les trois lots (corrections de classes déjà faites,
  nouveaux composants partagés, fonctionnalité de sélection du tableau de bord) et leurs
  validations respectives, pour que la revue puisse les distinguer.

## Migration Plan

Aucune migration de données. Déploiement standard : une branche, une PR, revue du diff, fusion sur
GitHub. Retour arrière possible par revert de la PR, sans dépendance externe.
