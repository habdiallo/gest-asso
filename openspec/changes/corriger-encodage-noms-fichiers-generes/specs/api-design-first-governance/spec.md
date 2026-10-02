## ADDED Requirements

### Requirement: Tags du contrat en ASCII

Les tags OpenAPI de `contribo-back/src/main/resources/contribo-api.yml` SHALL être composés uniquement de
caractères ASCII, pour garantir une génération de code reproductible côté
client Angular et côté interfaces backend avec les générateurs actuellement
épinglés.

#### Scenario: Ajout d'un nouveau tag

- **WHEN** une opération nécessite un nouveau tag dans `contribo-back/src/main/resources/contribo-api.yml`
- **THEN** ce tag ne contient aucun caractère accentué ou non-ASCII

#### Scenario: Tag existant accentué détecté en revue

- **WHEN** un tag accentué est proposé ou constaté dans le contrat
- **THEN** la PR corrige le tag en équivalent ASCII avant la génération et la fusion
