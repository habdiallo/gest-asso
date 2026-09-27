## Context

Le frontend est une application Angular 21 utilisant Tailwind CSS 4 via PostCSS,
avec des composants standalone organisés par features, `core/` et `shared/`. Le
thème CSS-first existe déjà dans `contribo-front/src/styles.css` : couleurs des
deux thèmes, polices `font-sans`, `font-display` et `font-data`, ainsi que
`rounded-card`, `rounded-modal` et plusieurs rayons génériques. T-137 est désormais
considéré comme fusionné dans la base fonctionnelle : l'audit doit donc inclure la
sidebar dont la destination dépend du rôle, la page `Mon accès`, le badge de statut
partagé et les usages de filtre et select déjà ajustés.

L'analyse initiale montre une convention partielle mais une forte répétition de
valeurs locales. Les occurrences les plus fréquentes comprennent `text-[9px]`,
`text-[13px]`, `text-[8px]`, des interlettrages `0.1em` et `0.13em`, `p-[22px]`,
`pb-[18px]`, `min-h-[48px]`, `max-w-[1440px]` et `rounded-[9px]`. Les pages
combinent aussi les seuils Tailwind `sm`, `md`, `lg`, `xl` avec des transitions
spécifiques à `821px` et `1180px`. Ces constats sont des hypothèses de départ,
à confirmer par un inventaire complet avant toute migration.

## Goals / Non-Goals

**Goals:**

- Produire un inventaire reproductible des valeurs et de leurs contextes, avec une
  synthèse `constats -> conventions -> incohérences -> patterns -> direction -> impact`.
- Décider quelles conventions sont suffisamment stables et fréquentes pour devenir
  des tokens Tailwind CSS 4 ou des classes partagées existantes.
- Harmoniser la hiérarchie des textes, les contrôles, les surfaces, les tableaux,
  les cartes, les KPI, les formulaires, les dialogues et les conteneurs sans changer
  le contenu métier.
- Conserver la lisibilité des valeurs numériques avec la police de données et les
  usages tabulaires déjà nécessaires.
- Définir les adaptations responsive par besoin réel et vérifier les largeurs
  intermédiaires, pas seulement les seuils de media query.
- Réduire la duplication CSS et les valeurs arbitraires répétées lorsque la
  conversion reste lisible et ne dégrade pas un besoin ponctuel.
- Laisser `main` fonctionnelle à chaque étape de la PR T-138.

**Non-Goals:**

- Repenser l'identité graphique, les couleurs, les parcours, les droits ou la
  hiérarchie fonctionnelle des écrans.
- Modifier le contrat OpenAPI, les DTO générés, les règles métier ou les données.
- Ajouter une bibliothèque de composants, une dépendance Tailwind ou un système
  de design parallèle aux utilities et composants déjà présents.
- Transformer toutes les valeurs locales en tokens ou tous les breakpoints en
  règles responsive.
- Introduire des container queries ou de nouveaux breakpoints sans preuve issue
  de l'audit et d'un cas de composant difficile à traiter par les seuils existants.

## Decisions

### Auditer avant de migrer

L'implémentation commence par un inventaire automatisé et une revue contextualisée.
Les recherches couvrent les classes Tailwind, les règles CSS, les variables `--*`,
les media queries, les dimensions et les usages par composant. Les valeurs sont
regroupées par rôle et par fréquence, puis vérifiées dans les templates afin de
ne pas confondre une convention avec une coïncidence de texte.

Alternative écartée : appliquer immédiatement une échelle standard issue d'un
framework. Elle imposerait des valeurs avant de connaître les besoins de densité
des tableaux, des KPI et des formulaires de Contribo.

### Traiter la maquette mobile comme une référence de composition

La capture mobile sert à comparer la structure et la densité des composants déjà
présents : rythme du shell, largeur des actions, composition des cartes, empilement
des sections, lisibilité des listes et navigation basse. Elle ne constitue pas un
backlog de fonctionnalités. Les données, sections, KPI, liens et actions restent
ceux fournis par le produit actuel et ses contrats.

