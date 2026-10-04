## MODIFIED Requirements

### Requirement: HTTPS obligatoire en environnement exposé

Le proxy d'entrée des environnements exposés SHALL terminer TLS, rediriger HTTP vers HTTPS et relayer le trafic vers le frontend sur le réseau Docker interne. Le conteneur frontend SHALL servir uniquement en HTTP interne et MUST NOT être publié directement sur un port public. Le mode local HTTP SHALL rester explicitement identifié comme non productif.

#### Scenario: Requête HTTP publique
- **WHEN** un client atteint le proxy d'entrée en HTTP
- **THEN** il reçoit une redirection vers l'URL HTTPS correspondante
- **THEN** aucune donnée d'authentification n'est traitée sur le flux HTTP

#### Scenario: Accès direct au frontend
- **WHEN** la stack de déploiement est inspectée
- **THEN** le port HTTP du frontend n'est joignable que depuis le réseau du proxy d'entrée

### Requirement: Headers de sécurité

Le déploiement SHALL fournir HSTS sur les réponses HTTPS depuis le proxy d'entrée, et le frontend SHALL ajouter une CSP adaptée au bundle Angular, `X-Content-Type-Options: nosniff`, une `Referrer-Policy`, une `Permissions-Policy` et une protection contre le framing avec `frame-ancestors` et `X-Frame-Options`.

#### Scenario: Réponse applicative HTTPS
- **WHEN** un client reçoit une page ou une réponse d'erreur via HTTPS
- **THEN** les headers de sécurité configurés sont présents, y compris sur les réponses d'erreur
- **THEN** la page ne peut pas être chargée dans un frame d'une autre origine

#### Scenario: CSP compatible avec l'application
- **WHEN** le frontend Angular est chargé avec la CSP de production
- **THEN** les parcours de connexion, navigation et appels API fonctionnent sans ressource non autorisée

## ADDED Requirements

### Requirement: Proxy interne de confiance par plage d'adresses

Le backend SHALL accepter, dans la liste des proxys de confiance, des adresses exactes et des plages CIDR IPv4 ou IPv6. L'en-tête d'adresse client SHALL être pris en compte uniquement si l'adresse distante appartient à l'une de ces entrées.

#### Scenario: Proxy dans la plage de confiance
- **WHEN** une requête provient d'une adresse incluse dans une plage CIDR configurée et porte un en-tête `X-Real-IP` valide
- **THEN** le backend utilise cette adresse client pour l'audit et les limites de débit

#### Scenario: Source hors plage
- **WHEN** une requête provient d'une adresse hors de toutes les entrées configurées
- **THEN** le backend ignore l'en-tête et utilise l'adresse distante

#### Scenario: Entrée invalide
- **WHEN** la configuration contient une entrée qui n'est ni une adresse ni une plage CIDR valide
- **THEN** le démarrage échoue avec une erreur explicite
