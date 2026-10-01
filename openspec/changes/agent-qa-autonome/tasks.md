## 1. Préparer le ticket et le contrat d'artefacts

- [x] 1.1 [T-187] Vérifier la dépendance T-183, résoudre T-187 avec `node scripts/tickets.mjs resolve T-187 --json`, confirmer la branche `infra/feat-187-agent-qa-autonome` et exécuter `node scripts/tickets.mjs verify T-187` avant toute implémentation.
- [x] 1.2 [T-187] Définir les schémas versionnés de `runId`, inventaire, scénario, résultat, anomalie, ticket QA, manifeste et synthèse, avec redaction des secrets et règles de rétention documentées.

## 2. Construire la découverte et la planification

- [x] 2.1 [T-187] Implémenter la découverte en lecture seule des features/routes Angular, opérations OpenAPI, rôles, permissions, états et dépendances, en reliant les sources au plan T-183 sans modifier l'application.
- [x] 2.2 [T-187] Implémenter la génération des profils `smoke`, `full` et `targeted`, des identifiants de scénarios stables et de la matrice Feature, Scénario, Source, Rôle et Dépendance, avec cas non couverts explicitement listés.

## 3. Orchestrer l'exécution et la comparaison

- [x] 3.1 [T-187] Implémenter l'orchestrateur `discover`, `plan`, `prepare`, `execute`, `compare`, `classify`, `deduplicate`, `report` et `finalize`, avec mode dry-run et reprise d'un run interrompu.
- [x] 3.2 [T-187] Ajouter l'adaptateur d'exécution guidée et le contrat d'un adaptateur navigateur optionnel, avec confirmation obligatoire pour les mutations financières, suppressions et autres actions irréversibles.

## 4. Qualifier les écarts et éviter les doublons

- [x] 4.1 [T-187] Implémenter la comparaison attendu/observé, les statuts `Réussi`, `Échoué`, `Bloqué` et `Non applicable`, les catégories d'anomalie, les niveaux de sévérité et la distinction entre défaut confirmé, suspicion et clarification.
- [x] 4.2 [T-187] Implémenter l'empreinte normalisée, la recherche dans les runs et artefacts accessibles, la gestion des doublons exacts et potentiels et la liaison de chaque anomalie à un scénario et à un résultat.

## 5. Produire les artefacts QA et les tickets

- [x] 5.1 [T-187] Produire sous `qa/runs/<runId>/` le plan, les résultats JSON, la liste des anomalies, les tickets QA, le manifeste et le rapport de synthèse, avec preuves expurgées et métriques de couverture.
- [x] 5.2 [T-187] Générer un ticket de correction ou une fiche de clarification selon le niveau de preuve, avec reproduction, attendu, observé, impact, priorité, critères d'acceptation et tests de non-régression, sans promotion Git implicite.

## 6. Valider et préparer la livraison

- [x] 6.1 [T-187] Ajouter les fixtures et validations de schémas, de déduplication, de comptage et de reprise, puis exécuter les contrôles OpenSpec et `node scripts/tickets.mjs check` sur la branche du ticket.
- [x] 6.2 [T-187] Relire le diff ciblé, documenter l'environnement de recette, les limites et la politique de publication, puis préparer la PR vers `develop` avec les validations réelles, sans push direct ni fusion automatique.
