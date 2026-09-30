## ADDED Requirements

### Requirement: HTTPS obligatoire en environnement exposé

Le reverse proxy de production SHALL rediriger HTTP vers HTTPS et SHALL servir l'application avec une configuration TLS fournie par l'environnement. Le mode local HTTP SHALL être séparé et explicitement identifié comme non productif.

#### Scenario: Requête HTTP publique
- **WHEN** un client atteint le proxy de production en HTTP
- **THEN** il reçoit une redirection vers l'URL HTTPS correspondante
- **THEN** aucune donnée d'authentification n'est traitée sur le flux HTTP

### Requirement: Headers de sécurité

Le reverse proxy SHALL ajouter HSTS sur les réponses HTTPS, une CSP adaptée au bundle Angular, `X-Content-Type-Options: nosniff`, une `Referrer-Policy`, une `Permissions-Policy` et une protection contre le framing avec `frame-ancestors` et `X-Frame-Options`.

#### Scenario: Réponse applicative HTTPS
- **WHEN** un client reçoit une page ou une réponse d'erreur via HTTPS
- **THEN** les headers de sécurité configurés sont présents, y compris sur les réponses d'erreur
- **THEN** la page ne peut pas être chargée dans un frame d'une autre origine

#### Scenario: CSP compatible avec l'application
- **WHEN** le frontend Angular est chargé avec la CSP de production
- **THEN** les parcours de connexion, navigation et appels API fonctionnent sans ressource non autorisée
