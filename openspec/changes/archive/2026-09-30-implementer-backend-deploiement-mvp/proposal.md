## Why

Le cadrage `T-142` a confirmé que Contribo doit construire son propre backend et sa propre chaîne de déploiement à partir du contrat OpenAPI actuel, tout en limitant la référence technique à des patterns vérifiés. Les travaux doivent maintenant être découpés en tickets indépendants, ordonnés par dépendances, avec un worktree et une PR par livraison.

## What Changes

- Créer le socle backend sans reprendre les modèles métier de `saas-asso`.
- Ajouter progressivement l'authentification puis les domaines MVP du contrat API.
- Ajouter la persistance versionnée et les tests d'intégration nécessaires.
- Préparer le déploiement local, la publication d'images et l'environnement d'intégration.
- Maintenir `besoins/openapi.yaml` comme contrat canonique et synchroniser le frontend lorsqu'il évolue.
- Livrer chaque ticket sur sa branche dédiée, dans un worktree isolé, avec validation et PR vers `main`.

## Capabilities

### New Capabilities

- `backend-and-deployment-delivery-plan`: découpage ordonné des livraisons backend, frontend contractuel et infrastructure du MVP.

### Modified Capabilities

- Aucune exigence fonctionnelle existante n'est modifiée dans cette planification.

## Impact

- Backend futur dans `contribo-back/`.
- Contrat et client frontend dans `besoins/openapi.yaml` et `contribo-front/`.
- Déploiement futur dans `contribo-deploiement/` et CI dans `.github/workflows/`.
- Tickets planifiés de `T-143` à `T-151`, dépendants de `T-142`.
