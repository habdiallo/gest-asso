## Context

Le frontend Angular possède deux chemins d'exécution : le chemin réel, qui utilise le proxy `/api/**`, et un chemin mock basé sur MSW, ses handlers par feature et des données de démonstration. Le backend réel est maintenant disponible dans le dépôt et les tests manuels ont montré que le mode mock peut être lancé sans être remarqué. Le changement touche le tooling frontend, la documentation et la CI, mais pas le contrat API ni le backend.

## Goals / Non-Goals

**Goals:**

- Faire du chemin réel (`npm start`, `npm run build`) l'unique chemin d'exécution et de validation applicative.
- Supprimer les artefacts qui enregistrent ou alimentent MSW au runtime navigateur.
- Conserver les tests unitaires isolés qui utilisent les outils Angular/Vitest adaptés.
- Rendre la documentation et la CI cohérentes avec l'existence du backend réel.
- Garder le proxy `/api/**`, la configuration development et la configuration production fonctionnels.

**Non-Goals:**

- Modifier les endpoints, DTO, modèles OpenAPI ou migrations de base de données.
- Remplacer les tests unitaires par un outil E2E ou créer un nouveau backend de test.
- Supprimer les spies, `HttpTestingController`, `provideHttpClientTesting` ou les fixtures locales utilisées par des tests de composants et services.
- Changer l'architecture Angular par fonctionnalités.

## Decisions

- **Supprimer entièrement le chemin mock runtime.** Les configurations `mock`, les points d'entrée MSW, les handlers, les données de démonstration et le worker sont retirés au lieu d'être conservés derrière un flag. Cela évite qu'un démarrage accidentel serve encore des données fictives.
- **Conserver uniquement le client API réel dans les builds.** `angular.json` gardera les configurations `development` et `production`, leurs remplacements d'environnement et le proxy existant. La commande `npm start` appellera donc toujours `/api/v1` via le backend configuré.
- **Retirer MSW et les scripts associés.** La dépendance `msw`, le bloc de configuration `msw`, les scripts `start:mock` et `build:mock`, l'alias `@mocks` et `tsconfig.mock.json` seront supprimés avec les imports devenus orphelins. Le lockfile sera régénéré par npm.
- **Retirer les tests des handlers runtime, garder les tests applicatifs.** Les fichiers `handlers.spec.ts` dédiés aux handlers MSW vérifient une implémentation supprimée. Les tests de pages, composants, services et client API qui utilisent `HttpTestingController` ou des spies restent dans leur feature et continuent de valider le comportement frontend.
- **Mettre à jour la CI sans ajouter un équivalent mock.** Les workflows ne lanceront plus `npm run build:mock`. Le build normal, les tests et les contrôles de tooling restent les validations de cette branche.

Alternatives écartées : conserver MSW mais masquer sa commande, car cela laisserait un chemin trompeur ; remplacer MSW par un autre serveur de fixtures, car cela recréerait la divergence avec le backend réel ; supprimer tous les mocks de tests, car ils sont indépendants du runtime et nécessaires à la vitesse des tests unitaires.

## Risks / Trade-offs

- **[Risque]** Les tests manuels sans backend ne fonctionneront plus. → La documentation indiquera explicitement le prérequis backend et la commande `npm start` réelle ; les tests automatisés restent isolés.
- **[Risque]** Des imports ou références résiduels peuvent casser la compilation. → Rechercher les références `msw`, `mock`, `demo` et `build:mock`, puis exécuter tests, build, lint, format et contrôles de tooling.
- **[Risque]** La CI pourrait perdre une couverture spécifique aux handlers. → Les scénarios métier sont reportés sur les tests applicatifs existants et les validations d'intégration réelles ; aucune nouvelle validation E2E n'est inventée dans ce ticket.
- **[Trade-off]** Le build devient plus représentatif de la production, mais nécessite le backend pour un test manuel complet. → Le proxy et les instructions de démarrage documentent ce flux.

## Migration Plan

1. Supprimer le chemin mock, ses dépendances, ses données et sa documentation.
2. Régénérer le lockfile avec `npm install` ou la commande npm équivalente sans changer d'autres dépendances.
3. Mettre à jour les workflows et vérifier que les scripts documentés existent.
4. Exécuter les validations frontend et vérifier que le build ne contient plus le worker MSW.
5. Déployer normalement ; aucun changement de données ou de migration n'est nécessaire.

Pour revenir en arrière, rétablir le commit de suppression et relancer `npm ci`. Le rollback ne modifie pas la base de données ni le backend.

## Open Questions

Aucune question bloquante. Un futur besoin d'environnement simulé devra faire l'objet d'un ticket distinct, avec une frontière explicite et une validation du mainteneur.
