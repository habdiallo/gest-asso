## Context

Le contrat OpenAPI (`besoins/openapi.yaml`) déclare `/api/v1` comme base path (les logs de
génération le confirment : `Default to [http://localhost] for server URL [http://localhost/api/v1]`).
Mais le backend implémente ses contrôleurs avec des chemins non préfixés :
`AuthenticationController` déclare explicitement `/auth/login`, `/auth/csrf`, `/auth/logout` ; les
contrôleurs métier (`MemberController implements MembresApi`, etc.) utilisent les interfaces
générées par openapi-generator (générateur `spring`), dont les `@RequestMapping` sont eux aussi
non préfixés (ex. `MembresApi.PATH_CREATE_MEMBER = "/members"`).

Seule la configuration Nginx de la stack Docker (`contribo-deploiement/nginx.local.conf`,
dupliquée dans `nginx.conf` pour la production) fait exister `/api/v1` en pratique, via deux
règles : une réécriture générique (`location /api/v1/ { proxy_pass http://backend:8080/; }`, qui
retire le préfixe) et une règle spéciale pour l'authentification
(`location /api/v1/auth/login { proxy_pass http://backend:8080/auth/login; }`). Sans cette couche
Nginx (cas `npm start` + `mvn spring-boot:run` en local), le proxy de développement Angular
(`contribo-front/proxy.conf.json`) transmet les chemins sans réécriture, et le backend répond
`401 AUTHENTICATION_REQUIRED` faute de mapping sur `/api/v1/auth/login`.

Une première approche envisagée consistait à ajouter la même réécriture dans le proxy de
développement Angular (converti en `proxy.conf.mjs` pour disposer d'une fonction `rewrite`, le
format JSON ne supportant pas les fonctions). Cette approche a été écartée : elle duplique dans une
troisième configuration (après Nginx local et Nginx production) une connaissance qui doit avoir une
source unique, et elle ne corrige pas le fait que le backend n'implémente pas réellement la version
d'API qu'il documente.

