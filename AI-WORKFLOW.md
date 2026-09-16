# Skills et agents — Claude, Codex et Copilot

Les consignes sont partagées ; chaque outil dispose de ses emplacements natifs.
Commencer par `AGENTS.md` et `CONTRIBUTING.md`. L'initialisation utilise le ticket
`000`, une branche dédiée par évolution et une PR vers `main`.

## Lancer les skills

| Usage | Claude Code | Codex | Copilot VS Code / CLI |
| --- | --- | --- | --- |
| Revue senior | `/code-review-senior` | `$code-review-senior` | `/code-review-senior` |
| Proposition OpenSpec | `/opsx:propose` | `$openspec-propose` | `/opsx-propose` dans VS Code ; `/openspec-propose` dans le CLI |
| Implémentation | `/opsx:apply` | `$openspec-apply-change` | `/opsx-apply` dans VS Code ; `/openspec-apply-change` dans le CLI |
| Exploration | `/opsx:explore` | `$openspec-explore` | `/opsx-explore` dans VS Code ; `/openspec-explore` dans le CLI |
| Synchronisation des specs | `/opsx:sync` | `$openspec-sync-specs` | `/opsx-sync` dans VS Code ; `/openspec-sync-specs` dans le CLI |
| Archivage | `/opsx:archive` | `$openspec-archive-change` | `/opsx-archive` dans VS Code ; `/openspec-archive-change` dans le CLI |

Exemple Codex : `$code-review-senior examine cette branche contre main`.
Exemple Claude/Copilot : `/code-review-senior examine le diff local`.
Les noms complets des skills OpenSpec sont aussi utilisables avec `/` dans Claude.
Le skill senior réalise lui-même la revue ; il n'exige pas de sous-agent.
Une revue rend un rapport local, sans correction, commit, publication ou approbation.

Codex propose `/skills` et les mentions `$` ; il découvre les dossiers liés depuis
`.agents/skills`, y compris depuis un sous-dossier du dépôt. Les copies
`.codex/skills` restent disponibles pour les intégrations qui les utilisent encore.
Si une session ne voit pas un nouveau skill, la relancer.
Dans Copilot VS Code, `.github/prompts/*.prompt.md` fournit les commandes explicites.
Les clients doivent prendre en charge les skills/prompts ; mettre à jour ou
recharger le client en cas d'absence. Le frontend possède déjà des prompts locaux
OpenSpec ; la découverte des personnalisations du dépôt parent dépend du client
et de ses réglages. Ouvrir la racine `gest-asso` dans VS Code pour le catalogue complet.

Les skills générés OpenSpec conservent parfois des noms d'outils Claude ou des
commandes `/opsx:*`. Traduire vers les capacités de l'hôte : lecture/recherche,
question avec l'outil disponible ou dans la conversation, suivi des tâches avec
le plan disponible. Utiliser la table ci-dessus pour l'invocation ; ne pas modifier
ces skills générés pour y dupliquer les règles du dépôt.

## Lancer le reviewer indépendant

| Outil | Point d'entrée |
| --- | --- |
| Claude Code | « Lance l'agent `code-reviewer` sur cette branche contre main » ; vérifier sa présence avec `/agents` |
| Codex actuel | « Utilise l'agent personnalisé `code-reviewer` pour revoir cette branche contre main » ; les sous-agents doivent être disponibles dans le client |
| Copilot VS Code | Sélectionner `code-reviewer` dans le sélecteur d'agents, puis indiquer la cible |
| Copilot CLI | Sélectionner `code-reviewer` avec `/agent`, puis indiquer la cible |

Claude charge `.claude/agents/code-reviewer.md`, Codex `.codex/agents/code-reviewer.toml`,
Copilot `.github/agents/code-reviewer.agent.md`. Les profils héritent du modèle choisi.
Codex applique un sandbox `read-only`. Claude/Copilot n'exposent pas les outils
d'édition, mais leur shell peut écrire : la consigne de lecture seule n'est pas
une interdiction système des écritures shell. Tous les profils interdisent
corrections, installation, génération et publication pendant la revue.
Si les agents personnalisés ne sont pas pris en charge dans une intégration Codex,
utiliser directement `$code-review-senior` pour la même méthode.

## Ajouter ou mettre à jour une capacité

Sur la branche conforme du ticket :

```bash
node scripts/sync-ai-capabilities.mjs --write
node scripts/sync-ai-capabilities.mjs --check
node --test tests/ai-capabilities.test.mjs
```

- **Skill** : créer/modifier `.claude/skills/<name>/SKILL.md` et ses ressources,
  puis synchroniser les copies Codex/Copilot et les liens de découverte Codex.
  Utiliser des instructions indépendantes des noms d'outils d'un fournisseur.
  Les champs portables acceptés sont `name`, `description`, `license`,
  `compatibility`, `metadata`. Les extensions d'exécution Claude (`context`,
  `agent`, outils préautorisés, injections shell et substitutions spécifiques)
  nécessitent une adaptation explicite du générateur ; elles ne sont pas copiées
  silencieusement comme si les autres outils les exécutaient.
- **Agent** : créer `.claude/agents/<name>.md` avec `name`, une `description`
  entre guillemets JSON, `tools` séparés par `, `, `model: inherit` et le corps
  d'instructions. Ajouter dans `tooling/ai-agents.json` les outils natifs de Claude
  et Copilot ainsi que le sandbox Codex. Un champ supplémentaire ou un agent sans
  adaptation est refusé : étendre explicitement le générateur et ses tests avant usage.
- **Mise à jour OpenSpec** : exécuter la mise à jour officielle pour les trois
  intégrations, puis synchroniser et contrôler. `.claude/skills` est la source
  de synchronisation ; éviter des changements indépendants dans les copies.
- **Suppression** : retirer explicitement la source, ses copies/liens et
  l'adaptation concernée après inspection du diff. Le script ne supprime rien.

Le contrôle CI `AI capabilities parity` échoue en cas de divergence sur les PR
concernées. Il contrôle les fichiers, pas le comportement d'un modèle ni une
connexion au client. Ajouter explicitement au commit les sources, profils et liens.

## Formats officiels vérifiés

- [Skills Codex : découverte et invocation](https://learn.chatgpt.com/docs/build-skills).
- [Agents personnalisés Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- [Skills Claude](https://code.claude.com/docs/en/skills).
- [Sous-agents Claude](https://code.claude.com/docs/en/sub-agents).
- [Skills Copilot](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).
- [Commandes Copilot CLI](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference).
- [Profils d'agents Copilot](https://docs.github.com/en/copilot/reference/custom-agents-configuration).
- [Agents personnalisés VS Code](https://code.visualstudio.com/docs/agent-customization/custom-agents).
