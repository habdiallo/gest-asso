# pluralisation-i18n-francaise Specification

## Purpose
TBD - created by archiving change gerer-pluriels-interface. Update Purpose after archive.
## Requirements
### Requirement: Les libellés de comptage accordent le singulier et le pluriel

L'interface SHALL afficher un libellé français grammaticalement adapté à la valeur numérique fournie, sans utiliser la notation `(s)` pour représenter une variation de nombre.

#### Scenario: Un seul élément

- **WHEN** un compteur vaut `1`
- **THEN** le libellé affiche le nom au singulier, par exemple « 1 membre » ou « 1 campagne »

#### Scenario: Plusieurs éléments

- **WHEN** un compteur vaut au moins `2`
- **THEN** le libellé affiche le nom et les adjectifs associés au pluriel, par exemple « 2 membres actifs »

#### Scenario: Aucun élément

- **WHEN** un compteur vaut `0`
- **THEN** le libellé affiche la forme française définie pour ce message et ne contient aucun marqueur `(s)`

### Requirement: La pluralisation est portée par les traductions

Les règles d'accord SHALL être déclarées dans les messages Transloco français. Les composants et templates SHALL transmettre des nombres comme paramètres et SHALL NOT construire eux-mêmes les mots singulier ou pluriel avec des conditions ou une concaténation.

#### Scenario: Rendu d'une clé pluralisable

- **WHEN** un template utilise une clé pluralisable avec un paramètre numérique
- **THEN** Transloco résout la variante correspondant à la valeur et le template reste identique pour le singulier et le pluriel

#### Scenario: Phrase composée de plusieurs compteurs

- **WHEN** un message contient plusieurs compteurs, comme un nombre actif et un nombre total
- **THEN** chaque groupe nominal est accordé indépendamment selon son propre paramètre numérique

### Requirement: Les compteurs existants conservent leur sens et leurs paramètres

La migration SHALL conserver les clés réutilisées, les valeurs numériques et le sens métier des libellés. Elle SHALL NOT modifier le contrat API ni les données utilisées pour calculer les compteurs.

#### Scenario: Compteur issu d'une réponse API

- **WHEN** une vue affiche un compteur issu d'une donnée déjà chargée
- **THEN** la valeur numérique et la sélection de données restent inchangées, seul le texte rendu est adapté

#### Scenario: Absence de compteur

- **WHEN** une vue n'a pas de donnée numérique à afficher
- **THEN** elle conserve son état vide, de chargement ou d'erreur existant et ne rend pas un libellé pluralisé avec une valeur inventée

### Requirement: Les valeurs dynamiques restent du texte

Les messages français SHALL injecter les valeurs textuelles dynamiques avec des arguments ICU explicites. Le contenu fourni par une association SHALL NOT être interprété comme une expression MessageFormat.

#### Scenario: Nom contenant des accolades

- **WHEN** un nom de campagne, un bénéficiaire ou un autre texte saisi contient `{` ou `}`
- **THEN** l'interface affiche ces caractères tels quels sans erreur et sans valeur `undefined`

### Requirement: Les libellés concernés sont couverts par des tests de rendu

Les tests frontend SHALL couvrir les cas `0`, `1` et plusieurs pour les familles de libellés migrées, ainsi que l'absence de la notation `(s)` dans les sorties visibles concernées.

#### Scenario: Vérification des formes numériques

- **WHEN** la suite de tests rend une vue avec zéro, un puis plusieurs éléments
- **THEN** elle vérifie la forme française attendue pour chaque valeur et échoue si un marqueur `(s)` apparaît

#### Scenario: Régression d'une clé ou d'un paramètre

- **WHEN** une clé pluralisable est supprimée, mal paramétrée ou rendue avec une syntaxe invalide
- **THEN** un test de rendu ou de compilation échoue avant la livraison

