## 1. Préparer le ticket T-186

- [x] 1.1 [T-186] Vérifier le ticket, les prérequis et la branche `front/chore-186-supprimer-mocks-runtime` avant toute modification applicative.
- [x] 1.2 [T-186] Rechercher les points d'activation MSW, les handlers runtime, les données de démonstration et les références `start:mock`/`build:mock` à traiter.

## 2. Supprimer le runtime mock

- [x] 2.1 [T-186] Retirer de `package.json`, `angular.json`, `tsconfig*` et `src/environments` la configuration mock, ses scripts, alias, dépendance et point d'entrée.
- [x] 2.2 [T-186] Supprimer le worker MSW, l'agrégateur, les comptes/données de démonstration, les handlers par feature et les tests dédiés à ces handlers.
- [x] 2.3 [T-186] Régénérer le lockfile npm et vérifier que le build normal ne référence plus MSW ni un fichier mock runtime.

## 3. Réaligner documentation et intégration

- [x] 3.1 [T-186] Mettre à jour le README frontend et la documentation API pour documenter uniquement le démarrage avec le backend réel et conserver la stratégie de tests unitaires isolés.
- [x] 3.2 [T-186] Retirer les étapes de build mock des workflows CI sans modifier les validations backend ou le proxy réel.
- [x] 3.3 [T-186] Vérifier que les tests applicatifs restants n'importent pas les handlers runtime et conserver les doubles de test unitaires nécessaires.

## 4. Valider et livrer

- [x] 4.1 [T-186] Exécuter les tests frontend, le build, le lint, le format check, les contrôles tooling et les recherches de références résiduelles.

  Validation : tests, builds production et development, tooling, documentation,
  contrôle API, formatage des fichiers touchés et `git diff --check` réussis.
  Le lint global reste en échec sur un import inutilisé préexistant dans
  `src/app/core/session/auth.interceptor.ts`. Le format check global reste en
  échec sur quinze fichiers préexistants hors périmètre ; les fichiers touchés
  par T-186 sont conformes.
- [x] 4.2 [T-186] Mettre à jour les étapes réalisées, vérifier le ticket, créer le commit `chore(front): T-186 supprimer les mocks runtime`, pousser la branche et ouvrir une PR vers `develop`.
