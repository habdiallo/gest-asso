## ADDED Requirements

### Requirement: Taille et rayon des boutons d'action
Tout bouton d'action affiché dans `contribo-front/src/app/features/*` (bouton primaire, secondaire
ou de pagination) SHALL avoir une hauteur minimale de 44px (`min-h-11`, cohérente avec le bouton
« Nouvelle campagne » du tableau de bord et avec `.btn` de `design/styles.css`) et un rayon d'angle
de 8px (token Tailwind `rounded`, `--radius` de `contribo-front/src/styles.css`), quel que soit
l'écran sur lequel il apparaît.

#### Scenario: Bouton principal d'une liste
- **WHEN** un rôle authentifié autorisé affiche une page de liste comportant un bouton d'action
  principal (ex. « Ajouter un membre » sur `members-list-page.html`)
- **THEN** ce bouton a une hauteur minimale de 44px et un rayon d'angle de 8px (classe `rounded`),
  et non `rounded-card` (14px) ni `rounded-lg` (16px)

#### Scenario: Boutons de pagination
- **WHEN** un tableau paginé affiche ses contrôles « précédent »/« suivant »
- **THEN** ces boutons ont un rayon d'angle de 8px (classe `rounded`) cohérent avec les autres
  boutons de l'écran, et non le rayon des conteneurs (`rounded-card`, 14px)

### Requirement: Rayon des conteneurs de tableau
Tout wrapper englobant un tableau de données (`<table>`) dans `contribo-front/src/app/features/*`
SHALL avoir un rayon d'angle de 14px (token Tailwind `rounded-card`, `--radius-card` de
`contribo-front/src/styles.css`), qu'il ait déjà un rayon différent ou aucun rayon défini.

#### Scenario: Tableau sans rayon défini
- **WHEN** un écran affiche un tableau dont le wrapper `overflow-x-auto` ne porte aujourd'hui aucune
  classe de rayon (ex. `campaign-detail-page.html`, `member-payments-tab.html`,
  `social-fund-detail-page.html`)
- **THEN** ce wrapper porte la classe `rounded-card` (14px)

#### Scenario: Tableau avec un rayon incorrect
- **WHEN** un écran affiche un tableau dont le wrapper porte un rayon différent de 14px (ex.
  `rounded-xl`, 24px, sur `member-dues-tab.html`, `member-contributions-tab.html` ou
  `campaign-dues-tab.html`)
- **THEN** ce wrapper est corrigé pour porter la classe `rounded-card` (14px)

### Requirement: Taille et rayon des champs de saisie
Tout champ de saisie (`<input>` texte/date/nombre, `<textarea>`) de
`contribo-front/src/app/features/*` et de `contribo-front/src/app/shared/amount-input` SHALL avoir
une hauteur minimale de 48px et un rayon d'angle de 8px (token Tailwind `rounded`), cohérents avec
`.field input` de `design/styles.css`, sans modifier l'anneau de focus doré déjà en place
(`focus:border-gold`, `focus:ring-[3px]`, `focus:ring-gold-wash`).

#### Scenario: Champ de saisie d'un formulaire
- **WHEN** un formulaire de création ou d'édition affiche un champ texte, date, nombre ou une zone
  de texte
- **THEN** ce champ a une hauteur minimale de 48px et un rayon d'angle de 8px (classe `rounded`), et
  non `rounded-lg` (16px), et conserve son anneau de focus doré existant à l'identique

### Requirement: Composant select accessible réutilisable
`contribo-front/src/app/shared/custom-select` SHALL être un composant Angular autonome
(`ControlValueAccessor`) affichant un déclencheur et un menu personnalisés (rôles ARIA
`listbox`/`option`), avec navigation clavier (flèches, Home, End, Échap), plutôt que le rendu natif
du `<select>` du navigateur. Son déclencheur SHALL avoir une hauteur minimale de 48px et un rayon
d'angle de 8px (`rounded`), cohérents avec `.select-trigger` de `design/styles.css` ; son menu
conserve le rayon `rounded-[10px]` déjà proche du prototype. Tout `<select>` natif métier de
`contribo-front/src/app/features/*` et `contribo-front/src/app/shared/payment-method-select` SHALL
être remplacé par ce composant, sans changer sa valeur, sa validation ni les événements qu'il émet.