Alternative écartée : reproduire tout le dashboard visible dans la capture. Cela
transformerait une référence de mise en page en extension fonctionnelle et sortirait
du périmètre d'harmonisation.

### Utiliser le thème CSS-first de Tailwind comme source des primitives

Les conventions confirmées seront exposées dans `@theme inline` de `styles.css`,
en conservant les références aux variables de thème clair et sombre. Les tokens
de rayon suivront le namespace `--radius-*`, et les autres namespaces ne seront
ajoutés que lorsque le projet en démontre l'usage répété et le bénéfice de
maintenance. Les utilities générées resteront le point d'entrée des templates.

Alternative écartée : créer une feuille de classes métier concurrente qui
reproduirait les utilities Tailwind. Cela masquerait les exceptions et créerait
deux sources de vérité.

### Distinguer les niveaux sémantiques des valeurs brutes

La hiérarchie sera décrite par rôle : titre de page, titre de section, texte
courant, texte secondaire, label, en-tête de tableau, valeur numérique, KPI,
action et aide. Une valeur ne deviendra pas un token uniquement parce qu'elle
apparaît plusieurs fois. Elle doit aussi représenter un rôle stable, avoir un
gain de cohérence et ne pas empêcher une exception locale documentée.

La typographie des grands titres pourra rester responsive si l'audit montre un
gain de hiérarchie sans perte de lisibilité. Les textes de tableaux, labels et
contrôles resteront stables lorsque leur densité et leur accessibilité l'exigent.

### Conserver des niveaux de rayon compréhensibles

Les contrôles, surfaces de carte, panneaux, dialogues, pastilles et cercles
seront comparés séparément. Les valeurs déjà confirmées comme `rounded-card` et
`rounded-modal` seront conservées ou ajustées seulement si l'inventaire démontre
une convention concurrente plus représentative. Les rayons circulaires et les
petites pastilles resteront des formes sémantiques, pas des variantes de panneau.

### Stabiliser le layout par conteneur et par composition

Les pages partageront les primitives de largeur maximale, de padding horizontal,
de rythme vertical et de grille uniquement lorsque le même besoin est présent.
Les tableaux garderont leur conteneur de défilement local. Les `min-width`, `minmax`
et retours à la ligne seront conservés quand ils protègent des données lisibles.
Une container query ne sera retenue que pour un composant réutilisé dans des
conteneurs de largeurs différentes, avec un comportement impossible à exprimer
clairement par les breakpoints de page.

### Migrer par familles de composants

L'ordre de migration sera : thème global et primitives, composants `shared`, shell
et navigation, pages de liste et tableaux, pages de détail et formulaires, puis
contrôle des exceptions. Chaque groupe sera vérifié avant de modifier le suivant.
Les features ne s'importeront pas entre elles ; les abstractions transverses
restent dans `shared/` et les règles globales dans `styles.css` ou `app.css`.

### Vérifier les transitions, pas seulement les breakpoints

La vérification couvrira au minimum mobile étroit, mobile large, tablette,
desktop intermédiaire et desktop large, avec des largeurs situées entre les
seuils utilisés par le projet. Elle observera le débordement horizontal de la
page, les tableaux, les dialogues, les formulaires, la navigation, les sidebars,
les cartes, les grilles, les contenus longs et les états vides. Les contrôles
clavier, le focus visible et le contraste des deux thèmes restent obligatoires.

## Risks / Trade-offs

- [Risque] Une migration globale modifie plusieurs features simultanément. ->
  Mitigation : inventorier les usages, migrer par familles, garder un diff ciblé
  et vérifier les tests des composants partagés et des pages touchées.
- [Risque] Un token trop générique efface une exception justifiée. -> Mitigation :
  conserver les valeurs locales rares lorsqu'elles répondent à un besoin de contenu,
  de densité ou de composition documenté dans l'audit.
