## MODIFIED Requirements

### Requirement: Normalisation des noms indépendante de la locale PostgreSQL

La migration corrective des identifiants membres SHALL produire le même préfixe pour une même combinaison de prénom et de nom, quelle que soit la locale PostgreSQL prise en charge. Elle SHALL traiter explicitement les majuscules accentuées avant la suppression des accents et des séparateurs.

#### Scenario: Nom accentué en locale C

- **WHEN** la migration est exécutée sur une base PostgreSQL de locale C avec un prénom ou un nom contenant `É`, `À`, `Ç` ou une autre lettre accentuée prise en charge
- **THEN** la normalisation produit le préfixe ASCII attendu
- **AND** elle ne dépend pas d'un résultat implicite de `lower()`

### Requirement: Correction conservatrice des identifiants déjà migrés

La migration corrective SHALL cibler uniquement les comptes inventoriés par `user_account_identifier_migration_t200`. Elle SHALL conserver le suffixe numérique à quatre chiffres, les données du compte et l'historique T-200, et SHALL enregistrer chaque valeur effectivement corrigée dans un audit T-204.

#### Scenario: Identifiant V4 à corriger

- **WHEN** le préfixe calculé avec la normalisation indépendante de la locale diffère de celui de l'identifiant courant
- **THEN** l'identifiant est corrigé avec le même suffixe numérique
- **AND** une ligne d'audit contient l'ancienne et la nouvelle valeur
- **AND** l'UUID, le hash du mot de passe, le rôle, le membre et l'historique restent inchangés

#### Scenario: Identifiant déjà conforme

- **WHEN** l'identifiant courant respecte déjà la normalisation canonique
- **THEN** aucune mise à jour n'est effectuée
- **AND** aucune ligne d'audit inutile n'est créée

#### Scenario: Collision pendant la correction

- **WHEN** la nouvelle valeur existe déjà dans la même association pour un autre compte
- **THEN** la migration échoue avec une erreur explicite
- **AND** aucune correction partielle n'est conservée
