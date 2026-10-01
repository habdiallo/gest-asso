## Context

Le backend Spring Security utilise `CookieCsrfTokenRepository.withHttpOnlyFalse()` pour émettre `XSRF-TOKEN`. Avec le context-path `/api/v1`, le cookie observé en environnement réel porte `Path=/api/v1`. Le frontend Angular est servi sur les routes du SPA, par exemple `/login` et `/membres`, et `withXsrfConfiguration` s'appuie sur `document.cookie` pour lire ce token.

Un cookie limité à `/api/v1` n'est pas visible depuis les pages du SPA. Angular n'ajoute donc pas `X-XSRF-TOKEN` aux mutations authentifiées par cookie. Le filtre CSRF rejette alors la requête avant le traitement métier, avec un retour 401 générique dans le parcours observé.

## Goals / Non-Goals

**Goals:**

- Émettre explicitement `XSRF-TOKEN` avec `Path=/` quelle que soit la valeur de `server.servlet.context-path`.
- Préserver un cookie lisible par JavaScript uniquement pour le token CSRF, sans modifier le cookie de session `__Host-contribo-session`.
- Vérifier le `Set-Cookie` réel, la lecture par le frontend et l'acceptation d'une mutation authentifiée.
- Conserver le refus des mutations dépourvues de token CSRF valide.

**Non-Goals:**

- Désactiver CSRF ou élargir les routes exemptées.
- Remplacer l'authentification par cookie, modifier le JWT ou changer les règles métier d'autorisation.
- Ajouter un endpoint ou modifier le contrat fonctionnel OpenAPI.
- Corriger les messages d'erreur 401 génériques dans un autre ticket.

## Decisions

### Définir le chemin du repository CSRF

La configuration créera le `CookieCsrfTokenRepository` puis lui appliquera explicitement `setCookiePath("/")` avant de l'enregistrer dans la chaîne Spring Security. Cette option est locale, lisible et indépendante du context-path serveur.

L'alternative consistant à modifier le context-path ou à compter sur la déduction Spring est rejetée : elle affecterait les URLs publiques ou reproduirait le défaut à l'origine du problème.

### Conserver la séparation des cookies

Le cookie CSRF restera non `HttpOnly` pour permettre à Angular de le lire, tandis que le cookie de session conservera le préfixe `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict` et `Path=/`. Aucun secret de session ne sera rendu accessible au JavaScript.

### Tester le comportement à trois niveaux

Les tests couvriront :

1. le header `Set-Cookie` de `GET /auth/csrf` et son `Path=/` ;
2. l'acceptation d'une mutation authentifiée avec le cookie et le header CSRF ;
3. le refus d'une mutation authentifiée sans token CSRF.

Un contrôle frontend ou réseau vérifiera également qu'une page SPA située hors de `/api/v1` peut lire le cookie et transmettre le header. Les tests backend resteront la preuve contractuelle principale.

## Risks / Trade-offs

- [Risque] Un proxy réécrit les attributs `Set-Cookie` après la réponse Spring. -> Mitigation : vérifier le header sur l'environnement intégré et documenter toute réécriture du proxy.
- [Risque] Un cookie `Path=/` est envoyé à davantage de chemins. -> Mitigation : le cookie ne contient qu'un nonce CSRF non secret, sans donnée d'identité ni JWT, et reste limité par les règles SameSite et HTTPS de l'environnement.
- [Risque] Le test MockMvc ne reproduit pas le comportement d'un navigateur. -> Mitigation : compléter le test HTTP par une vérification réseau ou navigateur avec une page SPA réelle.
- [Risque] La mutation testée échoue pour une cause métier ou de données indépendante de CSRF. -> Mitigation : utiliser une mutation déterministe et vérifier séparément la réponse avant et après correction.

## Migration Plan

1. Appliquer la configuration explicite du chemin sur la branche T-184.
2. Exécuter les tests HTTP backend et la vérification frontend ou réseau.
3. Déployer sur l'environnement d'intégration avec le context-path `/api/v1`.
4. Contrôler `Set-Cookie`, puis exécuter une mutation authentifiée depuis une route SPA.
5. En cas de régression, retirer uniquement la configuration de chemin ajoutée et restaurer la version précédente du backend.

## Open Questions

- Le reverse proxy de production réécrit-il actuellement les attributs `Path` des cookies ?
- Quelle mutation métier déterministe sera utilisée pour le test réseau d'intégration ?
