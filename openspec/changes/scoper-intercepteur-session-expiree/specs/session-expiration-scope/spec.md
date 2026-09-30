## ADDED Requirements

### Requirement: Invalidation globale limitée aux appels de session

Le frontend SHALL effacer la session locale et naviguer vers `/login` uniquement lorsqu'une réponse `401` provient d'un endpoint explicitement identifié comme un appel d'authentification ou de validation de session. Le statut HTTP `401` seul SHALL NOT suffire à déclencher cette invalidation pour un endpoint métier.

#### Scenario: Session invalide confirmée par l'appel de session
- **WHEN** un appel explicitement identifié comme une vérification de session reçoit une réponse `401`
- **THEN** le frontend efface la session locale
- **THEN** le frontend navigue vers `/login`
- **THEN** l'erreur HTTP originale reste propagée à l'appelant

#### Scenario: Endpoint métier renvoyant 401
- **WHEN** un endpoint métier comme `/members` ou `/dashboard` reçoit une réponse `401` alors que la requête n'est pas un appel de validation de session
- **THEN** le frontend conserve la session locale
- **THEN** le frontend ne navigue pas vers `/login` à cause de cet appel
- **THEN** l'erreur HTTP originale reste propagée à la feature appelante

### Requirement: Requête de connexion exclue de l'expiration de session

Le frontend SHALL traiter une réponse `401` de la requête de connexion comme une erreur d'identifiants, sans effacer une session existante ni provoquer une navigation globale vers `/login` par l'intercepteur d'expiration.

#### Scenario: Identifiants de connexion invalides
- **WHEN** `POST /auth/login` reçoit une réponse `401`
- **THEN** l'intercepteur ne déclenche pas la logique d'expiration d'une session
- **THEN** l'erreur reste disponible pour l'affichage de l'échec de connexion

### Requirement: Compatibilité avec les erreurs globales existantes

Le frontend SHALL conserver la redirection vers `/changer-mot-de-passe` pour une réponse `403` portant le code `PASSWORD_CHANGE_REQUIRED`, quel que soit l'endpoint concerné, sans effacer automatiquement la session pour ce seul motif.

#### Scenario: Changement de mot de passe obligatoire
- **WHEN** une requête reçoit une réponse `403` avec le code `PASSWORD_CHANGE_REQUIRED`
- **THEN** le frontend navigue vers `/changer-mot-de-passe`
- **THEN** le frontend ne traite pas cette réponse comme une expiration `401`
