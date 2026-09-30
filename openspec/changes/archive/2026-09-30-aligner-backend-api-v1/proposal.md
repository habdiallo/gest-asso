## Why

Le contrat OpenAPI (`besoins/openapi.yaml`) déclare `/api/v1` comme base path de l'API, mais le
backend Spring Boot ne l'implémente pas réellement : `AuthenticationController` répond sur
`/auth/login`, `/auth/csrf`, `/auth/logout`, et les contrôleurs générés depuis le contrat
(`MembresApi`, `CampagnesApi`, etc.) répondent sur des chemins sans préfixe (ex. `/members`). Seule
la configuration Nginx de la stack Docker (`contribo-deploiement/nginx.local.conf`) fait exister
`/api/v1` en pratique, en réécrivant les chemins entrants (avec une règle spéciale pour
`/api/v1/auth/login`, distincte de la règle générique `/api/v1/`). Tester le frontend contre un
backend local sans Docker (`npm start` + `mvn spring-boot:run`) échoue donc dès la connexion,
puisque le proxy de développement Angular (`contribo-front/proxy.conf.json`) transmet
`/api/v1/auth/login` tel quel à un backend qui ne répond que sur `/auth/login`.

Corriger uniquement le proxy de développement frontend (ajouter une réécriture équivalente à celle
de Nginx) déplacerait le problème sans le résoudre : la connaissance du mapping
`/api/v1/* <-> chemin réel backend` serait alors dupliquée dans deux configurations
indépendantes (Nginx et le proxy Angular), avec un risque de divergence future. La version d'API
`/api/v1` doit être une réalité implémentée par le backend, source unique de vérité, et non un
artefact reconstruit à chaque couche de proxy.

## What Changes

- Le backend expose nativement tous les chemins du contrat sous `/api/v1` via
  `server.servlet.context-path: /api/v1` (Spring Boot), sans changer les `@RequestMapping`
  existants (relatifs, donc inchangés).
- `SecurityConfig.requiresCookieCsrf` et `JwtAuthenticationFilter.isAllowedDuringPasswordChange`
  comparent aujourd'hui `request.getRequestURI()` (chemin absolu, incluant le context-path) à des
  chemins littéraux (`/auth/login`, `/auth/csrf`, `/me`, etc.) : ces deux méthodes utilisent
  désormais une méthode utilitaire commune (`RequestPaths.pathWithinApplication`) qui recalcule le
  chemin relatif au context-path à partir de `getRequestURI()`/`getContextPath()`, pour que ces
  exemptions continuent de fonctionner une fois le context-path ajouté.
- Les endpoints Actuator (`/actuator/health`, `/actuator/health/readiness`) sont déplacés sur un
  port de gestion Spring Boot dédié (`management.server.port`), découplé du context-path de l'API
  publique : la supervision d'infrastructure ne doit pas être versionnée comme l'API métier.
- Les références aux endpoints Actuator dans l'outillage de déploiement sont mises à jour vers le
  nouveau port de gestion : `contribo-deploiement/backend.Dockerfile` (instruction `HEALTHCHECK` de
  l'image, seule source pour `compose.yaml` et `compose.integration.yaml` qui ne la redéfinissent
  pas) et `contribo-deploiement/compose.portainer.yaml` (test de healthcheck explicite).
- `contribo-deploiement/nginx.local.conf` et `contribo-deploiement/nginx.conf` (même règle
  dupliquée entre local et production) passent en passthrough direct (`proxy_pass
  http://backend:8080;`, sans réécriture de chemin) puisque le backend répond déjà sous
  `/api/v1/*` ; la règle dédiée à `/api/v1/auth/login` est conservée uniquement pour sa limitation
  de débit spécifique (`contribo_login`), pas pour réécrire le chemin.
- **Aucun changement frontend** : `contribo-front/proxy.conf.json` reste tel quel
  (`/api/** -> http://localhost:8080` sans réécriture) et devient enfin correct vis-à-vis du
  backend réel. La documentation (`contribo-front/README.md`) n'a pas besoin d'être corrigée sur ce
  point : elle décrivait déjà le comportement visé.

## Capabilities

### New Capabilities
- `api-v1-base-path`: le backend Spring Boot expose l'intégralité des chemins du contrat OpenAPI
  (authentification et ressources métier) sous le préfixe `/api/v1`, avec la supervision Actuator
  découplée sur un port de gestion séparé.

### Modified Capabilities
(aucune capacité existante ne change de comportement)

## Impact

- Code affecté : `contribo-back/src/main/resources/application.yaml` (context-path, port de
  gestion), `contribo-back/src/main/java/com/habdiallo/contribo/security/SecurityConfig.java`
  (exemption CSRF).
- Infrastructure affectée : `contribo-deploiement/backend.Dockerfile` (cible de healthcheck),
  `contribo-deploiement/compose.portainer.yaml` (cible de healthcheck),
  `contribo-deploiement/nginx.local.conf` et `contribo-deploiement/nginx.conf` (simplification du
  routage). `compose.yaml` et `compose.integration.yaml` héritent du `HEALTHCHECK` de l'image sans
  modification propre.
- Aucun changement au contrat OpenAPI, ni au frontend, ni au schéma de base de données.
- Ce changement rend `npm start` (frontend) utilisable directement contre un backend local
  (`mvn spring-boot:run`), sans dépendre de la stack Docker pour un test d'intégration basique.
- Livré intégralement sous le ticket T-159 (branche `back/fix-159-aligner-backend-api-v1`, PR #168) :
  la revue de cette PR a démontré qu'un découpage en deux tickets/PR distincts (T-159 pour le
  backend, T-160 pour l'outillage de déploiement) laisserait la stack Docker cassée entre les deux
  fusions. Le ticket T-160, initialement réservé pour cette partie, est annulé dans le registre
  (`planningStatus: cancelled`) au profit de ce périmètre unique.
