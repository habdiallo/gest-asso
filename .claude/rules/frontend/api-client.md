---
paths:
  - "contribo-front/src/**/*.ts"
  - "contribo-front/package.json"
  - "contribo-front/angular.json"
  - "contribo-front/openapitools.json"
  - "contribo-front/proxy.conf.json"
  - "besoins/openapi.yaml"
---

# Client API — Contribo, API Design First

## Contrat unique

- `besoins/openapi.yaml` est la source de vérité des échanges frontend/backend.
- Consommer `operationId`, requêtes/réponses, enums, formats et codes d'erreur sans inventer de comportement serveur.
- Préfixe contractuel : `/api/v1`, pas `/api` seul.
- Aucun backend n'est présent. Le proxy de développement couvre `/api/**`, sans réécriture, vers `localhost:8080` (convention à ajuster à l'intégration backend).
- La génération Angular est configurée dans `openapitools.json` depuis `../besoins/openapi.yaml`, avec générateur fixé et alias `@api`.
- Ne pas prétendre que le client se régénère au build, aux tests ou au démarrage.

## Génération et consommation

- Depuis `contribo-front/` : `npm run validate:api`, puis `npm run generate:api`. Java 11+ et un téléchargement initial du JAR sont nécessaires.
- La sortie `src/app/core/api/generated/` est ignorée par Git, ESLint et Prettier ; versionner contrat, configuration et lockfile npm.
- Générer avant de construire/tester une feature qui importe `@api`. Aucun hook npm ne déclenche la génération automatiquement ; le shell reste indépendant du client.
- Vérifier la compilation du généré et les propriétés nullables/enums après toute évolution du contrat ou du générateur ; ne pas dégrader le contrat pour contourner un outil.
- Générer DTO et services HTTP depuis le contrat. Ne pas les écrire à la main ni modifier le généré.
- Voir `contribo-front/src/app/core/api/README.md` pour les commandes et la politique de reproduction.
- Garder les composants centrés sur l'IHM ; placer orchestration API/état partagé dans un service ou store de feature fin si nécessaire.
- Ne pas imposer ports abstraits, adapters ou copies de DTO. Réutiliser les types générés s'ils expriment le besoin.
- Ajouter un mapping seulement pour une transformation utile ou un concept distinct réellement utilisé.
- Ne pas contourner le client avec des appels HTTP métier manuels ou `httpResource()` construit à partir d'URLs libres.

## Requêtes, sécurité et états

- Base relative/configurable, sans hôte de développement codé en dur dans une feature.
- `provideHttpClient()` est configuré ; l'authentification Bearer doit être reliée à la session réelle lors de son intégration, sans jeton fictif.
- Respecter rôles et `operatorCanRecordPayments`. La fonction associative ne confère aucun droit.
- Le contrôle IHM ne remplace pas l'autorisation backend. Gérer 401/403 sans exposer de données non autorisées.
- Ne pas journaliser jetons, mots de passe, coordonnées ou historiques financiers des membres.
- Respecter pagination, filtres et recherche de chaque opération, sans paramètres inventés.
- Distinguer absence, zéro et null, notamment l'effacement du nom d'usage par `null`.
- Montants entiers et dates contractuelles ; formatage uniquement à l'affichage.
- Exploiter les codes stables et `fieldErrors`, sans analyser le texte du message.

## Rafraîchissement et mocks

- Après mutation, utiliser l'état retourné ; rafraîchir les agrégats/listes que la réponse ne contient pas.
- Ne pas recalculer un état financier officiel à partir d'une page partielle de règlements.
- Ne pas réessayer automatiquement une écriture financière après une erreur réseau ambiguë : elle pourrait déjà avoir été enregistrée.
- Les mocks respectent modèles, contraintes, droits et transitions du contrat.
- Ne pas ajouter paiement en ligne, inscription libre, suppression ou correction financière absent du contrat.
- Signaler un besoin non couvert et faire valider la modification contractuelle avant implémentation.
- Tests de composant : remplacer la dépendance applicative réellement injectée. Tests API : vérifier requêtes, réponses et erreurs avec le dispositif adapté au client configuré.
