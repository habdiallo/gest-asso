# secure-cookie-session Specification

## Purpose
TBD - created by archiving change durcissement-securite-production. Update Purpose after archive.
## Requirements
### Requirement: Session d'authentification en cookie sécurisé

Le login SHALL établir la session avec un cookie de type `__Host-` portant `HttpOnly`, `Secure`, `SameSite=Strict` et `Path=/`, sans exposer le JWT dans le corps JSON ni dans un stockage accessible au JavaScript. La durée de validité de la session SHALL être limitée à 15 minutes au maximum pour ce ticket.

#### Scenario: Connexion réussie
- **WHEN** un compte actif fournit des identifiants valides à `POST /auth/login`
- **THEN** la réponse pose le cookie de session avec les attributs de sécurité requis
- **THEN** la réponse ne contient pas de JWT exploitable par le frontend

#### Scenario: Déconnexion
- **WHEN** l'utilisateur appelle l'action de déconnexion
- **THEN** le cookie de session est supprimé ou expiré côté serveur
- **THEN** une réutilisation de l'ancienne session échoue

### Requirement: Protection CSRF des requêtes mutantes

Le backend SHALL exiger un token CSRF valide sur les requêtes mutantes authentifiées. Le frontend SHALL transmettre ce token dans le header configuré et SHALL inclure les credentials nécessaires sans lire le cookie de session HttpOnly.

#### Scenario: Requête mutante avec token CSRF valide
- **WHEN** une requête mutante authentifiée contient le token CSRF attendu dans le header
- **THEN** la requête est traitée selon ses autorisations métier

#### Scenario: Requête mutante sans token CSRF
- **WHEN** une requête mutante authentifiée ne contient pas de token CSRF valide
- **THEN** le backend répond `403`
- **THEN** aucune mutation métier n'est exécutée

### Requirement: Contrat de login sans bearer token frontend

Le contrat OpenAPI SHALL décrire le cookie comme mécanisme de session et SHALL supprimer l'obligation de transmettre un `accessToken` du corps de `LoginResponse`. Le frontend SHALL supprimer la lecture, l'écriture et la suppression du JWT de session dans `localStorage`.

#### Scenario: Hydratation après rechargement
- **WHEN** l'application est rechargée avec un cookie de session valide
- **THEN** elle récupère l'utilisateur courant via l'API sans lire un token dans `localStorage`

#### Scenario: Tentative de stockage de session
- **WHEN** un login ou une déconnexion est exécuté
- **THEN** la clé de stockage du JWT n'est ni créée ni utilisée

