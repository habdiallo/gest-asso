## Why

Le déploiement d'intégration charge actuellement la page de connexion très lentement et laisse l'interface partiellement vide. L'observation du serveur et de la console montre une incompatibilité entre la CSP active et Transloco MessageFormat, des polices externes bloquées, ainsi que des ressources et initialisations qui doivent être mesurées pour réduire le temps de démarrage.

## What Changes

- Rendre le rendu des traductions et des pluriels compatible avec la CSP sans autoriser `unsafe-eval`.
- Déplacer les polices utilisées par l'interface dans les assets de l'application et les servir depuis la même origine.
- Mesurer le démarrage de la page de connexion, identifier les requêtes et initializers bloquants, puis réduire le temps avant affichage et interaction.
- Ajouter des tests de régression frontend et un contrôle navigateur de la page déployée sous la CSP réelle.
- Vérifier que la configuration Nginx effectivement montée par Portainer, les headers CSP et les assets déployés sont cohérents après redéploiement.

## Capabilities

### New Capabilities

- `frontend-startup-performance`: mesurer et encadrer le chargement initial du frontend, ses initializers, ses assets et son temps d'interaction.

### Modified Capabilities

- `proxy-security-hardening`: la CSP doit rester restrictive tout en permettant le fonctionnement réel du frontend, sans erreur de ressource nécessaire ni `unsafe-eval` ajouté par défaut.
- `pluralisation-i18n-francaise`: les messages ICU doivent conserver leur comportement sous une CSP restrictive et ne pas provoquer d'erreur de rendu au démarrage.
- `portainer-deployment`: la procédure de déploiement doit vérifier la configuration Nginx montée, les assets de traduction et les headers effectifs avant de déclarer la version saine.

## Impact

- Frontend Angular : configuration Transloco, messages français, initializers, chargement des polices et tests.
- Déploiement : configuration Nginx Portainer, CSP, assets statiques et contrôles post-déploiement.
- CI et QA : mesures de performance, smoke test de la page de connexion et vérification des erreurs console.
- Aucun changement de contrat API ni de données métier attendu.
