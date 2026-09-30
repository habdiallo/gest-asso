## Why

`session-expired.interceptor.ts` traite actuellement toute réponse HTTP `401` comme une session invalide. Un endpoint métier indisponible, incomplet ou refusant l'accès peut donc effacer une session pourtant valide et rediriger l'utilisateur vers `/login`. T-181 rétablit l'endpoint `/dashboard`, mais le comportement global de l'intercepteur reste une source de déconnexion abusive et de diagnostic trompeur.

## What Changes

- Définir précisément quelles réponses `401` peuvent invalider la session côté frontend.
- Préserver la session et la réponse d'erreur pour les `401` provenant d'un endpoint métier non lié à l'état de session.
- Conserver la redirection vers `/login` lorsqu'une vérification d'authentification ou de session confirme l'invalidité de la session.
- Ajouter des tests couvrant les réponses `401` d'authentification, les erreurs `401` métier, les erreurs `403` et les requêtes de connexion.
- Documenter la règle de portée de l'intercepteur afin que les futurs endpoints n'en dépendent pas implicitement.

## Capabilities

### New Capabilities

- `session-expiration-scope`: Détermine quand une réponse d'authentification invalide la session frontend et quand elle doit rester une erreur locale à la requête.

### Modified Capabilities

Cette évolution introduit une règle frontend dédiée et ne modifie pas les exigences du contrat de session cookie existant.

## Impact

- Frontend Angular : `contribo-front/src/app/core/session/session-expired.interceptor.ts` et ses tests.
- Services ou contrats d'authentification utilisés pour distinguer une session invalide d'un refus propre à un endpoint.
- Navigation vers `/login` et conservation de l'état de session pour les erreurs métier.
- Aucun changement du backend `/dashboard` de T-181 ni du contrat des endpoints métier n'est inclus dans ce ticket.
