## MODIFIED Requirements

### Requirement: Contrat API prioritaire

Les tickets SHALL traiter `contribo-back/src/main/resources/contribo-api.yml` comme source canonique et SHALL aligner le backend et le client Angular généré lors de toute modification.

#### Scenario: Contrat modifié

- **WHEN** un ticket ajoute ou modifie une opération API
- **THEN** la validation OpenAPI, la génération ou mise à jour des consommateurs et les tests de compatibilité sont inclus avant l'ouverture de la PR
