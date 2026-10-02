## ADDED Requirements

### Requirement: Rendu tolérant des informations optionnelles d'une cagnotte

La liste des cagnottes SHALL afficher les informations métier disponibles même lorsque les champs financiers optionnels `targetAmount` et `progressRate` sont absents ou renvoyés à `null`. Elle SHALL afficher la jauge et le comparatif collecté / objectif uniquement lorsqu'un objectif est défini.

#### Scenario: Cagnotte sans objectif avec champs optionnels absents

- **WHEN** l'API retourne une cagnotte sans `targetAmount` ni `progressRate`
- **THEN** la carte affiche le titre, le type d'événement, le bénéficiaire, la période, le statut et le montant collecté
- **AND** la carte n'affiche ni comparatif d'objectif ni barre de progression

#### Scenario: Cagnotte sans objectif avec champs optionnels sérialisés à null

- **WHEN** l'API retourne `targetAmount: null` ou `progressRate: null` pour une cagnotte sans objectif
- **THEN** la carte conserve les informations métier et le montant collecté
- **AND** le frontend ne tente pas de formater une valeur nulle
- **AND** la carte n'affiche ni comparatif d'objectif ni barre de progression

#### Scenario: Campagne avec objectif calculé par les membres affectés

- **WHEN** une campagne affiche sa jauge de cotisation
- **THEN** son objectif reste calculé à partir du cumul des membres affectés à la cotisation
- **AND** le traitement des cagnottes sans objectif ne modifie pas ce calcul
