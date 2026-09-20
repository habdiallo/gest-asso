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

### Requirement: Taille et rayon des champs select
Tout composant select de `contribo-front/src/app/shared/` (déclencheur du listbox personnalisé
`custom-select`, et le `<select>` natif de `payment-method-select`) SHALL avoir une hauteur minimale
de 48px et un rayon d'angle de 8px (token Tailwind `rounded`), cohérents avec `.select-trigger` et
`.field input` de `design/styles.css`.

#### Scenario: Déclencheur du select personnalisé
- **WHEN** un formulaire affiche le composant `shared/custom-select`
- **THEN** son déclencheur a une hauteur minimale de 48px et un rayon d'angle de 8px (classe
  `rounded`), et non `rounded-lg` (16px)

#### Scenario: Select natif du mode de règlement
- **WHEN** un formulaire d'enregistrement de paiement affiche `shared/payment-method-select`
- **THEN** ce champ a une hauteur minimale de 48px et un rayon d'angle de 8px, cohérents avec les
  autres champs de saisie du même formulaire
