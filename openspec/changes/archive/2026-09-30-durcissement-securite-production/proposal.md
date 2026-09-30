## Why

Le socle d'authentification et de déploiement expose encore plusieurs risques bloquants avant une mise en production : absence de limitation robuste du login, JWT persistant dans `localStorage`, reverse proxy sans HTTPS ni headers de sécurité, secrets avec valeurs connues, Actuator trop exposé et absence de journalisation de sécurité exploitable. Ce ticket traite la priorité immédiate afin de réduire le risque de prise de compte, d'exfiltration de session et de mauvaise configuration opérationnelle.

## What Changes

- Ajouter une limitation du login par adresse IP et identifiant, avec réponse `429`, limite globale au reverse proxy et politique explicite de confiance pour `X-Forwarded-For`.
- **BREAKING** Remplacer le stockage frontend du JWT dans `localStorage` et le transport par bearer géré en JavaScript par un cookie de session `HttpOnly`, `Secure`, `SameSite=Strict`, avec protection CSRF réactivée et configurée.
- Rendre HTTPS obligatoire en environnement exposé et ajouter au reverse proxy HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` et protection contre le framing.
- Supprimer les mots de passe et secrets connus par défaut dans les profils d'intégration et de production ; faire échouer le démarrage si une valeur obligatoire manque.
- Rendre publics uniquement les probes Actuator `health` et `readiness`, et réserver `info`, les métriques et les autres endpoints à l'administration.
- Ajouter une journalisation structurée des connexions réussies et échouées, refus d'autorisation, tokens invalides et limitations déclenchées, sans mot de passe, JWT, clé ni secret dans les événements.
- Ajouter les tests de contrat, d'intégration et de configuration nécessaires pour démontrer les comportements attendus et empêcher leur régression.

Les sujets suivants restent hors de ce ticket et devront être planifiés séparément : claims `issuer`, `audience` et `jti`, rotation et révocation des refresh tokens, invalidation globale après changement de mot de passe ou compromission, MFA, politique de mot de passe et réinitialisation, contrôles d'autorisation métier exhaustifs, limites générales de requêtes et pagination, CORS inter-domaines, privilèges PostgreSQL et TLS base distante, sauvegardes chiffrées, scans de dépendances et images, SBOM, Dependabot ou Renovate, pinning des actions, exécution non root, alerting et audit externe.

## Capabilities

### New Capabilities

- `api-rate-limiting`: limitation anti-abus du login et du trafic entrant, avec gestion sûre de l'adresse client.
- `secure-cookie-session`: session d'authentification portée par cookie sécurisé et protection CSRF côté frontend et backend.
- `proxy-security-hardening`: HTTPS obligatoire et headers de sécurité cohérents au reverse proxy.
- `actuator-and-secret-hardening`: exposition Actuator minimale et configuration sans secret par défaut en intégration ou production.
- `security-audit-logging`: événements de sécurité structurés, utiles à l'exploitation et exempts de données secrètes.

### Modified Capabilities

Aucune spécification existante ne porte encore ces exigences de sécurité.

## Impact

- Backend Spring Boot : sécurité HTTP, émission et lecture de session, CSRF, limitation du login, Actuator, configuration et événements de sécurité.
- Frontend Angular : service de session, intercepteur HTTP, configuration XSRF, tests et suppression de la persistance du JWT dans `localStorage`.
- Reverse proxy et déploiement : `contribo-deploiement/nginx.conf`, TLS, limites de requêtes, headers, secrets d'exécution et tests de healthcheck.
- Contrats et tests : réponse de login, cookies, erreurs `429`, accès Actuator et vérifications de non-divulgation des secrets.
- Sources de référence : [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) et [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
