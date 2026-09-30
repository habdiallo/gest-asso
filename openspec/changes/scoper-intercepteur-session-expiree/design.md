## Context

Le frontend utilise un cookie de session HttpOnly et un intercepteur HTTP global. Aujourd'hui, l'intercepteur efface l'état local et navigue vers `/login` pour toute réponse `401`, à l'exception de la requête de connexion. Cette règle mélange deux cas : une session réellement invalide et une erreur propre à un endpoint métier.

Le ticket doit rester frontend et préserver le contrat backend. Il doit aussi conserver la propagation de l'erreur à l'appelant, afin que la feature concernée puisse afficher son propre état d'erreur.

## Goals / Non-Goals

**Goals:**

- Déclencher l'invalidation globale uniquement pour les appels explicitement identifiés comme une vérification d'authentification ou de session.
- Laisser les `401` des endpoints métier dans le flux d'erreur de la feature appelante, sans effacer la session ni naviguer globalement.
- Conserver le comportement de la requête de connexion et la redirection dédiée `PASSWORD_CHANGE_REQUIRED`.
- Donner au tableau de bord un chemin de reconnexion déclenché par l'utilisateur lorsqu'un `401` est reçu après l'hydratation initiale de la session.
- Couvrir les deux branches de comportement par des tests d'intercepteur.

**Non-Goals:**

- Modifier l'endpoint `/dashboard` ou le backend livré par T-181.
- Modifier les autorisations métier ou transformer un `401` en `403`.
- Ajouter un store global, un mécanisme de retry automatique ou une nouvelle dépendance frontend.
- Déterminer qu'une session est valide à partir d'un simple code HTTP sur un endpoint métier.

## Decisions

### Portée déterminée par les endpoints de session

L'intercepteur utilisera une liste explicite d'appels d'authentification ou de session, issue des routes réellement présentes dans le contrat et le frontend. Une réponse `401` ne déclenchera l'invalidation globale que si la requête appartient à cette liste. La requête de login restera explicitement exclue, car son `401` décrit des identifiants invalides et non une session existante à supprimer.

Une simple règle fondée sur `status === 401` est rejetée car elle confond l'authentification globale avec l'erreur locale d'un endpoint. Une détection uniquement fondée sur le texte du message est également rejetée car ce contenu est instable et localisable.

### Conservation de la propagation RxJS

Dans tous les cas, l'intercepteur retournera l'erreur originale via `throwError`. La nouvelle règle ne masquera pas l'échec HTTP et ne créera pas de réponse de substitution. Cela permet aux pages et services métier de traiter un `401` localement.

### Tests colocalisés

Les tests resteront dans `contribo-front/src/app/core/session/session-expired.interceptor.spec.ts`. Ils utiliseront `HttpTestingController` pour démontrer séparément l'invalidation sur un appel de session, la conservation d'une session sur un endpoint métier, l'exclusion du login et le comportement `403` existant.

## Risks / Trade-offs

- [Risque] Un nouvel endpoint de vérification de session pourrait être oublié dans la liste explicite. → Documenter la liste et exiger un test lors de l'ajout d'un endpoint d'authentification.
- [Risque] Un backend peut renvoyer `401` pour une raison différente sur un endpoint de session. → Conserver la responsabilité de la sémantique d'authentification côté contrat et vérifier le code d'erreur dans les tests d'intégration frontend si le contrat l'expose.
- [Risque] Une feature peut recevoir un `401` sans message global. → Préserver la propagation de l'erreur et laisser la feature décider de son affichage.
- [Risque] Un `401` du tableau de bord peut laisser l'utilisateur sur une page inutilisable si aucune action n'est proposée. → Le tableau de bord affiche une action de reconnexion, efface l'état local sur activation, puis navigue vers `/login`.

## Migration Plan

1. Ajouter la règle de portée et les tests sur la branche T-182.
2. Exécuter les validations frontend existantes et le build.
3. Livrer la PR vers `develop`.
4. En cas de régression, revenir au commit de T-182 sans migration de données ni changement backend.

## Open Questions

- La liste finale doit-elle viser l'endpoint existant `GET /me`, ou un endpoint de session dédié sera-t-il introduit ultérieurement ? Le ticket devra choisir une liste correspondant au contrat présent au moment de l'implémentation.