**Mise à jour post-revue (PR #168, T-159)** : la revue a démontré que livrer uniquement le
context-path backend sans mettre à jour dans le même changement le `HEALTHCHECK` Actuator et le
routage Nginx laisse la stack Docker cassée entre la fusion de T-159 et celle de T-160 (registre
initialement prévu comme ticket `infra` séparé et dépendant). Le contenu initialement planifié pour
T-160 (mise à jour des healthchecks et passthrough Nginx) est donc livré dans ce même changement,
sur la branche de T-159, plutôt que dans une PR séparée qui aurait laissé un état intermédiaire non
déployable sur `develop`. Le ticket T-160 est annulé dans le registre (`planningStatus: cancelled`)
avec renvoi vers ce paragraphe.

## Goals / Non-Goals

**Goals:**
- Faire du backend la source unique de vérité pour le chemin `/api/v1` : le contrat et
  l'implémentation coïncident, sans réécriture de chemin nécessaire à aucune couche de proxy.
- Simplifier Nginx (local et production) en un passthrough direct, sans règle spéciale pour
  l'authentification.
- Permettre à `npm start` (frontend) associé à un backend local (`mvn spring-boot:run`) de
  fonctionner sans modification du frontend et sans dépendre de la stack Docker.
- Garder la supervision d'infrastructure (Actuator) découplée de la version d'API publique.

**Non-Goals:**
- Modifier le contrat OpenAPI ou le générateur de code (`openapitools.json` côté backend/frontend).
- Changer le comportement fonctionnel de l'authentification ou des ressources métier : seul le
  chemin d'accès change, pas la logique.
- Toucher au frontend : `contribo-front/proxy.conf.json` et `contribo-front/README.md` restent
  inchangés, leur description actuelle (« sans réécriture ») devient enfin exacte.

## Decisions

### Le backend porte `/api/v1` via `server.servlet.context-path`
`contribo-back/src/main/resources/application.yaml` déclare
`server.servlet.context-path: /api/v1`. Spring MVC et Spring Security résolvent leurs mappings et
`requestMatchers` relativement au context-path, donc aucun
`@RequestMapping` existant n'a besoin d'être modifié : `/auth/login` reste `/auth/login` dans le
code, mais devient accessible à `/api/v1/auth/login`.

**Alternative envisagée et rejetée** : réécrire le proxy de développement Angular (voir Context).
Rejetée car elle duplique la connaissance du mapping dans une troisième configuration au lieu de la
supprimer, et laisse le backend en désaccord avec son propre contrat documenté.

**Alternative envisagée et rejetée** : préfixer manuellement chaque contrôleur
(`@RequestMapping("/api/v1")` sur chaque classe, ou régénérer les interfaces avec le préfixe inclus
dans les chemins du contrat). Rejetée car plus intrusive (touche chaque contrôleur et potentiellement
la configuration du générateur), alors que `server.servlet.context-path` obtient le même résultat en
un seul endroit, de façon standard en Spring Boot.

### Comparaisons de chemin littérales : `RequestPaths.pathWithinApplication(request)`
`request.getRequestURI()` est un appel Servlet brut qui renvoie le chemin absolu, **context-path
inclus**. Avec `server.servlet.context-path: /api/v1`, une requête de connexion aurait pour
`getRequestURI()` la valeur `/api/v1/auth/login`, ce qui ne correspondrait plus aux comparaisons
littérales `"/auth/login".equals(...)` dans `SecurityConfig.requiresCookieCsrf` et
`JwtAuthenticationFilter.isAllowedDuringPasswordChange`, et casserait silencieusement l'exemption
CSRF et l'accès pendant un changement de mot de passe obligatoire.

**Alternative envisagée et rejetée à l'implémentation** : `request.getServletPath()`. Semblait
correcte (exclut le context-path en théorie) mais s'est révélée **peu fiable sous le dispatcher de
test `MockMvc`** : le test `AccountPasswordLifecycleHttpTest.temporaryLoginIsLimitedUntilPasswordChange`
a échoué (`GET /me` → 403 au lieu de 200) car `getServletPath()` ne renvoyait pas `/me` dans ce
contexte de test, alors que `getRequestURI()` s'y comporte normalement (contrairement à un vrai
conteneur Tomcat, où les deux méthodes sont cohérentes). Cet écart est documenté comme un piège
connu de `MockMvc`/`TestDispatcherServlet` combiné au dispatch par motif de chemin de Spring MVC.

**Solution retenue** : une méthode utilitaire `RequestPaths.pathWithinApplication(request)`
(`contribo-back/src/main/java/com/habdiallo/contribo/security/RequestPaths.java`), qui calcule
`request.getRequestURI().substring(request.getContextPath().length())`. N'utilise que des appels
Servlet bruts (`getRequestURI()`, `getContextPath()`), non affectés par le dispatch Spring MVC :
fiable aussi bien sous `MockMvc` (context-path vide en test, donc `substring(0)` laisse le chemin
inchangé) qu'en production avec `/api/v1` comme context-path. Les 38 tests existants passent sans
modification une fois ce remplacement fait.

