## ADDED Requirements

### Requirement: Stabilité entre les seuils responsive

Les pages et composants SHALL rester utilisables sur toute la largeur comprise
entre deux seuils de responsive, et pas uniquement aux valeurs exactes des
breakpoints. Le document ou la vérification du change SHALL couvrir l'absence de
débordement horizontal involontaire, de texte tronqué inutilement et de grille
instable.

#### Scenario: Largeur intermédiaire

- **WHEN** la fenêtre est placée entre deux breakpoints utilisés par le projet
- **THEN** le contenu reste lisible, les actions restent accessibles et aucun
  défilement horizontal de la page n'apparaît en dehors des conteneurs qui le
  nécessitent explicitement

#### Scenario: Contenu long

- **WHEN** un titre, un label, un nom, une catégorie ou une valeur longue est affiché
- **THEN** le composant conserve une mise en page lisible sans troncature inutile,
  chevauchement ni perte de l'action associée

### Requirement: Responsive décidé par besoin réel

La stratégie responsive SHALL distinguer les rôles qui doivent changer de taille,
de structure ou d'empilement de ceux qui doivent rester stables pour préserver la
densité, la lisibilité et l'accessibilité. Elle SHALL éviter d'ajouter un breakpoint
ou une variation typographique pour une seule résolution sans problème observé.

#### Scenario: Texte stable

- **WHEN** une taille de texte de tableau, de label ou de contrôle reste lisible sur
  les largeurs vérifiées
- **THEN** sa taille reste stable et seul son conteneur, son retour à la ligne ou
  sa composition s'adapte si nécessaire

#### Scenario: Structure adaptée

- **WHEN** une grille, une navigation, un dialogue ou un tableau ne peut plus
  conserver sa composition sans perte de lisibilité
- **THEN** le composant s'empile, se recompose ou défile localement au seuil justifié
  par l'audit, avec un comportement stable avant et après ce seuil

### Requirement: Conteneurs et grilles cohérents

Les pages SHALL utiliser une logique cohérente de largeur maximale, de padding
horizontal et d'espacement de section. Les grilles SHALL préserver les colonnes
utiles et leurs contraintes minimales, tout en permettant l'empilement ou le
redimensionnement lorsque l'espace disponible l'exige.

#### Scenario: Page métier

- **WHEN** un utilisateur consulte plusieurs pages de liste ou de détail à la même
  largeur
- **THEN** les conteneurs présentent un alignement horizontal et un rythme de
  section cohérents, sauf exception documentée par le contenu de la page

#### Scenario: Carte ou panneau réutilisé

- **WHEN** un composant partagé est placé dans des conteneurs de largeurs différentes
- **THEN** sa composition reste stable sans dépendre d'une largeur de page unique,
  et une container query n'est introduite que si les breakpoints de fenêtre ne
  permettent pas d'exprimer clairement ce comportement

### Requirement: Comportement responsive des composants critiques

Les tableaux, formulaires, dialogues, navigation, sidebars, cartes, grilles, états vides et actions principales SHALL rester accessibles et fonctionnels sur
mobile, tablette, desktop intermédiaire et desktop large, dans les deux thèmes.

#### Scenario: Dialogue et formulaire

- **WHEN** un formulaire est ouvert sur mobile, tablette ou desktop
- **THEN** il conserve son nom, ses labels, ses actions, son focus visible et sa
  validation, avec la composition dialogue ou plein écran prévue par le shell

#### Scenario: Tableau de données

- **WHEN** un tableau dépasse la largeur disponible
- **THEN** son conteneur gère le défilement local ou la composition mobile prévue,
  sans élargir la page entière ni masquer les informations essentielles

#### Scenario: Navigation et sidebar

- **WHEN** la largeur passe progressivement d'un format desktop à mobile
- **THEN** la navigation ne recouvre pas le contenu, les destinations restent
  accessibles au clavier et l'état actif reste identifiable

### Requirement: Référence mobile sans extension fonctionnelle

La capture mobile fournie SHALL servir à évaluer l'agencement, la densité et les
transitions des composants déjà présents. Elle SHALL NOT entraîner l'ajout de
sections, KPI, données, liens, actions ou parcours qui ne sont pas supportés par
le produit actuel et ses contrats.

#### Scenario: Comparaison d'agencement

- **WHEN** l'audit compare une page existante à la capture mobile
- **THEN** il évalue le shell compact, la hiérarchie du titre, l'action pleine
  largeur, les cartes en colonnes, l'empilement des sections, les surfaces de
  listes et la navigation basse selon l'espace réellement disponible

#### Scenario: Contenu absent de la capture fonctionnelle

- **WHEN** un bloc métier visible dans la capture n'existe pas dans le produit
  ou son contrat courant
- **THEN** le bloc n'est pas ajouté dans T-138 et l'analyse porte uniquement sur
  les conventions de mise en page réutilisables
