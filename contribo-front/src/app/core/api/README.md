# Client API

Source unique : `besoins/openapi.yaml` à la racine. Depuis `contribo-front/`, lancer
`npm run validate:api` puis `npm run generate:api`. Java 11+ est nécessaire ; le
premier lancement télécharge le JAR fixé dans `openapitools.json`.

La sortie `generated/` est ignorée par Git, ESLint et Prettier. Ne jamais la modifier
manuellement : modifier la configuration/contrat puis régénérer. Importer les types
et services via `@api` après génération. Aucun package npm client séparé n'est créé.

Le client utilise `/api/v1`, configuré par le contrat. `provideHttpClient()` est
installé au niveau applicatif. Configurer les credentials Bearer depuis la session
réelle lors de l'intégration de l'authentification ; ne pas coder un jeton ni une
URL de développement dans un service de feature.

La génération est explicite, sans hook npm automatique. Avant de construire/tester
une feature qui importe `@api`, générer le client. Le shell d'accueil n'en dépend
pas. Vérifier la compilation avec `npx --no-install tsc --noEmit -p tsconfig.app.json`.
