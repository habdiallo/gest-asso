## ADDED Requirements

### Requirement: Cartes financières réutilisables

Le frontend SHALL fournir dans `shared/` un composant de carte financière
réutilisable par les listes Campagnes et Cagnottes. Le composant SHALL porter le
conteneur commun, le lien vers le détail, le statut, les montants, la progression
optionnelle et le pied de carte, tandis que chaque feature reste responsable du
mapping de ses données métier et de ses libellés.

#### Scenario: Carte de cotisation

- **WHEN** la liste Campagnes affiche une campagne renvoyée par l'API
- **THEN** elle utilise le composant partagé avec le nombre de membres, le nom,
  la période, le statut et le bilan financier autorisé
- **AND** l'objectif et la progression sont affichés uniquement quand le bilan
  financier est présent
- **AND** le clic et l'activation clavier conservent le lien vers le détail de
  la campagne

#### Scenario: Carte de cagnotte

- **WHEN** la liste Cagnottes affiche une cagnotte renvoyée par l'API
- **THEN** elle utilise le même composant avec le type d'événement, le titre, le
  bénéficiaire, la période, le statut et les informations financières disponibles
- **AND** une cagnotte sans objectif n'affiche ni séparateur montant/objectif ni
  barre de progression
- **AND** le clic et l'activation clavier conservent le lien vers le détail de
  la cagnotte

### Requirement: États visuels de la carte

Le composant SHALL reprendre les tokens du prototype pour son repos, son hover,
son focus-visible et ses états de statut. Le hover SHALL déplacer légèrement la
carte et renforcer sa bordure, le focus SHALL rester visible au clavier, et le
statut SHALL être compréhensible par son texte et son point coloré.

#### Scenario: Survol ou focus de la carte

- **WHEN** l'utilisateur survole ou atteint une carte au clavier
- **THEN** la carte conserve le fond et l'ombre du design, renforce la bordure
  dorée et applique un déplacement vertical de 2 px au survol
- **AND** le titre adopte l'accent doré au survol ou au focus
- **AND** aucun contenu métier ne disparaît

### Requirement: Listes compactes et ordonnées

Les listes Campagnes et Cagnottes SHALL demander au service API au maximum six
éléments par page et SHALL conserver la pagination au-delà de cette limite. Le
service SHALL renvoyer les éléments de la date de début la plus récente à la plus
ancienne, avec la date de fin comme départage secondaire. La carte SHALL conserver
le flux vertical du prototype, sans hauteur minimale, `h-full` ni espacement automatique
qui repousserait le bilan financier en bas de la carte.

#### Scenario: Première page desktop

- **WHEN** une liste contient plus de six campagnes ou cagnottes
- **THEN** la première requête demande une page de six éléments
- **AND** l'écran affiche au plus six cartes, dans une grille de trois colonnes
  lorsque la largeur desktop le permet
- **AND** les contrôles de pagination permettent d'ouvrir les éléments suivants

#### Scenario: Bilan financier compact

- **WHEN** une carte affiche son titre, sa période et son bilan financier
- **THEN** le montant commence après la marge verticale du prototype, sans espace
  extensible entre la période et le montant
- **AND** la hauteur de la carte est déterminée par son contenu

#### Scenario: Ordre des résultats

- **WHEN** plusieurs éléments ont des dates de début différentes
- **THEN** la première page commence par l'élément dont `startDate` est la plus récente
- **AND** le tri est appliqué avant le découpage en pages afin qu'un élément ne soit
  pas décalé entre deux pages
