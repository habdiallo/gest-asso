## Why

Le frontend conserve un mode d'exécution MSW construit avant la disponibilité du backend réel. Il peut servir des données et des comptes fictifs tout en donnant l'impression que l'intégration fonctionne, ce qui a masqué le fait que le navigateur était lancé en configuration mock lors des premiers tests de bout en bout. Le backend et la base de développement étant maintenant disponibles, le runtime applicatif doit utiliser le chemin réel par défaut et ne plus embarquer ce faux environnement.

## What Changes

- **BREAKING** Supprimer les commandes et configurations Angular dédiées au démarrage et au build mock.
- Supprimer l'entrée `main.mock.ts`, l'environnement mock, le worker MSW, les handlers par feature et les données de démonstration utilisées uniquement par le runtime mock.
- Retirer la dépendance et les alias de configuration devenus inutiles, puis mettre à jour le lockfile.
- Mettre à jour la documentation frontend et la CI pour ne valider que le build et le démarrage avec le backend réel.
- Conserver les doubles de tests unitaires nécessaires, notamment `HttpTestingController`, les spies et les fixtures colocalisées qui ne démarrent pas de service worker.
- Vérifier que `npm start` et le build normal utilisent toujours le client API réel, le proxy `/api/**` et les données renvoyées par le backend.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `mocks-api-msw` : supprimer le mode mock réseau applicatif et conserver uniquement la séparation des tests unitaires vis-à-vis du réseau réel.
- `mock-build-validation` : remplacer la validation du build et du serveur mock par les validations du frontend réel et retirer les scénarios dépendant des handlers MSW.
- `environnements-angular` : supprimer la configuration d'environnement et les remplacements de fichiers propres au mode mock, sans changer les configurations development et production.

## Impact

- Frontend Angular : `package.json`, `package-lock.json`, `angular.json`, `tsconfig*`, `src/main*`, `src/environments`, les dossiers `mocks` et le worker public.
- Documentation et automatisation : README frontend, documentation du client API et workflows CI qui invoquent le build mock.
- API et backend : aucun changement de contrat, d'endpoint ou de migration ; le frontend appellera les services réels déjà exposés par le proxy.
- Validation : tests unitaires frontend, build normal, contrôle de formatage et vérification qu'aucune activation MSW/runtime mock ne subsiste.
