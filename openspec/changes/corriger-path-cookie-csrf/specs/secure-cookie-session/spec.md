## MODIFIED Requirements

### Requirement: Protection CSRF des requêtes mutantes

Le backend SHALL émettre le cookie lisible `XSRF-TOKEN` avec `Path=/`, indépendamment du context-path de l'API, afin qu'une page du SPA puisse le lire. Le cookie CSRF SHALL rester non `HttpOnly` et ne SHALL contenir aucun secret de session. Le backend SHALL exiger un token CSRF valide sur les requêtes mutantes authentifiées par cookie de session. Le frontend SHALL transmettre ce token dans le header configuré et SHALL inclure les credentials nécessaires sans lire le cookie de session HttpOnly.

#### Scenario: Cookie CSRF accessible depuis les routes du SPA

- **WHEN** un client appelle `GET /auth/csrf` avec un context-path serveur `/api/v1`
- **THEN** la réponse pose un cookie `XSRF-TOKEN` avec `Path=/`
- **THEN** le cookie CSRF n'est pas `HttpOnly` et le cookie de session n'est pas rendu lisible par JavaScript

#### Scenario: Requête mutante avec token CSRF valide

- **WHEN** une requête mutante authentifiée par cookie de session contient le token lu depuis `XSRF-TOKEN` dans le header `X-XSRF-TOKEN`
- **THEN** la requête est traitée selon ses autorisations métier

#### Scenario: Requête mutante sans token CSRF

- **WHEN** une requête mutante authentifiée par cookie de session ne contient pas de token CSRF valide
- **THEN** le backend répond `403`
- **THEN** aucune mutation métier n'est exécutée

#### Scenario: Requête GET sans header CSRF

- **WHEN** un client authentifié appelle une ressource GET sans header CSRF
- **THEN** la requête reste accessible selon son authentification et ses autorisations, car le token CSRF n'est pas requis pour une lecture
