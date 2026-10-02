# environnements-angular Specification

## Purpose

Décrire les configurations Angular réellement livrées et leur accès au backend réel.

## Requirements

### Requirement: Contrat de configuration par environnement

Le frontend Angular (`contribo-front/`) SHALL exposer un dossier `src/environments/` contenant un fichier pour chaque configuration conservée (`environment.ts` pour `development` et `environment.production.ts` pour `production`), chacun implémentant une interface TypeScript `Environment` commune définissant au minimum `production: boolean` et `apiBaseUrl: string`.

#### Scenario: Lecture de la configuration en développement

- **WHEN** le code applicatif importe `environment` depuis `src/environments/environment` sans build Angular explicite
- **THEN** les valeurs lues sont celles de `environment.ts`, avec `production: false` et une URL relative vers l'API réelle

#### Scenario: Les deux fichiers respectent le même contrat

- **WHEN** un développeur ouvre `environment.ts` et `environment.production.ts`
- **THEN** chacun exporte une constante `environment` qui satisfait l'interface `Environment`

### Requirement: Remplacement de fichier par configuration Angular

`contribo-front/angular.json` SHALL déclarer les configurations `development` et `production` de la cible `architect.build` et ne SHALL déclarer aucune configuration ou point d'entrée runtime mock.

#### Scenario: Serve en configuration development

- **WHEN** `ng serve` est exécuté sans configuration explicite dans `contribo-front/`
- **THEN** le bundle utilise `environment.ts`, `production: false`, le point d'entrée normal et le proxy backend réel

#### Scenario: Build en configuration production

- **WHEN** `ng build --configuration production` est exécuté dans `contribo-front/`
- **THEN** le bundle utilise `environment.production.ts`, avec `production: true`

#### Scenario: Aucun démarrage runtime mock

- **WHEN** un développeur inspecte les scripts npm, les configurations Angular et les points d'entrée
- **THEN** aucune commande, configuration ou import ne démarre un worker applicatif de simulation
