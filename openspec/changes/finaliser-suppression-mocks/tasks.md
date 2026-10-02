## 1. Préparer T-189

- [x] 1.1 [T-189] Vérifier le ticket, la dépendance T-186, la branche `front/fix-189-finaliser-suppression-mocks` et les résidus mock présents dans `develop`.
- [x] 1.2 [T-189] Définir les limites entre runtime mock supprimé et doubles de tests unitaires conservés.

## 2. Nettoyer les résidus frontend

- [x] 2.1 [T-189] Vérifier le lockfile contre `package.json` sans dépendance runtime MSW et retirer l'exclusion du worker dans `.prettierignore`.
- [x] 2.2 [T-189] Vérifier que les scripts, configurations, workers, handlers, comptes et données runtime mock ne sont plus référencés dans le frontend livré.
- [x] 2.3 [T-189] Corriger la perte de session réelle, fiabiliser l'en-tête CSRF des mutations et rediriger vers la page de connexion sur un `401` hors connexion.
- [x] 2.4 [T-189] Déplacer le contrat OpenAPI canonique vers `contribo-back/src/main/resources/contribo-api.yml` et aligner Maven, le générateur Angular, les images Docker, l'agent QA et la documentation.

## 3. Réaligner la documentation OpenSpec

- [x] 3.1 [T-189] Mettre à jour les specs publiées pour supprimer les exigences runtime mock, les comptes fictifs, le build mock et les références aux handlers MSW.
- [x] 3.2 [T-189] Documenter le démarrage avec le backend réel, la base de développement et les doubles de tests unitaires conservés.

## 4. Valider et livrer

- [x] 4.1 [T-189] Exécuter les recherches de résidus, les contrôles tickets/OpenSpec, les tests frontend, le build, le contrôle de documentation, le format check et `git diff --check`.
- [x] 4.2 [T-189] Mettre à jour les tâches réellement réalisées, vérifier le ticket et préparer le commit `fix(front): T-189 finaliser la suppression des mocks` et la PR vers `develop`.
