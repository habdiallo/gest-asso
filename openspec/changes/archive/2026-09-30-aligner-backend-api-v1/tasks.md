## 1. Ticket T-159 (scope `back`, type `fix`, branche `back/fix-159-aligner-backend-api-v1`)

Périmètre : le backend expose nativement `/api/v1` (context-path) et découple Actuator sur un port
de gestion dédié, sans changer les `@RequestMapping` existants.
Critères d'acceptation : `POST http://localhost:8080/api/v1/auth/login` fonctionne directement
(sans Nginx) avec un compte de test ; `npm start` (frontend, proxy inchangé) associé à ce backend
permet une connexion réussie ; `mvn test`/`mvn verify` passent.

- [x] 1.1 [T-159] Vérifier `git status`/`git branch --show-current`, puis créer/réutiliser
      `back/fix-159-aligner-backend-api-v1` depuis `origin/develop`.
- [x] 1.2 [T-159] Ajouter `server.servlet.context-path: /api/v1` et
      `management.server.port: 9001` dans `contribo-back/src/main/resources/application.yaml`.
- [x] 1.3 [T-159] Dans `SecurityConfig.requiresCookieCsrf`, remplacer la comparaison littérale sur
      `request.getRequestURI()` par une résolution relative au context-path pour
      `/auth/login`/`/auth/csrf`. (`request.getServletPath()` envisagé initialement, mais écarté :
      voir 1.4, remplacé par `RequestPaths.pathWithinApplication`.)
- [x] 1.4 [T-159] Rechercher dans `contribo-back/src/main/java` et `contribo-back/src/test` tout
      chemin absolu codé en dur (`/auth/`, `/members`, `/actuator/`) qui supposerait l'absence de
      context-path, et corriger si nécessaire. (Même bug trouvé et corrigé dans
      `JwtAuthenticationFilter.isAllowedDuringPasswordChange` ; `RequestBodyPresenceFilter` était
      déjà correct via `request.getContextPath()`. Nouvelle classe utilitaire
      `security/RequestPaths.java` : `pathWithinApplication(request)` =
      `getRequestURI().substring(getContextPath().length())`, utilisée par les deux classes.
      `request.getServletPath()` a été essayé puis rejeté : `mvn test` a révélé qu'il n'est pas
      fiable sous le dispatcher `MockMvc` — `AccountPasswordLifecycleHttpTest` a échoué
      (`GET /me` → 403 au lieu de 200) avant ce remplacement.)
- [x] 1.5 [T-159] Exécuter `mvn test` et `mvn verify` depuis `contribo-back/` et rapporter les
      résultats réels. (`mvn test` : 38/38 passent. `mvn verify` : `BUILD SUCCESS`.)
- [x] 1.6 [T-159] Vérifier manuellement : backend seul (`mvn spring-boot:run`) répond sur
      `http://localhost:8080/api/v1/auth/login` (plus sur `/auth/login`) et sur
      `http://localhost:9001/actuator/health/readiness` ; puis `npm start` (frontend) associé à ce
      backend permet une connexion réussie via `http://localhost:4200`. (Vérifié : `POST
      localhost:8080/api/v1/auth/login` → 200, `POST localhost:8080/auth/login` → 404,
      `localhost:9001/actuator/health/readiness` → 200, `localhost:8080/actuator/health/readiness`
      → 404, `POST localhost:4200/api/v1/auth/login` via le proxy Angular inchangé → 200.)
- [x] 1.7 [T-159] Committer les fichiers du ticket avec le message
      `fix(back): T-159 <résumé>`, pousser `back/fix-159-aligner-backend-api-v1` et ouvrir une PR
      en brouillon vers `develop`, sans fusionner ni activer l'auto-merge. (PR #168.)

### Retours de revue sur la PR #168 (T-160 absorbé, voir section 2 annulée ci-dessous)

- [x] 1.8 [T-159] Mettre à jour `contribo-deploiement/backend.Dockerfile`
      (`HEALTHCHECK ... CMD curl ... http://localhost:9001/actuator/health/readiness`).
