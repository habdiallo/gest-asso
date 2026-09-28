## ADDED Requirements

### Requirement: Login limité par IP et identifiant

Le backend SHALL appliquer des fenêtres de limitation distinctes par adresse client canonique et par identifiant de connexion normalisé sur `POST /auth/login`. Le dépassement d'une fenêtre SHALL répondre avec le statut `429` et une erreur générique ne révélant pas si le compte existe.

#### Scenario: Trop de tentatives depuis une même adresse
- **WHEN** une adresse client dépasse la limite de tentatives de login sur la fenêtre configurée
- **THEN** `POST /auth/login` répond `429` pour les tentatives suivantes de la fenêtre
- **THEN** la réponse ne révèle ni le statut du compte ni le mot de passe attendu

#### Scenario: Trop de tentatives sur un même identifiant
- **WHEN** un identifiant normalisé dépasse sa limite de tentatives, même avec des adresses différentes
- **THEN** `POST /auth/login` répond `429` pour cet identifiant pendant la fenêtre configurée
- **THEN** un identifiant différent n'hérite pas de ce compteur sans dépasser sa propre limite

### Requirement: Adresse client protégée contre le spoofing

Le système SHALL dériver l'adresse client de la connexion réseau observée ou d'un header réécrit par un proxy explicitement de confiance. Il MUST ignorer ou écraser toute valeur `X-Forwarded-For` fournie directement par un client non approuvé.

#### Scenario: Header client forgé
- **WHEN** une requête de login fournit une valeur `X-Forwarded-For` différente de son adresse réseau observée
- **THEN** les compteurs et les événements de sécurité utilisent l'adresse canonique observée par le proxy de confiance
- **THEN** l'attaquant ne peut pas créer une nouvelle clé de limitation en changeant ce header

### Requirement: Limitation globale au reverse proxy

Le reverse proxy SHALL limiter le débit global des requêtes entrantes et appliquer une limite spécifique au chemin de login avant transmission au backend.

#### Scenario: Débit global dépassé
- **WHEN** le trafic entrant dépasse la limite globale configurée
- **THEN** le reverse proxy refuse ou temporise la requête selon sa politique sans surcharger le backend
- **THEN** les réponses de limitation restent observables par leur statut et leur métrique