- [Risque] La réduction de tailles ou d'interlettrages nuit à la lisibilité. ->
  Mitigation : maintenir des niveaux stables pour les tableaux et contrôles,
  vérifier le clavier et les contenus longs, et comparer les deux thèmes.
- [Risque] Les breakpoints actuels ne couvrent pas une transition intermédiaire. ->
  Mitigation : tester des largeurs intermédiaires et corriger la composition avec
  `min-width: 0`, grilles fluides, empilement ou défilement local avant d'ajouter
  un nouveau seuil.
- [Risque] Une utility Tailwind générée à partir d'une variable de thème ne suit
  pas correctement le thème actif. -> Mitigation : conserver `@theme inline`,
  vérifier le CSS généré par le build et tester le thème sombre et le thème clair.
- [Risque] Les tests DOM deviennent trop couplés aux classes de présentation. ->
  Mitigation : ne vérifier les classes que lorsqu'elles représentent une convention
  contractuelle, et conserver des assertions comportementales séparées.

## Migration Plan

1. Résoudre T-138, vérifier la branche `front/refactor-138-harmoniser-systeme-visuel`
   et confirmer que la version fusionnée de T-137 est disponible dans l'ascendance
   avant toute modification applicative. Si nécessaire, recréer ou rebaser la
   branche T-138 depuis le `main` mis à jour, sans reprendre de modifications
   étrangères.
2. Produire l'audit des classes, tokens, media queries, dimensions et doublons CSS,
   puis consigner la synthèse courte et la matrice des décisions dans les artefacts
   du change ou dans la PR avant les modifications structurelles.
3. Définir l'échelle retenue, les tokens justifiés, les exceptions locales et la
   stratégie responsive. Vérifier que chaque token proposé couvre plusieurs usages
   cohérents et qu'aucun breakpoint n'est ajouté par convenance.
4. Mettre à jour `contribo-front/src/styles.css` et, si nécessaire, `app.css` pour
   exposer les primitives CSS-first retenues. Ne pas modifier les couleurs ou le
   contenu fonctionnel.
5. Migrer les composants `shared/`, le shell et les pages concernées par familles,
   en conservant les frontières d'architecture et les comportements existants.
6. Ajuster les tests de présentation nécessaires, exécuter les tests ciblés, la
   suite frontend, le lint, le format check et le build selon les fichiers touchés.
7. Vérifier visuellement les thèmes et les largeurs de référence et intermédiaires,
   puis documenter les écarts restant volontairement locaux.
8. Relire le diff et les tâches T-138, exécuter les contrôles OpenSpec et tickets,
   puis préparer une PR ciblée vers `main` sans push direct ni fusion.

Le retour arrière consiste à revert la PR T-138. Aucun changement de schéma, de
donnée persistée ou de contrat API n'est prévu.

## Open Questions

- La version de `main` utilisée pour l'implémentation contient-elle bien la fusion
  T-137 et ses artefacts OpenSpec, afin que l'audit parte de l'état réellement livré ?
- L'audit confirmera-t-il que les seuils spécifiques `821px` et `1180px` sont des
  conventions produit, ou certains peuvent-ils être remplacés par les seuils
  Tailwind existants sans dégrader les dialogues et la navigation ?
- Quels tokens d'espacement et de hauteur apportent un gain suffisant pour être
  ajoutés au thème, plutôt que de conserver les utilities Tailwind natives ?
- Les tableaux réutilisés ont-ils besoin d'un composant de présentation commun,
  ou les primitives et `app-data-table` suffisent-elles après harmonisation ?
La capture mobile fournie est une référence d'agencement, pas une spécification de
contenu. Elle montre notamment un shell compact, un titre avec action pleine largeur,
des cartes KPI en deux colonnes lorsque l'espace le permet, des sections empilées,
des surfaces de listes lisibles et une navigation basse. L'audit doit vérifier si
les composants existants peuvent produire cette densité et ces transitions, mais ne
doit pas ajouter les blocs métier, textes, KPI ou actions présents uniquement dans
la capture du dashboard.
