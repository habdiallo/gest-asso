## MODIFIED Requirements

### Requirement: Contrat de configuration par environnement

Le frontend Angular (`contribo-front/`) SHALL exposer un dossier `src/environments/` contenant un fichier pour chaque configuration de build conservée (`environment.ts` pour `development` et `environment.production.ts` pour `production`), chacun implémentant une interface TypeScript `Environment` commune définissant au minimum `production: boolean` et `apiBaseUrl: string`.

#### Scenario: Lecture de la configuration en développement

- **WHEN** le code applicatif importe `environment` depuis `src/environments/environment` sans build Angular explicite, par exemple pendant les tests unitaires
- **THEN** les valeurs lues sont celles de `environment.ts`, avec `production: false` et l'URL relative de l'API réelle

#### Scenario: Les deux fichiers respectent le même contrat

- **WHEN** un développeur ouvre `environment.ts` et `environment.production.ts`
- **THEN** chacun exporte une constante `environment` qui satisfait l'interface `Environment`, sans champ manquant ni champ supplémentaire non déclaré dans l'interface

### Requirement: Remplacement de fichier par configuration Angular

`contribo-front/angular.json` SHALL déclarer, pour les configurations `development` et `production` de la cible `architect.build`, les remplacements d'environnement correspondants. Il SHALL ne déclarer aucune configuration mock ni aucun remplacement vers un point d'entrée mock.

#### Scenario: Build en configuration production

- **WHEN** `ng build --configuration production` est exécuté dans `contribo-front/`
- **THEN** le bundle résultant utilise les valeurs de `environment.production.ts`, avec `production: true`, sans worker ni point d'entrée runtime supprimé

#### Scenario: Serve en configuration development

- **WHEN** `ng serve` est exécuté sans configuration explicite dans `contribo-front/`
- **THEN** le bundle utilise `environment.ts`, `production: false`, le point d'entrée normal et le proxy backend réel

#### Scenario: Build sans configuration explicite

- **WHEN** `ng build` est exécuté sans configuration explicite
- **THEN** le bundle utilise `environment.production.ts`, avec `production: true`
