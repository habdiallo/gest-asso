## ADDED Requirements

### Requirement: Isoler le frontend du client OpenAPI généré

Les consommateurs applicatifs SHALL importer les services, enums et modèles API
depuis `@core/api`. Le module `core/api/index.ts` SHALL être le seul module
applicatif à connaître le chemin `core/api/generated`, sans créer de DTO
concurrent ni contourner le client généré avec des URLs métier manuelles.

#### Scenario: Consommateur applicatif

- **WHEN** une feature, le socle, un composant partagé ou un mock utilise le contrat API
- **THEN** il importe depuis `@core/api` et ne référence ni `@api` ni un chemin `generated`

#### Scenario: Changement de générateur

- **WHEN** la sortie du générateur est déplacée ou régénérée
- **THEN** le point d'adaptation applicatif est limité à `core/api/index.ts` et à sa configuration d'alias

#### Scenario: Contrôle de livraison

- **WHEN** le ticket est validé
- **THEN** son périmètre est couvert par le code ou une décision documentée, ses validations sont tracées et ses dépendances sont respectées
