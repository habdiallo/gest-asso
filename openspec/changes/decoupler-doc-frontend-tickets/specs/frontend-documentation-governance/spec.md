## ADDED Requirements

### Requirement: Découpler la documentation frontend des travaux

La documentation de référence du frontend SHALL décrire les comportements,
responsabilités et contrats stables sans dépendre des identifiants de travaux.

#### Scenario: Documentation sans identifiant volatile

- **WHEN** le contrôle de documentation s'exécute
- **THEN** le README et les documents frontend de référence ne contiennent pas de
  numéro de ticket ou d'identifiant de user story

#### Scenario: Traçabilité séparée

- **WHEN** un mainteneur doit retrouver l'origine d'un comportement
- **THEN** il consulte OpenSpec ou les tests de traçabilité sans transformer cet
  identifiant en vocabulaire de la documentation d'architecture
