## Why

Les requêtes GET fonctionnent, mais les requêtes mutantes authentifiées par cookie de session échouent avec un 401 générique. La cause est confirmée : le backend émet `XSRF-TOKEN` avec `Path=/api/v1`, ce qui empêche l'intercepteur XSRF d'Angular de lire le cookie depuis les routes SPA telles que `/membres` ou `/login`.

## What Changes

- Émettre le cookie lisible `XSRF-TOKEN` avec `Path=/` afin qu'il soit accessible depuis toutes les routes du SPA.
- Conserver le cookie de session `__Host-contribo-session` avec ses attributs de sécurité actuels, notamment `Path=/` et `HttpOnly`.
- Vérifier que les requêtes `POST`, `PUT`, `PATCH` et `DELETE` authentifiées par cookie transmettent le header `X-XSRF-TOKEN` attendu.
- Vérifier qu'une requête mutante sans token CSRF reste refusée et qu'aucune mutation métier n'est exécutée.
- Ajouter une vérification HTTP de l'attribut `Path` et un parcours frontend/backend de mutation réelle.
- Ne pas modifier la règle d'exemption CSRF des routes publiques ni le contrat d'authentification par cookie.

## Capabilities

### New Capabilities

Aucune nouvelle capacité produit.

### Modified Capabilities

- `secure-cookie-session`: le cookie CSRF lisible par le frontend doit couvrir les routes du SPA avec `Path=/`, tout en conservant la protection des requêtes mutantes authentifiées.

## Impact

- Backend : configuration Spring Security dans `contribo-back/src/main/java/com/habdiallo/contribo/security/SecurityConfig.java` et tests HTTP d'authentification.
- Frontend : vérification de `withXsrfConfiguration` et d'une mutation réelle, sans changement attendu de configuration si le cookie est corrigé côté backend.
- Contrat API : aucune nouvelle opération, mais le comportement de sécurité de `/auth/csrf` et des requêtes mutantes est concerné.
- Déploiement : vérifier le comportement avec le context-path `/api/v1` et derrière le proxy de développement ou le reverse proxy.
- Ticket local : T-184, scope `back`, type `fix`, branche `back/fix-184-corriger-path-cookie-csrf`, PR prévue vers `develop`.
