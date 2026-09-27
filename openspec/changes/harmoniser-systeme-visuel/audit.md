# Audit visuel T-138

## Constats

- Le thème CSS-first centralise déjà les couleurs, les polices, les rayons de
  carte et de dialogue, mais les pages complètent encore cette base avec de
  nombreuses valeurs arbitraires.
- Les répétitions les plus significatives dans `contribo-front/src` sont
  `text-[9px]` (84), `tracking-[0.1em]` (83), `text-[13px]` (45), `text-[8px]`
  (28), `min-h-[48px]` (23), `max-w-[1440px]` (15), `p-[22px]` (14),
  `rounded-[9px]` (13) et `pb-[18px]` (12).
- Les composants issus de T-137 utilisent les mêmes primitives existantes,
  notamment `rounded-card`, les actions partagées, les filtres et le shell
  conditionné par le rôle. Ils ne nécessitent pas une nouvelle couche visuelle.

## Conventions existantes

- `font-sans` porte le texte courant, `font-display` les titres et `font-data`
  les données chiffrées et les informations denses.
- `rounded-card` et `rounded-modal` sont les deux rayons composant les surfaces
  principales. `rounded-full` reste réservé aux avatars, pastilles et contrôles
  explicitement circulaires.
- Le shell bascule à `821px`, certains contenus passent à l'horizontal à
  `661px`, et le login dispose d'une transition à `1181px`.
- Les tableaux conservent leur débordement dans un conteneur local, avec une
  largeur minimale destinée à protéger la lisibilité des colonnes.

## Incohérences

- Les mêmes rôles de micro-typographie sont écrits avec plusieurs tailles et
  interlettrages arbitraires, parfois au sein d'une même feature.
- La largeur maximale de page est répétée sous la forme `max-w-[1440px]`, alors
  qu'elle représente une primitive de conteneur stable.
- Les rayons de petits conteneurs d'icône utilisent plusieurs valeurs proches,
  dont `rounded-[9px]`, sans nom sémantique.
- Les valeurs de densité du dashboard, comme `p-[22px]` et `pb-[18px]`, sont
  répétées mais restent candidates à une convention locale de KPI plutôt qu'à
  un token global de panneau.

## Patterns récurrents

- Les labels et kickers utilisent une petite taille, la police de données, des
  capitales et un tracking positif.
- Les cartes partagent le rayon `rounded-card`, une bordure issue de `line` et
  une surface issue du thème.
- Les pages utilisent un conteneur central avec un padding horizontal qui varie
  selon la largeur, tandis que les tableaux et dialogues gèrent leur propre
  contrainte de largeur.
- La capture mobile confirme la pertinence d'un shell compact, d'actions pleine
  largeur, de cartes en deux colonnes lorsque l'espace le permet, de sections
  empilées et d'une navigation basse. Elle ne justifie pas l'ajout des blocs
  métier montrés dans cette capture.

## Direction proposée

- Ajouter au thème uniquement les primitives stables : conteneur `shell`, niveaux
  `kicker`, `micro`, `data` et `kpi`, tracking sémantique associé, et rayon
  `icon`.
- Remplacer les occurrences partagées de `max-w-[1440px]` par le conteneur
  nommé, puis migrer les composants et pages dont le rôle typographique est
  démontré sans convertir toutes les exceptions locales.
- Conserver les seuils `661px`, `821px` et `1181px` tant que la vérification
  visuelle ne montre pas de conflit. Aucun breakpoint ni aucune container query
  supplémentaire n'est nécessaire à ce stade.
- Garder les paddings spécifiques des KPI, les largeurs minimales de tableaux et
  les tailles de dialogue lorsqu'ils protègent la densité ou les données.

## Impact estimé

- `styles.css` reçoit un petit ensemble de tokens CSS-first, sans changement de
  palette ni de contrat fonctionnel.
- Les templates partagés et les pages principales gagnent des classes nommées
  pour les rôles stables, avec un diff limité aux conventions visuelles.
- Les surfaces T-137 sont vérifiées dans le même périmètre, sans ajout de blocs
  du dashboard de la capture.
- Les validations attendues sont le build, les tests frontend, le lint, le
  format check et une vérification live des largeurs étroites et larges.
