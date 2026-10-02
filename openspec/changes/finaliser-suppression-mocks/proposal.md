## Why

Le ticket T-186 a supprimé le runtime MSW du frontend, mais sa livraison a laissé des résidus dans le lockfile, les exclusions de formatage et les specs publiées. Ces références entretiennent l'idée qu'un mode mock reste disponible alors que le backend réel et la base de développement sont maintenant la source d'exécution attendue.

## What Changes

- Vérifier qu'aucune dépendance directe `msw` n'est déclarée dans le frontend. Les peerDependencies optionnelles apportées par Vitest restent uniquement des métadonnées de test et ne constituent pas un runtime mock.
- Supprimer l'exclusion `.prettierignore` du worker MSW.
- Supprimer ou réaligner les specs OpenSpec qui décrivent encore le runtime mock, les comptes de démonstration ou le build mock.
- Conserver les doubles de tests unitaires, les spies, `HttpTestingController` et les classes de test Spring qui ne constituent pas un runtime mock applicatif.
- Documenter que `npm start` utilise exclusivement le backend réel via le proxy `/api/**`.
- Corriger l'état d'authentification frontend quand une requête réelle retourne `401` après expiration du JWT local.
- Fiabiliser les mutations authentifiées quand le navigateur ne rend pas le cookie CSRF lisible, sans désactiver la protection pour les requêtes cross-site.
- Centraliser le contrat OpenAPI dans `contribo-back/src/main/resources/contribo-api.yml`, comme source unique du backend, du client Angular, des images Docker et de l'agent QA.
- Rendre le rendu des cartes cagnottes tolérant aux champs financiers optionnels absents ou renvoyés à `null`, afin de conserver les informations métier et de masquer uniquement la jauge lorsqu'aucun objectif n'est défini.
- Rétablir le rendu responsive des collections : le composant `app-data-table` est utilisé sur desktop et tablette, tandis que les cartes mobiles existantes restent affichées sous le breakpoint `tablet`, sans modifier les règles métier ni la pagination.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `mocks-api-msw` : retirer le contrat du runtime MSW et conserver l'isolation des tests unitaires.
- `mock-build-validation` : retirer les exigences de build, handlers et démarrage mock.
- `environnements-angular` : décrire uniquement les configurations development et production.
- `demo-auth-session` : retirer le catalogue de comptes et les scénarios d'authentification mockée.
- `campaign-detail-coherence` : retirer la requirement fondée sur les données MSW de démonstration.
- `api-design-first-governance` : aligner le contrat avec le client et les tests, sans mock runtime.
- `backend-and-deployment-delivery-plan` : aligner les consommateurs API réels, sans mock runtime.
- `refactorisation-sans-regression` : retirer l'alias et les frontières liés à `src/mocks`.
- `demo-auth-session` : documenter la gestion de l'expiration de session sur les endpoints réels.

## Impact

- Frontend : `contribo-front/.prettierignore`, l'intercepteur d'expiration de session, ses tests et la documentation d'intégration API.
- OpenSpec : specs publiées et delta du change `finaliser-suppression-mocks`.
- Backend : déplacement du fichier de contrat dans les ressources, sans changement d'endpoint, de schéma ou de migration.
- Tests : aucune suppression des mocks de tests unitaires ou des objets simulés nécessaires aux tests de composants.
