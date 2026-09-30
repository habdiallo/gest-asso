# rsa-jwt-authentication Specification

## Purpose
TBD - created by archiving change auth-rsa-portainer. Update Purpose after archive.
## Requirements
### Requirement: Les JWT de session sont signés en RSA

Le backend SHALL émettre les JWT de session avec l'algorithme RS256, la clé privée RSA configurée et le sujet UUID du compte authentifié. La durée d'expiration et le type Bearer de la réponse de login SHALL rester inchangés.

#### Scenario: Connexion réussie

- **WHEN** un compte actif fournit des identifiants valides
- **THEN** la réponse contient un access token Bearer signé RS256 dont le sujet est l'UUID du compte et dont l'expiration respecte la configuration

### Requirement: Les requêtes sont vérifiées avec la clé publique RSA

Le backend SHALL valider les JWT Bearer avec la clé publique RSA correspondante et SHALL conserver l'identifiant UUID attendu par les contrôleurs et services d'autorisation.

#### Scenario: Requête avec un JWT RS256 valide

- **WHEN** une requête protégée porte un JWT signé par la clé privée correspondante et non expiré
- **THEN** elle est authentifiée avec l'UUID du sujet et poursuit son traitement normal

#### Scenario: Requête avec un JWT mal signé ou expiré

- **WHEN** une requête protégée porte un JWT signé par une autre clé ou expiré
- **THEN** le backend répond 401 avec le format d'erreur d'authentification existant

### Requirement: Les clés sont chargées sans secret HMAC de secours

Le backend SHALL charger les clés depuis des ressources PEM classpath ou fichier, SHALL refuser une configuration absente ou invalide au démarrage, et SHALL ne plus utiliser `JWT_SECRET` pour émettre ou vérifier les sessions.

#### Scenario: Clés PEM fournies par secrets Docker

- **WHEN** `RSA_PUBLIC_KEY` et `RSA_PRIVATE_KEY` pointent vers des fichiers PEM lisibles
- **THEN** le backend démarre et utilise cette paire pour le login et les requêtes protégées

#### Scenario: Clé manquante ou invalide

- **WHEN** une ressource RSA est absente, illisible ou incompatible
- **THEN** le démarrage échoue avec une erreur de configuration explicite

