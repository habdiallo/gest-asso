## ADDED Requirements

### Requirement: Analyse de référence traçable

L'analyse SHALL distinguer les fichiers versionnés du dépôt de référence et ses modifications locales avant de retenir une information technique.

#### Scenario: Référence avec arbre de travail modifié

- **WHEN** le dépôt de référence contient des fichiers modifiés ou supprimés localement
- **THEN** l'analyse utilise `HEAD` comme base de décision et signale l'arbre de travail comme non validé

### Requirement: Classification de chaque reprise

Chaque pattern ou composant candidat SHALL être classé comme réutilisable tel quel, adaptable ou à écarter, avec sa justification et son impact sur Contribo.

#### Scenario: Pattern technique générique

- **WHEN** un élément ne porte aucune règle métier et peut respecter les contraintes du projet actuel
- **THEN** l'analyse indique les conditions de sa réutilisation et les validations nécessaires

#### Scenario: Élément métier de la référence

- **WHEN** un élément contient une entité, une permission, une transition ou une règle absente du projet actuel
- **THEN** l'analyse le classe à écarter par défaut et ne le transforme pas en exigence Contribo

### Requirement: Priorité aux sources fonctionnelles actuelles

Les décisions fonctionnelles SHALL être dérivées du cahier actuel, des specs OpenSpec et du contrat `besoins/openapi.yaml`, jamais d'une fonctionnalité de la référence prise isolément.

#### Scenario: Divergence entre les dépôts

- **WHEN** le dépôt de référence propose un comportement différent du contrat ou du cahier actuel
- **THEN** le comportement actuel reste prioritaire et la divergence est documentée comme question ou change séparé
