## ADDED Requirements

### Requirement: Contrat de configuration par environnement
Le frontend Angular (`contribo-front/`) SHALL exposer un dossier `src/environments/` contenant un
fichier par configuration de build (`environment.ts` pour `development`, `environment.mock.ts` pour
`mock`, `environment.production.ts` pour `production`), chacun implémentant une interface
TypeScript `Environment` commune définissant au minimum `production: boolean` et
`apiBaseUrl: string`.

#### Scenario: Lecture de la configuration en développement
- **WHEN** le code applicatif importe `environment` depuis `src/environments/environment` sans
  build Angular explicite (ex. exécution de tests unitaires)
- **THEN** les valeurs lues sont celles de `environment.ts`, avec `production: false`

#### Scenario: Les trois fichiers respectent le même contrat
- **WHEN** un développeur ouvre `environment.ts`, `environment.mock.ts` et
  `environment.production.ts`
- **THEN** chacun des trois fichiers exporte une constante `environment` qui satisfait
  l'interface `Environment`, sans champ manquant ni champ supplémentaire non déclaré dans
  l'interface

### Requirement: Remplacement de fichier par configuration Angular
`contribo-front/angular.json` SHALL déclarer, pour chacune des configurations `development`,
`mock` et `production` de la cible `architect.build`, un `fileReplacements` substituant
`src/environments/environment.ts` par le fichier d'environnement correspondant à cette
configuration.

#### Scenario: Build en configuration production
- **WHEN** `ng build --configuration production` est exécuté dans `contribo-front/`
- **THEN** le bundle résultant utilise les valeurs de `environment.production.ts`, avec
  `production: true`

#### Scenario: Build en configuration mock
- **WHEN** `ng build --configuration mock` (ou `ng serve --configuration mock`) est exécuté dans
  `contribo-front/`
- **THEN** le bundle résultant utilise les valeurs de `environment.mock.ts`, sans affecter le
  `fileReplacement` existant de `main.ts` vers `main.mock.ts`

#### Scenario: Build en configuration development (par défaut)
- **WHEN** `ng build` ou `ng serve` est exécuté sans configuration explicite dans
  `contribo-front/`
- **THEN** le bundle résultant utilise les valeurs de `environment.ts` (`production: false`)
