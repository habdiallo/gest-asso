## MODIFIED Requirements

### Requirement: Synchronisation des consommateurs

Après toute modification acceptée du contrat, le client Angular généré et les tests concernés SHALL être régénérés ou mis à jour depuis le contrat sans DTO concurrent non justifié.

#### Scenario: Changement compatible du schéma

- **WHEN** un champ ou une réponse est ajouté sans casser les consommateurs existants
- **THEN** le client et les tests du frontend reflètent le nouveau contrat avant la livraison

#### Scenario: Changement incompatible

- **WHEN** une opération, un champ obligatoire, une enum ou une réponse est modifié de façon incompatible
- **THEN** la PR documente l'impact, la stratégie de version ou de migration et les consommateurs à adapter

### Requirement: Vérification de dérive contractuelle

Les validations SHALL contrôler que le backend, le client Angular et les tests n'introduisent pas de contrat concurrent au fichier OpenAPI canonique `contribo-back/src/main/resources/contribo-api.yml`.

#### Scenario: Génération reproductible

- **WHEN** la génération est exécutée dans une branche propre avec les mêmes outils
- **THEN** elle produit un résultat stable ou un diff explicable et contrôlé
