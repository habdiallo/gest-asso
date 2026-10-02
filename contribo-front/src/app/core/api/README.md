# Client API

Source unique : `contribo-back/src/main/resources/contribo-api.yml`. Depuis `contribo-front/`, lancer
`npm run validate:api` puis `npm run generate:api`. Java 11+ est nécessaire ; le
premier lancement télécharge le JAR fixé dans `openapitools.json`.

La sortie `generated/` est ignorée par Git, ESLint et Prettier. Ne jamais la modifier
manuellement : modifier la configuration/contrat puis régénérer. Le fichier
`index.ts` est la frontière applicative unique vers cette sortie. Importer les types
et services via `@core/api`, jamais directement depuis `generated/`. Aucun package npm
client séparé n'est créé.

Le client utilise `/api/v1`, configuré par le contrat. `provideHttpClient()` est
installé au niveau applicatif. L'authentification réelle repose sur le cookie
HttpOnly `__Host-contribo-session`, transmis par l'intercepteur avec
`withCredentials: true`. Aucun jeton ni URL de développement ne doit être codé
dans un service de feature.

Les requêtes mutantes utilisent le token CSRF retourné par `/auth/csrf`. Le
frontend recopie `X-XSRF-TOKEN` depuis le cookie non secret ou depuis l'en-tête
de réponse lorsque le navigateur ne rend pas le cookie lisible.

Avant toute commande API, `npm run check:api` vérifie Node.js 22+, Java 11+, le
wrapper npm présent dans le lockfile et les versions exactes du wrapper et du
générateur. Les commandes `validate:api` et `generate:api` réutilisent ce contrôle
et exécutent uniquement le wrapper installé par `npm ci`, sans outil global.

Java reste une dépendance du générateur OpenAPI, pas de l'application Angular : il
est requis pour valider ou générer le client, mais ni `npm start`, ni `npm test`, ni
`npm run build` ne déclenchent Java ou la génération. Le premier contrôle ou la
première génération peut télécharger le JAR fixé dans `openapitools.json`.

La génération API est explicite, sans hook npm automatique. Avant de construire ou
tester une feature qui importe `@core/api`, générer le client. Vérifier sa compilation
avec `npx --no-install tsc --noEmit -p tsconfig.app.json`.

## Intégration avec le backend réel

Le frontend utilise exclusivement le client généré et le proxy de développement.
Depuis `contribo-front/`, lancer `npm start` avec le backend et la base de données
actifs. Les requêtes relatives `/api/v1` sont transmises au backend réel par
`proxy.conf.json`.

Les tests unitaires restent isolés du réseau réel. Les services et le client généré
utilisent `HttpTestingController` ou `provideHttpClientTesting`, tandis que les
composants remplacent leurs dépendances par des spies ou des fixtures locales.

Si une requête authentifiée reçoit `401`, l'intercepteur efface l'utilisateur
courant et redirige vers `/login`, car le JWT local est expiré ou invalide. Un
`403` reste une erreur d'autorisation ou de règle métier et ne déconnecte pas
l'utilisateur.
