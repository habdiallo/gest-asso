## MODIFIED Requirements

### Requirement: Création d'une campagne

Le frontend SHALL permettre à l'Administrateur et au Trésorier de créer une campagne (Nom, Description, Date de début, Date de fin, Membres concernés), avec la date de fin postérieure ou égale à la date de début (US-COT-001, RG-COT-001 à RG-COT-005), et SHALL transmettre `categoryAmounts` comme un tableau JSON conforme au contrat API lors de l'appel de création.

#### Scenario: Création réussie

- **WHEN** un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec un nom, une date de début et une date de fin valides
- **THEN** le frontend appelle l'API de création avec `categoryAmounts` sérialisé en tableau JSON
- **AND** l'API accepte la requête et le frontend affiche la nouvelle campagne dans la liste

#### Scenario: Le type généré utilise un Set mais le transport utilise un tableau

- **WHEN** le formulaire construit `categoryAmounts` avec le type `Set<CampaignCategoryAmount>` généré depuis `uniqueItems: true`
- **THEN** la frontière d'appel HTTP convertit les valeurs en tableau avant la sérialisation
- **AND** `JSON.stringify` du corps produit une propriété `categoryAmounts` contenant un tableau et non un objet vide

#### Scenario: Date de fin antérieure à la date de début

- **WHEN** un utilisateur saisit une date de fin antérieure à la date de début
- **THEN** le frontend bloque la soumission et affiche une erreur de validation sur les dates (RG-COT-005)

#### Scenario: Action masquée pour Opérateur et Membre

- **WHEN** un utilisateur Opérateur ou Membre consulte la liste des campagnes
- **THEN** le frontend n'affiche aucune action de création de campagne