### Découpler Actuator sur un port de gestion dédié (`management.server.port`)
Spring Boot fournit ce mécanisme précisément pour ce cas : séparer la supervision d'infrastructure
(non versionnée, souvent non exposée publiquement) de l'API applicative. On fixe
`management.server.port: 9001` (port interne, non publié dans `compose.yaml`, seulement interrogé
depuis l'intérieur du conteneur par les healthchecks). Les endpoints Actuator ne sont alors affectés
ni par `server.servlet.context-path`, ni par une éventuelle évolution future de la version d'API.

**Alternative envisagée et rejetée** : laisser Actuator sous `/api/v1/actuator/health`. Rejetée
(choix explicite de l'utilisateur) : mélange sémantiquement la supervision d'infrastructure avec la
version de l'API publique, et lie leur cycle de vie alors qu'ils n'ont pas la même audience (outillage
d'infra vs. clients de l'API).

### Simplification de Nginx (local et production)
Avec le backend répondant nativement sous `/api/v1/**`, `nginx.local.conf` et `nginx.conf`
conservent leurs deux règles (`/api/v1/auth/login` et `/api/v1/`), mais les deux passent en
`proxy_pass http://backend:8080;` (sans chemin ni slash final), qui transmet le chemin de la
requête tel quel au backend au lieu de le réécrire. Les deux règles sont conservées séparées non
pour réécrire des chemins différents (ce n'est plus nécessaire), mais parce que la route de
connexion applique une zone de limitation de débit dédiée (`limit_req zone=contribo_login`), une
mesure de durcissement de sécurité (ticket T-154) indépendante du sujet de ce changement.

## Risks / Trade-offs

- [Risque] Toute URL absolue codée en dur côté backend (logs, liens, tests d'intégration) vers
  `/auth/...` ou `/members` sans préfixe deviendrait incorrecte une fois le context-path actif →
  Mitigation : rechercher les usages de `HttpServletRequest`/URLs absolues dans
  `contribo-back/src/main/java` et les tests avant de livrer ; les tests Spring MVC
  (`MockMvc`) utilisant des chemins relatifs ne sont pas affectés par le context-path sauf s'il est
  explicitement configuré dans le test.
- [Risque] Le port de gestion `9001` doit rester cohérent entre `application.yaml` et les
  `HEALTHCHECK`/healthchecks Compose qui le ciblent → Mitigation : un seul endroit
  (`application.yaml`) définit la valeur ; les tâches de ce ticket mettent à jour les deux fichiers
  qui la consomment (`backend.Dockerfile`, `compose.portainer.yaml`) dans le même changement.
- [Risque] `compose.yaml` (stack de développement local) et `compose.integration.yaml` héritent du
  `HEALTHCHECK` défini dans l'image (`backend.Dockerfile`) sans le redéfinir : une mise à jour
  incomplète du Dockerfile romprait leur détection de santé → Mitigation : vérifier après
  modification que `docker compose -f contribo-deploiement/compose.yaml up --build` marque bien le
  service `backend` comme `healthy`.

## Migration Plan

1. `contribo-back/src/main/resources/application.yaml` : ajouter
   `server.servlet.context-path: /api/v1` et `management.server.port: 9001`.
2. `contribo-back/src/main/java/.../security/RequestPaths.java` (nouveau) : méthode utilitaire
   `pathWithinApplication(request)` ; l'utiliser dans `SecurityConfig.requiresCookieCsrf` et
   `JwtAuthenticationFilter.isAllowedDuringPasswordChange` à la place des comparaisons littérales
   sur `request.getRequestURI()`.
3. `contribo-deploiement/backend.Dockerfile` : mettre à jour `HEALTHCHECK` vers
   `http://localhost:9001/actuator/health/readiness`.
4. `contribo-deploiement/compose.portainer.yaml` : mettre à jour le test de healthcheck du service
   `backend` vers le même port.
5. `contribo-deploiement/nginx.local.conf` et `contribo-deploiement/nginx.conf` : passer les deux
   règles existantes (`/api/v1/auth/login`, `/api/v1/`) en passthrough (`proxy_pass
   http://backend:8080;`, sans réécriture), en conservant leur séparation pour la limitation de
   débit dédiée au login.
6. Vérifier localement (backend seul, puis frontend + backend locaux, puis stack Docker complète).

Retour arrière : retirer les deux propriétés ajoutées dans `application.yaml`, annuler l'usage de
`RequestPaths.pathWithinApplication` (sans risque, comportement strictement équivalent à
`getRequestURI()` hors context-path), et restaurer les règles Nginx et healthchecks d'origine.
Aucune donnée persistante n'est affectée.

## Open Questions

Aucune : le port de gestion (`9001`) est un choix local libre (non exposé publiquement), vérifié
comme non utilisé ailleurs dans le dépôt.