- [x] 1.9 [T-159] Mettre à jour le test de healthcheck du service `backend` dans
      `contribo-deploiement/compose.portainer.yaml` vers le même port.
- [x] 1.10 [T-159] Passer `contribo-deploiement/nginx.local.conf` en passthrough direct
      (`proxy_pass http://backend:8080;`, sans réécriture) pour les règles `/api/v1/auth/login` et
      `/api/v1/`, en conservant leur séparation pour la limitation de débit dédiée au login.
- [x] 1.11 [T-159] Appliquer la même correction à `contribo-deploiement/nginx.conf` (production).
- [x] 1.12 [T-159] Vérifier manuellement via `docker compose -f contribo-deploiement/compose.yaml
      up --build` : `db` et `backend` `healthy` ; connexion et appel métier authentifié
      (`/api/v1/members`) réussis via `http://localhost:8081`. (Vérifié : login → 200, `GET
      /api/v1/members` authentifié → 200. Le conteneur `frontend` reste `unhealthy` pour une raison
      préexistante et sans rapport : son `HEALTHCHECK` interne `wget http://localhost/` résout en
      IPv6 `::1` avant IPv4, or `nginx.local.conf` ne déclare que `listen 80;` — déjà le cas sur
      `develop` avant ce changement, confirmé par `git show origin/develop:...`. Application
      fonctionnelle et vérifiée depuis l'hôte : `curl http://localhost:8081/` → 200.)
- [x] 1.13 [T-159] Committer ces corrections et les mises à jour d'artefacts OpenSpec, pousser sur
      `back/fix-159-aligner-backend-api-v1` (PR #168 déjà ouverte), sans fusionner ni activer
      l'auto-merge.

## 2. Ticket T-160 — ANNULÉ (`planningStatus: cancelled`)

Initialement prévu comme ticket `infra` séparé et dépendant de T-159 pour la même intention
(healthchecks + passthrough Nginx). La revue de la PR #168 a démontré qu'un découpage en deux PR
distinctes laisserait `develop` avec une stack Docker cassée entre les deux fusions (voir
`design.md`, section « Mise à jour post-revue »). Son contenu a été livré directement sous T-159
(tâches 1.8 à 1.13 ci-dessus) au lieu d'une branche/PR séparée. Les étapes ci-dessous restent
répertoriées pour la traçabilité du registre (`openspec/tickets.json`), non cochées, et ne seront
pas implémentées séparément.

- [ ] 2.1 [T-160] Vérifier les prérequis (T-159 fusionné ou présent dans l'ascendance), puis
      créer/réutiliser `infra/fix-160-simplifier-nginx-api-v1` depuis `origin/develop`.
- [ ] 2.2 [T-160] Mettre à jour `contribo-deploiement/backend.Dockerfile`
      (`HEALTHCHECK ... CMD curl ... http://localhost:9001/actuator/health/readiness`).
- [ ] 2.3 [T-160] Mettre à jour le test de healthcheck du service `backend` dans
      `contribo-deploiement/compose.portainer.yaml` vers le même port.
- [ ] 2.4 [T-160] Simplifier `contribo-deploiement/nginx.local.conf` : remplacer les règles
      `/api/v1/auth/login` et `/api/v1/` (avec retrait de préfixe) par un passthrough direct
      conservant `/api/v1` dans le chemin transmis au backend.
- [ ] 2.5 [T-160] Appliquer la même simplification à `contribo-deploiement/nginx.conf`
      (production).
- [ ] 2.6 [T-160] Vérifier manuellement : `docker compose -f contribo-deploiement/compose.yaml up
      --build` démarre avec `backend` `healthy` ; connexion et un appel métier authentifié
      fonctionnent via `http://localhost:8081`.
- [ ] 2.7 [T-160] Committer les fichiers du ticket avec le message
      `fix(infra): T-160 <résumé>`, pousser `infra/fix-160-simplifier-nginx-api-v1` et ouvrir une
      PR en brouillon vers `develop`, sans fusionner ni activer l'auto-merge.
