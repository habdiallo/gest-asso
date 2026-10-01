# api-v1-base-path Specification

## Purpose
TBD - created by archiving change aligner-backend-api-v1. Update Purpose after archive.
## Requirements
### Requirement: Le backend expose le contrat sous le préfixe /api/v1
Le backend Spring Boot (`contribo-back`) SHALL exposer l'intégralité des chemins définis dans
`besoins/openapi.yaml` (authentification et ressources métier) sous le préfixe `/api/v1`, via le
context-path du serveur, sans qu'aucun proxy intermédiaire (Nginx, proxy de développement Angular)
n'ait à réécrire les chemins pour que le contrat soit respecté.

#### Scenario: Connexion directe au backend sans proxy
- **WHEN** un client envoie `POST /api/v1/auth/login` directement au backend (ex.
  `http://localhost:8080/api/v1/auth/login` en développement local)
- **THEN** le backend répond comme le décrit `besoins/openapi.yaml` pour l'opération `login`,
  sans nécessiter de réécriture de chemin par un tiers

#### Scenario: Ressource métier générée depuis le contrat
- **WHEN** un client envoie `GET /api/v1/members?page=0` avec une session valide
- **THEN** le backend répond via `MembresApi` (interface générée par openapi-generator), sans que
  ce chemin nécessite de réécriture

#### Scenario: Connexion locale via le frontend sans Docker
- **WHEN** l'application Angular, servie par `ng serve` sur `http://localhost:4200`, envoie
  `POST /api/v1/auth/login` avec des identifiants valides, via le proxy de développement existant
  (`contribo-front/proxy.conf.json`, sans réécriture de chemin)
- **THEN** la requête atteint le backend local (`mvn spring-boot:run`) sur
  `/api/v1/auth/login` et reçoit une réponse `200` avec le cookie de session

### Requirement: L'exemption CSRF reste correcte avec un context-path
`SecurityConfig` SHALL déterminer l'exemption de vérification CSRF pour les routes
d'authentification (`/auth/login`, `/auth/csrf`) à partir du chemin de la requête relatif au
context-path du serveur, et non du chemin absolu, afin que l'exemption reste correcte quel que soit
le context-path configuré.

#### Scenario: Connexion sans jeton CSRF préalable
- **WHEN** un client envoie `POST /api/v1/auth/login` sans jeton CSRF, alors que le
  context-path du serveur est `/api/v1`
- **THEN** la requête n'est pas rejetée pour absence de jeton CSRF (l'exemption s'applique bien à
  la route de connexion)

### Requirement: La supervision Actuator est découplée de la version d'API publique
Le backend SHALL exposer les endpoints Actuator (`/actuator/health`,
`/actuator/health/readiness`) sur un port de gestion Spring Boot dédié, distinct du port et du
context-path de l'API publique, afin que la supervision d'infrastructure ne soit pas versionnée
comme une ressource de l'API métier.

#### Scenario: Vérification de santé par l'outillage de déploiement
- **WHEN** l'instruction `HEALTHCHECK` de l'image backend (ou le healthcheck Compose équivalent)
  interroge l'endpoint de disponibilité
- **THEN** elle cible le port de gestion dédié (ex. `http://localhost:9001/actuator/health/readiness`)
  et non un chemin sous `/api/v1`

### Requirement: Le reverse proxy Nginx transmet /api/v1 sans réécriture de chemin
`contribo-deploiement/nginx.local.conf` et `contribo-deploiement/nginx.conf` SHALL transmettre les
requêtes `/api/v1/**` au backend sans réécriture de chemin, puisque le backend répond déjà
nativement sous `/api/v1/**`. Une règle dédiée à `/api/v1/auth/login` peut subsister uniquement pour
appliquer une politique distincte (ex. limitation de débit), jamais pour réécrire le chemin.

#### Scenario: Connexion via la stack Docker
- **WHEN** un client envoie `POST /api/v1/auth/login` à travers Nginx (stack Docker locale ou
  production)
- **THEN** Nginx transmet la requête telle quelle (même chemin `/api/v1/auth/login`) au backend

#### Scenario: Ressource métier via la stack Docker
- **WHEN** un client envoie `GET /api/v1/members` à travers Nginx avec une session valide
- **THEN** Nginx transmet la requête telle quelle (même chemin `/api/v1/members`) au backend, qui
  répond `200`

