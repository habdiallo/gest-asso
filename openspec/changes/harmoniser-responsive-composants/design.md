## Context

Contribo est une application Angular 21 organisée par features, `core/` et
`shared/`, avec Tailwind CSS 4 et deux thèmes visuels. T-138 a établi les
conventions globales de typographie, rayons, espacements et dimensions. T-139
porte sur leur comportement réel selon l'espace disponible, afin d'éviter que le
mobile soit traité comme un desktop simplement empilé.

Le dashboard fournit une référence utile pour analyser la densité, les cartes, la
hiérarchie et la navigation mobile. Les autres écrans restent dans le périmètre,
notamment les listes, détails, formulaires, tableaux, dialogues, filtres, états
vides et composants réutilisables.

## Goals / Non-Goals

**Goals:**

- Obtenir une composition lisible et utilisable sur mobile étroit, mobile large,
  tablette, desktop intermédiaire et desktop large.
- Appliquer les décisions responsive à tous les composants visuels concernés, avec
  des exceptions locales justifiées par le contenu ou le conteneur.
- Adapter la densité, les grilles, les empilements et la progressive disclosure
  sans changer les contrats fonctionnels.
- Préserver l'accessibilité, les zones tactiles, le focus, les labels, les données
  essentielles et les deux thèmes.
- Vérifier les transitions entre breakpoints, pas seulement leurs valeurs exactes.

**Non-Goals:**

- Reproduire littéralement les captures ou ajouter leurs sections et données.
- Ajouter une fonctionnalité, une route, une API, une dépendance ou un backend.
- Remplacer tous les composants par une bibliothèque UI ou créer une architecture
  concurrente aux frontières `features/`, `core/` et `shared/`.
- Réduire la taille des textes ou masquer une information uniquement pour diminuer
  la hauteur du scroll.

## Decisions

### Auditer avant de modifier

L'inventaire commence par les composants réellement présents et leurs usages sur
plusieurs largeurs. Chaque adaptation sera reliée à un problème observé :
débordement, densité excessive, espace inutilisé, perte de hiérarchie, troncature,
touch target insuffisante ou navigation peu accessible.

Alternative écartée : appliquer directement la composition de la capture du
dashboard à toutes les pages. Cette approche confondrait une référence visuelle
avec un contrat produit.

### Adapter par composant et par conteneur

Les règles restent dans le composant ou dans les primitives globales appropriées.
Une composition dépendant de la largeur réelle d'un composant sera traitée par sa
grille, son empilement ou une container query seulement si les breakpoints de page
ne suffisent pas. Les features ne s'importent pas entre elles.

Alternative écartée : multiplier les breakpoints de fenêtre pour chaque écran,
ce qui créerait des transitions difficiles à maintenir.

### Hiérarchiser sans perdre les données essentielles

Sur mobile, l'information principale, son statut ou sa valeur, le contexte utile
et l'accès au détail seront distingués. Les informations secondaires pourront être
regroupées ou révélées progressivement si leur fonction reste accessible. Les
tableaux conserveront un défilement local ou une composition adaptée lorsque les
colonnes sont nécessaires.

### Conserver les contrats d'interaction

Les adaptations visuelles ne changent pas les inputs, outputs, services, droits,
routes ou modèles API. Les contrôles restent nommés, atteignables au clavier,
visibles au focus et suffisamment grands pour le toucher.

## Risks / Trade-offs

- [Risque] Une composition mobile trop compacte réduit la lisibilité. ->
  Mitigation : vérifier les valeurs longues, le zoom, les deux thèmes et les
  tailles de texte avant de retenir une réduction.
- [Risque] Une adaptation propre à une page diverge des composants partagés. ->
  Mitigation : privilégier les primitives et composants communs, puis documenter
  toute exception locale.
- [Risque] Une progressive disclosure masque une information nécessaire. ->
  Mitigation : ne masquer que le contexte secondaire et conserver l'action ou la
  donnée essentielle au premier niveau.
- [Risque] Une largeur intermédiaire révèle un nouveau débordement. ->
  Mitigation : tester des largeurs situées entre les seuils existants avant d'ajouter
  un breakpoint.

## Migration Plan

1. Résoudre T-139, vérifier la branche dédiée et relire les décisions de T-138.
2. Inventorier les composants et parcourir les écrans sur les largeurs retenues.
3. Documenter la matrice problème, composant, règle responsive et exception.
4. Adapter d'abord le shell et les composants partagés, puis les composants locaux
   et pages des features, en gardant chaque groupe compilable.
5. Vérifier les interactions, les données, les deux thèmes et les contenus longs.
6. Exécuter les validations frontend, relire le diff et préparer la PR vers `main`.

Le retour arrière consiste à revert la PR T-139. Aucun changement de données,
contrat API ou migration n'est prévu.

## Open Questions

- Les seuils existants suffisent-ils pour tous les composants après l'audit des
  largeurs intermédiaires ?
- Quels composants bénéficient réellement d'une grille compacte sans perte de
  lisibilité pour les montants longs et le zoom utilisateur ?
- Quelles informations secondaires peuvent être regroupées sans dégrader les
  parcours par rôle ?
