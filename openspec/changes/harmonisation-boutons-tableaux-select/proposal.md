## Why

Une revue rapide de `design/styles.css` (prototype de référence) et des templates frontend actuels
montre que les rayons d'angle (`border-radius`) et les tailles des boutons, tableaux et champs
select ne suivent pas une échelle cohérente. Le prototype distingue clairement trois échelles :
boutons/champs à `8px` (`.btn`, `.field input`, `.select-trigger`), conteneurs/tableaux à `14px`
(`--radius`, `.data-panel`, `.panel`, `.stat-card`) et pilules/badges en arrondi complet (`9999px`).
Ces trois valeurs sont déjà déclarées comme tokens Tailwind dans `contribo-front/src/styles.css`
(`--radius: 0.5rem` soit 8px, `--radius-card: 14px`), mais leur usage dans les templates est
incohérent : par exemple `members-list-page.html` applique `rounded-card` (14px, pensé pour les
conteneurs) au bouton principal « Ajouter un membre » et aux boutons de pagination, alors que
`rounded-lg` (16px) est utilisé sur des champs de recherche et sur le déclencheur du composant
partagé `shared/custom-select` là où le prototype attend `8px`. Le porteur du produit a repéré cet
écart en comparant ses boutons et ses tableaux au prototype, avec le bouton « Nouvelle campagne »
du tableau de bord (`min-h-11`, soit la même hauteur `44px` que `.btn` dans le prototype) comme
référence de taille correcte à généraliser. Sans correction ciblée, cette incohérence continuera
de se propager à chaque nouvel écran, y compris ceux déjà couverts par le change
`alignement-visuel-desktop-design`.

## What Changes

- Harmoniser la taille (hauteur, espacement interne) de tous les boutons d'action de l'application
  sur celle déjà correcte du bouton « Nouvelle campagne » du tableau de bord (`min-h-11` soit
  `44px`, cohérent avec `.btn` de `design/styles.css`), pour les boutons primaires, secondaires et
  de pagination, sans changer leurs libellés, icônes ni actions.
- Corriger l'usage du rayon d'angle des boutons pour qu'il suive le token `rounded` (`8px`,
  `--radius` de `contribo-front/src/styles.css`) plutôt que `rounded-card` ou `rounded-lg` observés
  par erreur sur plusieurs écrans (dont le bouton principal et les boutons de pagination de
  `members-list-page.html`).
- Corriger l'usage du rayon d'angle des conteneurs de tableau (wrapper `overflow-x-auto` autour de
  chaque `<table>`) pour qu'il suive systématiquement le token `rounded-card` (`14px`), déjà
  appliqué correctement sur certains écrans (ex. `members-list-page.html` ligne du wrapper de
  tableau) mais pas vérifié sur l'ensemble des écrans avec tableau.
- Harmoniser le composant partagé `shared/custom-select` (déclencheur et menu) et le composant
  `shared/payment-method-select` sur le rayon `8px` du déclencheur de select du prototype
  (`.select-trigger`), en conservant leur hauteur actuelle déjà conforme (`min-h-[48px]`).
- Documenter l'échelle de rayons résultante (boutons/champs `8px`, conteneurs/tableaux `14px`,
  pilules `9999px`) comme référence commune pour les futurs écrans, y compris ceux du change
  `alignement-visuel-desktop-design` non encore traités (T-118 à T-124).
- **BREAKING** : aucune. Ce change ne modifie ni le comportement, ni les données affichées, ni les
  droits par rôle ; il corrige uniquement des classes utilitaires Tailwind (rayon, hauteur,
  espacement) sur des composants déjà existants.

## Capabilities

### New Capabilities

- `composants-interaction-visual` : critères de cohérence visuelle (taille et rayon d'angle) des
  boutons, des conteneurs de tableau et des champs select de l'application, par comparaison avec
  les tokens de `design/styles.css` et `contribo-front/src/styles.css`.

### Modified Capabilities

- Aucune. `desktop-sidebar-visual` et le futur `desktop-visual-parity` (change
  `alignement-visuel-desktop-design`, non encore archivé dans `openspec/specs/`) ne sont pas
  modifiés : ce change traite une préoccupation transverse de primitives d'interaction, indépendante
  de la revue écran par écran déjà planifiée pour ce change.

## Impact

- Zones concernées : boutons d'action et tableaux dans `contribo-front/src/app/features/*`
  (dashboard, members, campaigns, social-funds, income-categories, roles-users), ainsi que
  `shared/custom-select/` et `shared/payment-method-select/`.
- Aucun impact backend, contrat API (`besoins/openapi.yaml`), migration ou dépendance npm : seules
  des classes Tailwind (rayon, hauteur) sont corrigées dans les templates existants.
- Un seul ticket réel, `scope front` / `type fix`, réservé dans `openspec/tickets.json` lors de la
  rédaction de `tasks.md` de ce change ; une branche, une PR.
- Indépendant du change `alignement-visuel-desktop-design` (T-117 à T-125) : ne dépend d'aucun de
  ses tickets et ne les bloque pas ; peut être livré avant, pendant ou après, mais fournit une
  échelle de référence utile pour les tickets T-118 à T-124 restants de ce change.
