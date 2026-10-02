## Why

Le ticket T-187 a fourni un orchestrateur de campagnes QA guidées, mais il ne peut pas observer l'application ni exécuter les parcours à la place d'un testeur. Le besoin réel est un agent IA que l'on peut lancer depuis Claude ou Codex contre l'environnement local, avec des preuves, des limites de sécurité et un rapport exploitable.

## What Changes

- Ajouter un agent QA IA invocable comme capacité Claude et Codex depuis la racine du dépôt.
- Faire découvrir à l'agent le périmètre fonctionnel et les scénarios existants, puis lui permettre de piloter un navigateur local autorisé.
- Enregistrer les actions, observations, captures, statuts, anomalies et tickets QA dans le format traçable existant.
- Bloquer par défaut les actions destructives, financières ou nécessitant une confirmation humaine.
- Fournir un mode local de démarrage simple, un mode préparation sans navigateur et une reprise de run.
- Auditer le socle T-187, réutiliser ses contrats utiles et supprimer ou remplacer les chemins guidés devenus redondants dans le même ticket.
- Ne jamais publier automatiquement une issue, une branche ou une pull request depuis l'agent.

## Capabilities

### New Capabilities

- `ai-qa-agent`: Agent IA pilotable depuis Claude ou Codex pour exécuter des scénarios QA dans un environnement local autorisé et produire des artefacts traçables.

### Modified Capabilities

- Aucun changement de contrat existant n'est retenu à ce stade. Le contrat d'artefacts T-187 sera réutilisé ou adapté uniquement si les tests démontrent qu'il ne couvre pas les observations navigateur.

## Impact

- `qa/` et `scripts/` pour le runtime de l'agent, l'adaptateur navigateur et le lanceur local.
- `.claude/skills/`, `.codex/skills/` et les mécanismes de synchronisation IA pour exposer la même capacité aux deux outils.
- `openspec/changes/agent-qa-ia-claude-codex/` pour les spécifications, le design et les tâches du ticket T-188.
- Dépendances locales éventuelles pour le pilotage navigateur et l'appel du modèle, à choisir sans exposer de secret dans le dépôt.
- Le frontend et le backend restent inchangés fonctionnellement ; l'agent les observe uniquement dans un environnement de test autorisé.
