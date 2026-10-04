## MODIFIED Requirements

### Requirement: Session d'authentification en cookie sécurisé

Le login SHALL établir la session avec un cookie HttpOnly, SameSite=Strict et Path=/, sans exposer le JWT dans le corps JSON ni dans un stockage accessible au JavaScript. Lorsque le réglage de sécurité du cookie vaut `true`, le cookie SHALL s'appeler `__Host-contribo-session` et porter l'attribut `Secure`. Lorsque le réglage vaut `false`, uniquement pour le développement local en HTTP, le cookie SHALL utiliser un nom sans préfixe réservé et ne SHALL pas porter l'attribut `Secure`. La durée de validité de la session SHALL rester limitée à 30 minutes, soit 1800 secondes, conformément à la configuration existante.

#### Scenario: Connexion réussie en environnement sécurisé
- **WHEN** un compte actif fournit des identifiants valides à `POST /auth/login` avec la configuration sécurisée
- **THEN** la réponse pose le cookie `__Host-contribo-session` avec `HttpOnly`, `Secure`, `SameSite=Strict` et `Path=/`
- **THEN** la réponse ne contient pas de JWT exploitable par le frontend

#### Scenario: Connexion réussie en développement HTTP
- **WHEN** un compte actif fournit des identifiants valides à `POST /auth/login` avec la configuration locale non sécurisée
- **THEN** la réponse pose le cookie local sans préfixe `__Host-` avec `HttpOnly`, `Secure=false`, `SameSite=Strict` et `Path=/`
- **THEN** la réponse ne contient pas de JWT exploitable par le frontend

#### Scenario: Déconnexion
- **WHEN** l'utilisateur appelle l'action de déconnexion
- **THEN** le cookie de session actif est supprimé ou expiré avec le même nom et les mêmes attributs de portée que le cookie émis
- **THEN** une réutilisation de l'ancienne session échoue

### Requirement: Configuration d'environnement du cookie de session

Le backend SHALL lire un réglage explicite de sécurité du cookie depuis sa configuration. La valeur par défaut SHALL être `true`. Les configurations d'intégration, de staging et de production SHALL conserver `true`; seule la configuration locale prévue pour un frontend HTTP peut définir `false`.

#### Scenario: Configuration absente
- **WHEN** le backend démarre sans valeur pour le réglage de sécurité du cookie
- **THEN** il utilise `Secure=true` et le nom `__Host-contribo-session`

#### Scenario: Configuration locale explicite
- **WHEN** le backend démarre avec le réglage local `Secure=false`
- **THEN** il utilise le nom de cookie local sans préfixe `__Host-`
- **THEN** les opérations d'émission, de lecture et d'expiration utilisent ce même nom

#### Scenario: Configuration non locale
- **WHEN** le backend est démarré par une composition d'intégration, de staging ou de production
- **THEN** la configuration fournie conserve `Secure=true`
- **THEN** aucune variante locale non sécurisée n'est activée par défaut

## ADDED Requirements

### Requirement: Compatibilité du nom de cookie avec le mode HTTPS

Le backend SHALL interdire toute combinaison qui associe le préfixe `__Host-` à `Secure=false`. Le contrôle de session SHALL utiliser le nom réellement configuré ou dérivé, sans constante divergente dans la chaîne de sécurité.

#### Scenario: Mode sécurisé
- **WHEN** le réglage `Secure=true` est actif
- **THEN** le nom de session est `__Host-contribo-session`
- **THEN** la lecture du cookie par le filtre d'authentification reconnaît ce nom

#### Scenario: Mode non sécurisé
- **WHEN** le réglage `Secure=false` est actif
- **THEN** le nom de session n'est pas préfixé par `__Host-`
- **THEN** la lecture du cookie par le filtre d'authentification reconnaît le nom local
