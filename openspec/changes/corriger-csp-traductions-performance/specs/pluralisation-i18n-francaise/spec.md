## MODIFIED Requirements

### Requirement: La pluralisation est portée par les traductions

Les règles d'accord SHALL être déclarées dans les messages Transloco français. Les composants et templates SHALL transmettre des nombres comme paramètres et SHALL NOT construire eux-mêmes les mots singulier ou pluriel avec des conditions ou une concaténation. Le mécanisme de résolution SHALL fonctionner sous la CSP de l'application sans exécuter de code dynamique interdit.

#### Scenario: Rendu d'une clé pluralisable

- **WHEN** un template utilise une clé pluralisable avec un paramètre numérique
- **THEN** Transloco résout la variante correspondant à la valeur
- **THEN** le rendu ne déclenche pas `unsafe-eval` et le template reste identique pour le singulier et le pluriel

#### Scenario: Phrase composée de plusieurs compteurs

- **WHEN** un message contient plusieurs compteurs, comme un nombre actif et un nombre total
- **THEN** chaque groupe nominal est accordé indépendamment selon son propre paramètre numérique
- **THEN** le rendu reste fonctionnel avec la CSP restrictive

### Requirement: Les libellés concernés sont couverts par des tests de rendu

Les tests frontend SHALL couvrir les cas `0`, `1` et plusieurs pour les familles de libellés migrées, ainsi que l'absence de la notation `(s)` dans les sorties visibles concernées. Les tests SHALL aussi vérifier qu'une configuration CSP restrictive ne produit pas d'erreur de compilation dynamique lors du rendu.

#### Scenario: Vérification des formes numériques

- **WHEN** la suite de tests rend une vue avec zéro, un puis plusieurs éléments
- **THEN** elle vérifie la forme française attendue pour chaque valeur et échoue si un marqueur `(s)` apparaît

#### Scenario: Régression CSP d'une clé ou d'un paramètre

- **WHEN** une clé pluralisable est supprimée, mal paramétrée ou rendue avec une syntaxe nécessitant une évaluation dynamique interdite
- **THEN** un test de rendu ou de compilation échoue avant la livraison