#### Scenario: Déclencheur du select personnalisé
- **WHEN** un formulaire affiche le composant `shared/custom-select`
- **THEN** son déclencheur a une hauteur minimale de 48px et un rayon d'angle de 8px (classe
  `rounded`), et non `rounded-lg` (16px)

#### Scenario: Sélection d'une option au clavier ou à la souris
- **WHEN** un rôle authentifié choisit une option du menu de `shared/custom-select`, au clavier ou
  à la souris
- **THEN** le menu se ferme, la valeur sélectionnée est reflétée sur le déclencheur avec une coche
  dans le menu à sa prochaine ouverture, le focus revient au déclencheur, et l'anneau doré de focus
  visible ne reste pas affiché en dehors d'une navigation clavier active

#### Scenario: Remplacement d'un select natif métier
- **WHEN** un écran de `features/*` (ex. rôle d'un utilisateur, type d'événement d'une cagnotte,
  campagne associée à un règlement, mode de règlement) affichait un `<select>` natif du navigateur
  - **THEN** cet écran affiche désormais `shared/custom-select` avec la même valeur, les mêmes
  options traduites et le même comportement de validation qu'auparavant

### Requirement: Carte indicateur réutilisable
`contribo-front/src/app/shared/stat-card` SHALL être un composant partagé affichant une icône, un
liseré doré supérieur, un libellé, une valeur et un sous-texte optionnel, conforme au motif de
`design/app.js`. `dashboard-page.html` SHALL utiliser ce composant pour ses indicateurs (membres
actifs, nouveaux membres, campagnes ouvertes, membres enregistrés, et le bilan financier de gestion
lorsqu'il est fourni par l'API), sans changer les données déjà affichées pour les indicateurs non
financiers.

#### Scenario: Indicateurs de gestion sans bilan financier
- **WHEN** un rôle de gestion affiche le tableau de bord et que l'API ne fournit pas
  `financialOverview` (rôle non autorisé au bilan financier)
- **THEN** les 4 cartes indicateurs existantes (membres actifs, nouveaux membres, campagnes
  ouvertes, membres enregistrés) s'affichent via `shared/stat-card`, sans carte financière ni valeur
  devinée

### Requirement: Sélecteur de campagne/cagnotte et bilan financier du tableau de bord
Lorsque l'API retourne `financialOverview` pour le tableau de bord de gestion, `dashboard-page`
SHALL proposer un sélecteur (`shared/custom-select`) de campagne ou de cagnotte relié aux paramètres
`campaignId`/`socialFundId` de l'opération `getDashboard`, et afficher via `shared/stat-card` les
montants retournés par `financialOverview.selectedCampaign.financialSummary`
(`collectedAmount`, `expectedAmount`, `remainingAmount`, `collectionRate`) et par
`financialOverview.selectedSocialFund` (`collectedAmount`, et `progressRate` si un objectif existe).
Ces cartes ne SHALL jamais afficher de valeur calculée côté frontend à partir d'une liste partielle
(ex. `recentPayments`) : uniquement les agrégats déjà fournis par l'API.

#### Scenario: Bilan financier disponible pour une campagne sélectionnée
- **WHEN** un Administrateur, Trésorier ou Opérateur autorisé consulte le tableau de bord et que
  `financialOverview.selectedCampaign.financialSummary` est présent
- **THEN** une carte affiche le montant encaissé et le taux de collecte de cette campagne, et une
  autre affiche le reste à recouvrer, tous deux issus de `financialSummary` sans recalcul côté
  frontend

#### Scenario: Absence de bilan financier
- **WHEN** l'API ne retourne pas `financialOverview`, ou ne retourne pas `selectedCampaign` ou
  `selectedSocialFund` en son sein
- **THEN** les cartes et le sélecteur correspondants ne s'affichent pas, sans message d'erreur ni
  valeur par défaut inventée
