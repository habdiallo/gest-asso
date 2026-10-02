# api-design-first-governance Specification

## Purpose
TBD - created by archiving change cadrer-backend-deploiement-reference. Update Purpose after archive.
## Requirements
### Requirement: Contrat OpenAPI canonique

`contribo-back/src/main/resources/contribo-api.yml` SHALL rester l'unique source de vérité versionnée pour les endpoints, schémas, erreurs, autorisations déclarées et versions de l'API du MVP.

#### Scenario: Nouvelle opération backend

- **WHEN** une opération API est nécessaire pour une fonctionnalité validée
- **THEN** son chemin, son operationId, ses schémas, ses erreurs et ses règles d'accès sont d'abord définis dans `contribo-back/src/main/resources/contribo-api.yml`

#### Scenario: Contrat absent ou invalide

- **WHEN** la validation OpenAPI échoue
- **THEN** aucune génération de client ou d'interface serveur n'est considérée comme livrable

### Requirement: Synchronisation des consommateurs

Après toute modification acceptée du contrat, le client Angular généré et les tests concernés SHALL être régénérés ou mis à jour depuis le contrat sans DTO concurrent non justifié.

#### Scenario: Changement compatible du schéma

- **WHEN** un champ ou une réponse est ajouté sans casser les consommateurs existants
- **THEN** le client et les tests du frontend reflètent le nouveau contrat avant la livraison

#### Scenario: Changement incompatible

- **WHEN** une opération, un champ obligatoire, une enum ou une réponse est modifié de façon incompatible
- **THEN** la PR documente l'impact, la stratégie de version ou de migration et les consommateurs à adapter

### Requirement: Vérification de dérive contractuelle

Les validations SHALL contrôler que le backend, le client Angular et les tests n'introduisent pas de contrat concurrent au fichier OpenAPI canonique.

#### Scenario: Génération reproductible

- **WHEN** la génération est exécutée dans une branche propre avec les mêmes outils
- **THEN** elle produit un résultat stable ou un diff explicable et contrôlé

### Requirement: Autorisations cohérentes avec le contrat

Le backend SHALL appliquer les exigences d'authentification et d'autorisation documentées par opération, sans ajouter de droits issus du dépôt de référence.

#### Scenario: Compte non autorisé

- **WHEN** un compte authentifié ne possède pas le rôle ou l'autorisation requis par l'opération
- **THEN** l'API répond par le refus prévu dans le contrat et ne modifie aucune donnée
