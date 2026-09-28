## Why

Le projet actuel dispose d'un frontend Angular fonctionnel pour le MVP, d'un contrat OpenAPI partagé et de mocks, mais pas encore de backend ni de chaîne de déploiement propre au dépôt. Le dépôt `saas-asso` apporte des exemples techniques potentiellement utiles, toutefois son périmètre fonctionnel est plus large et son état de travail local est modifié. Une analyse cadrée est donc nécessaire avant toute reprise de code afin de préserver les règles métier de Contribo et d'éviter de transformer une architecture de référence en source fonctionnelle implicite.

## What Changes

- Auditer le projet actuel à partir du contrat `besoins/openapi.yaml`, du cahier des user stories, des specs OpenSpec et de la structure du frontend.
- Auditer le dépôt de référence en lecture seule, en distinguant ses éléments versionnés de ses modifications locales.
- Classer chaque élément étudié comme réutilisable tel quel, adaptable ou à écarter, avec une justification liée au projet actuel.
- Définir une direction d'architecture backend et de déploiement compatible avec le frontend existant, sans reprendre par défaut les règles métier ni les modèles du dépôt de référence.
- Poser le contrat OpenAPI existant comme point de départ API Design First, avec une procédure de maintien du contrat et de régénération contrôlée du client frontend.
- Définir un découpage de livraison en tickets et PR séparés pour le socle backend, les évolutions du contrat, l'implémentation MVP et le déploiement.
- Ne modifier aucun code applicatif du backend ou du déploiement dans ce change de cadrage.

## Capabilities

### New Capabilities

- `reference-reuse-analysis`: analyse traçable du dépôt de référence et matrice de réutilisation technique.
- `backend-architecture-foundation`: direction d'architecture du backend alignée sur le contrat et les frontières du frontend.
- `api-design-first-governance`: règles de maintien du contrat OpenAPI et de synchronisation avec le client frontend.
- `deployment-foundation`: direction de configuration, conteneurisation, environnements et déploiement du MVP.

### Modified Capabilities

- Aucune exigence fonctionnelle existante n'est modifiée dans ce change. Les règles métier restent celles du projet actuel et les futurs écarts devront être traités par des changes dédiés.

## Impact

- Documentation et spécifications OpenSpec dans `openspec/changes/cadrer-backend-deploiement-reference/`.
- Registre local des tickets avec `T-142`, scope `fullstack`, type `chore`, branche `fullstack/chore-142-cadrage-backend-deploiement`.
- Références analysées dans `besoins/openapi.yaml`, `besoins/cahier-user-stories-mvp-association-v2.md`, `contribo-front/` et le dépôt externe local `/Users/habdiallo/Workspace/project-perso/saas-asso`.
- Aucun changement applicatif, aucune migration et aucune dépendance de production ne sont introduits par ce cadrage.
