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
