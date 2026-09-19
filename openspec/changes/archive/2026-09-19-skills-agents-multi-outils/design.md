## Context

Cinq skills OpenSpec existent en copies identiques dans `.claude/skills`, `.codex/skills` et `.github/skills`. Aucun agent local n'existe encore. Codex actuel découvre les skills dans `.agents/skills` et les agents dans `.codex/agents/*.toml` ; Claude et Copilot emploient des profils Markdown.

## Goals / Non-Goals

**Goals:** six skills accessibles dans chaque outil, revue adaptée au dépôt, reviewer natif, parité vérifiable sans dépendance npm supplémentaire.

**Non-Goals:** importer tous les outils de l'ancien projet, modifier les skills générés OpenSpec, imposer un modèle, lancer une revue distante ou garantir des permissions identiques entre fournisseurs.

## Decisions

- `.claude/skills` est la source de synchronisation. Les copies existantes Codex/Copilot sont conservées pour les intégrations actuelles ; chaque dossier est également lié depuis `.agents/skills`, emplacement officiel de Codex actuel. Les copies indépendantes sans contrôle ont été écartées pour éviter la dérive.
- Le script Node sans dépendance synchronise toutes les ressources des skills et contrôle les entrées obsolètes. Il refuse les suppressions implicites : les entrées retirées sont nettoyées explicitement après revue.
- `.claude/agents/*.md` porte les instructions ; `tooling/ai-agents.json` déclare les adaptations explicites des outils. Le format pris en charge est limité aux champs `name`, `description`, `tools`, `model: inherit`. Un champ Claude supplémentaire ou un agent sans adaptation bloque la synchronisation, au lieu de perdre ses contraintes.
- `code-reviewer` hérite du modèle choisi. Codex impose `read-only` ; Claude et Copilot excluent les outils d'édition mais conservent le shell pour lire les diffs. Le shell peut écrire : la consigne de lecture seule n'est pas une garantie système pour ces deux outils.
- Une CI dédiée contrôle la parité sur PR, avec un token en lecture seule et sans secrets. Les points d'entrée Copilot et AGENTS renvoient vers les mêmes règles frontend.

## Risks / Trade-offs

- [Évolution des formats fournisseurs] → liens officiels et profils réduits ; valider sur le client utilisé.
- [Copies régénérées par `openspec update`] → relancer la synchronisation puis le contrôle ; aucun patch de règles dans les skills OpenSpec.
- [Session déjà ouverte] → relancer/recharger le client si la découverte n'est pas actualisée.
- [Ressources divergentes ou profil inconnu] → contrôle en échec, adaptation explicite obligatoire.

## Migration Plan

Livrer après les PR #2 et #1, vérifier synchronisation, tests d'outillage et validation OpenSpec. Préparer une PR vers `main`. Pour revenir en arrière, retirer cette évolution par PR ; aucun état applicatif à migrer. La publication et la fusion restent des étapes distinctes.
