## 1. Cadrage et audit du socle

- [x] 1.1 [T-188] Résoudre T-188 avec `node scripts/tickets.mjs resolve T-188 --json`, confirmer `infra/feat-188-agent-qa-ia-claude-codex`, vérifier les prérequis T-187 et exécuter `node scripts/tickets.mjs verify T-188` avant le code.
- [x] 1.2 [T-188] Auditer les appelants de T-187, le mode guidé, les artefacts et les tests, puis décider dans le périmètre T-188 ce qui est conservé, migré ou supprimé.

## 2. Contrat d'observation IA

- [x] 2.1 [T-188] Définir le contrat d'observation navigateur, le préflight, les capacités déclarées et le protocole de reprise compatible avec `qa/runs/<runId>`, en incluant les specs et changes OpenSpec terminés comme sources de vérité.
- [x] 2.2 [T-188] Ajouter les validations de schéma, la redaction des preuves et les fixtures couvrant succès, blocage, absence de navigateur et données sensibles.

## 3. Entrée Claude et Codex

- [x] 3.1 [T-188] Créer le skill source `.claude/skills/qa-agent/SKILL.md` avec l'invocation `/qa-agent`, la boucle de test, les règles de sécurité et la restitution attendue.
- [x] 3.2 [T-188] Synchroniser le skill vers Codex et les sorties gérées, puis vérifier la parité et l'invocation `$qa-agent` avec les contrôles IA du dépôt.

## 4. Préparation et pilotage navigateur

- [x] 4.1 [T-188] Implémenter le préflight de l'environnement local, la détection de l'application et la détection explicite des capacités navigateur disponibles dans la session.
- [x] 4.2 [T-188] Implémenter la boucle d'exécution IA qui lit un scénario, demande une action autorisée, observe l'état suivant et produit une observation normalisée sans inventer de résultat.

## 5. Intégration des résultats

- [x] 5.1 [T-188] Brancher les observations de session sur l'orchestrateur T-187 pour produire des résultats, anomalies, déduplications et tickets QA locaux.
- [x] 5.2 [T-188] Ajouter la reprise d'un run interrompu, les métriques de couverture et une synthèse distinguant exécuté, bloqué, non applicable et non couvert.

## 6. Sécurité et nettoyage du socle

- [x] 6.1 [T-188] Protéger les actions irréversibles ou financières par confirmation explicite, tracer la décision et vérifier qu'aucune donnée de production n'est acceptée.
- [x] 6.2 [T-188] Auditer les chemins T-187 et conserver uniquement le fallback guidé encore nécessaire, documenté et couvert par les tests ; aucune suppression n'est faite lorsque le mode navigateur n'est pas disponible.

## 7. Validation et livraison

- [x] 7.1 [T-188] Exécuter les tests QA, les tests de parité IA, les contrôles OpenSpec et un smoke local non destructif en mode préparation, puis documenter l'absence éventuelle de navigateur ou d'application accessible.
- [x] 7.2 [T-188] Mettre à jour la documentation de lancement Claude/Codex et préparer la PR `infra/feat-188-agent-qa-ia-claude-codex` vers `develop` avec les validations et limites réelles.
