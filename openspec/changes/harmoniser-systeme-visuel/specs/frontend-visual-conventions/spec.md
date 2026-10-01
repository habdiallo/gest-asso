## ADDED Requirements

### Requirement: Hiérarchie typographique explicite

Le frontend SHALL définir et documenter une hiérarchie de rôles couvrant au minimum
les titres de page, titres de section, textes courants, textes secondaires, labels,
en-têtes de tableau, valeurs numériques, KPI et actions. Chaque rôle SHALL utiliser
une convention identifiable et les niveaux réellement responsive SHALL être justifiés
par la lisibilité, la hiérarchie ou la densité observées dans l'audit.

#### Scenario: Texte d'un écran principal

- **WHEN** un écran principal affiche un titre, une description, un label, une cellule
  de tableau ou une valeur financière
- **THEN** chaque texte utilise le niveau typographique correspondant à son rôle,
  avec une famille, une taille, une graisse, une hauteur de ligne et un interlettrage
  cohérents avec la convention documentée

#### Scenario: Niveau stable ou responsive

- **WHEN** l'audit compare le même rôle sur plusieurs largeurs
- **THEN** le rôle reste stable si sa variation n'améliore pas la lisibilité ou la
  hiérarchie, et ne varie que sur les largeurs où l'adaptation est justifiée

### Requirement: Tokens Tailwind CSS 4 justifiés par l'usage

Les conventions globales confirmées SHALL être exposées dans le thème CSS-first de
Tailwind CSS 4 lorsque cela réduit la duplication et reste compréhensible dans les
templates. Une valeur rare, contextuelle ou propre à une composition SHALL rester
locale et ne SHALL pas devenir un token uniquement pour supprimer une valeur
arbitraire.

#### Scenario: Convention répétée

- **WHEN** une même valeur apparaît dans plusieurs features pour un rôle identique
  et que l'audit confirme sa stabilité
- **THEN** le thème expose un token ou une utility native correspondant à cette
  convention, et les usages migrés consomment cette source commune

#### Scenario: Exception locale justifiée

- **WHEN** une valeur ne sert qu'un composant, une densité de tableau ou une
  contrainte de contenu identifiée dans l'audit
- **THEN** elle reste locale, est documentée comme exception et n'entraîne pas la
  création d'un token global concurrent

### Requirement: Logique de rayons par niveau de composant

Les rayons SHALL être organisés par rôle de composant, au minimum contrôles,
cartes ou panneaux, dialogues, pastilles et formes circulaires. Les utilities
Tailwind du namespace `--radius-*` SHALL être utilisées pour les niveaux récurrents,
et les valeurs locales SHALL être conservées uniquement lorsqu'une variation est
visuellement ou fonctionnellement justifiée.

#### Scenario: Contrôle et surface

- **WHEN** un écran affiche un bouton ou un champ à côté d'une carte, d'un panneau
  ou d'un dialogue
- **THEN** chacun utilise le niveau de rayon de son rôle et aucun rayon de surface
  n'est appliqué par simple répétition locale à un contrôle

#### Scenario: Pastille ou cercle

- **WHEN** un composant affiche un statut, un avatar, une icône ou une pastille
- **THEN** sa forme circulaire ou compacte reste distincte du rayon des cartes et
  conserve son nom accessible et son contenu

### Requirement: Primitives d'espacement et de dimension proportionnées

Les valeurs de padding, margin, gap, hauteur, largeur, conteneur et séparation de section SHALL être regroupées en quelques primitives seulement lorsque l'audit
confirme un pattern récurrent. Les composants SHALL conserver les valeurs locales
nécessaires aux tableaux, dialogues, textes longs et états spécifiques.

#### Scenario: Usage répété dans plusieurs features

- **WHEN** le même espacement interne ou la même largeur de conteneur est utilisé
  par plusieurs pages ou composants partagés
- **THEN** les usages concernés consomment la primitive commune sans changer le
  contenu, la structure ou le comportement du composant

#### Scenario: Besoin ponctuel

- **WHEN** un composant nécessite une dimension particulière pour éviter un
  débordement, préserver une donnée ou respecter une composition du prototype
- **THEN** la valeur ponctuelle est conservée et identifiée comme exception plutôt
  que remplacée artificiellement par une primitive voisine

### Requirement: Audit visuel reproductible avant migration

Le change SHALL conserver une synthèse courte et vérifiable des constats, conventions,
incohérences, patterns récurrents, direction proposée et impact estimé avant toute
modification structurelle du thème ou des composants.

#### Scenario: Audit complet

- **WHEN** la phase d'audit est terminée
- **THEN** le relevé inclut les fréquences, les composants concernés, les valeurs
  répétées, les tokens existants, les media queries, les règles CSS dupliquées,
  les exceptions et les décisions globales ou locales

#### Scenario: Décision de migration

- **WHEN** une valeur est proposée comme token global
- **THEN** la synthèse relie explicitement la valeur à ses usages, son gain de
  maintenance et les composants qui seront migrés
