## ADDED Requirements

### Requirement: Contrat d'identité membre ou externe

Le contrat OpenAPI SHALL représenter une contribution avec exactement un contributeur membre ou externe. La variante membre utilise `memberId`. La variante externe utilise un objet `externalContributor` contenant un `firstName` et un `lastName` non vides, bornés en longueur et sans donnée de contact supplémentaire.

#### Scenario: Requête membre valide

- **WHEN** `CreateContributionRequest` contient un `memberId`, un montant positif, une date et un mode valide
- **THEN** l'API accepte la contribution si les droits et le statut de la cagnotte l'autorisent
- **AND** `externalContributor` est absent ou nul

#### Scenario: Requête externe valide

- **WHEN** `CreateContributionRequest` contient `externalContributor.firstName` et `externalContributor.lastName`, un montant positif, une date et un mode valide
- **THEN** l'API accepte la contribution si les droits et le statut de la cagnotte l'autorisent
- **AND** `memberId` est absent ou nul

#### Scenario: Requête avec identité absente ou double

- **WHEN** la requête ne contient ni `memberId` ni `externalContributor`, ou contient les deux
- **THEN** l'API répond avec une erreur de validation `400`
- **AND** aucune écriture financière n'est créée

#### Scenario: Nom externe invalide

- **WHEN** le prénom ou le nom externe est vide, dépasse la limite contractuelle ou ne contient pas de caractère non blanc
- **THEN** l'API répond avec une erreur de validation `400`
- **AND** le détail identifie le champ invalide lorsque le contrat le permet

### Requirement: Représentation d'une contribution externe

La réponse `Contribution` SHALL rendre `member` nullable et SHALL exposer `externalContributor` nullable. Le serveur SHALL garantir qu'exactement un des deux est renseigné, avec l'utilisateur et l'horodatage de saisie conservés pour les deux variantes.

#### Scenario: Lecture d'une contribution membre

- **WHEN** une contribution liée à un membre est retournée
- **THEN** `member` contient le résumé du membre
- **AND** `externalContributor` vaut `null` ou est absent selon la forme contractuelle retenue

#### Scenario: Lecture d'une contribution externe

- **WHEN** une contribution liée à un contributeur externe est retournée
- **THEN** `member` vaut `null` ou est absent selon la forme contractuelle retenue
- **AND** `externalContributor` contient le prénom et le nom conservés lors de l'enregistrement
- **AND** `recordedBy` et `recordedAt` restent disponibles

### Requirement: Agrégats et espace membre

Le serveur SHALL conserver des agrégats cohérents pour les contributions membres et externes. Une contribution externe ne SHALL pas apparaître dans l'espace personnel d'un membre ni être considérée comme une contribution du membre connecté.

#### Scenario: Bilan d'une cagnotte avec un externe

- **WHEN** une cagnotte contient des contributions membres et externes
- **THEN** `collectedAmount` et `contributionCount` incluent toutes les contributions acceptées
- **AND** `contributorCount` applique la règle documentée des identités membres et des paires de noms externes normalisées

#### Scenario: Historique personnel d'un membre

- **WHEN** le membre connecté consulte `/me/contributions`
- **THEN** seules les contributions liées à son `memberId` sont retournées
- **AND** les contributions externes ou celles d'autres membres ne sont pas exposées dans cet espace

#### Scenario: Historique autorisé d'une cagnotte

- **WHEN** un utilisateur autorisé consulte les contributions d'une cagnotte
- **THEN** l'historique distingue les contributions membres et externes
- **AND** les mêmes règles de pagination, d'autorisation et de consultation sont conservées

### Requirement: Protection et conservation de l'identité externe

Le système SHALL conserver l'identité externe comme un instantané minimal de l'opération, sans créer de membre, et SHALL appliquer les règles de protection des données aux affichages, logs et réponses.

#### Scenario: Contribution externe enregistrée

- **WHEN** une contribution externe est acceptée
- **THEN** aucun compte ni profil membre n'est créé
- **AND** le prénom et le nom sont conservés avec l'écriture pour préserver son historique

#### Scenario: Utilisateur sans droit financier

- **WHEN** un utilisateur non autorisé tente d'enregistrer une contribution membre ou externe
- **THEN** l'API répond `403`
- **AND** aucune donnée financière ou identité externe n'est enregistrée
