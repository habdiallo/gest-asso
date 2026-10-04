## Why

Le backend force actuellement l'attribut `Secure` sur le cookie de session. Le navigateur refuse alors la session lorsque le frontend local est servi en HTTP, ce qui empêche de tester le parcours d'authentification en local. La configuration doit préserver le niveau de sécurité des environnements staging et production tout en permettant un mode explicite pour le développement local.

## What Changes

- Rendre l'attribut `Secure` du cookie de session configurable par environnement.
- Conserver `Secure=true` pour staging, intégration et production.
- Autoriser `Secure=false` uniquement dans le profil de développement local servi en HTTP.
- Prendre en compte la contrainte du préfixe `__Host-`, incompatible avec un cookie non sécurisé, en définissant un nom de cookie local compatible ou en documentant clairement le choix HTTPS local.
- Aligner le cookie d'expiration, les tests et les exemples de configuration sur le même réglage.
- Vérifier que le mode sécurisé reste le défaut lorsque la configuration est absente.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `secure-cookie-session`: faire varier l'attribut `Secure` et le nom de cookie compatible avec le mode HTTP local, sans réduire la politique des environnements non locaux.

## Impact

- Backend: `SessionCookieService`, configuration Spring et tests HTTP d'authentification.
- Déploiement: variables d'environnement et fichiers Compose ou exemples associés au développement local, à l'intégration, au staging et à la production.
- Contrat et documentation API: préciser le nom de cookie attendu selon le mode d'exécution si le mode local utilise un nom distinct.
- Ticket local: `T-209`, branche `back/fix-209-configurer-secure-cookie-session`, PR ciblée vers `develop`.
- Aucun changement de schéma de données ni de migration n'est prévu.
